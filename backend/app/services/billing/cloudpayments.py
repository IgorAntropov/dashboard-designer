import base64
import hashlib
import hmac
import json
import uuid
from typing import Any

from app.models.enums import SubscriptionTier
from app.services.billing.base import CheckoutSession, WebhookEvent
from app.services.billing.plans import PLAN_PRICES

_TIER_VALUES = {tier.value for tier in SubscriptionTier}


class CloudPaymentsProvider:
    name = "cloudpayments"

    def __init__(self, public_id: str, api_secret: str) -> None:
        self._public_id = public_id
        self._api_secret = api_secret

    def create_checkout(self, user_id: str, tier: SubscriptionTier) -> CheckoutSession:
        return CheckoutSession(
            public_id=self._public_id,
            amount=PLAN_PRICES[tier],
            currency="RUB",
            description=f"Panelka {tier.value} subscription",
            account_id=user_id,
            invoice_id=str(uuid.uuid4()),
            tier=tier,
        )

    def verify_and_parse(
        self, raw_body: bytes, signature: str | None
    ) -> WebhookEvent | None:
        if not self._is_valid_signature(raw_body, signature):
            return None

        try:
            data: dict[str, Any] = json.loads(raw_body)
        except json.JSONDecodeError:
            return None

        custom = data.get("Data") or data.get("Metadata") or {}
        if isinstance(custom, str):
            try:
                custom = json.loads(custom)
            except json.JSONDecodeError:
                custom = {}

        tier_raw = custom.get("tier") if isinstance(custom, dict) else None
        tier = (
            SubscriptionTier(tier_raw) if tier_raw in _TIER_VALUES else None
        )

        try:
            amount: float | None = float(data.get("Amount"))
        except (TypeError, ValueError):
            amount = None

        return WebhookEvent(
            event_id=str(data.get("TransactionId") or data.get("Id") or ""),
            account_id=str(data.get("AccountId") or ""),
            tier=tier,
            amount=amount,
            status=self._map_status(str(data.get("Status") or "Completed")),
        )

    def _is_valid_signature(self, raw_body: bytes, signature: str | None) -> bool:
        if not signature:
            return False
        digest = hmac.new(
            self._api_secret.encode(), raw_body, hashlib.sha256
        ).digest()
        expected = base64.b64encode(digest).decode()
        return hmac.compare_digest(expected, signature)

    def _map_status(self, status: str) -> str:
        normalized = status.lower()
        if normalized in {"completed", "authorized", "success"}:
            return "success"
        if normalized in {"cancelled", "canceled"}:
            return "canceled"
        return "failed"
