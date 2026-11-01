import { NextRequest, NextResponse } from 'next/server';
import { isReferralCode } from '@/lib/growth/referral';
import { getAuthenticatedUserFromRequest, getSupabaseServiceClient } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DAY_MS = 24 * 60 * 60 * 1000;

function noStore(body: { ok: true; recorded: boolean } | { error: string }, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request);
  if (!user) return noStore({ error: 'Sign in required.' }, 401);

  let ref = '';
  try {
    const body = (await request.json()) as { ref?: unknown };
    ref = typeof body.ref === 'string' ? body.ref.trim().toLowerCase() : '';
  } catch {
    return noStore({ error: 'Send JSON.' }, 400);
  }

  const created = Date.parse(user.created_at);
  const fresh = Number.isFinite(created) && Date.now() - created < DAY_MS;
  if (!isReferralCode(ref) || ref === user.id.toLowerCase() || !fresh) {
    return noStore({ ok: true, recorded: false });
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
  if ((existing.data ?? []).length > 0) return noStore({ ok: true, recorded: false });

  const inserted = await supabase.from('commerce_checkout_events').insert({
    user_id: user.id,
    product_id: 'referral',
    provider: 'referral',
    session_mode: 'attribution',
    status: 'received',
    metadata: {
      kind: 'referral',
      referrer: ref,
      referred_user_id: user.id,
    },
  });
  if (inserted.error) {
    console.error('referral insert failed', inserted.error.code ?? 'unknown');
    return noStore({ error: 'Could not record that referral.' }, 503);
  }

  return noStore({ ok: true, recorded: true });
}
