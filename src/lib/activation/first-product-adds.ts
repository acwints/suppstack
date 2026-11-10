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

const LOS_ANGELES = 'America/Los_Angeles';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const LOS_ANGELES_DAY = new Intl.DateTimeFormat('en-US', {
  timeZone: LOS_ANGELES,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const LOS_ANGELES_CLOCK = new Intl.DateTimeFormat('en-US', {
  timeZone: LOS_ANGELES,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function zonedParts(date: Date, formatter: Intl.DateTimeFormat): Record<string, string> {
  const map: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') map[part.type] = part.value;
  }
  return map;
}

/** Midnight at the start of `now`'s calendar day in America/Los_Angeles. */
export function losAngelesDayStart(now: Date): Date {
  const day = zonedParts(now, LOS_ANGELES_DAY);
  const utcGuess = Date.UTC(Number(day.year), Number(day.month) - 1, Number(day.day));
  const clock = zonedParts(new Date(utcGuess), LOS_ANGELES_CLOCK);
  const asUtc = Date.UTC(
    Number(clock.year),
    Number(clock.month) - 1,
    Number(clock.day),
    Number(clock.hour),
    Number(clock.minute),
    Number(clock.second)
  );
  return new Date(utcGuess - (asUtc - utcGuess));
}

export type PublicFirstProductAdds = {
  first_product_adds_today: number;
  first_product_adds_7d: number;
};

/**
 * Public windows over the same first-add rule as `countFirstProductAdds`.
 * Today starts at Los Angeles midnight. Seven days is a rolling 7 × 24 hours.
 */
export function countPublicFirstProductAdds(
  users: readonly ListedUser[],
  rows: readonly FirstProductRow[],
  patterns: readonly string[],
  now: Date
): PublicFirstProductAdds {
  const today = countFirstProductAdds(users, rows, patterns, losAngelesDayStart(now).toISOString());
  const weekStart = new Date(now.getTime() - SEVEN_DAYS_MS).toISOString();
  const week = countFirstProductAdds(users, rows, patterns, weekStart);
  return {
    first_product_adds_today: today.first_product_adds,
    first_product_adds_7d: week.first_product_adds,
  };
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
