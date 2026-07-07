from httpx import AsyncClient


async def _auth_headers(client: AsyncClient, email: str) -> dict[str, str]:
    await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "password123", "display_name": "User"},
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "password123"},
    )
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


async def test_dashboard_crud_ownership_and_quota(client: AsyncClient) -> None:
    owner = await _auth_headers(client, "owner@example.com")

    created = await client.post(
        "/api/v1/dashboards", json={"title": "Sales"}, headers=owner
    )
    assert created.status_code == 201
    dashboard = created.json()
    assert dashboard["title"] == "Sales"
    assert dashboard["status"] == "draft"
    dashboard_id = dashboard["id"]

    listed = await client.get("/api/v1/dashboards", headers=owner)
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    fetched = await client.get(f"/api/v1/dashboards/{dashboard_id}", headers=owner)
    assert fetched.status_code == 200

    patched = await client.patch(
        f"/api/v1/dashboards/{dashboard_id}",
        json={"title": "Sales 2026"},
        headers=owner,
    )
    assert patched.status_code == 200
    assert patched.json()["title"] == "Sales 2026"

    over_quota = await client.post(
        "/api/v1/dashboards", json={"title": "Second"}, headers=owner
    )
    assert over_quota.status_code == 403

    intruder = await _auth_headers(client, "intruder@example.com")
    stolen = await client.get(
        f"/api/v1/dashboards/{dashboard_id}", headers=intruder
    )
    assert stolen.status_code == 404

    deleted = await client.delete(
        f"/api/v1/dashboards/{dashboard_id}", headers=owner
    )
    assert deleted.status_code == 204

    empty = await client.get("/api/v1/dashboards", headers=owner)
    assert empty.json() == []


async def test_requires_authentication(client: AsyncClient) -> None:
    response = await client.get("/api/v1/dashboards")
    assert response.status_code == 401
