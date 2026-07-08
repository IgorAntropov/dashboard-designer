from httpx import AsyncClient


async def _auth_headers(client: AsyncClient) -> dict[str, str]:
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "pub@example.com",
            "password": "password123",
            "display_name": "Pub",
        },
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "pub@example.com", "password": "password123"},
    )
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


async def test_publish_returns_token_and_marks_published(client: AsyncClient) -> None:
    headers = await _auth_headers(client)
    created = await client.post(
        "/api/v1/dashboards", json={"title": "Sales"}, headers=headers
    )
    dashboard_id = created.json()["id"]

    published = await client.post(
        f"/api/v1/dashboards/{dashboard_id}/publish",
        json={"allowed_domains": ["example.com"]},
        headers=headers,
    )

    assert published.status_code == 200
    body = published.json()
    assert body["status"] == "published"
    assert body["allowed_domains"] == ["example.com"]
    assert len(body["token"]) > 10

    again = await client.post(
        f"/api/v1/dashboards/{dashboard_id}/publish",
        json={"allowed_domains": ["other.com"]},
        headers=headers,
    )
    assert again.json()["token"] == body["token"]
    assert again.json()["allowed_domains"] == ["other.com"]
