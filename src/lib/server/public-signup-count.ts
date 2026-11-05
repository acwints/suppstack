import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { countFromUserPage, liveUserCount } from '@/lib/public-signup-count';
import { getSupabaseServiceClient } from '@/lib/server/supabase';

const CACHE_MS = 60_000;
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;
const PAGE_SIZE = 1000;
const MAX_PAGES = 50;

const buckets = new Map<string, { windowStart: number; count: number }>();

type CountPayload = {
  count: number;
  referrals: number;
  updated_at: string;
};

type CachedCount = CountPayload & { expiresAt: number };

let cached: CachedCount | null = null;
let inFlight: Promise<CountPayload> | null = null;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}

function rateLimited(request: NextRequest): boolean {
  const key = clientIp(request);
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now - current.windowStart >= RATE_WINDOW_MS) {
    buckets.set(key, { windowStart: now, count: 1 });
    return false;
  }
  if (current.count >= RATE_LIMIT) return true;
  current.count += 1;
  return false;
}

function noStore(body: CountPayload | { error: string }, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

async function fetchSignupCount(): Promise<number> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    throw new Error('missing_service_role');
  }

  let counted = 0;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    });
    if (error) throw error;

    const users = data.users ?? [];
    const total = page === 1 && 'total' in data && typeof data.total === 'number' ? data.total : 0;
    const resolved = countFromUserPage(total, users, PAGE_SIZE);
    if (resolved.done) {
      return counted + resolved.count;
    }
    counted += liveUserCount(users);
  }

  throw new Error('signup_count_page_cap');
}

async function fetchReferralCount(): Promise<number> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    throw new Error('missing_service_role');
  }

  const { count, error } = await supabase
    .from('commerce_checkout_events')
    .select('event_id', { count: 'exact', head: true })
    .eq('provider', 'referral');
  if (error) throw error;
  return count ?? 0;
}

async function loadSignupCount(): Promise<CountPayload> {
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return { count: cached.count, referrals: cached.referrals, updated_at: cached.updated_at };
  }

  if (!inFlight) {
    inFlight = (async () => {
      const [count, referrals] = await Promise.all([fetchSignupCount(), fetchReferralCount()]);
      const payload = { count, referrals, updated_at: new Date().toISOString() };
      cached = { ...payload, expiresAt: Date.now() + CACHE_MS };
      return payload;
    })().finally(() => {
      inFlight = null;
    });
  }

  return inFlight;
}

export async function publicSignupCountResponse(request: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    return noStore({ error: 'Signup count is not configured.' }, 503);
  }

  if (rateLimited(request)) {
    return noStore({ error: 'Too many count requests. Try again shortly.' }, 429);
  }

  try {
    const payload = await loadSignupCount();
    return noStore(payload, 200);
  } catch (error) {
    const missing = error instanceof Error && error.message === 'missing_service_role';
    console.error('public signup count failed', missing ? 'missing_service_role' : 'admin_list_users');
    return noStore({ error: 'Signup count is unavailable.' }, 503);
  }
}
