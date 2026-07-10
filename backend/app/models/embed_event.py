import datetime
import uuid

from sqlalchemy import Date, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UuidPkMixin


class EmbedEvent(UuidPkMixin, TimestampMixin, Base):
    __tablename__ = "embed_events"
    __table_args__ = (
        UniqueConstraint("dashboard_id", "day", name="uq_embed_events_dashboard_day"),
    )

    dashboard_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("dashboards.id", ondelete="CASCADE"), index=True
    )
    day: Mapped[datetime.date] = mapped_column(Date, index=True)
    count: Mapped[int] = mapped_column(Integer, default=0)
