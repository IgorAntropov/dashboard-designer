import uuid

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UuidPkMixin

JsonType = JSON().with_variant(JSONB(), "postgresql")


class EmbedToken(UuidPkMixin, TimestampMixin, Base):
    __tablename__ = "embed_tokens"

    dashboard_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("dashboards.id", ondelete="CASCADE"), index=True
    )
    token: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    ingest_key: Mapped[str] = mapped_column(String(64), default="")
    allowed_domains: Mapped[list[str]] = mapped_column(JsonType, default=list)
    revoked: Mapped[bool] = mapped_column(default=False)
