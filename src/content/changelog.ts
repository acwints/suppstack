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
    id: '2026-11-01-improvements',
    date: '2026-11-01',
    title: 'Improvements box',
    body: 'Every page has a box for how SuppStack should be different. Notes stay with the team until a change ships.',
  },
];

/** Add a row in the same pull request as the fix. Leave empty until then. */
export const shippedFromFeedback: ShippedFromFeedbackEntry[] = [];
