import json
import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

MAX_TOKENS_BYTES = 8 * 1024


def _bounded(value: dict[str, Any]) -> dict[str, Any]:
    if len(json.dumps(value).encode()) > MAX_TOKENS_BYTES:
        raise ValueError("tokens too large")
    return value


class UserThemeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    tokens: dict[str, Any] = Field(default_factory=dict)

    _bound = field_validator("tokens")(_bounded)


class UserThemeUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    tokens: dict[str, Any] | None = None

    @field_validator("tokens")
    @classmethod
    def _bound(cls, value: dict[str, Any] | None) -> dict[str, Any] | None:
        return None if value is None else _bounded(value)


class UserThemeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    tokens: dict[str, Any]
    created_at: datetime
    updated_at: datetime
