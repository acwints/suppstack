'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaShoppingCart, FaCheck, FaExternalLinkAlt } from 'react-icons/fa';
import { FiActivity, FiBookmark, FiClock, FiCpu, FiMoon, FiShield, FiTarget } from 'react-icons/fi';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { useSavedProducts } from '../../context/SavedProductsContext';
import { useReviews } from '@/hooks/useReviews';
import { recordProductView } from '@/hooks/useRecentlyViewed';
import {
  useHealthExperiments,
  useHealthSnapshots,
  useProductInStack,
  usePriceCalculations,
} from '@/hooks';
import { useCommerceCheckout } from '@/hooks';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';
import {
  Spinner,
  Button,
  Badge,
  Card,
  EmptyState,
  Stack,
  Inline,
  Grid,
  useToast,
} from '@/components/ui';
import { Rating } from '@/components/composite/Rating';
import { ReviewList } from '@/components/composite/Review/ReviewList';
import { EmbeddedCheckout } from '@/components/composite/Commerce';
import { BrandLogo } from '@/components/composite/Brand';
import type { ReviewSortBy } from '@/hooks/useReviews';
import { findCatalogProductById } from '@/lib/catalog/supplement-catalog';
import { resolveDatabaseProductId } from '@/lib/catalog/supplement-sync';
import {
  canPurchase,
  getInventoryLabel,
  getPurchaseDestination,
  getPurchaseLabel,
  isShopifySearchUrl,
} from '@/lib/commerce/shopify-ucp';
import { hasShopifyVariant } from '@/lib/commerce/product-source';
import {
  getProductImageSrc,
  isRemoteImageSrc,
  PRODUCT_IMAGE_FALLBACK,
} from '@/lib/catalog/product-image';
import { buildProductDirectory } from '@/lib/catalog/product-directory';
import { buildProductSignalMatches } from '@/lib/catalog/product-match';
import {
  buildHealthTrackerPlan,
  DEMO_HEALTH_SNAPSHOT,
} from '@/lib/health/health-intelligence';
import { findHealthGoalDirectoryItem } from '@/lib/catalog/health-goal-directory';

export default function ProductPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [productImageSrc, setProductImageSrc] = useState(PRODUCT_IMAGE_FALLBACK);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [sortBy, setSortBy] = useState<ReviewSortBy>('newest');
  const isLocalCatalogProductId = params.id.startsWith('catalog-') || params.id.startsWith('real-');

  // Reviews are keyed by database product ids. Catalog products resolve
  // (and lazily materialize) their database identity so reviews and ratings
  // work for every product, not just database-native ones.
  const [reviewProductId, setReviewProductId] = useState<string | null>(
    isLocalCatalogProductId ? null : params.id
  );

  // Review system hook
  const {
    reviews,
    stats,
    isLoading: reviewsLoading,
    userReview,
    hasMore,
    loadMore,
    submitReview,
    updateReview,
    deleteReview,
    voteHelpful,
  } = useReviews({
    productId: reviewProductId ?? '',
    sortBy,
    enabled: !!reviewProductId,
  });

  // Stack management
  const { isInStack, isUpdating, addToStack } = useProductInStack(product);
  const { isSaved, toggleSaved } = useSavedProducts();
  const saved = product ? isSaved(String(product.product_id)) : false;
  const { isStartingCheckout, startCheckout } = useCommerceCheckout();
  const { latestSnapshot } = useHealthSnapshots({ limit: 1 });
  const {
    activeExperiments,
    createExperiment,
    isSaving: isSavingExperiment,
    schemaWarning: experimentSchemaWarning,
  } = useHealthExperiments({ limit: 8 });

  // Price calculations
  // servings_per_container of 0 means the merchant listing doesn't state a
  // serving count; per-serving math is hidden rather than invented.
  const { costPerServing, monthlyCost } = usePriceCalculations(
    product?.product_price || 0,
    product?.servings_per_container || 0,
    product?.servings_per_day || 1
  );

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);

      const catalogProduct = findCatalogProductById(params.id);
      if (catalogProduct) {
        setProduct(catalogProduct);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*, brands(brand_name), supplements(supplement_id, supplement_name)')
        .eq('product_id', params.id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
      } else {
        setProduct(data);
      }
      setIsLoading(false);
    }

    fetchProduct();
  }, [params.id]);

  useEffect(() => {
    setProductImageSrc(getProductImageSrc(product?.product_image));
  }, [product?.product_image]);

  // Feed the home screen's "Recently Viewed" strip.
  useEffect(() => {
    if (product) recordProductView(product);
  }, [product]);

  // Resolve the database identity for catalog products (creates the products
  // row on first visit, idempotent by product_url) so reviews attach to it.
  useEffect(() => {
    if (!product || !isLocalCatalogProductId) return;
    let cancelled = false;
    resolveDatabaseProductId(product)
      .then((id) => {
        if (!cancelled) setReviewProductId(String(id));
      })
      .catch((error) => console.error('Could not resolve review identity:', error));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.product_id, isLocalCatalogProductId]);

  const productDirectory = useMemo(() => buildProductDirectory(), []);
  const directoryProduct = useMemo(() => {
    if (!product) return null;

    return (
      productDirectory.products.find(
        (item) => String(item.product_id) === String(product.product_id)
      ) ?? null
    );
  }, [product, productDirectory.products]);
  const signalMatch = useMemo(() => {
    if (!directoryProduct) return null;
    return (
      buildProductSignalMatches([directoryProduct], DEMO_HEALTH_SNAPSHOT).get(
        String(directoryProduct.product_id)
      ) ?? null
    );
  }, [directoryProduct]);
  const healthGoalFits = useMemo(
    () =>
      (directoryProduct?.health_goal_ids ?? [])
        .map((goalId) => findHealthGoalDirectoryItem(goalId))
        .filter((goal): goal is NonNullable<ReturnType<typeof findHealthGoalDirectoryItem>> =>
          Boolean(goal)
        )
        .slice(0, 4),
    [directoryProduct]
  );
  const productImpactGoalId =
    signalMatch?.primaryGoalId ?? directoryProduct?.health_goal_ids[0] ?? healthGoalFits[0]?.id ?? null;
  const activeProductExperiment = useMemo(() => {
    if (!product) return null;
    return (
      activeExperiments.find((experiment) =>
        experiment.productIds.includes(String(product.product_id))
      ) ?? null
    );
  }, [activeExperiments, product]);
  const latestSnapshotTracker = useMemo(
    () => (latestSnapshot ? buildHealthTrackerPlan(latestSnapshot) : null),
    [latestSnapshot]
  );

  const handleAddToStack = async () => {
    if (!user) {
      toast.info('Please log in to add products to your stack');
      router.push('/login');
      return;
    }
    try {
      await addToStack();
      toast.success('Added to your stack!');
    } catch (error) {
      console.error('Failed to add to stack:', error);
      toast.error('Failed to add to stack');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <EmptyState
          icon="404"
          title="Product not found"
          description="This product may have been removed or doesn't exist."
          action={
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
            >
              Back to Home
            </Link>
          }
          size="lg"
        />
      </main>
    );
  }

  const rating = stats?.average_rating || 0;
  const reviewCount = stats?.total_reviews || 0;
  const isCatalogProduct =
    product.data_source === 'catalog_fallback' ||
    product.product_id.startsWith('catalog-') ||
    product.product_id.startsWith('real-');
  const purchaseLabel = getPurchaseLabel(product);
  const purchaseDestination = getPurchaseDestination(product);
  const inventoryLabel = getInventoryLabel(product);

  const handleStartCheckout = async () => {
    if (hasShopifyVariant(product)) {
      setIsCheckoutOpen(true);
      return;
    }

    try {
      await startCheckout(product);
    } catch (error) {
      console.error('Failed to start checkout:', error);
      toast.error('Unable to open purchase link');
    }
  };

  const handleStartProductImpactTest = async () => {
    if (!user) {
      toast.info('Please log in to start an impact test');
      router.push('/login');
      return;
    }

    if (!productImpactGoalId || !directoryProduct) {
      toast.info('This product needs a health signal before it can start an impact test');
      return;
    }

    if (activeProductExperiment) {
      toast.info('Impact test already active for this product');
      return;
    }

    try {
      await createExperiment({
        snapshotId: latestSnapshot?.snapshotId ?? null,
        goalId: productImpactGoalId,
        title: `14-day ${directoryProduct.directory_supplement_name} impact test`,
        targetDays: 14,
        productIds: [String(product.product_id)],
        supplementNames: [directoryProduct.directory_supplement_name],
        baselineReadinessScore: latestSnapshotTracker?.readinessScore ?? null,
        baselineSleepHoursAvg: latestSnapshot?.sleepHoursAvg ?? null,
        notes: [
          `Product detail impact test for ${product.product_name}.`,
          signalMatch?.score ? `Signal score ${signalMatch.score}.` : null,
          signalMatch?.reasons.length ? `Reasons: ${signalMatch.reasons.join(', ')}.` : null,
          'Keep the rest of the stack steady before comparing the next health snapshot.',
        ]
          .filter(Boolean)
          .join(' '),
      });
      toast.success('Impact test started');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start impact test');
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Navigation */}
      <Link
        href={
          product.supplements?.supplement_id
            ? `/supplement/${product.supplements.supplement_id}`
            : '/'
        }
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <FaArrowLeft className="w-4 h-4" />
        Back to {product.supplements?.supplement_name || 'stack picks'}
      </Link>

      {/* Product Header */}
      <Grid cols={{ sm: 1, lg: 2 }} gap={12} className="mb-12">
        {/* Product Image */}
        <Card padding="lg" className="aspect-square relative overflow-hidden bg-gray-50">
          <Image
            src={productImageSrc}
            alt={product.product_name}
            fill
            className="object-contain p-8"
            sizes="(max-width: 1024px) 100vw, 50vw"
            unoptimized={isRemoteImageSrc(productImageSrc)}
            onError={() => setProductImageSrc(PRODUCT_IMAGE_FALLBACK)}
          />
        </Card>

        {/* Product Info */}
        <Stack gap={6}>
          {/* Brand */}
          <span className="flex items-center gap-2">
            <BrandLogo
              domain={product.shopify_store_domain}
              brandName={product.brands?.brand_name || 'Brand'}
              size="md"
            />
            <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              {product.brands?.brand_name || product.shopify_store_domain || ''}
            </span>
          </span>

          {/* Product Name */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-serif text-gray-900">{product.product_name}</h1>
            <button
              type="button"
              onClick={() => toggleSaved(product)}
              aria-label={saved ? 'Remove from saved' : 'Save for later'}
              aria-pressed={saved}
              className={`flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded border transition-colors duration-150 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 ${
                saved
                  ? 'border-gray-900 text-gray-900'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              <FiBookmark size={20} className={saved ? 'fill-current' : ''} aria-hidden="true" />
            </button>
          </div>

          {/* Rating Summary */}
          <Inline gap={3} align="center">
            <Rating value={rating} size="lg" />
            <span className="text-lg font-medium text-gray-700">
              {rating > 0 ? rating.toFixed(1) : 'No ratings'}
            </span>
            <span className="text-gray-500">
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </Inline>

          {/* Price */}
          <div className="text-4xl font-semibold text-gray-900">
            ${formatPrice(product.product_price)}
          </div>

          {/* Stats Grid — hidden when the merchant listing doesn't state a
              serving count, rather than showing invented numbers */}
          {product.servings_per_container > 0 && (
            <Grid cols={{ sm: 3 }} gap={4}>
              <Card padding="md" className="text-center bg-gray-50">
                <div className="text-xl font-semibold text-gray-900">
                  ${formatPrice(costPerServing)}
                </div>
                <div className="text-sm text-gray-600">per serving</div>
              </Card>
              <Card padding="md" className="text-center bg-gray-50">
                <div className="text-xl font-semibold text-gray-900">
                  ${formatPrice(monthlyCost)}
                </div>
                <div className="text-sm text-gray-600">per month</div>
              </Card>
              <Card padding="md" className="text-center bg-gray-50">
                <div className="text-xl font-semibold text-gray-900">
                  {product.servings_per_container}
                </div>
                <div className="text-sm text-gray-600">servings</div>
              </Card>
            </Grid>
          )}

          {/* Description */}
          {product.product_description && (
            <p className="text-gray-600">{product.product_description}</p>
          )}

          {/* Serving Info */}
          <div className="rounded border border-gray-100 bg-gray-50 p-4">
            <div className="text-sm font-medium text-gray-800">
              Stack plan: {product.servings_per_day} serving
              {product.servings_per_day !== 1 ? 's' : ''} per day
            </div>
          </div>

          {(signalMatch || healthGoalFits.length > 0) && (
            <div className="rounded border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    <FiCpu />
                    Health signal fit
                  </div>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Ranked against SuppStack&apos;s demo sleep, body, output, and recovery signal mix.
                  </p>
                </div>
                {signalMatch && signalMatch.score > 0 && (
                  <Badge variant="success" size="sm">
                    {signalMatch.score} match
                  </Badge>
                )}
              </div>

              {signalMatch && signalMatch.reasons.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {signalMatch.reasons.map((reason) => (
                    <span
                      key={reason}
                      className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              )}

              {healthGoalFits.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {healthGoalFits.map((goal) => (
                    <Link
                      key={goal.id}
                      href={`/products?goal=${goal.id}`}
                      className="rounded border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{goal.shortTitle}</p>
                          <p className="mt-1 text-xs leading-5 text-gray-500">{goal.signalLabel}</p>
                        </div>
                        <FiTarget className="mt-0.5 shrink-0 text-gray-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button
                  size="sm"
                  onClick={handleStartProductImpactTest}
                  disabled={Boolean(activeProductExperiment) || !productImpactGoalId}
                  isLoading={isSavingExperiment}
                  leftIcon={activeProductExperiment ? <FiClock /> : <FiActivity />}
                >
                  {activeProductExperiment ? 'Impact test active' : 'Start impact test'}
                </Button>
                <Link
                  href="/products"
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FiTarget />
                  Compare products
                </Link>
                <Link
                  href="/products?goal=sleep-recovery"
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FiMoon />
                  Sleep shelf
                </Link>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div className="rounded border border-gray-100 bg-white p-2">
                  <span className="block font-medium text-gray-900">
                    {latestSnapshotTracker ? latestSnapshotTracker.readinessScore : 'No baseline'}
                  </span>
                  Readiness baseline
                </div>
                <div className="rounded border border-gray-100 bg-white p-2">
                  <span className="block font-medium text-gray-900">
                    {latestSnapshot?.sleepHoursAvg
                      ? `${latestSnapshot.sleepHoursAvg.toFixed(1)}h`
                      : 'No sleep data'}
                  </span>
                  Sleep baseline
                </div>
              </div>
              {experimentSchemaWarning && (
                <p className="mt-3 text-xs leading-5 text-amber-700">{experimentSchemaWarning}</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge variant={purchaseDestination.isDirectCheckout ? 'success' : 'primary'}>
              {purchaseDestination.isDirectCheckout ? 'Instant checkout' : inventoryLabel}
            </Badge>
            {product.subscriptions_available && <Badge variant="secondary">Subscription available</Badge>}
            {product.quality_badges?.slice(0, 3).map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1 rounded border border-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                <FiShield className="h-3 w-3" />
                {badge}
              </span>
            ))}
          </div>

          {/* Actions */}
          <Stack gap={3}>
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleStartCheckout}
              disabled={!canPurchase(product)}
              isLoading={isStartingCheckout}
              rightIcon={<FaExternalLinkAlt className="w-3 h-3" />}
            >
              {purchaseLabel}
            </Button>

            <Button
              onClick={handleAddToStack}
              disabled={isInStack || isUpdating}
              variant={isInStack ? 'outline' : 'secondary'}
              fullWidth
              size="lg"
              leftIcon={isInStack ? <FaCheck /> : <FaShoppingCart />}
              isLoading={isUpdating}
              className={isInStack ? 'bg-green-50 text-green-700 border-green-200' : ''}
            >
              {isInStack ? 'Added to My Stack' : 'Add to My Stack'}
            </Button>

            <Inline gap={3}>
              {product.product_url && !isShopifySearchUrl(product.product_url) && (
                <a
                  href={product.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                >
                  Brand Store
                  <FaExternalLinkAlt className="w-3 h-3" />
                </a>
              )}
              {product.amazon_url && !product.ucp_enabled && (
                <a
                  href={product.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded bg-gray-100 px-4 text-sm font-medium text-gray-900 hover:bg-gray-200"
                >
                  Buy on Amazon
                  <FaExternalLinkAlt className="w-3 h-3" />
                </a>
              )}
            </Inline>
          </Stack>

          {/* Supplement Category */}
          {product.supplements?.supplement_name && (
            <div className="pt-6 border-t border-gray-200">
              <Badge variant="secondary">{product.supplements.supplement_name}</Badge>
            </div>
          )}
        </Stack>
      </Grid>

      <EmbeddedCheckout
        product={product}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* Sticky purchase bar (mobile) — the tab bar yields to this on /product routes */}
      <div className="app-bottom-bar fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden">
        <div className="flex items-center gap-4 px-4 py-2.5">
          <div className="min-w-0 shrink-0">
            <p className="text-lg font-semibold leading-tight text-gray-900">
              ${formatPrice(product.product_price)}
            </p>
            {(product.servings_per_container ?? 0) > 0 && (
              <p className="text-xs text-gray-500">${formatPrice(costPerServing)}/serving</p>
            )}
          </div>
          <Button
            variant="primary"
            size="lg"
            className="min-h-11 flex-1"
            onClick={handleStartCheckout}
            disabled={!canPurchase(product)}
            isLoading={isStartingCheckout}
          >
            {purchaseLabel}
          </Button>
        </div>
      </div>

      {/* Reviews Section */}
      {reviewProductId && (
        <div className="border-t border-gray-200 pt-12">
          <ReviewList
            productId={reviewProductId}
            productName={product.product_name}
            reviews={reviews}
            stats={stats}
            userReview={userReview}
            isLoading={reviewsLoading}
            hasMore={hasMore}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onLoadMore={loadMore}
            onSubmitReview={submitReview}
            onUpdateReview={updateReview}
            onDeleteReview={deleteReview}
            onVoteHelpful={voteHelpful}
            isLoggedIn={!!user}
          />
        </div>
      )}
    </main>
  );
}
