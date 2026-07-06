'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import {
  PREMIUM_ENTITLEMENT,
  isEntitlementActive,
  type UserEntitlement,
} from '@/lib/billing/entitlements';

export interface UsePremiumResult {
  /** Whether the signed-in user currently has an active premium entitlement. */
  isPremium: boolean;
  /** The raw entitlement row (for period end / store in account settings). */
  entitlement: UserEntitlement | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Premium subscription status for the current user.
 *
 * Reads the RLS-protected `user_entitlements` mirror that the RevenueCat
 * webhook keeps in sync — no billing SDK involved on the read path. Signed-out
 * users are never premium.
 */
export function usePremium(): UsePremiumResult {
  const { user, loading: authLoading } = useAuth();
  const [entitlement, setEntitlement] = useState<UserEntitlement | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEntitlement = useCallback(async () => {
    if (!user) {
      setEntitlement(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await supabase
        .from('user_entitlements')
        .select(
          'entitlement_id, user_id, entitlement, status, store, product_id, current_period_end, will_renew, updated_at'
        )
        .eq('user_id', user.id)
        .eq('entitlement', PREMIUM_ENTITLEMENT)
        .maybeSingle();
      setEntitlement((data as UserEntitlement | null) ?? null);
    } catch {
      setEntitlement(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    fetchEntitlement();
  }, [authLoading, fetchEntitlement]);

  return {
    isPremium: isEntitlementActive(entitlement),
    entitlement,
    loading: authLoading || loading,
    refetch: fetchEntitlement,
  };
}

export default usePremium;
