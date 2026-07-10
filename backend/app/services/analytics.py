import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.embed_event import EmbedEvent


class AnalyticsService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def record_load(self, dashboard_id: uuid.UUID) -> None:
        today = datetime.now(tz=UTC).date()
        result = await self._session.execute(
            update(EmbedEvent)
            .where(
                EmbedEvent.dashboard_id == dashboard_id,
                EmbedEvent.day == today,
            )
            .values(count=EmbedEvent.count + 1)
        )
        if result.rowcount == 0:
            self._session.add(
                EmbedEvent(dashboard_id=dashboard_id, day=today, count=1)
            )
        await self._session.commit()

    async def get_analytics(
        self, dashboard_id: uuid.UUID, days: int = 30
    ) -> tuple[int, list[tuple[str, int]]]:
        since = datetime.now(tz=UTC).date() - timedelta(days=days - 1)
        rows = await self._session.execute(
            select(EmbedEvent.day, EmbedEvent.count)
            .where(
                EmbedEvent.dashboard_id == dashboard_id,
                EmbedEvent.day >= since,
            )
            .order_by(EmbedEvent.day)
        )
        daily = [(day.isoformat(), count) for day, count in rows.all()]
        total = await self._session.scalar(
            select(func.coalesce(func.sum(EmbedEvent.count), 0)).where(
                EmbedEvent.dashboard_id == dashboard_id
            )
        )
        return int(total or 0), daily
