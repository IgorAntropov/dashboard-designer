import base64
import hashlib
import hmac
import json

from httpx import AsyncClient


async def _webhook(
    client: AsyncClient,
    user_id: str,
    status: str,
    amount: int = 0,
    tx: str = "tx",
) -> None:
    body = json.dumps(
        {
            "TransactionId": tx,
            "AccountId": user_id,
            "Status": status,
            "Amount": amount,
        }
    ).encode()
    signature = base64.b64encode(
        hmac.new(b"", body, hashlib.sha256).digest()
    ).decode()
    response = await client.post(
        "/api/v1/billing/webhook/cloudpayments",
        content=body,
        headers={"Content-HMAC": signature, "Content-Type": "application/json"},
    )
    assert response.status_code == 200


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


async def test_webhook_cancel_downgrades_to_free(client: AsyncClient) -> None:
    headers = await _auth_headers(client)
    user_id = (await client.get("/api/v1/me", headers=headers)).json()["id"]

    await _webhook(client, user_id, "Completed", amount=490, tx="tx-pro")
    active = (await client.get("/api/v1/billing/status", headers=headers)).json()
    assert active["tier"] == "pro"
    assert active["status"] == "active"

    await _webhook(client, user_id, "Cancelled", tx="tx-cancel")
    canceled = (await client.get("/api/v1/billing/status", headers=headers)).json()
    assert canceled["tier"] == "free"
    assert canceled["status"] == "canceled"


async def test_webhook_failed_marks_past_due(client: AsyncClient) -> None:
    headers = await _auth_headers(client)
    user_id = (await client.get("/api/v1/me", headers=headers)).json()["id"]

    await _webhook(client, user_id, "Completed", amount=490, tx="tx-pro")
    await _webhook(client, user_id, "Declined", tx="tx-fail")

    status = (await client.get("/api/v1/billing/status", headers=headers)).json()
    assert status["tier"] == "pro"
    assert status["status"] == "past_due"
