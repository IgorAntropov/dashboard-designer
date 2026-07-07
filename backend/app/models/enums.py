import enum


class SubscriptionTier(str, enum.Enum):
    free = "free"
    pro = "pro"
    unlimited = "unlimited"
