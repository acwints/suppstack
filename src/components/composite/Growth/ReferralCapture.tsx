'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureRefFromUrl } from '@/lib/growth/referral';

/** Stores `?ref=` so it is still here after the sign-in redirect. Renders nothing. */
export function ReferralCapture() {
  const pathname = usePathname();

  useEffect(() => {
    captureRefFromUrl();
  }, [pathname]);

  return null;
}
