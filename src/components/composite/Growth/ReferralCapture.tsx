'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { growthEnabled } from '@/lib/flags';
import { captureRefFromUrl } from '@/lib/growth/referral';

/** Stores `?ref=` for a later claim. Renders nothing, and does nothing when the flag is off or in the native shell. */
export function ReferralCapture() {
  const pathname = usePathname();

  useEffect(() => {
    if (!growthEnabled('referrals')) return;
    captureRefFromUrl();
  }, [pathname]);

  return null;
}
