from httpx import AsyncClient

CREDENTIALS = {
    "email": "profile@example.com",
    "password": "password123",
    "display_name": "Old Name",
}


async def _auth_headers(client: AsyncClient) -> dict[str, str]:
    await client.post("/api/v1/auth/register", json=CREDENTIALS)
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": CREDENTIALS["email"], "password": CREDENTIALS["password"]},
    )
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


async def test_update_display_name(client: AsyncClient) -> None:
    headers = await _auth_headers(client)

    response = await client.patch(
        "/api/v1/me", json={"display_name": "New Name"}, headers=headers
    )

    assert response.status_code == 200
    assert response.json()["display_name"] == "New Name"


async def test_subscription_upgrade_requires_payment(client: AsyncClient) -> None:
    headers = await _auth_headers(client)

    blocked = await client.patch(
        "/api/v1/me/subscription", json={"tier": "pro"}, headers=headers
    )
    assert blocked.status_code == 403
    assert blocked.json()["code"] == "tier_upgrade_paid"

    allowed = await client.patch(
        "/api/v1/me/subscription", json={"tier": "free"}, headers=headers
    )
    assert allowed.status_code == 200
    assert allowed.json()["subscription_tier"] == "free"


async def test_change_password_flow(client: AsyncClient) -> None:
    headers = await _auth_headers(client)

    wrong = await client.post(
        "/api/v1/auth/change-password",
        json={"current_password": "wrong-password", "new_password": "newsecret123"},
        headers=headers,
    )
    assert wrong.status_code == 401

    changed = await client.post(
        "/api/v1/auth/change-password",
        json={
            "current_password": CREDENTIALS["password"],
            "new_password": "newsecret123",
        },
        headers=headers,
    )
    assert changed.status_code == 204

    old_login = await client.post(
        "/api/v1/auth/login",
        json={"email": CREDENTIALS["email"], "password": CREDENTIALS["password"]},
    )
    assert old_login.status_code == 401

    new_login = await client.post(
        "/api/v1/auth/login",
        json={"email": CREDENTIALS["email"], "password": "newsecret123"},
    )
    assert new_login.status_code == 200
