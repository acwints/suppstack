export interface ChangelogEntry {
  id: string;
  /** ISO date, yyyy-mm-dd */
  date: string;
  title: string;
  body: string;
}

/**
 * A shipped change that started from a note. Credit is a public label such as
 * "suggested by a user". Never put an email address or the raw note here.
 * The feedback API does not write this file.
 */
export interface ShippedFromFeedbackEntry {
  id: string;
  date: string;
  change: string;
  credit: string;
}

export const changelog: ChangelogEntry[] = [
  {
    id: '2026-11-06-whats-new',
    date: '2026-11-06',
    title: 'Updates and feedback',
    body: 'Open What’s New from the top bar to see updates or send feedback.',
  },
];

/** Add a row in the same pull request as the fix. Leave empty until then. */
export const shippedFromFeedback: ShippedFromFeedbackEntry[] = [];
