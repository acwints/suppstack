/**
 * First-party checkout counts. Rows older than this tracking, including
 * merchant checkouts since PR 45 (2026-11-07T21:44:42Z) and before this
 * writer shipped, are not in the table. Those are unknown, not zero.
 */
export const CHECKOUT_MEASUREMENT_START = '2026-11-07T21:44:42.000Z';

export const CHECKOUT_FUNNEL_PROVIDER = 'checkout_funnel';

export type CheckoutFunnelStatus = 'started' | 'completed' | 'dismissed' | 'failed';

const ATTEMPT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Unknown outcomes are rejected. They are never stored as completed. */
export function funnelStatusForOutcome(outcome: string): CheckoutFunnelStatus | null {
  if (outcome === 'completed') return 'completed';
  if (outcome === 'dismissed') return 'dismissed';
  if (outcome === 'failed') return 'failed';
  if (outcome === 'opened') return 'started';
  return null;
}

export function isCheckoutAttemptId(value: string): boolean {
  return ATTEMPT_ID.test(value);
}

export type CheckoutFunnelTotals = {
  started: number;
  completed: number;
  dismissed: number;
  failed: number;
};

/**
 * `completed` and `dismissed` both mean checkout was presented, so they count
 * as started. `failed` means it did not open or the kit reported failure, and
 * does not count as started or completed. Duplicate attempt ids count once.
 */
export function aggregateCheckoutFunnel(
  events: readonly { attemptId: string; status: CheckoutFunnelStatus }[]
): CheckoutFunnelTotals {
  const seen = new Set<string>();
  const totals: CheckoutFunnelTotals = { started: 0, completed: 0, dismissed: 0, failed: 0 };
  for (const event of events) {
    const id = event.attemptId.toLowerCase();
    if (seen.has(id)) continue;
    seen.add(id);
    if (event.status === 'completed') {
      totals.started += 1;
      totals.completed += 1;
    } else if (event.status === 'dismissed' || event.status === 'started') {
      totals.started += 1;
      if (event.status === 'dismissed') totals.dismissed += 1;
    } else if (event.status === 'failed') {
      totals.failed += 1;
    }
  }
  return totals;
}
