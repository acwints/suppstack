'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import {
  PRIORITY_TERMS,
  isPriorityStatus,
  rewardSummary,
  type PriorityStatus,
} from '@/lib/growth/referral-priority';
import { copyLinkResult, referralUrl } from '@/lib/growth/referral';

export function InviteLinkCard({
  url,
  statusLine,
  terms,
  buttonLabel,
  note,
  onCopy,
}: {
  url: string;
  statusLine: string;
  terms: string;
  buttonLabel: string;
  note: string | null;
  onCopy: () => void;
}) {
  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-medium text-gray-900">Priority early access</p>
      <p className="mt-1 text-sm text-gray-600" aria-live="polite">
        {statusLine}
      </p>
      <p className="mt-2 text-sm text-gray-600">{terms}</p>
      <p className="mt-3 break-all text-sm text-gray-900">{url}</p>
      <button
        type="button"
        onClick={onCopy}
        className="mt-3 inline-flex min-h-11 items-center rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
      >
        {buttonLabel}
      </button>
      {note ? (
        <p className="mt-2 text-sm text-gray-600" role="status">
          {note}
        </p>
      ) : null}
    </div>
  );
}

/** UUID invite link plus the priority rule. No prices, so it can show in the iOS shell. */
export function InviteLink({ onCopied }: { onCopied?: () => void } = {}) {
  const { user, session } = useAuth();
  const [copyState, setCopyState] = useState(copyLinkResult(false));
  const [copyAttempted, setCopyAttempted] = useState(false);
  const [status, setStatus] = useState<PriorityStatus | null>(null);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const token = session?.access_token;
    if (!user || !token) return;
    let cancelled = false;
    setPhase('loading');
    fetch('/api/referral/priority', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('priority_status_failed');
        return response.json() as Promise<unknown>;
      })
      .then((body) => {
        if (cancelled) return;
        if (!isPriorityStatus(body)) {
          setPhase('error');
          return;
        }
        setStatus(body);
        setPhase('ready');
      })
      .catch(() => {
        if (!cancelled) setPhase('error');
      });
    return () => {
      cancelled = true;
    };
  }, [user, session?.access_token]);

  if (!user) return null;

  const url = referralUrl(user.id);
  const summary = status ? rewardSummary(status) : null;
  const statusLine =
    phase === 'loading'
      ? 'Checking eligible signups.'
      : phase === 'error'
        ? 'Eligible signups could not be loaded. The link still works.'
        : (summary?.detail ?? '');
  const shown = copyAttempted ? copyState : { button: 'Copy link' as const, note: null };

  return (
    <InviteLinkCard
      url={url}
      statusLine={statusLine}
      terms={PRIORITY_TERMS}
      buttonLabel={shown.button}
      note={shown.note}
      onCopy={() => {
        const write = navigator.clipboard?.writeText(url);
        if (!write) {
          setCopyAttempted(true);
          setCopyState(copyLinkResult(false));
          return;
        }
        void write.then(
          () => {
            setCopyAttempted(true);
            setCopyState(copyLinkResult(true));
            onCopied?.();
          },
          () => {
            setCopyAttempted(true);
            setCopyState(copyLinkResult(false));
          }
        );
      }}
    />
  );
}
