import { funnelStatusForOutcome, isCheckoutAttemptId } from '@/lib/commerce/checkout-funnel';

/** Fire-and-forget. Unknown outcomes are not sent and cannot be stored as completed. */
export function reportCheckoutFunnel(input: {
  outcome: string;
  attemptId: string;
  productId?: string;
  surface: 'product' | 'stack';
  nativeKit: boolean;
}): void {
  if (typeof window === 'undefined') return;
  if (!funnelStatusForOutcome(input.outcome) || !isCheckoutAttemptId(input.attemptId)) return;
  const status = funnelStatusForOutcome(input.outcome);
  void fetch('/api/commerce/checkout-funnel', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      attemptId: input.attemptId,
      status,
      productId: input.productId ?? null,
      surface: input.surface,
      nativeKit: input.nativeKit,
    }),
  }).catch(() => undefined);
}
