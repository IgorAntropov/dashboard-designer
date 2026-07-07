import re
import secrets
import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dashboard import Dashboard
from app.models.user import User
from app.schemas.dashboard import DashboardCreate, DashboardUpdate
from app.services.quota import dashboard_limit


class DashboardError(Exception):
    pass


class DashboardNotFoundError(DashboardError):
    pass


class DashboardQuotaExceededError(DashboardError):
    pass


def _slugify(title: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-") or "dashboard"
    return f"{base[:40]}-{secrets.token_hex(3)}"


class DashboardService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_for_user(self, user: User) -> list[Dashboard]:
        result = await self._session.scalars(
            select(Dashboard)
            .where(Dashboard.user_id == user.id)
            .order_by(Dashboard.created_at.desc())
        )
        return list(result)

    async def _count_for_user(self, user: User) -> int:
        count = await self._session.scalar(
            select(func.count())
            .select_from(Dashboard)
            .where(Dashboard.user_id == user.id)
        )
        return count or 0

    async def _ensure_quota(self, user: User) -> None:
        limit = dashboard_limit(user.subscription_tier)
        if limit is not None and await self._count_for_user(user) >= limit:
            raise DashboardQuotaExceededError

    async def create(self, user: User, payload: DashboardCreate) -> Dashboard:
        await self._ensure_quota(user)
        dashboard = Dashboard(
            user_id=user.id,
            title=payload.title,
            slug=_slugify(payload.title),
            theme_key=payload.theme_key,
            layout=payload.layout,
            data_bindings=payload.data_bindings,
            data_source=payload.data_source,
        )
        self._session.add(dashboard)
        await self._session.flush()
        return dashboard

    async def get_owned(self, user: User, dashboard_id: uuid.UUID) -> Dashboard:
        dashboard = await self._session.get(Dashboard, dashboard_id)
        if dashboard is None or dashboard.user_id != user.id:
            raise DashboardNotFoundError
        return dashboard

    async def update(
        self, user: User, dashboard_id: uuid.UUID, payload: DashboardUpdate
    ) -> Dashboard:
        dashboard = await self.get_owned(user, dashboard_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(dashboard, field, value)
        await self._session.flush()
        return dashboard

    async def delete(self, user: User, dashboard_id: uuid.UUID) -> None:
        dashboard = await self.get_owned(user, dashboard_id)
        await self._session.delete(dashboard)
        await self._session.flush()

    async def duplicate(self, user: User, dashboard_id: uuid.UUID) -> Dashboard:
        source = await self.get_owned(user, dashboard_id)
        await self._ensure_quota(user)
        copy = Dashboard(
            user_id=user.id,
            title=f"{source.title} (copy)",
            slug=_slugify(source.title),
            theme_key=source.theme_key,
            layout=source.layout,
            data_bindings=source.data_bindings,
            data_source=source.data_source,
        )
        self._session.add(copy)
        await self._session.flush()
        return copy
