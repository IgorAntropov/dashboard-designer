import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dashboard import Dashboard
from app.models.export_job import ExportJob
from app.models.user import User


class ExportJobNotFoundError(Exception):
    pass


class ExportService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, user: User, dashboard: Dashboard) -> ExportJob:
        job = ExportJob(
            dashboard_id=dashboard.id, user_id=user.id, status="pending"
        )
        self._session.add(job)
        await self._session.flush()
        return job

    async def process(self, job: ExportJob, dashboard: Dashboard) -> None:
        job.result = {
            "title": dashboard.title,
            "slug": dashboard.slug,
            "theme_key": dashboard.theme_key,
            "theme_tokens": dashboard.theme_tokens,
            "layout": dashboard.layout,
            "exported_at": datetime.now(tz=timezone.utc).isoformat(),
        }
        job.status = "done"
        await self._session.flush()

    async def get_owned(self, user: User, job_id: uuid.UUID) -> ExportJob:
        job = await self._session.get(ExportJob, job_id)
        if job is None or job.user_id != user.id:
            raise ExportJobNotFoundError
        return job
