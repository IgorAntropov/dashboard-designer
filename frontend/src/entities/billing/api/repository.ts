import type { components } from '@shared/api'
import { api } from '@shared/api'

export type CheckoutResponse = components['schemas']['CheckoutResponse']
export type Tier = components['schemas']['SubscriptionTier']

export async function createCheckout(
  tier: Tier,
): Promise<CheckoutResponse | null> {
  const { data } = await api.POST('/api/v1/billing/subscribe', {
    body: { tier },
  })
  return data ?? null
}
