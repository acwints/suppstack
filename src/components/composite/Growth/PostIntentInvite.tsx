'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { finishPostIntentInvite } from '@/lib/growth/post-intent-invite';
import { InviteLink } from './InviteLink';

/**
 * One invite after the first stack save or verified checkout. It is not a
 * modal, and it is not the welcome or profile card.
 */
export function PostIntentInvite() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener('suppstack:post-intent-invite', show);
    return () => window.removeEventListener('suppstack:post-intent-invite', show);
  }, []);

  if (!open || !user) return null;

  const close = () => {
    finishPostIntentInvite(window.localStorage);
    setOpen(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-20 z-[60] px-3 md:bottom-6">
      <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white shadow-surface">
        <div className="flex justify-end px-3 pt-3">
          <button
            type="button"
            onClick={close}
            className="min-h-11 px-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Dismiss
          </button>
        </div>
        <div className="px-3 pb-3">
          <InviteLink onCopied={close} />
        </div>
      </div>
    </div>
  );
}
