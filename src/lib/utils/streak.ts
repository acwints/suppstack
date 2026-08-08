/**
 * Consecutive-day logging streak, counted backwards from today.
 *
 * A day counts toward the streak when at least one supplement was logged on
 * it. Today only extends the streak once something is logged, but an empty
 * today does not break a streak that ran through yesterday — the user still
 * has the rest of the day to log.
 */
export function computeLogStreak(logDates: Iterable<string>, today: string): number {
  const loggedDays = new Set(logDates);
  if (loggedDays.size === 0) return 0;

  const cursor = new Date(`${today}T00:00:00`);
  if (!loggedDays.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (loggedDays.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** YYYY-MM-DD key for a date in the user's local timezone. */
export function getLocalDateKey(date: Date = new Date()): string {
  return toDateKey(date);
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
