import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import {
  publicCountFromUsers,
  publicReferralCount,
  testAccountPatterns,
  type ListedUser,
  type ReferralCountEvent,
} from '@/lib/public-signup-count';
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

function listedUser(user: {
  id: string;
  email?: string | null;
  deleted_at?: string | null;
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
}): ListedUser {
  return {
    id: user.id,
    email: user.email ?? null,
    deleted_at: user.deleted_at ?? null,
    app_metadata: { is_test: user.app_metadata?.is_test === true },
    user_metadata: { is_test: user.user_metadata?.is_test === true },
  };
}

async function fetchListedUsers(): Promise<{ total: number; users: ListedUser[] }> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    throw new Error('missing_service_role');
  }

  const users: ListedUser[] = [];
  let total = 0;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    });
    if (error) throw error;

    if (page === 1 && 'total' in data && typeof data.total === 'number' && data.total > 0) {
      total = data.total;
    }
    const batch = data.users ?? [];
    users.push(...batch.map((user) => listedUser(user)));
    if (batch.length < PAGE_SIZE) return { total, users };
  }

  throw new Error('signup_count_page_cap');
}

async function fetchReferralEvents(): Promise<ReferralCountEvent[]> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    throw new Error('missing_service_role');
  }

  const events: ReferralCountEvent[] = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const from = page * PAGE_SIZE;
    const { data, error } = await supabase
      .from('commerce_checkout_events')
      .select('user_id, metadata')
      .eq('provider', 'referral')
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;

    const rows = (data ?? []) as ReferralCountEvent[];
    events.push(...rows);
    if (rows.length < PAGE_SIZE) return events;
  }

  throw new Error('referral_count_page_cap');
}

async function loadSignupCount(): Promise<CountPayload> {
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return { count: cached.count, referrals: cached.referrals, updated_at: cached.updated_at };
  }

  if (!inFlight) {
    inFlight = (async () => {
      const patterns = testAccountPatterns(process.env.TEST_ACCOUNT_EMAILS);
      const [{ total, users }, events] = await Promise.all([fetchListedUsers(), fetchReferralEvents()]);
      const payload = {
        count: publicCountFromUsers(total, users, patterns),
        referrals: publicReferralCount(events, users, patterns),
        updated_at: new Date().toISOString(),
      };
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
