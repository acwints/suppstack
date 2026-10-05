'use client';

import type { ReactNode } from 'react';
import { FiLock } from 'react-icons/fi';
import { PREMIUM_FEATURES, type PremiumFeatureId } from '@/lib/billing/entitlements';
import { Card, Skeleton } from '@/components/ui';
import { usePremium } from '@/hooks';

export interface PremiumGateProps {
  /** Which Premium feature this wraps — drives the copy and the paywall. */
  feature: PremiumFeatureId;
  /** Optional one-line teaser shown on the locked card (e.g. "2 bottles run out this month"). */
  teaser?: ReactNode;
  children: ReactNode;
}

/**
 * Wraps a premium feature. Members see the feature; everyone else sees a
 * locked card that opens the paywall sheet. When Premium can't be bought on
 * this surface (IAP not configured yet), the feature simply renders — the app
 * never shows an upsell with no way to complete it.
 */
export function PremiumGate({ feature, teaser, children }: PremiumGateProps) {
  const { isPremium, purchasable, loading, openPaywall } = usePremium();
  const definition = PREMIUM_FEATURES.find((item) => item.id === feature);

  if (loading) {
    return (
      <Card padding="md">
        <Skeleton height={16} width={160} className="mb-3" />
        <Skeleton height={12} className="mb-2" />
        <Skeleton height={12} className="w-3/4" />
      </Card>
    );
  }

  if (isPremium || !purchasable) return <>{children}</>;

  return (
    <Card padding="md">
      <div className="flex items-start gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
          <FiLock size={17} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-medium text-gray-900">{definition?.name}</h3>
          <p className="mt-0.5 text-sm leading-5 text-gray-600">
            {teaser ?? definition?.description}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => openPaywall(feature)}
        className="mt-4 flex min-h-11 w-full items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
      >
        Unlock with Premium
      </button>
    </Card>
  );
}
