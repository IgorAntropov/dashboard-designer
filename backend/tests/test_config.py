import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_production_rejects_weak_jwt_secret() -> None:
    with pytest.raises(ValidationError):
        Settings(
            environment="production",
            jwt_secret="change-me",
            cloudpayments_api_secret="whsec",
        )


def test_production_rejects_empty_cloudpayments_secret() -> None:
    with pytest.raises(ValidationError):
        Settings(
            environment="production",
            jwt_secret="a-strong-secret-value",
            cloudpayments_api_secret="",
        )


def test_production_accepts_strong_config() -> None:
    settings = Settings(
        environment="production",
        jwt_secret="a-strong-secret-value",
        cloudpayments_api_secret="whsec_live",
        cors_origins=["https://app.example.com"],
    )
    assert settings.environment == "production"


def test_development_allows_defaults() -> None:
    settings = Settings(environment="development")
    assert settings.docs_enabled is True
