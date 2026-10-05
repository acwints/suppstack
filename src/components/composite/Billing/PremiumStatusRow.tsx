'use client';

import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';
import { usePremium } from '@/hooks';

/**
 * The account screen's Premium entry: members get a quiet status link to
 * manage their plan; free users get one upgrade row. Renders nothing while
 * Premium can't be bought on this surface.
 */
export function PremiumStatusRow() {
  const { isPremium, purchasable, loading, openPaywall } = usePremium();
  if (loading || (!isPremium && !purchasable)) return null;

  const rowClass =
    'mb-8 flex min-h-[64px] w-full items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left transition-colors hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900';

  if (isPremium) {
    return (
      <Link href="/premium" className={rowClass}>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-medium text-gray-900">SuppStack Premium</span>
          <span className="block text-sm text-gray-500">Active · Manage your plan</span>
        </span>
        <FiChevronRight size={18} className="shrink-0 text-gray-400" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => openPaywall()} className={rowClass}>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-medium text-gray-900">Try SuppStack Premium</span>
        <span className="block text-sm text-gray-500">
          Unlimited scans, restock forecasts, full ingredient breakdown
        </span>
      </span>
      <FiChevronRight size={18} className="shrink-0 text-gray-400" aria-hidden="true" />
    </button>
  );
}
