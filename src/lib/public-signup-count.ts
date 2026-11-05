export type ListedUser = {
  id?: string | null;
  email?: string | null;
  deleted_at?: string | null;
  is_test?: boolean | null;
  app_metadata?: { is_test?: boolean | null } | null;
  user_metadata?: { is_test?: boolean | null } | null;
};

/**
 * Always excluded from the public count. `*@suppstack.app` covers
 * `appreview@suppstack.app`. `*@mail.grokbot.com` is the same kind of test
 * domain. `TEST_ACCOUNT_EMAILS` adds more emails or domains.
 */
export const DEFAULT_TEST_ACCOUNT_PATTERNS = [
  '*@suppstack.app',
  'appreview@suppstack.app',
  '*@mail.grokbot.com',
] as const;

export type ReferralCountEvent = {
  user_id?: string | null;
  metadata?: unknown;
};

export function liveUserCount(users: ListedUser[]): number {
  return users.reduce((total, user) => (user.deleted_at ? total : total + 1), 0);
}

export function testAccountPatterns(envValue: string | undefined | null): string[] {
  const extra = String(envValue ?? '')
    .split(/[,;\s]+/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set([...DEFAULT_TEST_ACCOUNT_PATTERNS.map((pattern) => pattern.toLowerCase()), ...extra])];
}

function matchesTestPattern(email: string, pattern: string): boolean {
  if (pattern.startsWith('*@')) {
    const domain = pattern.slice(2);
    return domain.length > 0 && email.endsWith(`@${domain}`);
  }
  if (pattern.startsWith('@')) return email.endsWith(pattern);
  if (!pattern.includes('@')) return email.endsWith(`@${pattern}`);
  return email === pattern;
}

/** Email allowlist, or an auth `is_test` flag. No database column is required. */
export function isTestAccount(user: ListedUser, patterns: readonly string[]): boolean {
  if (user.is_test === true) return true;
  if (user.app_metadata?.is_test === true) return true;
  if (user.user_metadata?.is_test === true) return true;
  const email = user.email?.trim().toLowerCase() ?? '';
  if (!email.includes('@')) return false;
  return patterns.some((pattern) => matchesTestPattern(email, pattern));
}

/**
 * Header total, when GoTrue sent one, counts every listed user. Subtract test
 * accounts from it. When the header is missing, count live users and skip test
 * accounts the same way.
 */
export function publicCountFromUsers(
  total: number,
  users: readonly ListedUser[],
  patterns: readonly string[]
): number {
  if (total > 0) {
    const testCount = users.reduce((count, user) => (isTestAccount(user, patterns) ? count + 1 : count), 0);
    return Math.max(0, total - testCount);
  }
  return users.reduce((count, user) => {
    if (user.deleted_at || isTestAccount(user, patterns)) return count;
    return count + 1;
  }, 0);
}

function referralSubjectId(event: ReferralCountEvent): string | null {
  if (event.user_id) return event.user_id;
  const metadata = event.metadata;
  if (!metadata || typeof metadata !== 'object' || !('referred_user_id' in metadata)) return null;
  const referred = (metadata as { referred_user_id?: unknown }).referred_user_id;
  return typeof referred === 'string' ? referred : null;
}

/** Referral rows whose referred user is a test account are left out. */
export function publicReferralCount(
  events: readonly ReferralCountEvent[],
  users: readonly ListedUser[],
  patterns: readonly string[]
): number {
  const testIds = new Set<string>();
  for (const user of users) {
    if (!user.id || !isTestAccount(user, patterns)) continue;
    testIds.add(user.id.toLowerCase());
  }
  return events.reduce((count, event) => {
    const id = referralSubjectId(event)?.toLowerCase();
    if (id && testIds.has(id)) return count;
    return count + 1;
  }, 0);
}

/**
 * A short page is the full user list. Count it, subtracting test accounts from
 * GoTrue's total when that header was parsed. A full page has to be continued,
 * because a later page can hold a test account the header still includes.
 */
export function countFromUserPage(
  total: number,
  users: ListedUser[],
  perPage: number,
  patterns: readonly string[] = testAccountPatterns(undefined)
): { done: true; count: number } | { done: false } {
  // A full page may hide test accounts on a later page, so the header total
  // is not final until every user has been listed.
  if (users.length >= perPage) return { done: false };
  return { done: true, count: publicCountFromUsers(total, users, patterns) };
}
