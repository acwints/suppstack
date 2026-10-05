'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import {
  PREMIUM_ENTITLEMENT,
  isEntitlementActive,
  type PremiumFeatureId,
  type UserEntitlement,
} from '@/lib/billing/entitlements';
import {
  configureNativePurchases,
  hasNativePremium,
  isNativePurchasesSupported,
} from '@/lib/billing/native-purchases';
import { isNativeApp } from '@/lib/native/capacitor';

export interface PremiumContextValue {
  /** Whether the signed-in user currently has premium access. */
  isPremium: boolean;
  /** The mirrored entitlement row (for period end / store in settings). */
  entitlement: UserEntitlement | null;
  loading: boolean;
  /**
   * Whether Premium can actually be bought on this surface. When false the
   * app never shows a paywall or locks a feature — no dead-end upsells.
   */
  purchasable: boolean;
  isNative: boolean;
  refetch: () => Promise<void>;
  /** Open the paywall sheet; `feature` highlights why it was opened. */
  openPaywall: (feature?: PremiumFeatureId) => void;
  closePaywall: () => void;
  /** Paywall sheet state, rendered once by PaywallHost. */
  paywall: { open: boolean; feature?: PremiumFeatureId };
  /** Unlock immediately after a confirmed purchase/restore. */
  markPremium: () => void;
}

const PremiumContext = createContext<PremiumContextValue | null>(null);

/**
 * Premium status for the whole app — one entitlement read shared by every
 * gate, plus the paywall sheet's open state.
 *
 * Access is the union of the RLS-protected `user_entitlements` mirror (kept
 * in sync by the RevenueCat webhook) and, in the iOS app, the App Store's own
 * customer info — so a purchase unlocks instantly, before the webhook lands.
 */
export function PremiumProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [entitlement, setEntitlement] = useState<UserEntitlement | null>(null);
  const [nativePremium, setNativePremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState<{ native: boolean; purchasable: boolean } | null>(
    null
  );
  const [paywall, setPaywall] = useState<{ open: boolean; feature?: PremiumFeatureId }>({
    open: false,
  });

  useEffect(() => {
    const native = isNativeApp();
    setPlatform({
      native,
      purchasable: native
        ? isNativePurchasesSupported()
        : Boolean(process.env.NEXT_PUBLIC_PREMIUM_CHECKOUT_URL),
    });
  }, []);

  const fetchEntitlement = useCallback(async () => {
    if (!user) {
      setEntitlement(null);
      setNativePremium(false);
      setLoading(false);
      return;
    }
    try {
      const [{ data }, native] = await Promise.all([
        supabase
          .from('user_entitlements')
          .select(
            'entitlement_id, user_id, entitlement, status, store, product_id, current_period_end, will_renew, updated_at'
          )
          .eq('user_id', user.id)
          .eq('entitlement', PREMIUM_ENTITLEMENT)
          .limit(1),
        isNativePurchasesSupported()
          ? configureNativePurchases(user.id)
              .then(() => hasNativePremium())
              .catch(() => false)
          : Promise.resolve(false),
      ]);
      setEntitlement(((data || [])[0] as UserEntitlement | undefined) ?? null);
      setNativePremium(native);
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

  const openPaywall = useCallback((feature?: PremiumFeatureId) => {
    setPaywall({ open: true, feature });
  }, []);
  const closePaywall = useCallback(() => setPaywall({ open: false }), []);

  const markPremium = useCallback(() => {
    setNativePremium(true);
    // The webhook mirrors the purchase into Supabase within moments.
    setTimeout(() => {
      fetchEntitlement();
    }, 5000);
  }, [fetchEntitlement]);

  const value = useMemo<PremiumContextValue>(
    () => ({
      isPremium: nativePremium || isEntitlementActive(entitlement),
      entitlement,
      loading: authLoading || loading || platform === null,
      purchasable: platform?.purchasable ?? false,
      isNative: platform?.native ?? false,
      refetch: fetchEntitlement,
      openPaywall,
      closePaywall,
      paywall,
      markPremium,
    }),
    [
      nativePremium,
      entitlement,
      authLoading,
      loading,
      platform,
      fetchEntitlement,
      openPaywall,
      closePaywall,
      paywall,
      markPremium,
    ]
  );

  return (
    <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
  );
}

export function usePremiumContext(): PremiumContextValue {
  const context = useContext(PremiumContext);
  if (!context) throw new Error('usePremium must be used inside PremiumProvider');
  return context;
}
