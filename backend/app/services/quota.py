from app.models.enums import SubscriptionTier

DASHBOARD_LIMITS: dict[SubscriptionTier, int | None] = {
    SubscriptionTier.free: 1,
    SubscriptionTier.pro: 3,
    SubscriptionTier.unlimited: None,
}


def dashboard_limit(tier: SubscriptionTier) -> int | None:
    return DASHBOARD_LIMITS[tier]
