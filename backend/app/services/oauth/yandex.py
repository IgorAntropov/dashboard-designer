from urllib.parse import urlencode

import httpx

from app.services.oauth.base import OAuthIdentity

AUTHORIZE_URL = "https://oauth.yandex.ru/authorize"
TOKEN_URL = "https://oauth.yandex.ru/token"
INFO_URL = "https://login.yandex.ru/info"


class YandexOAuthProvider:
    name = "yandex"

    def __init__(self, client_id: str, client_secret: str, redirect_uri: str) -> None:
        self._client_id = client_id
        self._client_secret = client_secret
        self._redirect_uri = redirect_uri

    def authorization_url(self, state: str) -> str:
        query = urlencode(
            {
                "response_type": "code",
                "client_id": self._client_id,
                "redirect_uri": self._redirect_uri,
                "state": state,
            }
        )
        return f"{AUTHORIZE_URL}?{query}"

    async def fetch_identity(self, code: str) -> OAuthIdentity:
        async with httpx.AsyncClient(timeout=10.0) as client:
            token_response = await client.post(
                TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "client_id": self._client_id,
                    "client_secret": self._client_secret,
                },
            )
            token_response.raise_for_status()
            access_token = token_response.json()["access_token"]

            info_response = await client.get(
                INFO_URL,
                params={"format": "json"},
                headers={"Authorization": f"OAuth {access_token}"},
            )
            info_response.raise_for_status()
            info = info_response.json()

        return OAuthIdentity(
            provider=self.name,
            provider_user_id=str(info["id"]),
            email=info.get("default_email"),
            display_name=info.get("real_name") or info.get("login") or "Yandex user",
        )
