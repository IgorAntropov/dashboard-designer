import asyncio
import json
import uuid
from typing import Any

from fastapi import (
    APIRouter,
    Header,
    HTTPException,
    Request,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import SessionDep
from app.core.config import get_settings
from app.core.errors import AppError
from app.core.origins import origin_allowed
from app.core.rate_limit import rate_limit_dep
from app.core.redis import get_redis
from app.core.ssrf import safe_fetch
from app.schemas.embed import PublishedConfig
from app.services.analytics import AnalyticsService
from app.services.embed import EmbedService

router = APIRouter(prefix="/public", tags=["public"])

CACHE_TTL_SECONDS = 60
LIVE_CHANNEL_PREFIX = "embed:live:"

_settings = get_settings()
_PUBLIC_RL = rate_limit_dep(
    "public", _settings.rate_limit_public_per_min, _settings.rate_limit_window_sec
)
_INGEST_RL = rate_limit_dep(
    "ingest", _settings.rate_limit_ingest_per_min, _settings.rate_limit_window_sec
)


def _require_origin(request: Request, config: PublishedConfig) -> None:
    if not origin_allowed(
        request.headers.get("origin"),
        request.headers.get("referer"),
        config.allowed_domains,
        _settings.cors_origins,
    ):
        raise AppError(
            status.HTTP_403_FORBIDDEN, "origin_not_allowed", "Origin not allowed"
        )


class LiveChannelManager:
    def __init__(self) -> None:
        self._channels: dict[str, set[WebSocket]] = {}
        self._subscriber: asyncio.Task[None] | None = None

    def connect(self, token: str, websocket: WebSocket) -> None:
        self._channels.setdefault(token, set()).add(websocket)
        self._ensure_subscriber()

    def disconnect(self, token: str, websocket: WebSocket) -> None:
        connections = self._channels.get(token)
        if connections is not None:
            connections.discard(websocket)
            if not connections:
                self._channels.pop(token, None)

    async def _deliver_local(self, token: str, message: dict[str, Any]) -> None:
        for websocket in list(self._channels.get(token, set())):
            try:
                await websocket.send_json(message)
            except Exception:
                pass

    async def broadcast(self, token: str, message: dict[str, Any]) -> None:
        try:
            await get_redis().publish(
                f"{LIVE_CHANNEL_PREFIX}{token}", json.dumps(message)
            )
        except Exception:
            await self._deliver_local(token, message)

    def _ensure_subscriber(self) -> None:
        if self._subscriber is None or self._subscriber.done():
            self._subscriber = asyncio.create_task(self._run_subscriber())

    async def _run_subscriber(self) -> None:
        try:
            pubsub = get_redis().pubsub()
            await pubsub.psubscribe(f"{LIVE_CHANNEL_PREFIX}*")
            async for event in pubsub.listen():
                if event.get("type") != "pmessage":
                    continue
                channel = event["channel"]
                if isinstance(channel, bytes):
                    channel = channel.decode()
                token = channel.removeprefix(LIVE_CHANNEL_PREFIX)
                try:
                    payload = json.loads(event["data"])
                except (TypeError, ValueError):
                    continue
                await self._deliver_local(token, payload)
        except Exception:
            pass


live_manager = LiveChannelManager()


@router.get(
    "/embed/{token}",
    response_model=PublishedConfig,
    dependencies=[_PUBLIC_RL],
)
async def get_embed_config(
    token: str, request: Request, session: SessionDep
) -> PublishedConfig:
    redis = get_redis()
    cache_key = f"embed:{token}"

    try:
        cached = await redis.get(cache_key)
    except Exception:
        cached = None
    if cached:
        config = PublishedConfig.model_validate_json(cached)
        _require_origin(request, config)
        await _record_load(session, config.dashboard_id)
        return config

    config = await EmbedService(session).get_config(token)
    if config is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Not found"
        )
    _require_origin(request, config)

    try:
        await redis.set(cache_key, config.model_dump_json(), ex=CACHE_TTL_SECONDS)
    except Exception:
        pass

    await _record_load(session, config.dashboard_id)
    return config


async def _record_load(session: AsyncSession, dashboard_id: str) -> None:
    try:
        await AnalyticsService(session).record_load(uuid.UUID(dashboard_id))
        await session.commit()
    except Exception:
        await session.rollback()


@router.get("/embed/{token}/data", dependencies=[_PUBLIC_RL])
async def embed_pull_data(
    token: str, request: Request, session: SessionDep
) -> Any:
    config = await EmbedService(session).get_config(token)
    if config is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Not found"
        )
    _require_origin(request, config)
    source = config.data_source or {}
    if source.get("mode") != "pull" or not isinstance(source.get("url"), str):
        raise AppError(
            status.HTTP_400_BAD_REQUEST, "pull_not_configured", "Pull not configured"
        )

    data = await safe_fetch(
        source["url"], _settings.pull_max_bytes, _settings.pull_timeout_sec
    )
    if data is None:
        raise AppError(
            status.HTTP_502_BAD_GATEWAY, "pull_failed", "Upstream fetch failed"
        )
    return data


@router.websocket("/embed/{token}/live")
async def embed_live(
    websocket: WebSocket, token: str, session: SessionDep
) -> None:
    config = await EmbedService(session).get_config(token)
    if config is None:
        await websocket.close(code=1008)
        return
    if not origin_allowed(
        websocket.headers.get("origin"),
        websocket.headers.get("referer"),
        config.allowed_domains,
        _settings.cors_origins,
    ):
        await websocket.close(code=1008)
        return

    await websocket.accept()
    live_manager.connect(token, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        live_manager.disconnect(token, websocket)


@router.post(
    "/embed/{token}/live",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[_INGEST_RL],
)
async def embed_live_push(
    token: str,
    payload: dict[str, Any],
    session: SessionDep,
    x_ingest_key: str = Header(default=""),
) -> None:
    if not await EmbedService(session).verify_ingest(token, x_ingest_key):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid ingest key"
        )
    await live_manager.broadcast(
        token, {"type": "panelka:data", "payload": payload}
    )
