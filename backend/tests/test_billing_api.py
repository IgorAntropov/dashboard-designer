from httpx import AsyncClient


async def _auth_headers(client: AsyncClient) -> dict[str, str]:
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "bill@example.com",
            "password": "password123",
            "display_name": "Bill",
        },
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "bill@example.com", "password": "password123"},
    )
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


async def test_subscribe_returns_checkout_for_paid_tier(client: AsyncClient) -> None:
    headers = await _auth_headers(client)

    response = await client.post(
        "/api/v1/billing/subscribe", json={"tier": "pro"}, headers=headers
    )

    assert response.status_code == 200
    body = response.json()
    assert body["tier"] == "pro"
    assert body["amount"] == 490
    assert body["currency"] == "RUB"
    assert body["provider"] == "cloudpayments"


async def test_subscribe_rejects_free_tier(client: AsyncClient) -> None:
    headers = await _auth_headers(client)

    response = await client.post(
        "/api/v1/billing/subscribe", json={"tier": "free"}, headers=headers
    )

    assert response.status_code == 400
