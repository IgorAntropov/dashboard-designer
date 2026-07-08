from app.models.enums import SubscriptionTier

PLAN_PRICES: dict[SubscriptionTier, int] = {
    SubscriptionTier.free: 0,
    SubscriptionTier.pro: 490,
    SubscriptionTier.unlimited: 990,
}
