import json
import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import DashboardStatus

MAX_JSON_BYTES = 256 * 1024


def _bounded_json(value: dict[str, Any] | None) -> dict[str, Any] | None:
    if value is None:
        return value
    if len(json.dumps(value).encode()) > MAX_JSON_BYTES:
        raise ValueError("payload too large")
    return value


class DashboardCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    theme_key: str = Field(default="light-minimal", max_length=64)
    layout: dict[str, Any] = Field(default_factory=dict)
    data_bindings: dict[str, Any] = Field(default_factory=dict)
    data_source: dict[str, Any] = Field(default_factory=dict)

    _bound = field_validator("layout", "data_bindings", "data_source")(
        _bounded_json
    )


class DashboardUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    theme_key: str | None = Field(default=None, max_length=64)
    theme_tokens: dict[str, Any] | None = None
    layout: dict[str, Any] | None = None
    data_bindings: dict[str, Any] | None = None
    data_source: dict[str, Any] | None = None

    _bound = field_validator(
        "theme_tokens", "layout", "data_bindings", "data_source"
    )(_bounded_json)


class DayCount(BaseModel):
    day: str
    count: int


class DashboardAnalytics(BaseModel):
    total: int
    days: list[DayCount]


class ExportJobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: str
    result: dict[str, Any] | None = None


class DashboardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    slug: str
    theme_key: str
    theme_tokens: dict[str, Any] | None
    layout: dict[str, Any]
    data_bindings: dict[str, Any]
    data_source: dict[str, Any]
    status: DashboardStatus
    created_at: datetime
    updated_at: datetime
