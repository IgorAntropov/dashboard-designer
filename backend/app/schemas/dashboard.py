import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import DashboardStatus


class DashboardCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    theme_key: str = Field(default="light-minimal", max_length=64)
    layout: dict[str, Any] = Field(default_factory=dict)
    data_bindings: dict[str, Any] = Field(default_factory=dict)
    data_source: dict[str, Any] = Field(default_factory=dict)


class DashboardUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    theme_key: str | None = Field(default=None, max_length=64)
    theme_tokens: dict[str, Any] | None = None
    layout: dict[str, Any] | None = None
    data_bindings: dict[str, Any] | None = None
    data_source: dict[str, Any] | None = None
    status: DashboardStatus | None = None


class DayCount(BaseModel):
    day: str
    count: int


class DashboardAnalytics(BaseModel):
    total: int
    days: list[DayCount]


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
