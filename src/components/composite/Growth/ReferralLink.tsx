'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import { Button, useToast } from '@/components/ui';
import { growthEnabled } from '@/lib/flags';
import { referralUrl } from '@/lib/growth/referral';
import { formatNumber } from '@/lib/utils';

type ReferralState =
  | { status: 'hidden' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; code: string; joined: number | null };

/**
 * Profile invite link. Hidden until an effect confirms the flag is on and
 * this is not the native shell, so server HTML and the iOS app stay unchanged
 * while the flag is off.
 */
export function ReferralLink() {
  const { user } = useAuth();
  const toast = useToast();
  const [state, setState] = useState<ReferralState>({ status: 'hidden' });

  useEffect(() => {
    if (!user || !growthEnabled('referrals')) return;

    let cancelled = false;
    setState({ status: 'loading' });

    Promise.all([
      supabase.rpc('get_or_create_referral_code'),
      supabase.from('referrals').select('referred_user_id', { count: 'exact', head: true }),
    ])
      .then(([codeResult, countResult]) => {
        if (cancelled) return;
        const code = typeof codeResult.data === 'string' ? codeResult.data : null;
        if (codeResult.error || !code) {
          setState({ status: 'error' });
          return;
        }
        const joined = countResult.error || countResult.count == null ? null : countResult.count;
        setState({ status: 'ready', code, joined });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const share = async () => {
    if (state.status !== 'ready') return;
    const url = referralUrl(state.code);

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: 'SuppStack', url });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Invite link copied');
    } catch {
      toast.error('Could not copy the invite link');
    }
  };

  if (state.status === 'hidden') return null;

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500">Invite link</h3>
      {state.status === 'loading' ? (
        <p className="mt-3 text-sm text-gray-500">Loading your invite link.</p>
      ) : state.status === 'error' ? (
        <p className="mt-3 text-sm text-gray-600">Your invite link is not available yet.</p>
      ) : (
        <>
          <p className="mt-3 text-sm text-gray-600">
            Share this link. If someone creates an account with it, they are counted here.
            There is no reward.
          </p>
          <p className="mt-3 break-all text-sm font-medium text-gray-900">{referralUrl(state.code)}</p>
          {state.joined != null && state.joined > 0 ? (
            <p className="mt-2 text-sm text-gray-500">
              {formatNumber(state.joined)} {state.joined === 1 ? 'person' : 'people'} joined with
              your link
            </p>
          ) : null}
          <Button type="button" variant="secondary" className="mt-4" onClick={() => void share()}>
            {typeof navigator.share === 'function' ? 'Share invite link' : 'Copy invite link'}
          </Button>
        </>
      )}
    </div>
  );
}
