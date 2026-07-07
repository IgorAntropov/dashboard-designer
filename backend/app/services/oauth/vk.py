from urllib.parse import urlencode

import httpx

from app.services.oauth.base import OAuthIdentity

AUTHORIZE_URL = "https://oauth.vk.com/authorize"
TOKEN_URL = "https://oauth.vk.com/access_token"
INFO_URL = "https://api.vk.com/method/users.get"
API_VERSION = "5.199"


class VkOAuthProvider:
    name = "vk"

    def __init__(self, client_id: str, client_secret: str, redirect_uri: str) -> None:
        self._client_id = client_id
        self._client_secret = client_secret
        self._redirect_uri = redirect_uri

    def authorization_url(self, state: str) -> str:
        query = urlencode(
            {
                "client_id": self._client_id,
                "redirect_uri": self._redirect_uri,
                "response_type": "code",
                "scope": "email",
                "state": state,
                "v": API_VERSION,
            }
        )
        return f"{AUTHORIZE_URL}?{query}"

    async def fetch_identity(self, code: str) -> OAuthIdentity:
        async with httpx.AsyncClient(timeout=10.0) as client:
            token_response = await client.get(
                TOKEN_URL,
                params={
                    "client_id": self._client_id,
                    "client_secret": self._client_secret,
                    "redirect_uri": self._redirect_uri,
                    "code": code,
                },
            )
            token_response.raise_for_status()
            token_data = token_response.json()
            access_token = token_data["access_token"]
            user_id = str(token_data["user_id"])
            email = token_data.get("email")

            info_response = await client.get(
                INFO_URL,
                params={"access_token": access_token, "v": API_VERSION},
            )
            info_response.raise_for_status()
            items = info_response.json().get("response", [])

        first = items[0] if items else {}
        name_parts = [first.get("first_name"), first.get("last_name")]
        display_name = " ".join(part for part in name_parts if part) or "VK user"

        return OAuthIdentity(
            provider=self.name,
            provider_user_id=user_id,
            email=email,
            display_name=display_name,
        )
