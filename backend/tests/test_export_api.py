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


async def test_export_requires_paid_tier(client: AsyncClient, activate_tier) -> None:
    headers = await _auth_headers(client)
    created = await client.post(
        "/api/v1/dashboards", json={"title": "Exportable"}, headers=headers
    )
    dashboard_id = created.json()["id"]

    forbidden = await client.post(
        f"/api/v1/dashboards/{dashboard_id}/export", headers=headers
    )
    assert forbidden.status_code == 403
    assert forbidden.json()["code"] == "export_paid"

    await activate_tier(headers, 490)

    exported = await client.post(
        f"/api/v1/dashboards/{dashboard_id}/export", headers=headers
    )
    assert exported.status_code == 200
    job = exported.json()
    assert job["status"] == "done"
    assert job["result"]["title"] == "Exportable"

    polled = await client.get(
        f"/api/v1/dashboards/exports/{job['id']}", headers=headers
    )
    assert polled.status_code == 200
    assert polled.json()["result"]["title"] == "Exportable"

    intruder = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "exp-intruder@example.com",
            "password": "password123",
            "display_name": "Other",
        },
    )
    assert intruder.status_code == 201
    other_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "exp-intruder@example.com", "password": "password123"},
    )
    other = {"Authorization": f"Bearer {other_login.json()['access_token']}"}
    stolen = await client.get(
        f"/api/v1/dashboards/exports/{job['id']}", headers=other
    )
    assert stolen.status_code == 404
