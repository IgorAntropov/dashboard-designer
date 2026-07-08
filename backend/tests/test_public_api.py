from httpx import AsyncClient


async def _publish(client: AsyncClient) -> tuple[str, str]:
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "embed@example.com",
            "password": "password123",
            "display_name": "Embed",
        },
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "embed@example.com", "password": "password123"},
    )
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    created = await client.post(
        "/api/v1/dashboards", json={"title": "Public"}, headers=headers
    )
    dashboard_id = created.json()["id"]
    published = await client.post(
        f"/api/v1/dashboards/{dashboard_id}/publish",
        json={"allowed_domains": []},
        headers=headers,
    )
    return dashboard_id, published.json()["token"]


async def test_public_config_after_publish(client: AsyncClient) -> None:
    dashboard_id, token = await _publish(client)

    response = await client.get(f"/api/v1/public/embed/{token}")

    assert response.status_code == 200
    body = response.json()
    assert body["dashboard_id"] == dashboard_id
    assert body["attribution"] is True


async def test_public_config_unknown_token_returns_404(client: AsyncClient) -> None:
    response = await client.get("/api/v1/public/embed/does-not-exist")
    assert response.status_code == 404
