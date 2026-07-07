from app.core.config import Settings
from app.services.oauth.base import OAuthProvider
from app.services.oauth.vk import VkOAuthProvider
from app.services.oauth.yandex import YandexOAuthProvider


class UnknownProviderError(Exception):
    pass


def build_provider(name: str, settings: Settings) -> OAuthProvider:
    redirect_uri = f"{settings.oauth_redirect_base}/{name}/callback"
    if name == "yandex":
        return YandexOAuthProvider(
            settings.oauth_yandex_client_id,
            settings.oauth_yandex_client_secret,
            redirect_uri,
        )
    if name == "vk":
        return VkOAuthProvider(
            settings.oauth_vk_client_id,
            settings.oauth_vk_client_secret,
            redirect_uri,
        )
    raise UnknownProviderError(name)
