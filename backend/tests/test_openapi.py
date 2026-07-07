from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app


def test_docs_enabled_and_bearer_scheme_in_development() -> None:
    client = TestClient(create_app(Settings(environment="development")))

    assert client.get("/docs").status_code == 200

    schema = client.get("/openapi.json").json()
    assert schema["components"]["securitySchemes"]["BearerAuth"] == {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
    }


def test_docs_gated_in_production() -> None:
    client = TestClient(create_app(Settings(environment="production")))

    assert client.get("/docs").status_code == 404
    assert client.get("/redoc").status_code == 404
    assert client.get("/openapi.json").status_code == 404
