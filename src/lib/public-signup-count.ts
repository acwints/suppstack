export type ListedUser = { deleted_at?: string | null };

export function liveUserCount(users: ListedUser[]): number {
  return users.reduce((total, user) => (user.deleted_at ? total : total + 1), 0);
}

/**
 * Prefer GoTrue's x-total-count when the client parsed it. That header is only
 * copied onto `total` when a Link header is present, so a single short page
 * can report total 0. In that case count the page. A full page means we have
 * to keep going.
 */
export function countFromUserPage(
  total: number,
  users: ListedUser[],
  perPage: number
): { done: true; count: number } | { done: false } {
  if (total > 0) return { done: true, count: total };
  if (users.length < perPage) return { done: true, count: liveUserCount(users) };
  return { done: false };
}
