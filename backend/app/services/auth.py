import hashlib
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.passwords import hash_password, verify_password
from app.core.tokens import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import TokenPair


class AuthError(Exception):
    pass


class EmailAlreadyUsedError(AuthError):
    pass


class InvalidCredentialsError(AuthError):
    pass


class InvalidRefreshTokenError(AuthError):
    pass


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def register(self, email: str, password: str, display_name: str) -> User:
        existing = await self._session.scalar(select(User).where(User.email == email))
        if existing is not None:
            raise EmailAlreadyUsedError
        user = User(
            email=email,
            password_hash=hash_password(password),
            display_name=display_name,
        )
        self._session.add(user)
        await self._session.flush()
        return user

    async def authenticate(self, email: str, password: str) -> User:
        user = await self._session.scalar(select(User).where(User.email == email))
        if user is None or user.password_hash is None:
            raise InvalidCredentialsError
        if not verify_password(password, user.password_hash):
            raise InvalidCredentialsError
        return user

    async def issue_tokens(self, user: User) -> TokenPair:
        settings = get_settings()
        access = create_access_token(str(user.id))
        refresh, _ = create_refresh_token(str(user.id))
        record = RefreshToken(
            user_id=user.id,
            token_hash=_hash_token(refresh),
            expires_at=datetime.now(timezone.utc)
            + timedelta(seconds=settings.jwt_refresh_ttl_sec),
        )
        self._session.add(record)
        await self._session.flush()
        return TokenPair(access_token=access, refresh_token=refresh)

    async def rotate(self, refresh_token: str) -> TokenPair:
        try:
            payload = decode_token(refresh_token, "refresh")
        except ValueError as exc:
            raise InvalidRefreshTokenError from exc

        record = await self._session.scalar(
            select(RefreshToken).where(
                RefreshToken.token_hash == _hash_token(refresh_token)
            )
        )
        if record is None or record.revoked:
            raise InvalidRefreshTokenError

        record.revoked = True
        user = await self._session.get(User, uuid.UUID(str(payload["sub"])))
        if user is None:
            raise InvalidRefreshTokenError
        return await self.issue_tokens(user)
