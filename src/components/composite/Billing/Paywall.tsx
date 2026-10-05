'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiCamera, FiCheck, FiClock, FiLayers, FiX } from 'react-icons/fi';
import { useAuth } from '@/app/context/AuthContext';
import { usePremium } from '@/hooks/usePremium';
import { openExternalUrl } from '@/lib/native/capacitor';
import {
  APPLE_EULA_URL,
  APPLE_SUBSCRIPTIONS_URL,
  PREMIUM_ANNUAL_PRICE_LABEL,
  PREMIUM_FEATURES,
  PREMIUM_PRICE_LABEL,
  premiumCheckoutUrl,
  type PremiumFeatureId,
} from '@/lib/billing/entitlements';
import {
  getPremiumOffers,
  isPurchaseCancellation,
  purchasePremium,
  restorePremium,
  type PremiumOffer,
} from '@/lib/billing/native-purchases';
import { Spinner, useToast } from '@/components/ui';
import { cn } from '@/lib/design-system/utils';

const FEATURE_ICONS: Record<PremiumFeatureId, typeof FiCamera> = {
  scan: FiCamera,
  restock: FiClock,
  ingredients: FiLayers,
};

const HEADLINES: Record<PremiumFeatureId | 'default', string> = {
  default: 'Get the most from your stack',
  scan: 'Scan your whole shelf, anytime',
  restock: 'Never run out mid-routine',
  ingredients: 'Know exactly what you take',
};

const PRIMARY_CTA =
  'flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 text-base font-medium text-white transition-[background-color,transform] duration-150 hover:bg-gray-800 active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 motion-reduce:transform-none';
const FINE_LINK =
  'inline-flex min-h-11 items-center px-1 underline underline-offset-2 hover:text-gray-700 disabled:opacity-60';

function periodLabel(offer: PremiumOffer): string {
  return offer.period === 'annual' ? 'year' : 'month';
}

/** Whole-percent saving of the annual plan versus twelve monthly payments. */
function annualSavings(offers: PremiumOffer[]): number | null {
  const annual = offers.find((offer) => offer.period === 'annual');
  const monthly = offers.find((offer) => offer.period === 'monthly');
  if (!annual || !monthly || monthly.price <= 0) return null;
  const pct = Math.round((1 - annual.price / (monthly.price * 12)) * 100);
  return pct >= 5 ? pct : null;
}

export interface PaywallProps {
  /** The locked feature that opened the paywall, if any. */
  feature?: PremiumFeatureId;
  /** Present when shown as a dismissible sheet. */
  onClose?: () => void;
  /** Label for the dismiss control (e.g. "Not now" during onboarding). */
  closeLabel?: string;
  className?: string;
}

/**
 * The Premium paywall: outcome headline, the three shipped benefits, an
 * annual-first plan picker with Apple's localized prices and trial
 * eligibility, and the purchase disclosures App Review requires (auto-renew
 * terms, Restore, Terms of Use, Privacy). Web falls back to the RevenueCat
 * Web Billing link.
 */
export function Paywall({ feature, onClose, closeLabel, className }: PaywallProps) {
  const { user } = useAuth();
  const { isPremium, entitlement, isNative, purchasable, markPremium, loading } = usePremium();
  const toast = useToast();
  const [offers, setOffers] = useState<PremiumOffer[] | null>(null);
  const [selected, setSelected] = useState<PremiumOffer['period']>('annual');
  const [busy, setBusy] = useState<'purchase' | 'restore' | null>(null);

  useEffect(() => {
    if (!isNative || !purchasable || !user) return;
    let cancelled = false;
    getPremiumOffers()
      .then((result) => {
        if (cancelled) return;
        setOffers(result);
        if (result.length && !result.some((offer) => offer.period === 'annual')) {
          setSelected(result[0].period);
        }
      })
      .catch((error) => {
        console.error('Failed to load App Store offering:', error);
        if (!cancelled) setOffers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isNative, purchasable, user]);

  const offer = offers?.find((item) => item.period === selected) ?? offers?.[0] ?? null;
  const savings = offers ? annualSavings(offers) : null;
  const orderedFeatures = feature
    ? [...PREMIUM_FEATURES].sort((a, b) => Number(b.id === feature) - Number(a.id === feature))
    : PREMIUM_FEATURES;

  const handlePurchase = async () => {
    if (!offer || busy) return;
    setBusy('purchase');
    try {
      if (await purchasePremium(offer)) {
        markPremium();
        toast.success('Welcome to Premium');
        onClose?.();
      }
    } catch (error) {
      if (!isPurchaseCancellation(error)) {
        console.error('Purchase failed:', error);
        toast.error('Purchase did not complete. You have not been charged.');
      }
    } finally {
      setBusy(null);
    }
  };

  const handleRestore = async () => {
    if (busy) return;
    setBusy('restore');
    try {
      if (await restorePremium()) {
        markPremium();
        toast.success('Premium restored');
        onClose?.();
      } else {
        toast.info('No previous purchase found for this Apple ID.');
      }
    } catch (error) {
      console.error('Restore failed:', error);
      toast.error('Could not restore purchases. Try again.');
    } finally {
      setBusy(null);
    }
  };

  const checkoutUrl = user && !isNative ? premiumCheckoutUrl(user.id) : null;
  const trialDays = offer?.trialDays ?? null;

  return (
    <div className={cn('mx-auto flex w-full max-w-md flex-col', className)}>
      {onClose && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel ?? 'Close'}
            className="-mr-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
          >
            {closeLabel ? (
              <span className="px-2 text-sm font-medium">{closeLabel}</span>
            ) : (
              <FiX size={22} />
            )}
          </button>
        </div>
      )}

      <header className="pt-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          SuppStack Premium
        </p>
        <h2 className="mt-3 text-balance font-serif text-3xl leading-tight text-gray-900">
          {HEADLINES[feature ?? 'default']}
        </h2>
      </header>

      <ul className="mt-8 space-y-5">
        {orderedFeatures.map((item) => {
          const Icon = FEATURE_ICONS[item.id];
          return (
            <li key={item.id} className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-900">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-base font-medium text-gray-900">{item.name}</span>
                <span className="block text-sm leading-5 text-gray-600">{item.description}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner size="md" color="secondary" />
          </div>
        ) : isPremium ? (
          <MemberState
            isNative={isNative}
            store={entitlement?.store}
            periodEnd={entitlement?.current_period_end ?? null}
            willRenew={entitlement?.will_renew ?? true}
          />
        ) : !user ? (
          <Link href="/login?next=/premium" className={PRIMARY_CTA}>
            Sign in to continue
          </Link>
        ) : isNative ? (
          !purchasable ? (
            <p className="rounded-lg bg-gray-50 px-4 py-4 text-center text-sm text-gray-600">
              Premium isn&apos;t available in this version of the app yet.
            </p>
          ) : offers === null ? (
            <div className="flex justify-center py-6">
              <Spinner size="md" color="secondary" />
            </div>
          ) : !offer ? (
            <p className="rounded-lg bg-gray-50 px-4 py-4 text-center text-sm text-gray-600">
              Couldn&apos;t reach the App Store. Check your connection and try again.
            </p>
          ) : (
            <>
              <div role="radiogroup" aria-label="Choose a plan" className="space-y-2.5">
                {offers.map((item) => {
                  const active = item.period === offer.period;
                  return (
                    <button
                      key={item.period}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSelected(item.period)}
                      className={cn(
                        'flex min-h-[64px] w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900',
                        active ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                          active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300'
                        )}
                      >
                        {active && <FiCheck size={12} strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-base font-medium text-gray-900">
                          {item.period === 'annual' ? 'Yearly' : 'Monthly'}
                          {item.period === 'annual' && savings && (
                            <span className="rounded bg-accent-50 px-1.5 py-0.5 text-xs font-semibold text-accent-800">
                              Save {savings}%
                            </span>
                          )}
                        </span>
                        <span className="block text-sm text-gray-500">
                          {item.trialDays
                            ? `${item.trialDays}-day free trial, then ${item.priceString}/${periodLabel(item)}`
                            : `${item.priceString}/${periodLabel(item)}`}
                        </span>
                      </span>
                      {item.period === 'annual' && item.pricePerMonthString && (
                        <span className="shrink-0 text-right text-sm text-gray-500">
                          <span className="block font-medium text-gray-900">
                            {item.pricePerMonthString}
                          </span>
                          per month
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {trialDays && (
                <ol className="mt-5 space-y-2 border-l border-gray-200 pl-4 text-sm">
                  <li>
                    <span className="font-medium text-gray-900">Today</span>
                    <span className="text-gray-600"> — full access, nothing charged</span>
                  </li>
                  <li>
                    <span className="font-medium text-gray-900">Day {trialDays}</span>
                    <span className="text-gray-600">
                      {' '}
                      — {offer.priceString}/{periodLabel(offer)} begins unless you cancel
                    </span>
                  </li>
                </ol>
              )}

              <button
                type="button"
                onClick={handlePurchase}
                disabled={busy !== null}
                className={cn(PRIMARY_CTA, 'mt-6')}
              >
                {busy === 'purchase' ? (
                  <Spinner size="sm" color="white" />
                ) : trialDays ? (
                  `Start ${trialDays}-day free trial`
                ) : (
                  'Continue'
                )}
              </button>
              <p className="mt-2 text-center text-sm text-gray-500">
                {trialDays ? 'No charge today. ' : ''}Cancel anytime in Settings.
              </p>
            </>
          )
        ) : checkoutUrl ? (
          <>
            <a href={checkoutUrl} className={PRIMARY_CTA}>
              Upgrade — {PREMIUM_PRICE_LABEL}
            </a>
            <p className="mt-2 text-center text-sm text-gray-500">
              Or {PREMIUM_ANNUAL_PRICE_LABEL} in the iOS app. Cancel anytime.
            </p>
          </>
        ) : (
          <p className="rounded-lg bg-gray-50 px-4 py-4 text-center text-sm text-gray-600">
            Premium is available in the SuppStack iPhone app.
          </p>
        )}
      </div>

      {isNative && !isPremium && user && (
        <footer className="mt-6 text-center text-xs leading-5 text-gray-500">
          <p>
            Payment is charged to your Apple ID when you confirm
            {trialDays ? ', after the free trial ends' : ''}. The subscription renews
            automatically at the same price unless cancelled at least 24 hours before the
            end of the current period. Manage or cancel anytime in your App Store account
            settings.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3">
            {purchasable && (
              <button
                type="button"
                onClick={handleRestore}
                disabled={busy !== null}
                className={FINE_LINK}
              >
                {busy === 'restore' ? 'Restoring…' : 'Restore purchases'}
              </button>
            )}
            <button
              type="button"
              onClick={() => openExternalUrl(APPLE_EULA_URL)}
              className={FINE_LINK}
            >
              Terms of Use
            </button>
            <Link href="/privacy" onClick={onClose} className={FINE_LINK}>
              Privacy Policy
            </Link>
          </div>
        </footer>
      )}
    </div>
  );
}

function MemberState({
  isNative,
  store,
  periodEnd,
  willRenew,
}: {
  isNative: boolean;
  store?: string;
  periodEnd: string | null;
  willRenew: boolean;
}) {
  const manageUrl = process.env.NEXT_PUBLIC_PREMIUM_MANAGE_URL;
  return (
    <div className="space-y-2 rounded-lg bg-gray-50 px-4 py-5 text-center">
      <p className="flex items-center justify-center gap-2 text-base font-medium text-gray-900">
        <FiCheck size={18} aria-hidden="true" />
        You&apos;re a Premium member
      </p>
      {periodEnd && (
        <p className="text-sm text-gray-500">
          {willRenew ? 'Renews' : 'Access until'}{' '}
          {new Date(periodEnd).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}
      {isNative && store === 'app_store' ? (
        <button
          type="button"
          onClick={() => openExternalUrl(APPLE_SUBSCRIPTIONS_URL)}
          className="inline-flex min-h-11 items-center text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900"
        >
          Manage subscription
        </button>
      ) : manageUrl && !isNative ? (
        <a
          href={manageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900"
        >
          Manage subscription
        </a>
      ) : null}
    </div>
  );
}

/** Full-screen sheet wrapper around the paywall, opened via usePremium(). */
export function PaywallSheet({
  open,
  feature,
  onClose,
}: {
  open: boolean;
  feature?: PremiumFeatureId;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="SuppStack Premium"
      className="fixed inset-0 z-[70] overflow-y-auto bg-white animate-fade-in motion-reduce:animate-none"
    >
      <div className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Paywall feature={feature} onClose={onClose} />
      </div>
    </div>
  );
}

export default Paywall;
