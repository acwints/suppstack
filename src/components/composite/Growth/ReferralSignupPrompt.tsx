'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { peekRef } from '@/lib/growth/referral';
import {
  REFERRAL_SIGNUP_PROMPT,
  showReferralSignupPrompt,
} from '@/lib/growth/referral-signup-prompt';
import { isNativeApp } from '@/lib/native/capacitor';

/**
 * Homepage prompt for a stored friend link. Mobile hides the header Sign in
 * button, so this is the visible way onto the existing login screen.
 */
export function ReferralSignupPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(showReferralSignupPrompt(peekRef(), isNativeApp()));
  }, []);

  if (!visible) return null;

  return (
    <div className="mt-3 flex flex-col gap-3 rounded bg-gray-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-700">{REFERRAL_SIGNUP_PROMPT}</p>
      <Link
        href="/login?next=/stack"
        className="inline-flex min-h-11 items-center justify-center rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
      >
        Create account
      </Link>
    </div>
  );
}
