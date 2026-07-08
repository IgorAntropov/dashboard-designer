import re
import secrets
import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dashboard import Dashboard
from app.models.embed_token import EmbedToken
from app.models.enums import DashboardStatus
from app.models.user import User
from app.schemas.dashboard import DashboardCreate, DashboardUpdate
from app.services.quota import dashboard_limit, widget_limit


class DashboardError(Exception):
    pass


class DashboardNotFoundError(DashboardError):
    pass


class DashboardQuotaExceededError(DashboardError):
    def __init__(self, reason: str = "dashboards") -> None:
        super().__init__(reason)
        self.reason = reason


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
            raise DashboardQuotaExceededError("dashboards")

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
        data = payload.model_dump(exclude_unset=True)
        self._ensure_widget_limit(user, data.get("layout"))
        for field, value in data.items():
            setattr(dashboard, field, value)
        await self._session.flush()
        return dashboard

    def _ensure_widget_limit(self, user: User, layout: object) -> None:
        limit = widget_limit(user.subscription_tier)
        if limit is None or not isinstance(layout, dict):
            return
        widgets = layout.get("widgets")
        if isinstance(widgets, list) and len(widgets) > limit:
            raise DashboardQuotaExceededError("widgets")

    async def publish(
        self, user: User, dashboard_id: uuid.UUID, allowed_domains: list[str]
    ) -> tuple[Dashboard, EmbedToken]:
        dashboard = await self.get_owned(user, dashboard_id)
        dashboard.status = DashboardStatus.published

        token = await self._session.scalar(
            select(EmbedToken).where(
                EmbedToken.dashboard_id == dashboard.id,
                EmbedToken.revoked.is_(False),
            )
        )
        if token is None:
            token = EmbedToken(
                dashboard_id=dashboard.id,
                token=secrets.token_urlsafe(32)[:64],
                allowed_domains=allowed_domains,
            )
            self._session.add(token)
        else:
            token.allowed_domains = allowed_domains

        await self._session.flush()
        return dashboard, token

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
