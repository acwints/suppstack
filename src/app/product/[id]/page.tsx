'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useReviews } from '@/hooks/useReviews';
import { recordProductView } from '@/hooks/useRecentlyViewed';
import { useProduct } from '@/hooks';
import {
  Spinner,
  Badge,
  Card,
  EmptyState,
  Stack,
  Inline,
  Grid,
} from '@/components/ui';
import { Rating } from '@/components/composite/Rating';
import { ReviewList } from '@/components/composite/Review/ReviewList';
import { BrandLogo } from '@/components/composite/Brand';
import type { ReviewSortBy } from '@/hooks/useReviews';
import { resolveDatabaseProductId } from '@/lib/catalog/supplement-sync';
import {
  getProductImageSrc,
  isRemoteImageSrc,
  PRODUCT_IMAGE_FALLBACK,
} from '@/lib/catalog/product-image';
import { ProductActions, ProductPriceLine, ProductSourceBadge } from '@/components/composite/Product';

export default function ProductPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const { product, isLoading } = useProduct(params.id);
  const [productImageSrc, setProductImageSrc] = useState(PRODUCT_IMAGE_FALLBACK);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-8">
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

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 py-8">
      {/* Back Navigation */}
      <Link
        href={
          product.supplements?.supplement_id
            ? `/supplement/${product.supplements.supplement_id}`
            : '/'
        }
        className="mb-6 hidden items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 md:inline-flex"
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
            <ProductSourceBadge product={product} />
          </span>

          {/* Product Name */}
          <h1 className="text-3xl font-serif text-gray-900">{product.product_name}</h1>

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

          <ProductPriceLine product={product} size="detail" />

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

          <div className="flex flex-wrap gap-2">
            {product.subscriptions_available && <Badge variant="secondary">Subscription available</Badge>}
            {product.quality_badges?.slice(0, 3).map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1 rounded border border-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                <FiShield className="h-3 w-3" />
                {badge}
              </span>
            ))}
          </div>

          {/* Actions */}
          <ProductActions product={product} variant="detail" />

          {/* Supplement Category */}
          {product.supplements?.supplement_name && (
            <div className="pt-6 border-t border-gray-200">
              <Badge variant="secondary">{product.supplements.supplement_name}</Badge>
            </div>
          )}
        </Stack>
      </Grid>

      {/* Sticky purchase bar (mobile) — the tab bar yields to this on /product routes */}
      <div className="app-bottom-bar fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="min-w-0 shrink-0">
            <ProductPriceLine product={product} />
          </div>
          <ProductActions product={product} variant="sticky" />
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
