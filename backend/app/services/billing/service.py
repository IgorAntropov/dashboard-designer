import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import SubscriptionTier
from app.models.processed_webhook import ProcessedWebhook
from app.models.subscription import Subscription
from app.models.user import User
from app.services.billing.base import WebhookEvent
from app.services.billing.plans import PLAN_PRICES

PERIOD_DAYS = 30

_PRICE_TO_TIER = {
    price: tier for tier, price in PLAN_PRICES.items() if price > 0
}


class BillingService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def apply_event(self, provider: str, event: WebhookEvent) -> None:
        event_key = f"{provider}:{event.event_id}"
        if event.event_id:
            seen = await self._session.scalar(
                select(ProcessedWebhook).where(
                    ProcessedWebhook.event_key == event_key
                )
            )
            if seen is not None:
                return
            self._session.add(
                ProcessedWebhook(provider=provider, event_key=event_key)
            )

        user = await self._load_user(event.account_id)
        if user is None:
            await self._session.flush()
            return

        if event.status == "success":
            tier = self._tier_for_amount(event.amount)
            if tier is not None:
                await self._activate(user, provider, event, tier)
        elif event.status == "canceled":
            await self._downgrade(user)
        elif event.status == "failed":
            await self._mark_past_due(user)

        await self._session.flush()

    def _tier_for_amount(self, amount: float | None) -> SubscriptionTier | None:
        if amount is None:
            return None
        return _PRICE_TO_TIER.get(int(amount))

    async def _load_user(self, account_id: str) -> User | None:
        try:
            user_id = uuid.UUID(account_id)
        except ValueError:
            return None
        return await self._session.get(User, user_id)

    async def _subscription(self, user: User) -> Subscription | None:
        return await self._session.scalar(
            select(Subscription).where(Subscription.user_id == user.id)
        )

    async def _activate(
        self,
        user: User,
        provider: str,
        event: WebhookEvent,
        tier: SubscriptionTier,
    ) -> None:
        user.subscription_tier = tier
        period_end = datetime.now(tz=UTC) + timedelta(days=PERIOD_DAYS)

        subscription = await self._subscription(user)
        if subscription is None:
            self._session.add(
                Subscription(
                    user_id=user.id,
                    tier=tier.value,
                    status="active",
                    provider=provider,
                    provider_sub_id=event.event_id,
                    current_period_end=period_end,
                )
            )
        else:
            subscription.tier = tier.value
            subscription.status = "active"
            subscription.provider = provider
            subscription.provider_sub_id = event.event_id
            subscription.current_period_end = period_end

    async def _downgrade(self, user: User) -> None:
        user.subscription_tier = SubscriptionTier.free
        subscription = await self._subscription(user)
        if subscription is not None:
            subscription.status = "canceled"

    async def _mark_past_due(self, user: User) -> None:
        subscription = await self._subscription(user)
        if subscription is not None:
            subscription.status = "past_due"
