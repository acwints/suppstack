import type { SupabaseClient } from '@supabase/supabase-js';
import type { PriorityAccount } from '@/lib/growth/referral-priority';
import type { ReferralCountEvent } from '@/lib/public-signup-count';

const PAGE_SIZE = 1000;
const MAX_PAGES = 50;

type ListedAuthUser = {
  id: string;
  email?: string | null;
  created_at?: string | null;
  deleted_at?: string | null;
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
};

function toAccount(user: ListedAuthUser): PriorityAccount {
  return {
    id: user.id,
    email: user.email ?? null,
    createdAt: user.created_at ?? null,
    deleted_at: user.deleted_at ?? null,
    app_metadata: { is_test: user.app_metadata?.is_test === true },
    user_metadata: { is_test: user.user_metadata?.is_test === true },
  };
}

/** Read-only. Uses the same auth users and referral events as the public count. */
export async function loadPriorityInputs(supabase: SupabaseClient): Promise<{
  accounts: PriorityAccount[];
  events: ReferralCountEvent[];
}> {
  const accounts: PriorityAccount[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
    if (error) throw error;
    const batch = (data.users ?? []) as ListedAuthUser[];
    accounts.push(...batch.map(toAccount));
    if (batch.length < PAGE_SIZE) break;
    if (page === MAX_PAGES) throw new Error('signup_count_page_cap');
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
    if (rows.length < PAGE_SIZE) break;
    if (page === MAX_PAGES - 1) throw new Error('referral_count_page_cap');
  }

  return { accounts, events };
}
