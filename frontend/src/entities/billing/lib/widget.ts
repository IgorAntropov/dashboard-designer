import type { CheckoutResponse } from '../api/repository'

const SCRIPT_URL = 'https://widget.cloudpayments.ru/bundles/cloudpayments.js'

interface CloudPaymentsWidget {
  start(params: Record<string, unknown>): Promise<unknown>
}

type CloudPaymentsCtor = new () => CloudPaymentsWidget

interface CloudPaymentsWindow extends Window {
  cp?: { CloudPayments: CloudPaymentsCtor }
}

let loading: Promise<CloudPaymentsCtor> | null = null

function loadScript(): Promise<CloudPaymentsCtor> {
  if (loading) {
    return loading
  }
  loading = new Promise<CloudPaymentsCtor>((resolve, reject) => {
    const existing = (window as CloudPaymentsWindow).cp?.CloudPayments
    if (existing) {
      resolve(existing)
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => {
      const ctor = (window as CloudPaymentsWindow).cp?.CloudPayments
      if (ctor) {
        resolve(ctor)
      } else {
        reject(new Error('CloudPayments unavailable'))
      }
    }
    script.onerror = () => reject(new Error('CloudPayments script failed'))
    document.head.append(script)
  })
  return loading
}

export interface CheckoutHandlers {
  onSuccess?: () => void
  onFail?: () => void
}

export async function openCheckout(
  checkout: CheckoutResponse,
  handlers: CheckoutHandlers = {},
): Promise<void> {
  const CloudPayments = await loadScript()
  const widget = new CloudPayments()
  try {
    await widget.start({
      publicTerminalId: checkout.public_id,
      description: checkout.description,
      amount: checkout.amount,
      currency: checkout.currency,
      paymentSchema: 'Single',
      externalId: checkout.invoice_id,
      userInfo: { accountId: checkout.account_id },
      metadata: { tier: checkout.tier },
    })
    handlers.onSuccess?.()
  } catch {
    handlers.onFail?.()
  }
}
