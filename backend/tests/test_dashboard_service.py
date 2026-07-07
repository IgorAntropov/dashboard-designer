from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import SubscriptionTier
from app.models.user import User
from app.schemas.dashboard import DashboardCreate
from app.services.dashboard import DashboardService


async def test_duplicate_copies_content(session: AsyncSession) -> None:
    user = User(
        email="unlimited@example.com",
        display_name="Unlimited",
        subscription_tier=SubscriptionTier.unlimited,
    )
    session.add(user)
    await session.flush()

    service = DashboardService(session)
    original = await service.create(
        user,
        DashboardCreate(title="Metrics", layout={"widgets": ["a"]}),
    )

    copy = await service.duplicate(user, original.id)

    assert copy.id != original.id
    assert copy.title == "Metrics (copy)"
    assert copy.layout == {"widgets": ["a"]}
    assert copy.slug != original.slug

    dashboards = await service.list_for_user(user)
    assert len(dashboards) == 2
