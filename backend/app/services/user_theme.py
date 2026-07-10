import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.user_theme import UserTheme
from app.schemas.user_theme import UserThemeCreate, UserThemeUpdate


class UserThemeNotFoundError(Exception):
    pass


class UserThemeService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list(self, user: User) -> list[UserTheme]:
        rows = await self._session.scalars(
            select(UserTheme)
            .where(UserTheme.user_id == user.id)
            .order_by(UserTheme.created_at)
        )
        return list(rows)

    async def get_owned(self, user: User, theme_id: uuid.UUID) -> UserTheme:
        theme = await self._session.get(UserTheme, theme_id)
        if theme is None or theme.user_id != user.id:
            raise UserThemeNotFoundError
        return theme

    async def create(self, user: User, payload: UserThemeCreate) -> UserTheme:
        theme = UserTheme(
            user_id=user.id, name=payload.name, tokens=payload.tokens
        )
        self._session.add(theme)
        await self._session.flush()
        return theme

    async def update(
        self, user: User, theme_id: uuid.UUID, payload: UserThemeUpdate
    ) -> UserTheme:
        theme = await self.get_owned(user, theme_id)
        data = payload.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(theme, field, value)
        await self._session.flush()
        return theme

    async def delete(self, user: User, theme_id: uuid.UUID) -> None:
        theme = await self.get_owned(user, theme_id)
        await self._session.delete(theme)
        await self._session.flush()
