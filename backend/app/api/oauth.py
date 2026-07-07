import secrets
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse

from app.api.deps import SessionDep
from app.core.config import Settings, get_settings
from app.schemas.auth import TokenPair
from app.services.auth import AuthService
from app.services.oauth.base import OAuthProvider
from app.services.oauth.registry import UnknownProviderError, build_provider

router = APIRouter(prefix="/auth/oauth", tags=["oauth"])

STATE_COOKIE = "panelka_oauth_state"


def get_provider(
    provider: str,
    settings: Annotated[Settings, Depends(get_settings)],
) -> OAuthProvider:
    try:
        return build_provider(provider, settings)
    except UnknownProviderError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Unknown provider"
        ) from exc


ProviderDep = Annotated[OAuthProvider, Depends(get_provider)]
SettingsDep = Annotated[Settings, Depends(get_settings)]


@router.get("/{provider}/start")
async def start(provider_impl: ProviderDep, settings: SettingsDep) -> RedirectResponse:
    state = secrets.token_urlsafe(24)
    response = RedirectResponse(provider_impl.authorization_url(state))
    response.set_cookie(
        STATE_COOKIE,
        state,
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        max_age=600,
    )
    return response


@router.get("/{provider}/callback", response_model=TokenPair)
async def callback(
    provider_impl: ProviderDep,
    session: SessionDep,
    request: Request,
    response: Response,
    code: str,
    state: str,
) -> TokenPair:
    expected_state = request.cookies.get(STATE_COOKIE)
    if expected_state is None or not secrets.compare_digest(expected_state, state):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth state"
        )

    identity = await provider_impl.fetch_identity(code)
    service = AuthService(session)
    user = await service.upsert_oauth_user(identity)
    tokens = await service.issue_tokens(user)
    await session.commit()

    response.delete_cookie(STATE_COOKIE)
    return tokens
