import { isTestAccount, testAccountPatterns, type ListedUser, type ReferralCountEvent } from '@/lib/public-signup-count';

const USER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One verified friend signup is enough. More friends do not add a second reward. */
export const PRIORITY_REFERRALS_REQUIRED = 1;

export const PRIORITY_TERMS =
  'A friend counts only after they sign up with your link. Copying the link does not count. You cannot refer yourself. A test account does not count, and each friend counts once. When SuppStack sends early-access invites, the priority group comes before the standard group. Inside the priority group, earlier signups go first. This is not a free month, a credit, or a promised date.';

export type PriorityAccount = ListedUser & { createdAt?: string | null };

export type PriorityPlacement = 'priority' | 'standard' | 'excluded';

export type CohortMember = {
  user_id: string;
  created_at: string | null;
  eligible_referrals: number;
};

export type PriorityCohort = {
  required_referrals: number;
  /** Priority group first. Signup time ascending inside each group. */
  priority: CohortMember[];
  standard: CohortMember[];
};

export type PriorityStatus = {
  placement: PriorityPlacement;
  eligible_referrals: number;
  required_referrals: number;
  /** Other priority-group members who signed up earlier. Null outside that group. */
  ahead_in_priority_group: number | null;
  priority_group_size: number;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

function uuidOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return USER_ID.test(normalized) ? normalized : null;
}

/** Short codes are not attributed. Only a user-id referrer can be verified. */
export function referrerIdFromEvent(event: ReferralCountEvent): string | null {
  const metadata = asRecord(event.metadata);
  return uuidOrNull(metadata?.referrer);
}

export function referredIdFromEvent(event: ReferralCountEvent): string | null {
  return uuidOrNull(event.user_id) ?? uuidOrNull(asRecord(event.metadata)?.referred_user_id);
}

function signupTime(account: PriorityAccount): number {
  const parsed = account.createdAt ? Date.parse(account.createdAt) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function bySignup(a: PriorityAccount, b: PriorityAccount): number {
  const delta = signupTime(a) - signupTime(b);
  if (delta !== 0) return delta;
  return (a.id ?? '').localeCompare(b.id ?? '');
}

function liveAccount(account: PriorityAccount): boolean {
  return Boolean(account.id) && !account.deleted_at;
}

/**
 * Friends whose signup is stored on a referral event and who are not the
 * referrer, not deleted, and not a test account. Duplicate events count once.
 */
export function eligibleReferredIds(
  referrerId: string,
  events: readonly ReferralCountEvent[],
  accounts: readonly PriorityAccount[],
  patterns: readonly string[] = testAccountPatterns(undefined)
): string[] {
  const referrer = referrerId.toLowerCase();
  const byId = new Map<string, PriorityAccount>();
  for (const account of accounts) {
    if (!account.id) continue;
    byId.set(account.id.toLowerCase(), account);
  }

  const seen = new Set<string>();
  const eligible: string[] = [];
  for (const event of events) {
    if (referrerIdFromEvent(event) !== referrer) continue;
    const referred = referredIdFromEvent(event);
    if (!referred || referred === referrer || seen.has(referred)) continue;
    seen.add(referred);
    const account = byId.get(referred);
    if (!account || !liveAccount(account) || isTestAccount(account, patterns)) continue;
    eligible.push(referred);
  }
  return eligible;
}

export function buildPriorityCohort(
  accounts: readonly PriorityAccount[],
  events: readonly ReferralCountEvent[],
  patterns: readonly string[] = testAccountPatterns(undefined)
): PriorityCohort {
  const counts = new Map<string, number>();
  const live = accounts.filter(liveAccount);
  for (const account of live) {
    const id = account.id!.toLowerCase();
    if (isTestAccount(account, patterns)) continue;
    counts.set(id, eligibleReferredIds(id, events, accounts, patterns).length);
  }

  const members = live
    .filter((account) => !isTestAccount(account, patterns))
    .slice()
    .sort(bySignup);

  const toMember = (account: PriorityAccount): CohortMember => ({
    user_id: account.id!.toLowerCase(),
    created_at: account.createdAt ?? null,
    eligible_referrals: counts.get(account.id!.toLowerCase()) ?? 0,
  });

  return {
    required_referrals: PRIORITY_REFERRALS_REQUIRED,
    priority: members
      .filter((account) => (counts.get(account.id!.toLowerCase()) ?? 0) >= PRIORITY_REFERRALS_REQUIRED)
      .map(toMember),
    standard: members
      .filter((account) => (counts.get(account.id!.toLowerCase()) ?? 0) < PRIORITY_REFERRALS_REQUIRED)
      .map(toMember),
  };
}

export function priorityStatusFor(userId: string, cohort: PriorityCohort): PriorityStatus {
  const id = userId.toLowerCase();
  const priorityIndex = cohort.priority.findIndex((member) => member.user_id === id);
  const priorityMember = cohort.priority[priorityIndex];
  if (priorityMember) {
    return {
      placement: 'priority',
      eligible_referrals: priorityMember.eligible_referrals,
      required_referrals: cohort.required_referrals,
      ahead_in_priority_group: priorityIndex,
      priority_group_size: cohort.priority.length,
    };
  }

  const standard = cohort.standard.find((member) => member.user_id === id);
  if (standard) {
    return {
      placement: 'standard',
      eligible_referrals: standard.eligible_referrals,
      required_referrals: cohort.required_referrals,
      ahead_in_priority_group: null,
      priority_group_size: cohort.priority.length,
    };
  }

  return {
    placement: 'excluded',
    eligible_referrals: 0,
    required_referrals: cohort.required_referrals,
    ahead_in_priority_group: null,
    priority_group_size: cohort.priority.length,
  };
}

export function isPriorityStatus(value: unknown): value is PriorityStatus {
  if (!value || typeof value !== 'object') return false;
  const status = value as Partial<PriorityStatus>;
  const placementOk =
    status.placement === 'priority' || status.placement === 'standard' || status.placement === 'excluded';
  return (
    placementOk &&
    typeof status.eligible_referrals === 'number' &&
    typeof status.required_referrals === 'number' &&
    typeof status.priority_group_size === 'number' &&
    (status.ahead_in_priority_group === null || typeof status.ahead_in_priority_group === 'number')
  );
}

function people(count: number): string {
  return count === 1 ? '1 person' : `${count} people`;
}

function signups(count: number): string {
  return count === 1 ? '1 eligible signup' : `${count} eligible signups`;
}

/** Visible welcome-screen copy. It states the rule that `buildPriorityCohort` sorts by. */
export function rewardSummary(status: PriorityStatus): { title: string; detail: string; terms: string } {
  if (status.placement === 'excluded') {
    return {
      title: 'Not in the early-access groups',
      detail: 'This account is not placed in the priority group or the standard group.',
      terms: PRIORITY_TERMS,
    };
  }

  if (status.placement === 'priority') {
    const ahead = status.ahead_in_priority_group ?? 0;
    const place =
      ahead === 0
        ? 'No one in that group signed up before you.'
        : `${people(ahead)} in that group signed up before you, so they come first when invites go out.`;
    return {
      title: 'Priority group',
      detail: `${signups(status.eligible_referrals)}. You are in the priority group. ${place}`,
      terms: PRIORITY_TERMS,
    };
  }

  return {
    title: 'Standard group',
    detail: `${signups(status.eligible_referrals)}. One eligible friend signup moves you into the priority group. ${people(status.priority_group_size)} are in that group now, and that group comes first when invites go out.`,
    terms: PRIORITY_TERMS,
  };
}
