import asyncio
import json
import uuid
from typing import Any

from fastapi import (
    APIRouter,
    Header,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    status,
)

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import SessionDep
from app.core.redis import get_redis
from app.schemas.embed import PublishedConfig
from app.services.analytics import AnalyticsService
from app.services.embed import EmbedService

router = APIRouter(prefix="/public", tags=["public"])

CACHE_TTL_SECONDS = 60
LIVE_CHANNEL_PREFIX = "embed:live:"


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


@router.get("/embed/{token}", response_model=PublishedConfig)
async def get_embed_config(token: str, session: SessionDep) -> PublishedConfig:
    redis = get_redis()
    cache_key = f"embed:{token}"

    try:
        cached = await redis.get(cache_key)
    except Exception:
        cached = None
    if cached:
        config = PublishedConfig.model_validate_json(cached)
        await _record_load(session, config.dashboard_id)
        return config

    config = await EmbedService(session).get_config(token)
    if config is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Not found"
        )

    try:
        await redis.set(cache_key, config.model_dump_json(), ex=CACHE_TTL_SECONDS)
    except Exception:
        pass

    await _record_load(session, config.dashboard_id)
    return config


async def _record_load(session: AsyncSession, dashboard_id: str) -> None:
    try:
        await AnalyticsService(session).record_load(uuid.UUID(dashboard_id))
    except Exception:
        pass


@router.websocket("/embed/{token}/live")
async def embed_live(
    websocket: WebSocket, token: str, session: SessionDep
) -> None:
    config = await EmbedService(session).get_config(token)
    if config is None:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    live_manager.connect(token, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        live_manager.disconnect(token, websocket)


@router.post("/embed/{token}/live", status_code=status.HTTP_202_ACCEPTED)
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
