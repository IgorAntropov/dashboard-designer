from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class OAuthIdentity:
    provider: str
    provider_user_id: str
    email: str | None
    display_name: str


class OAuthProvider(Protocol):
    name: str

    def authorization_url(self, state: str) -> str: ...

    async def fetch_identity(self, code: str) -> OAuthIdentity: ...
