import base64
import hashlib
import hmac
import json

from httpx import AsyncClient


def _sign(body: bytes) -> str:
    return base64.b64encode(hmac.new(b"", body, hashlib.sha256).digest()).decode()


async def test_webhook_activates_tier_and_is_idempotent(client: AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "wh@example.com",
            "password": "password123",
            "display_name": "WH",
        },
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "wh@example.com", "password": "password123"},
    )
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    me = await client.get("/api/v1/me", headers=headers)
    user_id = me.json()["id"]

    body = json.dumps(
        {
            "TransactionId": "tx-1",
            "AccountId": user_id,
            "Status": "Completed",
            "Amount": 490,
            "Data": {"tier": "unlimited"},
        }
    ).encode()
    signature = _sign(body)

    first = await client.post(
        "/api/v1/billing/webhook/cloudpayments",
        content=body,
        headers={"Content-HMAC": signature, "Content-Type": "application/json"},
    )
    assert first.status_code == 200
    assert first.json() == {"code": 0}

    upgraded = await client.get("/api/v1/me", headers=headers)
    assert upgraded.json()["subscription_tier"] == "pro"

    second = await client.post(
        "/api/v1/billing/webhook/cloudpayments",
        content=body,
        headers={"Content-HMAC": signature, "Content-Type": "application/json"},
    )
    assert second.status_code == 200


async def test_webhook_rejects_bad_signature(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/billing/webhook/cloudpayments",
        content=b"{}",
        headers={"Content-HMAC": "wrong", "Content-Type": "application/json"},
    )
    assert response.status_code == 400
