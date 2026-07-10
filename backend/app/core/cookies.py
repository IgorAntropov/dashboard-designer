from fastapi import Response

from app.core.config import get_settings

REFRESH_COOKIE = "panelka_refresh"
REFRESH_PATH = "/api/v1/auth"


def set_refresh_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        REFRESH_COOKIE,
        token,
        max_age=settings.jwt_refresh_ttl_sec,
        httponly=True,
        samesite="lax",
        secure=settings.environment == "production",
        path=REFRESH_PATH,
    )


def clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(REFRESH_COOKIE, path=REFRESH_PATH)
