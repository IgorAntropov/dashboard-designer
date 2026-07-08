from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import SubscriptionTier
from app.models.user import User


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def update_display_name(self, user: User, display_name: str) -> User:
        user.display_name = display_name
        await self._session.flush()
        return user

    async def update_tier(self, user: User, tier: SubscriptionTier) -> User:
        user.subscription_tier = tier
        await self._session.flush()
        return user
