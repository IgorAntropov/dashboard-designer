import hashlib
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.passwords import hash_password, verify_password
from app.core.tokens import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.models.oauth_account import OAuthAccount
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import TokenPair
from app.services.oauth.base import OAuthIdentity


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
            expires_at=datetime.now(UTC)
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

        user = await self._session.get(User, uuid.UUID(str(payload["sub"])))
        if user is None:
            raise InvalidRefreshTokenError
        access = create_access_token(str(user.id))
        return TokenPair(access_token=access, refresh_token=refresh_token)

    async def upsert_oauth_user(self, identity: OAuthIdentity) -> User:
        account = await self._session.scalar(
            select(OAuthAccount).where(
                OAuthAccount.provider == identity.provider,
                OAuthAccount.provider_user_id == identity.provider_user_id,
            )
        )
        if account is not None:
            linked = await self._session.get(User, account.user_id)
            if linked is not None:
                return linked

        user: User | None = None
        if identity.email is not None:
            user = await self._session.scalar(
                select(User).where(User.email == identity.email)
            )
        if user is None:
            fallback_email = (
                identity.email
                or f"{identity.provider}-{identity.provider_user_id}@oauth.panelka"
            )
            user = User(email=fallback_email, display_name=identity.display_name)
            self._session.add(user)
            await self._session.flush()

        self._session.add(
            OAuthAccount(
                user_id=user.id,
                provider=identity.provider,
                provider_user_id=identity.provider_user_id,
            )
        )
        await self._session.flush()
        return user

    async def change_password(self, user: User, current: str, new: str) -> None:
        if user.password_hash is None or not verify_password(
            current, user.password_hash
        ):
            raise InvalidCredentialsError
        user.password_hash = hash_password(new)
        tokens = await self._session.scalars(
            select(RefreshToken).where(
                RefreshToken.user_id == user.id,
                RefreshToken.revoked.is_(False),
            )
        )
        for token in tokens:
            token.revoked = True
        await self._session.flush()
