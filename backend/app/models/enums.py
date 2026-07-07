import enum


class SubscriptionTier(str, enum.Enum):
    free = "free"
    pro = "pro"
    unlimited = "unlimited"


class DashboardStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
