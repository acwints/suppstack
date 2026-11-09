import { createHash, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  countFirstProductAdds,
  FIRST_PRODUCT_WINDOW_START,
  type FirstProductRow,
} from '@/lib/activation/first-product-adds';
import { testAccountPatterns, type ListedUser } from '@/lib/public-signup-count';
import { getSupabaseServiceClient } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PAGE_SIZE = 1000;
const MAX_PAGES = 50;

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

async function loadAccounts(): Promise<ListedUser[]> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) throw new Error('missing_service_role');

  const users: ListedUser[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
    if (error) throw error;
    const batch = data.users ?? [];
    users.push(...batch.map((user) => listedUser(user)));
    if (batch.length < PAGE_SIZE) return users;
  }
  throw new Error('account_page_cap');
}

async function loadStackRows(): Promise<FirstProductRow[]> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) throw new Error('missing_service_role');

  const rows: FirstProductRow[] = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const from = page * PAGE_SIZE;
    const { data, error } = await supabase
      .from('users_products')
      .select('user_id, created_at')
      .order('user_id', { ascending: true })
      .order('created_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const batch = (data ?? []) as FirstProductRow[];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) return rows;
  }
  throw new Error('stack_page_cap');
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return unauthorized();

  if (!getSupabaseServiceClient()) {
    return noStore({ error: 'First-product counts are unavailable.' }, 503);
  }

  try {
    const [users, rows] = await Promise.all([loadAccounts(), loadStackRows()]);
    const totals = countFirstProductAdds(
      users,
      rows,
      testAccountPatterns(process.env.TEST_ACCOUNT_EMAILS),
      FIRST_PRODUCT_WINDOW_START
    );
    return noStore({
      ...totals,
      source: 'users_products.created_at',
      test_accounts_excluded: true,
    });
  } catch {
    return noStore({ error: 'First-product counts are unavailable.' }, 503);
  }
}
