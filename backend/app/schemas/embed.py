from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import DashboardStatus


class PublishRequest(BaseModel):
    allowed_domains: list[str] = Field(default_factory=list)


class PublishResponse(BaseModel):
    token: str
    allowed_domains: list[str]
    status: DashboardStatus


class PublishedConfig(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    dashboard_id: str
    theme_key: str
    layout: dict[str, Any]
    data_source: dict[str, Any]
    attribution: bool
