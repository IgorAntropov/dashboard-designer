import re

from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import create_app


def test_version_matches_settings_and_semver() -> None:
    client = TestClient(create_app())

    response = client.get("/api/v1/version")

    assert response.status_code == 200
    body = response.json()
    assert body == {"version": get_settings().app_version}
    assert re.fullmatch(r"\d+\.\d+\.\d+", body["version"])
