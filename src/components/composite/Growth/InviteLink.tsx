'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { referralUrl } from '@/lib/growth/referral';

/** A copyable invite link. No prices, so it can show in the iOS shell. */
export function InviteLink() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  if (!user) return null;

  const url = referralUrl(user.id);

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-medium text-gray-900">Your invite link</p>
      <p className="mt-1 break-all text-sm text-gray-600">{url}</p>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
          }).catch(() => {
            setCopied(false);
          });
        }}
        className="mt-3 inline-flex min-h-11 items-center rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
      >
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  );
}
