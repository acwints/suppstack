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

/**
 * What the premium tier includes — single source for paywall, gate, and
 * pricing copy. Every item must be a shipped feature, never a roadmap promise.
 */
export const PREMIUM_FEATURES = [
  {
    id: 'scan',
    name: 'Unlimited stack scans',
    description: 'Photograph your bottles and add the whole shelf in seconds.',
  },
  {
    id: 'restock',
    name: 'Restock forecasts',
    description: 'See when each bottle runs out, based on how you actually take it.',
  },
  {
    id: 'ingredients',
    name: 'Full ingredient breakdown',
    description: 'Every ingredient and dose across your stack, product by product.',
  },
] as const;

export type PremiumFeatureId = (typeof PREMIUM_FEATURES)[number]['id'];

/** Lifetime scans a free account gets before Premium is required. */
export const FREE_SCAN_LIMIT = 3;

/** Web fallback labels; the iOS paywall always shows Apple's localized prices. */
export const PREMIUM_PRICE_LABEL = '$5.99/mo';
export const PREMIUM_ANNUAL_PRICE_LABEL = '$39.99/yr';

/** Apple's standard EULA, which governs App Store subscriptions. */
export const APPLE_EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

/** Apple's subscription management sheet for the signed-in App Store account. */
export const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';
