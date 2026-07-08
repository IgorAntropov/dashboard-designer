from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UuidPkMixin


class ProcessedWebhook(UuidPkMixin, TimestampMixin, Base):
    __tablename__ = "processed_webhooks"

    provider: Mapped[str] = mapped_column(String(32))
    event_key: Mapped[str] = mapped_column(String(200), unique=True, index=True)
