import uuid
from typing import Any

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UuidPkMixin

JsonType = JSON().with_variant(JSONB(), "postgresql")


class UserTheme(UuidPkMixin, TimestampMixin, Base):
    __tablename__ = "user_themes"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(80))
    tokens: Mapped[dict[str, Any]] = mapped_column(JsonType, default=dict)
