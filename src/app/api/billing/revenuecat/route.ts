import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PREMIUM_ENTITLEMENT, type EntitlementStatus } from '@/lib/billing/entitlements';

/**
 * RevenueCat webhook receiver.
 *
 * RevenueCat is the billing system of record; this route mirrors subscription
 * state into `user_entitlements` so the app can check premium status with a
 * plain RLS-protected Supabase query. Configure in the RevenueCat dashboard:
 *   Integrations → Webhooks → URL: https://<host>/api/billing/revenuecat
 *   Authorization header: the value of REVENUECAT_WEBHOOK_AUTH_TOKEN.
 *
 * Clients identify to RevenueCat with the Supabase user id as the
 * app_user_id, which is how events map back to a row here.
 */

interface RevenueCatEvent {
  type: string;
  app_user_id?: string;
  original_app_user_id?: string;
  entitlement_ids?: string[];
  product_id?: string;
  store?: string;
  environment?: string;
  period_type?: string;
  expiration_at_ms?: number;
  cancel_reason?: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function statusForEventType(type: string, periodType?: string): EntitlementStatus | null {
  switch (type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'UNCANCELLATION':
    case 'PRODUCT_CHANGE':
      return periodType === 'TRIAL' ? 'trialing' : 'active';
    case 'CANCELLATION':
      return 'cancelled';
    case 'BILLING_ISSUE':
      return 'billing_issue';
    case 'EXPIRATION':
    case 'SUBSCRIPTION_PAUSED':
      return 'expired';
    default:
      // TEST, TRANSFER, NON_RENEWING_PURCHASE, etc. — acknowledged, not mapped.
      return null;
  }
}

function normalizeStore(store?: string): string {
  switch ((store || '').toUpperCase()) {
    case 'APP_STORE':
      return 'app_store';
    case 'PLAY_STORE':
      return 'play_store';
    case 'STRIPE':
      return 'stripe';
    case 'RC_BILLING':
      return 'rc_billing';
    case 'PROMOTIONAL':
      return 'promotional';
    default:
      return 'unknown';
  }
}

export async function POST(request: NextRequest) {
  const expectedAuth = process.env.REVENUECAT_WEBHOOK_AUTH_TOKEN;
  if (!expectedAuth) {
    return NextResponse.json(
      { error: 'Billing webhook is not configured.' },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('authorization') || '';
  // RevenueCat sends the configured value verbatim (commonly "Bearer <token>").
  if (authHeader !== expectedAuth && authHeader !== `Bearer ${expectedAuth}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let event: RevenueCatEvent | undefined;
  try {
    const body = await request.json();
    event = body?.event as RevenueCatEvent | undefined;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }
  if (!event?.type) {
    return NextResponse.json({ error: 'Missing event payload.' }, { status: 400 });
  }

  const status = statusForEventType(event.type, event.period_type);
  if (!status) {
    // Event types we don't track (e.g. TEST pings) are acknowledged so
    // RevenueCat doesn't retry them.
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const appUserId = event.app_user_id || event.original_app_user_id || '';
  if (!UUID_PATTERN.test(appUserId)) {
    // Anonymous RevenueCat ids ($RCAnonymousID:...) can't be mapped to a
    // Supabase user. Acknowledge to avoid retry loops; the state will sync
    // once the client logs in and RevenueCat aliases the id.
    return NextResponse.json({ received: true, ignored: 'unmapped app_user_id' });
  }

  // Only checked once the event actually requires a write, so TEST pings and
  // unmapped events succeed even before storage credentials are configured.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: 'Billing storage is not configured.' },
      { status: 503 }
    );
  }

  const entitlements = event.entitlement_ids?.length
    ? event.entitlement_ids
    : [PREMIUM_ENTITLEMENT];

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const rows = entitlements.map((entitlement) => ({
    user_id: appUserId,
    entitlement,
    status,
    store: normalizeStore(event!.store),
    product_id: event!.product_id || null,
    rc_app_user_id: appUserId,
    current_period_end: event!.expiration_at_ms
      ? new Date(event!.expiration_at_ms).toISOString()
      : null,
    will_renew: status === 'active' || status === 'trialing',
    metadata: {
      event_type: event!.type,
      period_type: event!.period_type,
      environment: event!.environment,
      cancel_reason: event!.cancel_reason,
    },
  }));

  const { error } = await supabase
    .from('user_entitlements')
    .upsert(rows, { onConflict: 'user_id,entitlement' });

  if (error) {
    // Non-2xx makes RevenueCat retry with backoff, which is what we want for
    // transient database failures.
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
