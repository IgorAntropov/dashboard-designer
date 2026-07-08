from app.core.config import Settings
from app.services.billing.base import BillingProvider
from app.services.billing.cloudpayments import CloudPaymentsProvider


def get_billing_provider(settings: Settings) -> BillingProvider:
    return CloudPaymentsProvider(
        settings.cloudpayments_public_id,
        settings.cloudpayments_api_secret,
    )
