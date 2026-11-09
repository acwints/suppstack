import { createHash, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  CHECKOUT_FUNNEL_PROVIDER,
  CHECKOUT_MEASUREMENT_START,
  aggregateCheckoutFunnel,
  isCheckoutAttemptId,
  type CheckoutFunnelStatus,
} from '@/lib/commerce/checkout-funnel';
import { getSupabaseServiceClient } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STATUSES: CheckoutFunnelStatus[] = ['started', 'completed', 'dismissed', 'failed'];
const PAGE_SIZE = 1000;
const MAX_PAGES = 20;

function noStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function unauthorized() {
  return noStore({ error: 'Unauthorized.' }, 401);
}

function tokensMatch(provided: string, expected: string): boolean {
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

function bearer(request: NextRequest): string {
  const header = request.headers.get('authorization') ?? '';
  return header.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? '';
}

function authorized(request: NextRequest): boolean {
  const expected = process.env.FEEDBACK_READ_TOKEN?.trim();
  const provided = bearer(request);
  if (!expected || !provided) return false;
  return tokensMatch(provided, expected);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return unauthorized();

  const supabase = getSupabaseServiceClient();
  if (!supabase) return noStore({ error: 'Checkout counts are unavailable.' }, 503);

  const events: { attemptId: string; status: CheckoutFunnelStatus }[] = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const from = page * PAGE_SIZE;
    const { data, error } = await supabase
      .from('commerce_checkout_events')
      .select('event_id, status')
      .eq('provider', CHECKOUT_FUNNEL_PROVIDER)
      .gte('created_at', CHECKOUT_MEASUREMENT_START)
      .range(from, from + PAGE_SIZE - 1);
    if (error) return noStore({ error: 'Checkout counts are unavailable.' }, 503);
    const rows = data ?? [];
    for (const row of rows) {
      if (!STATUSES.includes(row.status as CheckoutFunnelStatus)) continue;
      events.push({
        attemptId: String(row.event_id),
        status: row.status as CheckoutFunnelStatus,
      });
    }
    if (rows.length < PAGE_SIZE) break;
  }

  const totals = aggregateCheckoutFunnel(events);
  return noStore({
    window_start: CHECKOUT_MEASUREMENT_START,
    source: 'commerce_checkout_events',
    provider: CHECKOUT_FUNNEL_PROVIDER,
    ...totals,
    historical_before_this_tracking: 'unknown',
  });
}

export async function POST(request: NextRequest) {
  let body: {
    attemptId?: unknown;
    status?: unknown;
    productId?: unknown;
    surface?: unknown;
    nativeKit?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return noStore({ error: 'Send JSON.' }, 400);
  }

  const attemptId = typeof body.attemptId === 'string' ? body.attemptId : '';
  const status = body.status;
  if (!isCheckoutAttemptId(attemptId) || !STATUSES.includes(status as CheckoutFunnelStatus)) {
    return noStore({ error: 'A checkout attempt id and status are required.' }, 400);
  }
  if (body.surface !== 'product' && body.surface !== 'stack') {
    return noStore({ error: 'A checkout surface is required.' }, 400);
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) return noStore({ error: 'Checkout tracking is unavailable.' }, 503);

  const productId = typeof body.productId === 'string' ? body.productId.slice(0, 80) : 'checkout';
  const inserted = await supabase.from('commerce_checkout_events').insert({
    event_id: attemptId,
    product_id: productId,
    provider: CHECKOUT_FUNNEL_PROVIDER,
    session_mode: body.nativeKit === true ? 'native_kit' : 'merchant_navigation',
    status,
    metadata: {
      surface: body.surface,
      native_kit: body.nativeKit === true,
    },
  });
  if (inserted.error) {
    if (inserted.error.code === '23505') return noStore({ ok: true, recorded: false });
    return noStore({ error: 'Checkout tracking is unavailable.' }, 503);
  }
  return noStore({ ok: true, recorded: true });
}
