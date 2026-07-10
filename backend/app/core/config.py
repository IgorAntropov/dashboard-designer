from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_WEAK_JWT_SECRETS = {"", "change-me"}


def read_version() -> str:
    for parent in Path(__file__).resolve().parents:
        candidate = parent / "VERSION"
        if candidate.is_file():
            return candidate.read_text().strip()
    return "0.0.0"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_prefix="PANELKA_", extra="ignore"
    )

    app_name: str = "Panelka API"
    app_version: str = Field(default_factory=read_version)
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    database_url: str = "postgresql+asyncpg://panelka:panelka@localhost:5432/panelka"
    redis_url: str = "redis://localhost:6379/0"

    jwt_secret: str = "change-me"
    jwt_access_ttl_sec: int = 900
    jwt_refresh_ttl_sec: int = 1209600

    trust_proxy_headers: bool = False
    rate_limit_window_sec: int = 60
    rate_limit_auth_per_min: int = 20
    rate_limit_public_per_min: int = 120
    rate_limit_ingest_per_min: int = 120
    pull_max_bytes: int = 1_000_000
    pull_timeout_sec: float = 5.0

    oauth_redirect_base: str = "http://localhost:8000/api/v1/auth/oauth"
    oauth_yandex_client_id: str = ""
    oauth_yandex_client_secret: str = ""
    oauth_vk_client_id: str = ""
    oauth_vk_client_secret: str = ""

    cloudpayments_public_id: str = ""
    cloudpayments_api_secret: str = ""

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [part.strip() for part in value.split(",") if part.strip()]
        return value

    @model_validator(mode="after")
    def _require_production_secrets(self) -> "Settings":
        if self.environment != "production":
            return self
        if self.jwt_secret in _WEAK_JWT_SECRETS:
            raise ValueError("jwt_secret must be set to a strong value in production")
        if not self.cloudpayments_api_secret:
            raise ValueError("cloudpayments_api_secret must be set in production")
        if "*" in self.cors_origins:
            raise ValueError("cors_origins must not be '*' in production")
        return self

    @property
    def docs_enabled(self) -> bool:
        return self.environment != "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
