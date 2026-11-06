'use client';

import { InviteLink } from './InviteLink';

/**
 * The same UUID invite as the welcome screen. It stays available after
 * onboarding, on the web and in the iOS shell. It has no price. The
 * short-code flag does not hide it.
 */
export function ReferralLink() {
  return <InviteLink />;
}
