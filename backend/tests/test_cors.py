from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app


def test_cors_allows_configured_origin() -> None:
    client = TestClient(
        create_app(Settings(cors_origins=["http://localhost:3000"]))
    )

    response = client.get(
        "/api/v1/version", headers={"Origin": "http://localhost:3000"}
    )

    assert response.status_code == 200
    assert (
        response.headers.get("access-control-allow-origin")
        == "http://localhost:3000"
    )


def test_cors_omits_header_for_unlisted_origin() -> None:
    client = TestClient(
        create_app(Settings(cors_origins=["http://localhost:3000"]))
    )

    response = client.get(
        "/api/v1/version", headers={"Origin": "http://evil.example"}
    )

    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers
