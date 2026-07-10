import secrets

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dashboard import Dashboard
from app.models.embed_token import EmbedToken
from app.models.enums import DashboardStatus, SubscriptionTier
from app.models.user import User
from app.schemas.embed import PublishedConfig


class EmbedService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def verify_ingest(self, token: str, provided_key: str) -> bool:
        record = await self._session.scalar(
            select(EmbedToken).where(
                EmbedToken.token == token,
                EmbedToken.revoked.is_(False),
            )
        )
        if record is None or not record.ingest_key:
            return False
        return secrets.compare_digest(record.ingest_key, provided_key)

    async def get_config(self, token: str) -> PublishedConfig | None:
        record = await self._session.scalar(
            select(EmbedToken).where(
                EmbedToken.token == token,
                EmbedToken.revoked.is_(False),
            )
        )
        if record is None:
            return None

        dashboard = await self._session.get(Dashboard, record.dashboard_id)
        if dashboard is None or dashboard.status != DashboardStatus.published:
            return None

        owner = await self._session.get(User, dashboard.user_id)
        attribution = (
            owner is None
            or owner.subscription_tier != SubscriptionTier.unlimited
        )

        return PublishedConfig(
            dashboard_id=str(dashboard.id),
            theme_key=dashboard.theme_key,
            theme_tokens=dashboard.theme_tokens,
            layout=dashboard.layout,
            data_source=dashboard.data_source,
            allowed_domains=record.allowed_domains or [],
            attribution=attribution,
        )
