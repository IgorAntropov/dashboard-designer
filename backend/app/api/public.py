from typing import Any

from fastapi import (
    APIRouter,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    status,
)

from app.api.deps import SessionDep
from app.core.redis import get_redis
from app.schemas.embed import PublishedConfig
from app.services.embed import EmbedService

router = APIRouter(prefix="/public", tags=["public"])

CACHE_TTL_SECONDS = 60


class LiveChannelManager:
    def __init__(self) -> None:
        self._channels: dict[str, set[WebSocket]] = {}

    def connect(self, token: str, websocket: WebSocket) -> None:
        self._channels.setdefault(token, set()).add(websocket)

    def disconnect(self, token: str, websocket: WebSocket) -> None:
        connections = self._channels.get(token)
        if connections is not None:
            connections.discard(websocket)
            if not connections:
                self._channels.pop(token, None)

    async def broadcast(self, token: str, message: dict[str, Any]) -> None:
        for websocket in list(self._channels.get(token, set())):
            try:
                await websocket.send_json(message)
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
        return PublishedConfig.model_validate_json(cached)

    config = await EmbedService(session).get_config(token)
    if config is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Not found"
        )

    try:
        await redis.set(cache_key, config.model_dump_json(), ex=CACHE_TTL_SECONDS)
    except Exception:
        pass

    return config


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
    token: str, payload: dict[str, Any], session: SessionDep
) -> None:
    config = await EmbedService(session).get_config(token)
    if config is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Not found"
        )
    await live_manager.broadcast(
        token, {"type": "panelka:data", "payload": payload}
    )
