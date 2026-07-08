'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FiActivity,
  FiBarChart2,
  FiClock,
  FiCpu,
  FiExternalLink,
  FiLayers,
  FiSearch,
  FiShoppingCart,
  FiTarget,
  FiX,
} from 'react-icons/fi';
import ProductCard from '@/app/components/ProductCard';
import { Badge, Button } from '@/components/ui';
import { useHealthSnapshots } from '@/hooks';
import type {
  ProductDirectoryCategoryCoverage,
  ProductDirectoryGoalFilter,
  ProductDirectoryProduct,
  ProductDirectoryShelf,
  ProductDirectorySupplementCoverage,
} from '@/lib/catalog/product-directory';
import type { HealthGoalId } from '@/lib/catalog/health-goal-directory';
import {
  buildHealthSignalMap,
  buildSleepCommerceProtocol,
  describeMetricSnapshot,
} from '@/lib/health/health-intelligence';
import { buildHealthCommercePlan } from '@/lib/health/health-commerce';
import {
  buildProductSignalMatches,
  getSignalMatchScenario,
  SIGNAL_MATCH_SCENARIOS,
  type SignalMatchScenarioId,
} from '@/lib/catalog/product-match';
import { formatPrice } from '@/lib/utils';

export interface ProductDirectoryClientProps {
  products: ProductDirectoryProduct[];
  healthGoals: ProductDirectoryGoalFilter[];
  commerceShelves: ProductDirectoryShelf[];
  supplementCoverage: ProductDirectorySupplementCoverage[];
  categoryCoverage: ProductDirectoryCategoryCoverage[];
  initialGoalId?: string;
}

type ProductSort = 'signal_match' | 'featured' | 'price_asc' | 'price_desc' | 'name';
type DirectorySignalScenarioId = SignalMatchScenarioId | 'my-health';
type MinimumSignalScore = 0 | 50 | 75;

const MINIMUM_SIGNAL_OPTIONS: Array<{ value: MinimumSignalScore; label: string }> = [
  { value: 0, label: 'All' },
  { value: 50, label: '50+' },
  { value: 75, label: '75+' },
];

function optionLabel(value: string) {
  return value || 'Unknown';
}

function formatSnapshotDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function coverageLabel(level: ProductDirectorySupplementCoverage['coverageLevel']) {
  switch (level) {
    case 'deep':
      return 'Deep';
    case 'covered':
      return 'Covered';
    case 'research':
      return 'Research';
    case 'thin':
    default:
      return 'Needs options';
  }
}

function coverageBadgeVariant(level: ProductDirectorySupplementCoverage['coverageLevel']) {
  switch (level) {
    case 'deep':
      return 'success';
    case 'covered':
      return 'info';
    case 'research':
      return 'secondary';
    case 'thin':
    default:
      return 'warning';
  }
}

export function ProductDirectoryClient({
  products,
  healthGoals,
  commerceShelves,
  supplementCoverage,
  categoryCoverage,
  initialGoalId,
}: ProductDirectoryClientProps) {
  const initialGoal =
    initialGoalId && healthGoals.some((goal) => goal.id === initialGoalId) ? initialGoalId : 'all';
  const [searchTerm, setSearchTerm] = useState('');
  const [goalId, setGoalId] = useState(initialGoal);
  const [category, setCategory] = useState('all');
  const [brand, setBrand] = useState('all');
  const [sortBy, setSortBy] = useState<ProductSort>('signal_match');
  const [minimumSignalScore, setMinimumSignalScore] = useState<MinimumSignalScore>(0);
  const [signalScenarioId, setSignalScenarioId] =
    useState<DirectorySignalScenarioId>('holistic');
  const [showSignalTools, setShowSignalTools] = useState(false);
  const {
    latestSnapshot,
    isLoading: isHealthSnapshotLoading,
  } = useHealthSnapshots({ limit: 1 });
  const activeSignalScenario =
    signalScenarioId === 'my-health'
      ? getSignalMatchScenario('holistic')
      : getSignalMatchScenario(signalScenarioId);
  const activeSignalSnapshot =
    signalScenarioId === 'my-health' && latestSnapshot
      ? latestSnapshot
      : activeSignalScenario.snapshot;
  const latestSnapshotDate = formatSnapshotDate(
    latestSnapshot?.lastSyncedAt ?? latestSnapshot?.capturedAt
  );
  const activeSignalTitle =
    signalScenarioId === 'my-health' && latestSnapshot
      ? 'My health'
      : activeSignalScenario.label;
  const activeSignalSummary =
    signalScenarioId === 'my-health' && latestSnapshot
      ? `${latestSnapshotDate ? `Latest ${latestSnapshotDate} · ` : ''}${describeMetricSnapshot(
          latestSnapshot
        )}`
      : describeMetricSnapshot(activeSignalSnapshot);

  useEffect(() => {
    if (signalScenarioId === 'my-health' && !latestSnapshot && !isHealthSnapshotLoading) {
      setSignalScenarioId('holistic');
    }
  }, [isHealthSnapshotLoading, latestSnapshot, signalScenarioId]);

  const signalMatches = useMemo(
    () => buildProductSignalMatches(products, activeSignalSnapshot),
    [activeSignalSnapshot, products]
  );
  const signalMap = useMemo(() => buildHealthSignalMap(activeSignalSnapshot), [activeSignalSnapshot]);
  const sleepProtocol = useMemo(
    () => buildSleepCommerceProtocol(activeSignalSnapshot),
    [activeSignalSnapshot]
  );
  const primarySignal = signalMap[0] ?? null;

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.directory_category))).sort(),
    [products]
  );

  const brands = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((product) => product.brands?.brand_name ?? product.shopify_store_domain)
            .filter((name): name is string => Boolean(name))
        )
      ).sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const result = products.filter((product) => {
      const brandName = product.brands?.brand_name ?? product.shopify_store_domain ?? '';
      const searchable = [
        product.product_name,
        product.product_description,
        product.directory_supplement_name,
        product.directory_category,
        brandName,
        ...(product.quality_badges ?? []),
      ]
        .join(' ')
        .toLowerCase();

      if (term && !searchable.includes(term)) return false;
      if (goalId !== 'all' && !product.health_goal_ids.includes(goalId as HealthGoalId)) {
        return false;
      }
      if ((signalMatches.get(String(product.product_id))?.score ?? 0) < minimumSignalScore) {
        return false;
      }
      if (category !== 'all' && product.directory_category !== category) return false;
      if (brand !== 'all' && brandName !== brand) return false;

      return true;
    });

    return result.sort((a, b) => {
      switch (sortBy) {
        case 'signal_match': {
          const matchDelta =
            (signalMatches.get(String(b.product_id))?.score ?? 0) -
            (signalMatches.get(String(a.product_id))?.score ?? 0);
          if (matchDelta !== 0) return matchDelta;
          if (a.ucp_enabled !== b.ucp_enabled) return a.ucp_enabled ? -1 : 1;
          return a.product_price - b.product_price;
        }
        case 'price_asc':
          return a.product_price - b.product_price;
        case 'price_desc':
          return b.product_price - a.product_price;
        case 'name':
          return a.product_name.localeCompare(b.product_name);
        case 'featured':
        default:
          if (a.ucp_enabled !== b.ucp_enabled) return a.ucp_enabled ? -1 : 1;
          if (a.subscriptions_available !== b.subscriptions_available) {
            return a.subscriptions_available ? -1 : 1;
          }
          return a.product_price - b.product_price;
      }
    });
  }, [brand, category, goalId, minimumSignalScore, products, searchTerm, signalMatches, sortBy]);

  const topSignalMatches = useMemo(
    () =>
      filteredProducts
        .map((product) => ({
          product,
          match: signalMatches.get(String(product.product_id)),
        }))
        .filter((item) => (item.match?.score ?? 0) > 0)
        .sort((a, b) => {
          const scoreDelta = (b.match?.score ?? 0) - (a.match?.score ?? 0);
          if (scoreDelta !== 0) return scoreDelta;
          return a.product.product_price - b.product.product_price;
        })
        .slice(0, 3),
    [filteredProducts, signalMatches]
  );
  const starterStack = useMemo(
    () =>
      topSignalMatches.map(({ product, match }) => ({
        product,
        match,
        shelf:
          healthGoals.find((goal) => goal.id === match?.primaryGoalId)?.title ??
          healthGoals.find((goal) => product.health_goal_ids.includes(goal.id))?.title ??
          'Signal shelf',
      })),
    [healthGoals, topSignalMatches]
  );
  const directoryCommercePlan = useMemo(
    () => buildHealthCommercePlan(activeSignalSnapshot, filteredProducts, 3),
    [activeSignalSnapshot, filteredProducts]
  );
  const matchedProductCount = useMemo(
    () =>
      products.filter((product) => (signalMatches.get(String(product.product_id))?.score ?? 0) > 0)
        .length,
    [products, signalMatches]
  );
  const signalShelfMatrix = useMemo(
    () =>
      signalMap.map((signal) => {
        const shelfProducts = products.filter((product) =>
          product.health_goal_ids.includes(signal.goalId)
        );
        const matchedItems = shelfProducts
          .map((product) => ({
            product,
            match: signalMatches.get(String(product.product_id)),
          }))
          .filter((item) => (item.match?.score ?? 0) > 0)
          .sort((a, b) => {
            const scoreDelta = (b.match?.score ?? 0) - (a.match?.score ?? 0);
            if (scoreDelta !== 0) return scoreDelta;
            return a.product.product_price - b.product.product_price;
          });
        const directCheckoutCount = shelfProducts.filter((product) => product.ucp_enabled).length;
        const prices = shelfProducts
          .map((product) => product.product_price)
          .filter((price) => Number.isFinite(price) && price > 0);
        const averageScore =
          matchedItems.length > 0
            ? Math.round(
                matchedItems.reduce((total, item) => total + (item.match?.score ?? 0), 0) /
                  matchedItems.length
              )
            : 0;

        return {
          signal,
          title: healthGoals.find((goal) => goal.id === signal.goalId)?.title ?? signal.label,
          productCount: shelfProducts.length,
          directCheckoutCount,
          priceFrom: prices.length ? Math.min(...prices) : null,
          averageScore,
          topProduct: matchedItems[0]?.product ?? null,
          topScore: matchedItems[0]?.match?.score ?? 0,
        };
      }),
    [healthGoals, products, signalMap, signalMatches]
  );
  const coverageStats = useMemo(() => {
    const commercialSupplements = supplementCoverage.filter((row) => !row.researchOnly);
    const coveredSupplements = commercialSupplements.filter((row) => row.productCount >= 2);
    const deepSupplements = commercialSupplements.filter((row) => row.coverageLevel === 'deep');
    const thinSupplements = commercialSupplements.filter((row) => row.productCount < 2);

    return {
      commercialSupplementCount: commercialSupplements.length,
      coveredSupplementCount: coveredSupplements.length,
      deepSupplementCount: deepSupplements.length,
      thinSupplementCount: thinSupplements.length,
      researchOnlyCount: supplementCoverage.length - commercialSupplements.length,
      coveredPercent: Math.round(
        (coveredSupplements.length / Math.max(1, commercialSupplements.length)) * 100
      ),
    };
  }, [supplementCoverage]);
  const priorityCoverageGaps = useMemo(
    () =>
      supplementCoverage
        .filter((row) => !row.researchOnly && row.productCount < 2)
        .sort((a, b) => {
          const countDelta = a.productCount - b.productCount;
          if (countDelta !== 0) return countDelta;
          const categoryDelta = a.category.localeCompare(b.category);
          if (categoryDelta !== 0) return categoryDelta;
          return a.supplementName.localeCompare(b.supplementName);
        })
        .slice(0, 10),
    [supplementCoverage]
  );
  const priorityCategories = useMemo(
    () =>
      categoryCoverage
        .filter((row) => row.supplementCount > row.researchOnlyCount)
        .slice(0, 6),
    [categoryCoverage]
  );

  const activeFilterCount = [
    searchTerm.trim(),
    goalId !== 'all',
    category !== 'all',
    brand !== 'all',
    minimumSignalScore > 0,
    signalScenarioId !== 'holistic',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm('');
    setGoalId('all');
    setCategory('all');
    setBrand('all');
    setSortBy('signal_match');
    setMinimumSignalScore(0);
    setSignalScenarioId('holistic');
  };

  const focusCoverageGap = (row: ProductDirectorySupplementCoverage) => {
    setSearchTerm(row.supplementName);
    setCategory(row.category);
    setGoalId(row.healthGoalIds[0] ?? 'all');
    setSortBy('signal_match');
    setMinimumSignalScore(0);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {commerceShelves.map((shelf) => {
          const isActive = goalId === shelf.id;

          return (
            <button
              key={shelf.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                setGoalId(shelf.id);
                setSortBy('signal_match');
              }}
              className={[
                'min-h-[132px] rounded border p-4 text-left transition-colors',
                isActive
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={isActive ? 'text-xs font-semibold uppercase tracking-wide text-gray-300' : 'text-xs font-semibold uppercase tracking-wide text-gray-400'}>
                    {shelf.shortTitle} shelf
                  </p>
                  <p className="mt-1 text-base font-semibold leading-6">{shelf.title}</p>
                </div>
                <span
                  className={[
                    'shrink-0 rounded px-2 py-1 text-xs font-semibold',
                    isActive ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-700',
                  ].join(' ')}
                >
                  {shelf.productCount}
                </span>
              </div>

              <p className={isActive ? 'mt-3 line-clamp-2 text-xs leading-5 text-gray-300' : 'mt-3 line-clamp-2 text-xs leading-5 text-gray-500'}>
                {shelf.signalLabel}
              </p>

              <div className={isActive ? 'mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-300' : 'mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500'}>
                <span>{shelf.directCheckoutCount} instant</span>
                <span>{shelf.brandCount} brands</span>
                {shelf.priceFrom != null && <span>from ${formatPrice(shelf.priceFrom)}</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Analytics panels are heavy; keep them collapsed so the product grid
          leads on mobile (Etsy-style lean browse surface). */}
      <div className="flex items-center justify-between gap-3 rounded border border-gray-200 bg-white px-4 py-3">
        <div className="min-w-0 text-sm">
          <span className="font-medium text-gray-900">Signal tools</span>
          <span className="ml-2 hidden text-gray-500 sm:inline">
            Catalog coverage, signal scenarios, and the experiment builder
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSignalTools((open) => !open)}
          aria-expanded={showSignalTools}
        >
          {showSignalTools ? 'Hide' : 'Show'}
        </Button>
      </div>

      {showSignalTools && (
      <>
      <div className="rounded border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              <FiLayers />
              Catalog Coverage
            </div>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              {coverageStats.coveredPercent}% of commercial supplement families have at least two
              product options.
            </p>
          </div>
          <Badge variant={coverageStats.thinSupplementCount > 0 ? 'warning' : 'success'} size="sm">
            {coverageStats.thinSupplementCount} thin shelves
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 divide-x divide-y divide-gray-100 border-y border-gray-100 md:grid-cols-4 md:divide-y-0">
          <div className="p-3 first:pl-0">
            <p className="text-xl font-semibold text-gray-900">
              {coverageStats.commercialSupplementCount}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              Commercial families
            </p>
          </div>
          <div className="p-3">
            <p className="text-xl font-semibold text-gray-900">
              {coverageStats.coveredSupplementCount}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              Covered 2+
            </p>
          </div>
          <div className="p-3">
            <p className="text-xl font-semibold text-gray-900">
              {coverageStats.deepSupplementCount}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              Deep shelves
            </p>
          </div>
          <div className="p-3 last:pr-0">
            <p className="text-xl font-semibold text-gray-900">
              {coverageStats.researchOnlyCount}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              Research-only
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium text-gray-900">Category Depth</h3>
              <span className="text-xs text-gray-400">{priorityCategories.length} categories</span>
            </div>
            <div className="mt-2 divide-y divide-gray-100">
              {priorityCategories.map((row) => (
                <button
                  key={row.category}
                  type="button"
                  onClick={() => {
                    setCategory(row.category);
                    setGoalId('all');
                  }}
                  className="block w-full py-2 text-left"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium text-gray-800">
                      {row.category}
                    </span>
                    <span className="shrink-0 text-xs text-gray-400">
                      {row.productCount} products · {row.thinSupplementCount} thin
                    </span>
                  </span>
                  <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <span
                      className="block h-full rounded-full bg-gray-900"
                      style={{ width: `${Math.min(100, row.coveragePercent)}%` }}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium text-gray-900">Next Sourcing Targets</h3>
              <span className="text-xs text-gray-400">
                {coverageStats.thinSupplementCount} remaining
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {priorityCoverageGaps.map((row) => (
                <button
                  key={row.supplementId}
                  type="button"
                  onClick={() => focusCoverageGap(row)}
                  className="inline-flex max-w-full items-center gap-2 rounded border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
                >
                  <span className="truncate font-medium">{row.supplementName}</span>
                  <Badge variant={coverageBadgeVariant(row.coverageLevel)} size="sm">
                    {coverageLabel(row.coverageLevel)}
                  </Badge>
                  <span className="text-gray-400">{row.productCount}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              <FiCpu />
              Signal Match
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {activeSignalTitle} · {activeSignalSummary}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={signalScenarioId === 'my-health'}
              disabled={!latestSnapshot}
              onClick={() => {
                if (!latestSnapshot) return;
                setSignalScenarioId('my-health');
                setSortBy('signal_match');
              }}
              className={[
                'inline-flex h-8 items-center gap-1.5 rounded border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                signalScenarioId === 'my-health'
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900',
              ].join(' ')}
            >
              <FiActivity />
              My health
            </button>
            {SIGNAL_MATCH_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                aria-pressed={signalScenarioId === scenario.id}
                onClick={() => {
                  setSignalScenarioId(scenario.id);
                  setSortBy('signal_match');
                }}
                className={[
                  'inline-flex h-8 items-center rounded border px-3 text-xs font-medium transition-colors',
                  signalScenarioId === scenario.id
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900',
                ].join(' ')}
              >
                {scenario.label}
              </button>
            ))}
            {!latestSnapshot && !isHealthSnapshotLoading && (
              <Link
                href="/health/tracker"
                className="inline-flex h-8 items-center rounded border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
              >
                Connect health data
              </Link>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1.2fr]">
          <div className="rounded border border-gray-200 bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Primary signal
                </p>
                <h3 className="mt-1 text-sm font-medium text-gray-900">
                  {primarySignal?.headline ?? 'Connect health signals'}
                </h3>
              </div>
              {primarySignal && (
                <Badge
                  variant={primarySignal.status === 'strong' ? 'success' : primarySignal.status === 'watch' ? 'warning' : 'error'}
                  size="sm"
                >
                  {primarySignal.status}
                </Badge>
              )}
            </div>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {primarySignal?.reason ??
                'Connect sleep, body, calories, and steps to rank products from your real signal mix.'}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="rounded border border-gray-100 bg-gray-50 p-2">
                <span className="block font-medium text-gray-900">
                  {matchedProductCount}
                </span>
                Matched products
              </div>
              <div className="rounded border border-gray-100 bg-gray-50 p-2">
                <span className="block font-medium text-gray-900">
                  {sleepProtocol.status}
                </span>
                Sleep protocol
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-gray-400">
              {primarySignal?.targetLabel ?? sleepProtocol.measurementPlan[0]}
            </p>
          </div>

          <div className="rounded border border-gray-200 bg-white p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Suggested starter stack
                </p>
                <h3 className="mt-1 text-sm font-medium text-gray-900">
                  Start with the top matched products, then retest the signal.
                </h3>
              </div>
              <Link
                href={primarySignal ? `/products?goal=${primarySignal.goalId}` : '/health/tracker'}
                className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                {primarySignal ? 'Open shelf' : 'Open tracker'}
              </Link>
            </div>

            {starterStack.length > 0 ? (
              <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-3">
                {starterStack.map(({ product, match, shelf }) => (
                  <Link
                    key={product.product_id}
                    href={`/product/${product.product_id}`}
                    className="group min-w-0 rounded border border-gray-100 bg-gray-50 p-2 transition-colors hover:border-gray-200 hover:bg-white"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-medium text-gray-500">{shelf}</span>
                      <Badge variant="success" size="sm">
                        {match?.score ?? 0}
                      </Badge>
                    </span>
                    <span className="mt-2 block line-clamp-2 text-sm font-medium leading-5 text-gray-900 group-hover:underline">
                      {product.product_name}
                    </span>
                    <span className="mt-1 block truncate text-xs text-gray-500">
                      {product.directory_supplement_name} · ${formatPrice(product.product_price)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded border border-gray-100 bg-gray-50 p-3 text-sm text-gray-500">
                Choose a signal scenario or connect health data to build a starter stack.
              </p>
            )}
          </div>
        </div>

        {topSignalMatches.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
            {topSignalMatches.map(({ product, match }) => (
              <Link
                key={product.product_id}
                href={`/product/${product.product_id}`}
                className="rounded border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {product.product_name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {product.directory_supplement_name} · ${formatPrice(product.product_price)}
                    </p>
                  </div>
                  <Badge variant="success" size="sm">
                    {match?.score ?? 0}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
                  {match?.reasons.join(' · ') || 'Signal match'}
                </p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-4 rounded border border-gray-200 bg-white p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <FiBarChart2 />
                Signal Shelf Matrix
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Compare how the current health scenario maps into each product shelf.
              </p>
            </div>
            <Link
              href="/health/tracker"
              className="inline-flex h-8 shrink-0 items-center justify-center rounded border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Update signals
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
            {signalShelfMatrix.map((item) => (
              <button
                key={item.signal.id}
                type="button"
                onClick={() => {
                  setGoalId(item.signal.goalId);
                  setSortBy('signal_match');
                  setMinimumSignalScore(0);
                }}
                className={[
                  'min-h-[172px] rounded border p-3 text-left transition-colors',
                  goalId === item.signal.goalId
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white',
                ].join(' ')}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <span
                      className={[
                        'block truncate text-sm font-medium',
                        goalId === item.signal.goalId ? 'text-white' : 'text-gray-900',
                      ].join(' ')}
                    >
                      {item.signal.label}
                    </span>
                    <span
                      className={[
                        'mt-1 block text-[11px] font-medium uppercase tracking-wide',
                        goalId === item.signal.goalId ? 'text-gray-300' : 'text-gray-400',
                      ].join(' ')}
                    >
                      {item.title}
                    </span>
                  </span>
                  <Badge
                    variant={
                      item.signal.status === 'strong'
                        ? 'success'
                        : item.signal.status === 'watch'
                          ? 'warning'
                          : 'error'
                    }
                    size="sm"
                  >
                    {item.topScore || item.averageScore}
                  </Badge>
                </span>

                <span
                  className={[
                    'mt-3 block text-xs leading-5',
                    goalId === item.signal.goalId ? 'text-gray-300' : 'text-gray-500',
                  ].join(' ')}
                >
                  {item.signal.valueLabel}
                </span>

                <span className="mt-3 grid grid-cols-3 gap-1.5 text-[11px]">
                  <span
                    className={[
                      'rounded border p-1.5',
                      goalId === item.signal.goalId
                        ? 'border-gray-700 bg-gray-800 text-gray-200'
                        : 'border-gray-100 bg-white text-gray-500',
                    ].join(' ')}
                  >
                    <span className="block font-semibold">{item.productCount}</span>
                    Products
                  </span>
                  <span
                    className={[
                      'rounded border p-1.5',
                      goalId === item.signal.goalId
                        ? 'border-gray-700 bg-gray-800 text-gray-200'
                        : 'border-gray-100 bg-white text-gray-500',
                    ].join(' ')}
                  >
                    <span className="block font-semibold">{item.directCheckoutCount}</span>
                    Checkout
                  </span>
                  <span
                    className={[
                      'rounded border p-1.5',
                      goalId === item.signal.goalId
                        ? 'border-gray-700 bg-gray-800 text-gray-200'
                        : 'border-gray-100 bg-white text-gray-500',
                    ].join(' ')}
                  >
                    <span className="block font-semibold">
                      {item.priceFrom != null ? `$${formatPrice(item.priceFrom)}` : '--'}
                    </span>
                    From
                  </span>
                </span>

                <span
                  className={[
                    'mt-3 block border-t pt-2 text-xs leading-5',
                    goalId === item.signal.goalId
                      ? 'border-gray-700 text-gray-300'
                      : 'border-gray-100 text-gray-500',
                  ].join(' ')}
                >
                  {item.topProduct
                    ? `Top match: ${item.topProduct.directory_supplement_name}`
                    : 'No matched products yet'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {directoryCommercePlan.items.length > 0 && (
          <div className="mt-4 rounded border border-gray-200 bg-white p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <FiShoppingCart />
                  Experiment Builder
                </div>
                <h3 className="mt-1 text-sm font-medium text-gray-900">
                  {directoryCommercePlan.primaryExperiment?.title ?? directoryCommercePlan.headline}
                </h3>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
                  {directoryCommercePlan.summary}
                </p>
              </div>

              <div className="grid shrink-0 grid-cols-3 gap-2 text-xs text-gray-500 sm:min-w-[360px]">
                <div className="rounded border border-gray-100 bg-gray-50 p-2">
                  <span className="block font-medium text-gray-900">
                    ${formatPrice(directoryCommercePlan.totalOneTimeCost)}
                  </span>
                  One-time
                </div>
                <div className="rounded border border-gray-100 bg-gray-50 p-2">
                  <span className="block font-medium text-gray-900">
                    ~${formatPrice(directoryCommercePlan.estimatedMonthlyCost)}
                  </span>
                  Monthly
                </div>
                <div className="rounded border border-gray-100 bg-gray-50 p-2">
                  <span className="block font-medium text-gray-900">
                    {directoryCommercePlan.directCheckoutCount}
                  </span>
                  Checkout
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[0.82fr_1.18fr]">
              <div className="rounded border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <FiClock />
                  Routine Slots
                </div>
                <div className="mt-3 space-y-2">
                  {directoryCommercePlan.routineSlots.slice(0, 3).map((slot) => (
                    <Link
                      key={`${slot.id}-${slot.goalId}`}
                      href={slot.shelfHref}
                      className="block rounded border border-gray-100 bg-white p-2 transition-colors hover:border-gray-200 hover:bg-gray-50"
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="min-w-0">
                          <span className="flex flex-wrap gap-1.5">
                            <Badge variant={slot.isPrimary ? 'success' : 'secondary'} size="sm">
                              {slot.label}
                            </Badge>
                            <span className="rounded border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                              {slot.timingLabel}
                            </span>
                          </span>
                          <span className="mt-2 block text-xs font-medium leading-5 text-gray-900">
                            {slot.headline}
                          </span>
                        </span>
                        <FiTarget className="mt-1 shrink-0 text-gray-300" />
                      </span>
                      <span className="mt-2 block text-xs leading-5 text-gray-500">
                        {slot.productNames.join(', ')}
                      </span>
                      <span className="mt-2 block border-t border-gray-100 pt-2 text-[11px] leading-5 text-gray-400">
                        Measure: {slot.measurementLabel}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded border border-gray-100 bg-gray-50 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      <FiBarChart2 />
                      Impact Forecast
                    </div>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Baseline, target, and decision rule for this directory slice.
                    </p>
                  </div>
                  <Badge variant="info" size="sm">
                    {directoryCommercePlan.impactForecasts.length} tests
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-3">
                  {directoryCommercePlan.impactForecasts.slice(0, 3).map((forecast) => (
                    <div
                      key={`${forecast.productId}-${forecast.goalId}`}
                      className="rounded border border-gray-100 bg-white p-2"
                    >
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary" size="sm">
                          {forecast.slotLabel}
                        </Badge>
                        <span className="rounded border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                          {forecast.measurementWindow}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-gray-900">
                        {forecast.productName}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-gray-500">
                        {forecast.baselineLabel}
                      </p>
                      <p className="mt-2 border-t border-gray-100 pt-2 text-[11px] leading-5 text-gray-500">
                        <span className="font-medium text-green-700">Keep:</span>{' '}
                        {forecast.keepSignal}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {directoryCommercePlan.cartGroups.length > 0 && (
              <div className="mt-3 rounded border border-gray-100 bg-gray-50 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Merchant carts
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {directoryCommercePlan.cartGroups.map((group) => (
                    <a
                      key={group.storeDomain}
                      href={group.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-0 items-center justify-between gap-3 rounded border border-gray-100 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-200 hover:bg-gray-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-gray-900">
                          {group.brandNames.join(', ') || group.storeDomain}
                        </span>
                        <span className="text-xs text-gray-500">
                          {group.products.length} item{group.products.length !== 1 ? 's' : ''}
                        </span>
                      </span>
                      <FiExternalLink className="shrink-0 text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </>
      )}

      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.72fr_0.72fr_0.72fr_0.56fr_0.56fr]">
        <label className="block">
          <span className="sr-only">Search products</span>
          <span className="relative block">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={`Search ${products.length} products...`}
              className="h-11 w-full rounded border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
            />
          </span>
        </label>

        <label className="block">
          <span className="sr-only">Health signal</span>
          <select
            value={goalId}
            onChange={(event) => setGoalId(event.target.value)}
            className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
          >
            <option value="all">All health signals</option>
            {healthGoals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title} ({goal.productCount})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {optionLabel(item)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Brand</span>
          <select
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
          >
            <option value="all">All brands</option>
            {brands.map((item) => (
              <option key={item} value={item}>
                {optionLabel(item)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Sort products</span>
          <select
            value={sortBy}
            aria-label="Sort products"
            onChange={(event) => setSortBy(event.target.value as ProductSort)}
            className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
          >
            <option value="signal_match">Signal match</option>
            <option value="featured">Featured</option>
            <option value="price_asc">Price low to high</option>
            <option value="price_desc">Price high to low</option>
            <option value="name">Name</option>
          </select>
        </label>

        <div className="flex h-11 rounded border border-gray-300 bg-white p-1">
          {MINIMUM_SIGNAL_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={minimumSignalScore === option.value}
              onClick={() => {
                setMinimumSignalScore(option.value);
                setSortBy('signal_match');
              }}
              className={[
                'flex-1 rounded px-2 text-xs font-medium transition-colors',
                minimumSignalScore === option.value
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-900',
              ].join(' ')}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {filteredProducts.length.toLocaleString()} products
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {goalId === 'all'
              ? `${activeSignalTitle} ranking across every commerce-ready shelf`
              : healthGoals.find((goal) => goal.id === goalId)?.signalLabel}
            {minimumSignalScore > 0 ? ` · signal score ${minimumSignalScore}+` : ''}
          </p>
        </div>
        {activeFilterCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearFilters} leftIcon={<FiX />}>
            Clear filters
          </Button>
        )}
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Active filters">
          {searchTerm.trim() && (
            <FilterChip label={`"${searchTerm.trim()}"`} onRemove={() => setSearchTerm('')} />
          )}
          {goalId !== 'all' && (
            <FilterChip
              label={healthGoals.find((goal) => goal.id === goalId)?.title ?? goalId}
              onRemove={() => setGoalId('all')}
            />
          )}
          {category !== 'all' && (
            <FilterChip label={category} onRemove={() => setCategory('all')} />
          )}
          {brand !== 'all' && <FilterChip label={brand} onRemove={() => setBrand('all')} />}
          {minimumSignalScore > 0 && (
            <FilterChip
              label={`Signal ${minimumSignalScore}+`}
              onRemove={() => setMinimumSignalScore(0)}
            />
          )}
          {signalScenarioId !== 'holistic' && (
            <FilterChip
              label={
                signalScenarioId === 'my-health'
                  ? 'My health data'
                  : SIGNAL_MATCH_SCENARIOS.find((scenario) => scenario.id === signalScenarioId)
                      ?.label ?? signalScenarioId
              }
              onRemove={() => setSignalScenarioId('holistic')}
            />
          )}
        </div>
      )}

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              signalMatch={signalMatches.get(String(product.product_id))}
            />
          ))}
        </div>
      ) : (
        <div className="rounded border border-gray-200 bg-gray-50 p-10 text-center">
          <p className="text-base font-medium text-gray-900">No products match those filters.</p>
          <p className="mt-2 text-sm text-gray-500">
            Try another health signal, brand, category, or product search.
          </p>
          <Button variant="primary" className="mt-5" onClick={clearFilters}>
            Reset directory
          </Button>
        </div>
      )}
    </div>
  );
}

/** Removable chip for a single applied filter (editorial style). */
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove filter ${label}`}
      className="inline-flex min-h-9 items-center gap-1.5 rounded border border-gray-300 bg-white px-3 text-xs font-medium text-gray-900 transition-colors hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
    >
      {label}
      <FiX size={14} aria-hidden="true" />
    </button>
  );
}

export default ProductDirectoryClient;
