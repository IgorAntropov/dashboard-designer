from dataclasses import dataclass
from typing import Protocol

from app.models.enums import SubscriptionTier


@dataclass(frozen=True)
class CheckoutSession:
    public_id: str
    amount: int
    currency: str
    description: str
    account_id: str
    invoice_id: str
    tier: SubscriptionTier


@dataclass(frozen=True)
class WebhookEvent:
    event_id: str
    account_id: str
    tier: SubscriptionTier | None
    amount: float | None
    status: str


class BillingProvider(Protocol):
    name: str

    def create_checkout(self, user_id: str, tier: SubscriptionTier) -> CheckoutSession: ...

    def verify_and_parse(
        self, raw_body: bytes, signature: str | None
    ) -> WebhookEvent | None: ...
