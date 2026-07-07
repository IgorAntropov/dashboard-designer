from fastapi import APIRouter

from app.api.deps import CurrentUserDep
from app.models.user import User
from app.schemas.auth import UserOut

router = APIRouter(tags=["users"])


@router.get("/me", response_model=UserOut)
async def me(current_user: CurrentUserDep) -> User:
    return current_user
