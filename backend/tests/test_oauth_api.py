from fastapi import FastAPI
from httpx import AsyncClient

from app.api.oauth import get_provider
from app.services.oauth.base import OAuthIdentity


class FakeProvider:
    name = "yandex"

    def authorization_url(self, state: str) -> str:
        return f"https://provider.test/authorize?state={state}"

    async def fetch_identity(self, code: str) -> OAuthIdentity:
        return OAuthIdentity(
            provider="yandex",
            provider_user_id="42",
            email="oauth@example.com",
            display_name="OAuth User",
        )


async def _login(client: AsyncClient) -> dict[str, str]:
    started = await client.get(
        "/api/v1/auth/oauth/yandex/start", follow_redirects=False
    )
    assert started.status_code in (302, 307)
    state = client.cookies.get("panelka_oauth_state")
    assert state is not None
    callback = await client.get(
        "/api/v1/auth/oauth/yandex/callback",
        params={"code": "auth-code", "state": state},
    )
    assert callback.status_code == 200
    return callback.json()


async def test_oauth_login_creates_then_reuses_user(
    app_with_db: FastAPI, client: AsyncClient
) -> None:
    app_with_db.dependency_overrides[get_provider] = lambda: FakeProvider()

    tokens = await _login(client)
    me = await client.get(
        "/api/v1/me",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert me.status_code == 200
    assert me.json()["email"] == "oauth@example.com"

    reused_tokens = await _login(client)
    reused_me = await client.get(
        "/api/v1/me",
        headers={"Authorization": f"Bearer {reused_tokens['access_token']}"},
    )
    assert reused_me.status_code == 200
    assert reused_me.json()["id"] == me.json()["id"]


async def test_unknown_provider_returns_404(client: AsyncClient) -> None:
    response = await client.get(
        "/api/v1/auth/oauth/telegram/start", follow_redirects=False
    )
    assert response.status_code == 404
