'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaShoppingCart, FaCheck, FaExternalLinkAlt } from 'react-icons/fa';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { useReviews } from '@/hooks/useReviews';
import { useProductInStack, usePriceCalculations } from '@/hooks';
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
import type { ReviewSortBy } from '@/hooks/useReviews';

export default function ProductPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<ReviewSortBy>('newest');

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
    productId: params.id,
    sortBy,
    enabled: !!params.id,
  });

  // Stack management
  const { isInStack, isUpdating, addToStack } = useProductInStack(params.id);

  // Price calculations
  const { costPerServing, monthlyCost } = usePriceCalculations(
    product?.product_price || 0,
    product?.servings_per_container || 1,
    product?.servings_per_day || 1
  );

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
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
            <Link href="/">
              <Button variant="primary">Back to Home</Button>
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
        Back to {product.supplements?.supplement_name || 'supplements'}
      </Link>

      {/* Product Header */}
      <Grid cols={{ sm: 1, lg: 2 }} gap={12} className="mb-12">
        {/* Product Image */}
        <Card padding="lg" className="aspect-square relative bg-gradient-to-br from-gray-50 to-gray-100">
          {product.product_image ? (
            <Image
              src={product.product_image}
              alt={product.product_name}
              fill
              className="object-contain p-8"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-orange-600">
                  {product.product_name.charAt(0)}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Product Info */}
        <Stack gap={6}>
          {/* Brand */}
          <span className="text-orange-600 font-semibold">
            {product.brands?.brand_name || 'Premium Brand'}
          </span>

          {/* Product Name */}
          <h1 className="text-3xl font-bold text-gray-900">{product.product_name}</h1>

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
          <div className="text-4xl font-bold text-gray-900">
            ${formatPrice(product.product_price)}
          </div>

          {/* Stats Grid */}
          <Grid cols={{ sm: 3 }} gap={4}>
            <Card padding="md" className="text-center bg-gray-50">
              <div className="text-xl font-bold text-gray-900">
                ${formatPrice(costPerServing)}
              </div>
              <div className="text-sm text-gray-600">per serving</div>
            </Card>
            <Card padding="md" className="text-center bg-gray-50">
              <div className="text-xl font-bold text-gray-900">
                ${formatPrice(monthlyCost)}
              </div>
              <div className="text-sm text-gray-600">per month</div>
            </Card>
            <Card padding="md" className="text-center bg-gray-50">
              <div className="text-xl font-bold text-gray-900">
                {product.servings_per_container}
              </div>
              <div className="text-sm text-gray-600">servings</div>
            </Card>
          </Grid>

          {/* Description */}
          {product.product_description && (
            <p className="text-gray-600">{product.product_description}</p>
          )}

          {/* Serving Info */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
            <div className="text-sm font-medium text-orange-800">
              Recommended: {product.servings_per_day} serving
              {product.servings_per_day !== 1 ? 's' : ''} per day
            </div>
          </div>

          {/* Actions */}
          <Stack gap={3}>
            <Button
              onClick={handleAddToStack}
              disabled={isInStack || isUpdating}
              variant={isInStack ? 'outline' : 'primary'}
              fullWidth
              size="lg"
              leftIcon={isInStack ? <FaCheck /> : <FaShoppingCart />}
              isLoading={isUpdating}
              className={isInStack ? 'bg-green-50 text-green-700 border-green-200' : ''}
            >
              {isInStack ? 'Added to My Stack' : 'Add to My Stack'}
            </Button>

            <Inline gap={3}>
              {product.product_url && (
                <a
                  href={product.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    fullWidth
                    rightIcon={<FaExternalLinkAlt className="w-3 h-3" />}
                  >
                    Official Store
                  </Button>
                </a>
              )}
              {product.amazon_url && (
                <a
                  href={product.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="secondary"
                    fullWidth
                    rightIcon={<FaExternalLinkAlt className="w-3 h-3" />}
                    className="bg-amber-400 hover:bg-amber-500 text-black"
                  >
                    Buy on Amazon
                  </Button>
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

      {/* Reviews Section */}
      <div className="border-t border-gray-200 pt-12">
        <ReviewList
          productId={params.id}
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
    </main>
  );
}
