'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCamera, FiCheck, FiPlus } from 'react-icons/fi';
import { supabase } from '@/app/supabase';
import { Paywall } from '@/components/composite/Billing';
import { Spinner, useToast } from '@/components/ui';
import { cn } from '@/lib/design-system';
import { isNativeApp } from '@/lib/native/capacitor';
import {
  HEALTH_GOAL_DEFINITIONS,
  buildHealthGoalDirectory,
  type HealthGoalId,
} from '@/lib/catalog/health-goal-directory';
import {
  getProductImageSrc,
  isRemoteImageSrc,
  PRODUCT_IMAGE_FALLBACK,
} from '@/lib/catalog/product-image';
import type { Product } from '@/types';
import { usePremium, useProductInStack } from '@/hooks';

/**
 * First-run onboarding for new accounts: pick goals → add what you already
 * take → Premium offer (dismissible). Three steps, each skippable, so a new
 * user lands on a populated Today screen instead of an empty one.
 */

type Step = 'goals' | 'stack' | 'premium';

const MAX_SUGGESTIONS = 8;

const PRIMARY_BUTTON =
  'flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 text-base font-medium text-white transition-[background-color,transform] duration-150 hover:bg-gray-800 active:scale-[0.98] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 motion-reduce:transform-none';
const QUIET_BUTTON =
  'flex min-h-11 w-full items-center justify-center rounded px-4 text-sm font-medium text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900';

/** The flagship product of each goal's supplements, interleaved across goals. */
function suggestedProducts(goalIds: HealthGoalId[]): Product[] {
  const directory = buildHealthGoalDirectory().filter((goal) => goalIds.includes(goal.id));
  const queues = directory.map((goal) =>
    goal.supplements
      .map((supplement) =>
        goal.products.find((product) => product.supplement_id === supplement.supplement_id)
      )
      .filter((product): product is Product => Boolean(product))
  );

  const seen = new Set<string>();
  const result: Product[] = [];
  for (let i = 0; result.length < MAX_SUGGESTIONS && queues.some((q) => q.length > i); i++) {
    for (const queue of queues) {
      const product = queue[i];
      if (!product || seen.has(String(product.supplement_id))) continue;
      seen.add(String(product.supplement_id));
      result.push(product);
      if (result.length === MAX_SUGGESTIONS) break;
    }
  }
  return result;
}

export default function WelcomePage() {
  const router = useRouter();
  const toast = useToast();
  const { isPremium, purchasable } = usePremium();
  const [step, setStep] = useState<Step>('goals');
  const [goals, setGoals] = useState<HealthGoalId[]>([]);
  const [addedCount, setAddedCount] = useState(0);
  const [nextPath, setNextPath] = useState('/stack');
  const [finishing, setFinishing] = useState(false);
  const [native, setNative] = useState(false);

  useEffect(() => {
    setNative(isNativeApp());
    const requested = new URLSearchParams(window.location.search).get('next');
    if (requested?.startsWith('/') && !requested.startsWith('/welcome')) setNextPath(requested);
  }, []);

  const suggestions = useMemo(() => suggestedProducts(goals), [goals]);
  const showPremiumStep = purchasable && !isPremium;

  const finish = async (destination = nextPath) => {
    if (finishing) return;
    setFinishing(true);
    const { error } = await supabase.auth.updateUser({
      data: { onboarded_at: new Date().toISOString(), goals },
    });
    if (error) console.error('Failed to save onboarding:', error);
    router.replace(destination);
  };

  const continueFromStack = () => {
    if (showPremiumStep) setStep('premium');
    else finish();
  };

  const stepIndex = step === 'goals' ? 0 : step === 'stack' ? 1 : 2;
  const totalSteps = showPremiumStep ? 3 : 2;

  if (step === 'premium') {
    return (
      <main className="min-h-dvh bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Paywall closeLabel="Not now" onClose={() => finish()} />
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col bg-white pt-[env(safe-area-inset-top)]">
      {/* Progress + back */}
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-6 pt-3">
        {step === 'stack' ? (
          <button
            type="button"
            onClick={() => setStep('goals')}
            aria-label="Back"
            className="-ml-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded text-gray-700 hover:text-gray-900"
          >
            <FiArrowLeft size={20} />
          </button>
        ) : (
          <span className="min-w-9" aria-hidden="true" />
        )}
        <div
          className="flex flex-1 gap-1.5"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={stepIndex + 1}
          aria-label={`Step ${stepIndex + 1} of ${totalSteps}`}
        >
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className={cn('h-1 flex-1 rounded-full', i <= stepIndex ? 'bg-gray-900' : 'bg-gray-200')}
            />
          ))}
        </div>
        <span className="min-w-9" aria-hidden="true" />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8">
        {step === 'goals' ? (
          <>
            <h1 className="text-balance font-serif text-3xl leading-tight text-gray-900">
              What are you building a stack for?
            </h1>
            <p className="mt-2 text-base text-gray-600">Pick any that fit. You can change this later.</p>

            <div className="mt-7 space-y-2.5">
              {HEALTH_GOAL_DEFINITIONS.map((goal) => {
                const active = goals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setGoals((current) =>
                        active ? current.filter((id) => id !== goal.id) : [...current, goal.id]
                      )
                    }
                    className={cn(
                      'flex min-h-[64px] w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900',
                      active ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-medium text-gray-900">{goal.title}</span>
                      <span className="mt-0.5 block text-sm leading-5 text-gray-500">
                        {goal.description}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border',
                        active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300'
                      )}
                    >
                      {active && <FiCheck size={14} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto space-y-2 pt-8">
              <button
                type="button"
                onClick={() => setStep('stack')}
                disabled={goals.length === 0}
                className={PRIMARY_BUTTON}
              >
                Continue
              </button>
              <button type="button" onClick={() => finish()} className={QUIET_BUTTON}>
                Skip setup
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-balance font-serif text-3xl leading-tight text-gray-900">
              Add what you already take
            </h1>
            <p className="mt-2 text-base text-gray-600">
              Your stack powers your daily check-offs. Add a few now — you can fine-tune later.
            </p>

            {native && (
              <button
                type="button"
                onClick={() => finish('/scan')}
                className="mt-6 flex min-h-[64px] w-full items-center gap-3 rounded-lg border border-gray-900 px-4 py-3 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white">
                  <FiCamera size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-medium text-gray-900">Scan your bottles</span>
                  <span className="block text-sm text-gray-500">
                    One photo of your shelf adds them all
                  </span>
                </span>
              </button>
            )}

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
              Popular for your goals
            </p>
            <ul className="mt-3 divide-y divide-gray-100">
              {suggestions.map((product) => (
                <SuggestionRow
                  key={product.product_id}
                  product={product}
                  onAdded={() => setAddedCount((count) => count + 1)}
                  onError={() => toast.error('Couldn’t add that one. Try again.')}
                />
              ))}
            </ul>
            <Link
              href="/products"
              onClick={(event) => {
                event.preventDefault();
                finish('/products');
              }}
              className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-gray-600 underline underline-offset-4 hover:text-gray-900"
            >
              Browse the full catalog
            </Link>

            <div className="mt-auto space-y-2 pt-8">
              <button
                type="button"
                onClick={continueFromStack}
                disabled={finishing}
                className={PRIMARY_BUTTON}
              >
                {finishing ? (
                  <Spinner size="sm" color="white" />
                ) : addedCount > 0 ? (
                  `Continue with ${addedCount} supplement${addedCount === 1 ? '' : 's'}`
                ) : (
                  'Continue'
                )}
              </button>
              {addedCount === 0 && (
                <button type="button" onClick={continueFromStack} className={QUIET_BUTTON}>
                  I&apos;ll add them later
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function SuggestionRow({
  product,
  onAdded,
  onError,
}: {
  product: Product;
  onAdded: () => void;
  onError: () => void;
}) {
  const { isInStack, isUpdating, addToStack } = useProductInStack(product);
  const [imageSrc, setImageSrc] = useState<string | null>(() =>
    getProductImageSrc(product.product_image)
  );

  const handleAdd = async () => {
    if (isInStack || isUpdating) return;
    try {
      await addToStack();
      onAdded();
    } catch {
      onError();
    }
  };

  return (
    <li className="flex items-center gap-3 py-3">
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-white">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="48px"
            className="object-contain p-1"
            unoptimized={isRemoteImageSrc(imageSrc)}
            onError={() => setImageSrc(PRODUCT_IMAGE_FALLBACK)}
          />
        ) : (
          <span className="flex h-full items-center justify-center text-base font-semibold text-gray-300">
            {product.product_name.charAt(0)}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-gray-900">
          {product.supplements?.supplement_name ?? product.product_name}
        </span>
        <span className="block truncate text-sm text-gray-500">
          {product.brands?.brand_name ? `${product.brands.brand_name} · ` : ''}
          {product.product_name}
        </span>
      </span>
      <button
        type="button"
        onClick={handleAdd}
        disabled={isUpdating || isInStack}
        aria-label={isInStack ? `${product.product_name} added` : `Add ${product.product_name}`}
        className={cn(
          'inline-flex min-h-11 min-w-[76px] shrink-0 items-center justify-center gap-1 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900',
          isInStack
            ? 'border-gray-900 bg-gray-900 text-white'
            : 'border-gray-300 text-gray-900 hover:border-gray-400'
        )}
      >
        {isUpdating ? (
          <Spinner size="sm" color={isInStack ? 'white' : 'secondary'} />
        ) : isInStack ? (
          <>
            <FiCheck size={15} aria-hidden="true" /> Added
          </>
        ) : (
          <>
            <FiPlus size={15} aria-hidden="true" /> Add
          </>
        )}
      </button>
    </li>
  );
}
