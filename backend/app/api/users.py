from fastapi import APIRouter

from app.api.deps import CurrentUserDep, SessionDep
from app.models.user import User
from app.schemas.auth import SubscriptionUpdate, UserOut, UserUpdate
from app.services.user import UserService

router = APIRouter(tags=["users"])


@router.get("/me", response_model=UserOut)
async def me(current_user: CurrentUserDep) -> User:
    return current_user


@router.patch("/me", response_model=UserOut)
async def update_me(
    payload: UserUpdate, current_user: CurrentUserDep, session: SessionDep
) -> User:
    user = await UserService(session).update_display_name(
        current_user, payload.display_name
    )
    await session.commit()
    return user


@router.patch("/me/subscription", response_model=UserOut)
async def update_subscription(
    payload: SubscriptionUpdate, current_user: CurrentUserDep, session: SessionDep
) -> User:
    user = await UserService(session).update_tier(current_user, payload.tier)
    await session.commit()
    return user
