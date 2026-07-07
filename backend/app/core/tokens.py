import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

from jose import JWTError, jwt

from app.core.config import get_settings

ALGORITHM = "HS256"

TokenType = Literal["access", "refresh"]


def _create_token(subject: str, token_type: TokenType, ttl_seconds: int) -> tuple[str, str]:
    settings = get_settings()
    jti = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "jti": jti,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=ttl_seconds)).timestamp()),
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)
    return token, jti


def create_access_token(subject: str) -> str:
    token, _ = _create_token(subject, "access", get_settings().jwt_access_ttl_sec)
    return token


def create_refresh_token(subject: str) -> tuple[str, str]:
    return _create_token(subject, "refresh", get_settings().jwt_refresh_ttl_sec)


def decode_token(token: str, expected_type: TokenType) -> dict[str, Any]:
    settings = get_settings()
    try:
        payload: dict[str, Any] = jwt.decode(
            token, settings.jwt_secret, algorithms=[ALGORITHM]
        )
    except JWTError as exc:
        raise ValueError("invalid token") from exc
    if payload.get("type") != expected_type:
        raise ValueError("unexpected token type")
    return payload
