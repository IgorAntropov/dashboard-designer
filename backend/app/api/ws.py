import uuid

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.tokens import decode_token

router = APIRouter()


class SessionConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[str, tuple[str, WebSocket]] = {}

    async def connect(
        self, user_id: str, session_id: str, websocket: WebSocket
    ) -> None:
        existing = self._connections.get(user_id)
        if existing is not None:
            _, old_socket = existing
            try:
                await old_socket.send_json({"type": "kicked"})
                await old_socket.close(code=4000)
            except Exception:
                pass
        self._connections[user_id] = (session_id, websocket)

    def disconnect(self, user_id: str, session_id: str) -> None:
        current = self._connections.get(user_id)
        if current is not None and current[0] == session_id:
            self._connections.pop(user_id, None)


manager = SessionConnectionManager()

WS_SUBPROTOCOL = "panelka-ws"


def _token_from_subprotocols(websocket: WebSocket) -> str | None:
    header = websocket.headers.get("sec-websocket-protocol")
    if not header:
        return None
    offered = [item.strip() for item in header.split(",") if item.strip()]
    for item in offered:
        if item != WS_SUBPROTOCOL:
            return item
    return None


@router.websocket("/ws/session")
async def session_ws(websocket: WebSocket) -> None:
    token = _token_from_subprotocols(websocket)
    if token is None:
        await websocket.close(code=1008)
        return
    try:
        payload = decode_token(token, "access")
        user_id = str(payload["sub"])
    except (ValueError, KeyError):
        await websocket.close(code=1008)
        return
    session_id = str(uuid.uuid4())

    await websocket.accept(subprotocol=WS_SUBPROTOCOL)
    await manager.connect(user_id, session_id, websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, session_id)
