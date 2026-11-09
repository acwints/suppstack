import { isTestAccount, type ListedUser } from '@/lib/public-signup-count';

/**
 * Production deployment of PR 52 (`e58e941d5230c215481d858acc8476429b65bd6d`)
 * was created at this instant. First-product adds are counted from here.
 */
export const FIRST_PRODUCT_WINDOW_START = '2026-11-09T20:23:16.000Z';

export type FirstProductRow = {
  user_id?: string | null;
  created_at?: string | null;
};

export type FirstProductAddTotals = {
  window_start: string;
  /** Distinct non-test accounts whose earliest stack row is inside the window. */
  first_product_adds: number;
  /** Distinct non-test accounts whose earliest stack row is before the window. */
  first_product_adds_before_window: number;
  /**
   * Accounts with a stack row and no parseable `created_at`. They are not
   * counted as zero adds inside the window.
   */
  unknown_first_add_time: number;
};

function eligibleIds(users: readonly ListedUser[], patterns: readonly string[]): Set<string> {
  const ids = new Set<string>();
  for (const user of users) {
    if (!user.id || user.deleted_at) continue;
    if (isTestAccount(user, patterns)) continue;
    ids.add(user.id.toLowerCase());
  }
  return ids;
}

function timestamp(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * One count per account: the earliest `users_products.created_at`. A later
 * product does not count as a first add. Test accounts are left out.
 */
export function countFirstProductAdds(
  users: readonly ListedUser[],
  rows: readonly FirstProductRow[],
  patterns: readonly string[],
  windowStart: string = FIRST_PRODUCT_WINDOW_START
): FirstProductAddTotals {
  const windowMs = Date.parse(windowStart);
  const live = eligibleIds(users, patterns);
  const earliest = new Map<string, number | null>();

  for (const row of rows) {
    const id = row.user_id?.toLowerCase();
    if (!id || !live.has(id)) continue;
    const at = timestamp(row.created_at);
    if (!earliest.has(id)) {
      earliest.set(id, at);
      continue;
    }
    const current = earliest.get(id);
    if (current == null) {
      earliest.set(id, at);
      continue;
    }
    if (at != null && at < current) earliest.set(id, at);
  }

  const totals: FirstProductAddTotals = {
    window_start: windowStart,
    first_product_adds: 0,
    first_product_adds_before_window: 0,
    unknown_first_add_time: 0,
  };

  for (const at of earliest.values()) {
    if (at == null) {
      totals.unknown_first_add_time += 1;
    } else if (at >= windowMs) {
      totals.first_product_adds += 1;
    } else {
      totals.first_product_adds_before_window += 1;
    }
  }

  return totals;
}
