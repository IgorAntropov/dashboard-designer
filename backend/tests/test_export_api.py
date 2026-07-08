from httpx import AsyncClient


async def _auth_headers(client: AsyncClient) -> dict[str, str]:
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "exp@example.com",
            "password": "password123",
            "display_name": "Exp",
        },
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "exp@example.com", "password": "password123"},
    )
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


async def test_export_requires_paid_tier(client: AsyncClient) -> None:
    headers = await _auth_headers(client)
    created = await client.post(
        "/api/v1/dashboards", json={"title": "Exportable"}, headers=headers
    )
    dashboard_id = created.json()["id"]

    forbidden = await client.post(
        f"/api/v1/dashboards/{dashboard_id}/export", headers=headers
    )
    assert forbidden.status_code == 403

    await client.patch(
        "/api/v1/me/subscription", json={"tier": "pro"}, headers=headers
    )

    exported = await client.post(
        f"/api/v1/dashboards/{dashboard_id}/export", headers=headers
    )
    assert exported.status_code == 200
    body = exported.json()
    assert body["title"] == "Exportable"
    assert "layout" in body
