import uuid
from typing import Any

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UuidPkMixin

JsonType = JSON().with_variant(JSONB(), "postgresql")


class ExportJob(UuidPkMixin, TimestampMixin, Base):
    __tablename__ = "export_jobs"

    dashboard_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("dashboards.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    status: Mapped[str] = mapped_column(String(20), default="pending")
    result: Mapped[dict[str, Any] | None] = mapped_column(
        JsonType, nullable=True, default=None
    )
