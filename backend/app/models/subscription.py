import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UuidPkMixin


class Subscription(UuidPkMixin, TimestampMixin, Base):
    __tablename__ = "subscriptions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    tier: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(20), default="active")
    provider: Mapped[str] = mapped_column(String(32), default="cloudpayments")
    provider_sub_id: Mapped[str | None] = mapped_column(String(128), default=None)
    current_period_end: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None
    )
