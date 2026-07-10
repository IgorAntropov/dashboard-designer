import uuid

from fastapi import APIRouter, status

from app.api.deps import CurrentUserDep, SessionDep
from app.core.errors import AppError
from app.models.user_theme import UserTheme
from app.schemas.user_theme import (
    UserThemeCreate,
    UserThemeOut,
    UserThemeUpdate,
)
from app.services.user_theme import UserThemeNotFoundError, UserThemeService

router = APIRouter(prefix="/me/themes", tags=["themes"])

_NOT_FOUND = AppError(status.HTTP_404_NOT_FOUND, "not_found", "Theme not found")


@router.get("", response_model=list[UserThemeOut])
async def list_themes(
    current_user: CurrentUserDep, session: SessionDep
) -> list[UserTheme]:
    return await UserThemeService(session).list(current_user)


@router.post("", response_model=UserThemeOut, status_code=status.HTTP_201_CREATED)
async def create_theme(
    payload: UserThemeCreate, current_user: CurrentUserDep, session: SessionDep
) -> UserTheme:
    theme = await UserThemeService(session).create(current_user, payload)
    await session.commit()
    return theme


@router.patch("/{theme_id}", response_model=UserThemeOut)
async def update_theme(
    theme_id: uuid.UUID,
    payload: UserThemeUpdate,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> UserTheme:
    try:
        theme = await UserThemeService(session).update(
            current_user, theme_id, payload
        )
    except UserThemeNotFoundError as exc:
        raise _NOT_FOUND from exc
    await session.commit()
    return theme


@router.delete("/{theme_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_theme(
    theme_id: uuid.UUID, current_user: CurrentUserDep, session: SessionDep
) -> None:
    try:
        await UserThemeService(session).delete(current_user, theme_id)
    except UserThemeNotFoundError as exc:
        raise _NOT_FOUND from exc
    await session.commit()
