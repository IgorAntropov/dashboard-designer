from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_prefix="PANELKA_", extra="ignore"
    )

    app_name: str = "Panelka API"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"

    database_url: str = "postgresql+asyncpg://panelka:panelka@localhost:5432/panelka"
    redis_url: str = "redis://localhost:6379/0"

    jwt_secret: str = "change-me"
    jwt_access_ttl_sec: int = 900
    jwt_refresh_ttl_sec: int = 1209600


@lru_cache
def get_settings() -> Settings:
    return Settings()
