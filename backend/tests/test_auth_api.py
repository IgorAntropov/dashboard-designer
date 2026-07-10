from httpx import AsyncClient

CREDENTIALS = {
    "email": "ann@example.com",
    "password": "password123",
    "display_name": "Ann",
}


async def test_register_login_me_and_refresh_flow(client: AsyncClient) -> None:
    registered = await client.post("/api/v1/auth/register", json=CREDENTIALS)
    assert registered.status_code == 201
    assert registered.json()["email"] == CREDENTIALS["email"]

    duplicate = await client.post("/api/v1/auth/register", json=CREDENTIALS)
    assert duplicate.status_code == 409

    logged_in = await client.post(
        "/api/v1/auth/login",
        json={"email": CREDENTIALS["email"], "password": CREDENTIALS["password"]},
    )
    assert logged_in.status_code == 200
    tokens = logged_in.json()
    access = tokens["access_token"]

    wrong = await client.post(
        "/api/v1/auth/login",
        json={"email": CREDENTIALS["email"], "password": "not-the-password"},
    )
    assert wrong.status_code == 401

    me = await client.get(
        "/api/v1/me", headers={"Authorization": f"Bearer {access}"}
    )
    assert me.status_code == 200
    assert me.json()["email"] == CREDENTIALS["email"]
    assert me.json()["subscription_tier"] == "free"

    anonymous = await client.get("/api/v1/me")
    assert anonymous.status_code == 401

    assert tokens["refresh_token"] == ""
    old_refresh = client.cookies.get("panelka_refresh")
    assert old_refresh

    rotated = await client.post("/api/v1/auth/refresh")
    assert rotated.status_code == 200
    assert rotated.json()["access_token"] != access
    assert rotated.json()["refresh_token"] == ""

    reused = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": old_refresh}
    )
    assert reused.status_code == 401
