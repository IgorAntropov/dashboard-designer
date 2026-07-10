import uuid
from typing import Any

from sqlalchemy import JSON, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.enums import DashboardStatus
from app.models.mixins import TimestampMixin, UuidPkMixin

JsonType = JSON().with_variant(JSONB(), "postgresql")


class Dashboard(UuidPkMixin, TimestampMixin, Base):
    __tablename__ = "dashboards"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(220), index=True)
    theme_key: Mapped[str] = mapped_column(String(64), default="light-minimal")
    theme_tokens: Mapped[dict[str, Any] | None] = mapped_column(
        JsonType, nullable=True, default=None
    )
    layout: Mapped[dict[str, Any]] = mapped_column(JsonType, default=dict)
    data_bindings: Mapped[dict[str, Any]] = mapped_column(JsonType, default=dict)
    data_source: Mapped[dict[str, Any]] = mapped_column(JsonType, default=dict)
    status: Mapped[DashboardStatus] = mapped_column(
        Enum(DashboardStatus, name="dashboard_status"),
        default=DashboardStatus.draft,
    )
