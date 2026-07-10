from fastapi import APIRouter, Cookie, HTTPException, Response, status

from app.api.deps import CurrentUserDep, SessionDep
from app.core.cookies import clear_refresh_cookie, set_refresh_cookie
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenPair,
    UserOut,
)
from app.services.auth import (
    AuthService,
    EmailAlreadyUsedError,
    InvalidCredentialsError,
    InvalidRefreshTokenError,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _tokens_with_cookie(response: Response, tokens: TokenPair) -> TokenPair:
    set_refresh_cookie(response, tokens.refresh_token)
    return TokenPair(access_token=tokens.access_token, refresh_token="")


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, session: SessionDep) -> User:
    service = AuthService(session)
    try:
        user = await service.register(
            payload.email, payload.password, payload.display_name
        )
    except EmailAlreadyUsedError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
        ) from exc
    await session.commit()
    return user


@router.post("/login", response_model=TokenPair)
async def login(
    payload: LoginRequest, response: Response, session: SessionDep
) -> TokenPair:
    service = AuthService(session)
    try:
        user = await service.authenticate(payload.email, payload.password)
    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        ) from exc
    tokens = await service.issue_tokens(user)
    await session.commit()
    return _tokens_with_cookie(response, tokens)


@router.post("/refresh", response_model=TokenPair)
async def refresh(
    response: Response,
    session: SessionDep,
    payload: RefreshRequest | None = None,
    panelka_refresh: str | None = Cookie(default=None),
) -> TokenPair:
    supplied = (payload.refresh_token if payload else None) or panelka_refresh
    if not supplied:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )
    service = AuthService(session)
    try:
        tokens = await service.rotate(supplied)
    except InvalidRefreshTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        ) from exc
    await session.commit()
    return _tokens_with_cookie(response, tokens)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> None:
    clear_refresh_cookie(response)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> None:
    service = AuthService(session)
    try:
        await service.change_password(
            current_user, payload.current_password, payload.new_password
        )
    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        ) from exc
    await session.commit()
