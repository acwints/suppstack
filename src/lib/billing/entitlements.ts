/**
 * Premium subscription entitlements.
 *
 * RevenueCat is the billing system of record (Apple IAP in the iOS app,
 * RevenueCat Web Billing on the web). Its webhooks mirror subscription state
 * into the `user_entitlements` table (see migration 0005), and the app checks
 * premium status with a plain RLS-protected query via these helpers.
 */

export const PREMIUM_ENTITLEMENT = 'premium';

export type EntitlementStatus =
  | 'active'
  | 'trialing'
  | 'cancelled'
  | 'billing_issue'
  | 'expired';

export interface UserEntitlement {
  entitlement_id: string;
  user_id: string;
  entitlement: string;
  status: EntitlementStatus;
  store: string;
  product_id?: string | null;
  current_period_end?: string | null;
  will_renew: boolean;
  updated_at?: string;
}

/**
 * Whether an entitlement row currently grants access.
 *
 * 'cancelled' only means auto-renew was turned off — the paid period keeps
 * running until current_period_end, so it still grants access until then.
 * A missing current_period_end (promotional / lifetime grants) never expires.
 */
export function isEntitlementActive(
  row: Pick<UserEntitlement, 'status' | 'current_period_end'> | null | undefined,
  now: Date = new Date()
): boolean {
  if (!row) return false;
  if (row.status === 'expired') return false;
  if (!row.current_period_end) {
    return row.status === 'active' || row.status === 'trialing';
  }
  return new Date(row.current_period_end).getTime() > now.getTime();
}

/**
 * RevenueCat Web Billing purchase link for the premium plan, bound to a
 * Supabase user id so the webhook can attribute the purchase. Purchase links
 * accept the app user id as a path segment: https://pay.rev.cat/<id>/<user>.
 * Returns null until NEXT_PUBLIC_PREMIUM_CHECKOUT_URL is configured.
 */
export function premiumCheckoutUrl(userId: string): string | null {
  const base = process.env.NEXT_PUBLIC_PREMIUM_CHECKOUT_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/${encodeURIComponent(userId)}`;
}

/** What the premium tier includes — single source for paywall/pricing copy. */
export const PREMIUM_FEATURES = [
  {
    name: 'Wellness trends',
    description: 'Charts of energy, sleep, and mood over time from your daily logs.',
  },
  {
    name: 'Efficacy insights',
    description: 'See which supplements correlate with how you actually feel.',
  },
  {
    name: 'Restock reminders',
    description: 'Know when each container runs out based on your logging pace.',
  },
  {
    name: 'Cost analytics',
    description: 'Monthly and annual spend breakdowns across your whole regimen.',
  },
] as const;

export const PREMIUM_PRICE_LABEL = '$4.99/mo';
