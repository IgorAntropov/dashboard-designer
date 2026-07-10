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
    assert body["allowed_domains"] == []


async def test_public_config_unknown_token_returns_404(client: AsyncClient) -> None:
    response = await client.get("/api/v1/public/embed/does-not-exist")
    assert response.status_code == 404


async def test_live_ingest_requires_matching_key(client: AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "ingest@example.com",
            "password": "password123",
            "display_name": "Ingest",
        },
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "ingest@example.com", "password": "password123"},
    )
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    created = await client.post(
        "/api/v1/dashboards", json={"title": "Live"}, headers=headers
    )
    dashboard_id = created.json()["id"]
    published = await client.post(
        f"/api/v1/dashboards/{dashboard_id}/publish",
        json={"allowed_domains": []},
        headers=headers,
    )
    body = published.json()
    token = body["token"]
    ingest_key = body["ingest_key"]
    assert ingest_key

    missing = await client.post(
        f"/api/v1/public/embed/{token}/live", json={"a": [1]}
    )
    assert missing.status_code == 403

    wrong = await client.post(
        f"/api/v1/public/embed/{token}/live",
        json={"a": [1]},
        headers={"X-Ingest-Key": "nope"},
    )
    assert wrong.status_code == 403

    ok = await client.post(
        f"/api/v1/public/embed/{token}/live",
        json={"a": [1]},
        headers={"X-Ingest-Key": ingest_key},
    )
    assert ok.status_code == 202


async def test_embed_loads_are_counted_in_analytics(client: AsyncClient) -> None:
    dashboard_id, token = await _publish(client)

    await client.get(f"/api/v1/public/embed/{token}")
    await client.get(f"/api/v1/public/embed/{token}")

    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "embed@example.com", "password": "password123"},
    )
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    analytics = await client.get(
        f"/api/v1/dashboards/{dashboard_id}/analytics", headers=headers
    )

    assert analytics.status_code == 200
    body = analytics.json()
    assert body["total"] == 2
    assert sum(day["count"] for day in body["days"]) == 2
