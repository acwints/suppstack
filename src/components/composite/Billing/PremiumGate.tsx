'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { FiLock } from 'react-icons/fi';
import { usePremium } from '@/hooks/usePremium';
import { PREMIUM_PRICE_LABEL } from '@/lib/billing/entitlements';
import { isNativeApp } from '@/lib/native/capacitor';
import { Card, Skeleton } from '@/components/ui';

export interface PremiumGateProps {
  /** Feature name shown in the upsell card (e.g. "Restock reminders"). */
  feature: string;
  /** One-line description of what the member gets. */
  description?: string;
  children: ReactNode;
}

/**
 * Wraps a premium feature. Members see the feature; everyone else sees an
 * upsell card that links to the pricing page. While entitlement status loads,
 * a skeleton avoids flashing the paywall at paying members.
 */
export function PremiumGate({ feature, description, children }: PremiumGateProps) {
  const { isPremium, loading } = usePremium();
  const [platform, setPlatform] = useState<'checking' | 'native' | 'web'>('checking');

  useEffect(() => {
    setPlatform(isNativeApp() ? 'native' : 'web');
  }, []);

  if (loading || platform === 'checking') {
    return (
      <Card padding="md">
        <Skeleton height={16} width={160} className="mb-3" />
        <Skeleton height={12} className="mb-2" />
        <Skeleton height={12} className="w-3/4" />
      </Card>
    );
  }

  if (isPremium) return <>{children}</>;

  if (platform === 'native') {
    return (
      <Card padding="md" className="text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <FiLock size={18} className="text-gray-500" />
        </div>
        <h3 className="text-base font-medium text-gray-900">{feature}</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
          Sign in with an existing Premium membership to use this feature.
        </p>
      </Card>
    );
  }

  return (
    <Card padding="md" className="text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
        <FiLock size={18} className="text-gray-500" />
      </div>
      <h3 className="text-base font-medium text-gray-900">{feature}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
        {description || 'This feature is part of SuppStack Premium.'}
      </p>
      <Link
        href="/premium"
        className="mt-4 inline-flex items-center justify-center rounded bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
      >
        Upgrade — {PREMIUM_PRICE_LABEL}
      </Link>
    </Card>
  );
}

export default PremiumGate;
