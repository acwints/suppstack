'use client';

import { useEffect, useState } from 'react';
import { growthEnabled } from '@/lib/flags';
import { InviteLink } from './InviteLink';

/**
 * Profile invite. The short-code RPC is not required: the link is the user id.
 * Hidden until an effect confirms the flag is on and this is not the native shell.
 */
export function ReferralLink() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(growthEnabled('referrals'));
  }, []);

  if (!enabled) return null;
  return <InviteLink />;
}
