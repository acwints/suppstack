'use client';

import Link from 'next/link';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '@/app/context/AuthContext';
import { usePremium } from '@/hooks/usePremium';
import {
  PREMIUM_FEATURES,
  PREMIUM_PRICE_LABEL,
  premiumCheckoutUrl,
} from '@/lib/billing/entitlements';
import { Card, Badge, Spinner } from '@/components/ui';

const FREE_FEATURES = [
  'Browse and compare every supplement and product',
  'Verified merchant checkout',
  'Build and share stacks',
  'Daily supplement logging',
];

export default function PremiumPage() {
  const { user, loading: authLoading } = useAuth();
  const { isPremium, entitlement, loading: premiumLoading } = usePremium();

  const checkoutUrl = user ? premiumCheckoutUrl(user.id) : null;
  const manageUrl = process.env.NEXT_PUBLIC_PREMIUM_MANAGE_URL;
  const loading = authLoading || premiumLoading;

  return (
    <div className="container-custom py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-serif text-gray-900">SuppStack Premium</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">
          The marketplace and knowledge base stay free. Premium adds the
          operational layer: adherence, cost, and restock tools built from your
          supplement logs.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Free tier */}
        <Card padding="lg">
          <h2 className="text-lg font-medium text-gray-900">Free</h2>
          <p className="mt-1 text-sm text-gray-500">Everything you need to shop smart.</p>
          <p className="mt-4 text-2xl font-serif text-gray-900">$0</p>
          <ul className="mt-6 space-y-3">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-700">
                <FiCheck size={16} className="mt-0.5 shrink-0 text-gray-500" />
                {feature}
              </li>
            ))}
          </ul>
        </Card>

        {/* Premium tier */}
        <Card padding="lg" className="border-gray-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Premium</h2>
            <Badge variant="default">Insights</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">Understand what actually works for you.</p>
          <p className="mt-4 text-2xl font-serif text-gray-900">
            {PREMIUM_PRICE_LABEL.split('/')[0]}
            <span className="text-sm text-gray-500">/month</span>
          </p>
          <ul className="mt-6 space-y-3">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature.name} className="flex items-start gap-2.5 text-sm">
                <FiCheck size={16} className="mt-0.5 shrink-0 text-gray-900" />
                <span>
                  <span className="font-medium text-gray-900">{feature.name}.</span>{' '}
                  <span className="text-gray-600">{feature.description}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            {loading ? (
              <div className="flex justify-center py-2">
                <Spinner size="md" />
              </div>
            ) : isPremium ? (
              <div className="space-y-2 text-center">
                <p className="text-sm font-medium text-gray-900">
                  You&apos;re a Premium member
                </p>
                {entitlement?.current_period_end && (
                  <p className="text-xs text-gray-500">
                    {entitlement.will_renew ? 'Renews' : 'Access until'}{' '}
                    {new Date(entitlement.current_period_end).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}
                {manageUrl && (
                  <a
                    href={manageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900"
                  >
                    Manage subscription
                  </a>
                )}
              </div>
            ) : !user ? (
              // Route through /login so both Apple and Google are offered —
              // Apple-first parity matters on iOS, especially on a paid path.
              <Link
                href="/login?next=/premium"
                className="inline-flex w-full items-center justify-center gap-2 rounded bg-gray-900 px-5 py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
              >
                Sign in to upgrade
                <FiArrowRight size={16} />
              </Link>
            ) : checkoutUrl ? (
              <a
                href={checkoutUrl}
                className="inline-flex w-full items-center justify-center gap-2 rounded bg-gray-900 px-5 py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
              >
                Upgrade to Premium
                <FiArrowRight size={16} />
              </a>
            ) : (
              <div className="rounded border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
                Subscriptions are launching soon.
              </div>
            )}
          </div>
        </Card>
      </div>

      <p className="mx-auto mt-8 max-w-xl text-center text-xs text-gray-500">
        Cancel anytime. Your logging history is never paywalled — Premium only
        gates the analytics built on top of it.{' '}
        <Link href="/terms" className="underline underline-offset-2 hover:text-gray-600">
          Terms
        </Link>
      </p>
    </div>
  );
}
