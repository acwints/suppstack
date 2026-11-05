import { NextRequest, NextResponse } from 'next/server';
import { evaluateReferralClaim } from '@/lib/growth/referral-claim';
import { getAuthenticatedUserFromRequest, getSupabaseServiceClient } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function noStore(
  body: { ok: true; recorded: boolean; reason?: string } | { error: string },
  status = 200
) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request);
  if (!user) return noStore({ error: 'Sign in required.' }, 401);

  let ref: string | null = null;
  try {
    const body = (await request.json()) as { ref?: unknown };
    ref = typeof body.ref === 'string' ? body.ref : null;
  } catch {
    return noStore({ error: 'Send JSON.' }, 400);
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) return noStore({ error: 'Referral storage is not configured.' }, 503);

  const existing = await supabase
    .from('commerce_checkout_events')
    .select('event_id')
    .eq('provider', 'referral')
    .eq('user_id', user.id)
    .limit(1);
  if (existing.error) {
    console.error('referral lookup failed', existing.error.code ?? 'unknown');
    return noStore({ error: 'Could not record that referral.' }, 503);
  }

  const decision = evaluateReferralClaim({
    ref,
    userId: user.id,
    createdAt: user.created_at,
    now: Date.now(),
    alreadyRecorded: (existing.data ?? []).length > 0,
  });
  if (!decision.record) return noStore({ ok: true, recorded: false, reason: decision.reason });

  const inserted = await supabase.from('commerce_checkout_events').insert({
    event_id: decision.eventId,
    user_id: user.id,
    product_id: 'referral',
    provider: 'referral',
    session_mode: 'attribution',
    status: 'received',
    metadata: {
      kind: 'referral',
      referrer: decision.ref,
      referred_user_id: user.id,
    },
  });
  if (inserted.error) {
    if (inserted.error.code === '23505') {
      return noStore({ ok: true, recorded: false, reason: 'duplicate' });
    }
    console.error('referral insert failed', inserted.error.code ?? 'unknown');
    return noStore({ error: 'Could not record that referral.' }, 503);
  }

  return noStore({ ok: true, recorded: true });
}
