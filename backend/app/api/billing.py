from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUserDep
from app.core.config import get_settings
from app.models.enums import SubscriptionTier
from app.schemas.billing import (
    CheckoutResponse,
    SubscribeRequest,
    SubscriptionStatus,
)
from app.services.billing.factory import get_billing_provider

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/subscribe", response_model=CheckoutResponse)
async def subscribe(
    payload: SubscribeRequest, current_user: CurrentUserDep
) -> CheckoutResponse:
    if payload.tier == SubscriptionTier.free:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Free tier does not require checkout",
        )

    provider = get_billing_provider(get_settings())
    checkout = provider.create_checkout(str(current_user.id), payload.tier)
    return CheckoutResponse(
        provider=provider.name,
        public_id=checkout.public_id,
        amount=checkout.amount,
        currency=checkout.currency,
        description=checkout.description,
        account_id=checkout.account_id,
        invoice_id=checkout.invoice_id,
        tier=checkout.tier,
    )


@router.get("/status", response_model=SubscriptionStatus)
async def billing_status(current_user: CurrentUserDep) -> SubscriptionStatus:
    return SubscriptionStatus(tier=current_user.subscription_tier, status="active")
