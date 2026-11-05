/**
 * Print the early-access groups from stored referral events.
 * Read-only: it does not change accounts, send email, or write rows.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * Run:
 * TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","moduleResolution":"node","esModuleInterop":true}' npx ts-node -r tsconfig-paths/register src/scripts/printPriorityCohort.ts
 */
import { createClient } from '@supabase/supabase-js';
import { buildPriorityCohort } from '../lib/growth/referral-priority';
import { loadPriorityInputs } from '../lib/growth/referral-priority-load';
import { testAccountPatterns } from '../lib/public-signup-count';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.error('missing_service_role');
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { accounts, events } = await loadPriorityInputs(supabase);
  const cohort = buildPriorityCohort(accounts, events, testAccountPatterns(process.env.TEST_ACCOUNT_EMAILS));
  const emailById = new Map(
    accounts.filter((account) => account.id).map((account) => [account.id!.toLowerCase(), account.email ?? null])
  );
  const withEmail = (member: { user_id: string }) => ({
    ...member,
    email: emailById.get(member.user_id) ?? null,
  });

  console.log(
    JSON.stringify(
      {
        required_referrals: cohort.required_referrals,
        order: 'priority group by signup time, then standard group by signup time',
        priority: cohort.priority.map(withEmail),
        standard: cohort.standard.map(withEmail),
      },
      null,
      2
    )
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'priority_cohort_failed');
  process.exit(1);
});
