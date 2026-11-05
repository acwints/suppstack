/** Shown on the existing homepage when a friend link is stored. Not a reward. */
export const REFERRAL_SIGNUP_PROMPT =
  'A friend invited you. Apple or Google creates the account.';

export function showReferralSignupPrompt(ref: string | null, native: boolean): boolean {
  return Boolean(ref) && !native;
}
