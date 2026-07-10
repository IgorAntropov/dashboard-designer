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
    assert over_quota.json()["code"] == "quota_dashboards"

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


async def test_custom_theme_requires_paid_plan(client: AsyncClient) -> None:
    owner = await _auth_headers(client, "theme@example.com")
    created = await client.post(
        "/api/v1/dashboards", json={"title": "Themed"}, headers=owner
    )
    dashboard_id = created.json()["id"]
    tokens = {"colorAccent": "#ff0000", "colorBg": "#101010"}

    blocked = await client.patch(
        f"/api/v1/dashboards/{dashboard_id}",
        json={"theme_key": "custom", "theme_tokens": tokens},
        headers=owner,
    )
    assert blocked.status_code == 403
    assert blocked.json()["code"] == "custom_theme_paid"

    await client.patch(
        "/api/v1/me/subscription", json={"tier": "pro"}, headers=owner
    )
    allowed = await client.patch(
        f"/api/v1/dashboards/{dashboard_id}",
        json={"theme_key": "custom", "theme_tokens": tokens},
        headers=owner,
    )
    assert allowed.status_code == 200
    assert allowed.json()["theme_tokens"] == tokens


async def test_free_tier_widget_cap(client: AsyncClient) -> None:
    owner = await _auth_headers(client, "cap@example.com")
    created = await client.post(
        "/api/v1/dashboards", json={"title": "Capped"}, headers=owner
    )
    dashboard_id = created.json()["id"]

    def widgets(count: int) -> dict[str, object]:
        return {"layout": {"widgets": [{"id": str(i)} for i in range(count)]}}

    ok = await client.patch(
        f"/api/v1/dashboards/{dashboard_id}", json=widgets(5), headers=owner
    )
    assert ok.status_code == 200

    over = await client.patch(
        f"/api/v1/dashboards/{dashboard_id}", json=widgets(6), headers=owner
    )
    assert over.status_code == 403
    assert over.json()["code"] == "quota_widgets"

    intruder = await _auth_headers(client, "cap-intruder@example.com")
    stolen = await client.patch(
        f"/api/v1/dashboards/{dashboard_id}", json=widgets(1), headers=intruder
    )
    assert stolen.status_code == 404
    assert stolen.json()["code"] == "not_found"
