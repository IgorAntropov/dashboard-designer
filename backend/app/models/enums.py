import enum


class SubscriptionTier(enum.StrEnum):
    free = "free"
    pro = "pro"
    unlimited = "unlimited"


class DashboardStatus(enum.StrEnum):
    draft = "draft"
    published = "published"
