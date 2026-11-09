'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { finishPostIntentInvite, postIntentInviteRenderable } from '@/lib/growth/post-intent-invite';
import { InviteLink } from './InviteLink';

/**
 * One invite after the first stack save or verified checkout. It is not a
 * modal, and it is not the welcome or profile card.
 */
function dialogIsOpen(): boolean {
  return document.querySelector('[role="dialog"]') != null;
}

export function PostIntentInvite() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const show = () => {
      setOpen(true);
      setDialogOpen(dialogIsOpen());
    };
    window.addEventListener('suppstack:post-intent-invite', show);
    return () => window.removeEventListener('suppstack:post-intent-invite', show);
  }, []);

  useEffect(() => {
    if (!open) return;
    const sync = () => setDialogOpen(dialogIsOpen());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [open]);

  if (!postIntentInviteRenderable(open, dialogOpen) || !user) return null;

  const close = () => {
    finishPostIntentInvite(window.localStorage);
    setOpen(false);
  };

  return (
    <div className="relative z-10 border-b border-gray-200 bg-white px-3 py-3">
      <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-gray-50">
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
