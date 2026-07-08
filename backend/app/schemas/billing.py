from pydantic import BaseModel

from app.models.enums import SubscriptionTier


class SubscribeRequest(BaseModel):
    tier: SubscriptionTier


class CheckoutResponse(BaseModel):
    provider: str
    public_id: str
    amount: int
    currency: str
    description: str
    account_id: str
    invoice_id: str
    tier: SubscriptionTier


class SubscriptionStatus(BaseModel):
    tier: SubscriptionTier
    status: str
