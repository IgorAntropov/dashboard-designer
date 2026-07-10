from httpx import AsyncClient


async def _auth_headers(client: AsyncClient, email: str) -> dict[str, str]:
    await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "password123", "display_name": "T"},
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "password123"},
    )
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


async def test_user_theme_crud(client: AsyncClient) -> None:
    headers = await _auth_headers(client, "themes@example.com")

    empty = await client.get("/api/v1/me/themes", headers=headers)
    assert empty.status_code == 200
    assert empty.json() == []

    created = await client.post(
        "/api/v1/me/themes",
        json={"name": "Brand", "tokens": {"colorAccent": "#ff0000"}},
        headers=headers,
    )
    assert created.status_code == 201
    theme_id = created.json()["id"]
    assert created.json()["name"] == "Brand"

    listed = await client.get("/api/v1/me/themes", headers=headers)
    assert len(listed.json()) == 1

    updated = await client.patch(
        f"/api/v1/me/themes/{theme_id}",
        json={"name": "Brand 2"},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "Brand 2"

    deleted = await client.delete(
        f"/api/v1/me/themes/{theme_id}", headers=headers
    )
    assert deleted.status_code == 204

    gone = await client.get("/api/v1/me/themes", headers=headers)
    assert gone.json() == []


async def test_user_theme_ownership(client: AsyncClient) -> None:
    owner = await _auth_headers(client, "owner@example.com")
    other = await _auth_headers(client, "other@example.com")

    created = await client.post(
        "/api/v1/me/themes",
        json={"name": "Private", "tokens": {}},
        headers=owner,
    )
    theme_id = created.json()["id"]

    assert (await client.get("/api/v1/me/themes", headers=other)).json() == []

    forbidden = await client.patch(
        f"/api/v1/me/themes/{theme_id}",
        json={"name": "Hacked"},
        headers=other,
    )
    assert forbidden.status_code == 404
