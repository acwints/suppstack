'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaCheck, FaShoppingCart } from 'react-icons/fa';
import { FiBookmark } from 'react-icons/fi';
import type { Product, ProductRatingStats } from '@/types';
import { useAuth } from '../context/AuthContext';
import { useSavedProducts } from '../context/SavedProductsContext';
import { useProductInStack, usePriceCalculations } from '@/hooks';
import { useCommerceCheckout } from '@/hooks';
import { formatPrice } from '@/lib/utils';
import { Button, Badge, useToast } from '@/components/ui';
import { Rating } from '@/components/composite/Rating';
import { EmbeddedCheckout } from '@/components/composite/Commerce';
import { BrandLogo } from '@/components/composite/Brand';
import { supabase } from '../supabase';
import type { ProductSignalMatch } from '@/lib/catalog/product-match';
import {
  canPurchase,
  getInventoryLabel,
  getPurchaseDestination,
  getPurchaseLabel,
} from '@/lib/commerce/shopify-ucp';
import { hasShopifyVariant } from '@/lib/commerce/product-source';
import { cn } from '@/lib/design-system/utils';
import {
  getProductImageSrc,
  isRemoteImageSrc,
  PRODUCT_IMAGE_FALLBACK,
} from '@/lib/catalog/product-image';

interface ProductCardProps {
  product: Product;
  ratingStats?: ProductRatingStats | null;
  signalMatch?: ProductSignalMatch | null;
}

export default function ProductCard({
  product,
  ratingStats: initialStats,
  signalMatch,
}: ProductCardProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [ratingStats, setRatingStats] = useState<ProductRatingStats | null>(initialStats || null);
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const productId = String(product.product_id);
  const [imageSrc, setImageSrc] = useState<string | null>(() =>
    getProductImageSrc(product.product_image)
  );

  // Use custom hook for stack management
  const { isInStack, isUpdating, addToStack } = useProductInStack(product);
  const { isStartingCheckout, startCheckout } = useCommerceCheckout();
  const { isSaved, toggleSaved } = useSavedProducts();
  const saved = isSaved(productId);

  // Use custom hook for price calculations
  const { costPerServing } = usePriceCalculations(
    product.product_price,
    product.servings_per_container,
    product.servings_per_day
  );

  // Fetch real ratings from database if not provided
  useEffect(() => {
    if (initialStats !== undefined || productId.startsWith('catalog-') || productId.startsWith('real-')) return;

    async function fetchRatings() {
      const { data } = await supabase
        .from('product_rating_stats')
        .select('*')
        .eq('product_id', productId)
        .limit(1);

      if (data?.[0]) setRatingStats(data[0]);
    }
    fetchRatings();
  }, [productId, initialStats]);

  useEffect(() => {
    setImageSrc(getProductImageSrc(product.product_image));
  }, [product.product_image]);

  const rating = ratingStats?.average_rating || 0;
  const reviewCount = ratingStats?.total_reviews || 0;
  const purchaseLabel = getPurchaseLabel(product);
  const purchaseDestination = getPurchaseDestination(product);
  const inventoryLabel = getInventoryLabel(product);

  const handleAddToStack = async () => {
    if (!user) {
      toast.info('Please log in to add products to your stack');
      router.push('/login');
      return;
    }

    try {
      await addToStack();
      toast.success('Added to stack!');
    } catch (error) {
      toast.error('Failed to add product to stack. Please try again.');
    }
  };

  const handleStartCheckout = async () => {
    if (hasShopifyVariant(product)) {
      setIsCheckoutOpen(true);
      return;
    }

    try {
      await startCheckout(product);
    } catch (error) {
      toast.error('Unable to open purchase link. Please try again.');
    }
  };

  return (
    <div className="group flex h-full min-w-0 flex-col overflow-hidden rounded border border-gray-200 bg-white transition-all duration-150 hover:border-gray-300 hover:shadow-md">
      {/* Clickable Product Link - wraps image and basic info */}
      <Link href={`/product/${productId}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-white sm:aspect-square">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.product_name}
              fill
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.04] sm:p-5"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              unoptimized={isRemoteImageSrc(imageSrc)}
              onError={() => setImageSrc(PRODUCT_IMAGE_FALLBACK)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-3xl font-semibold text-gray-300">
                {product.product_name.charAt(0)}
              </span>
            </div>
          )}

          <div className="absolute left-2 top-2">
            <Badge variant={purchaseDestination.isDirectCheckout ? 'success' : 'primary'}>
              {purchaseDestination.isDirectCheckout ? 'Instant checkout' : inventoryLabel}
            </Badge>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleSaved(product);
            }}
            aria-label={saved ? `Remove ${product.product_name} from saved` : `Save ${product.product_name}`}
            aria-pressed={saved}
            className={cn(
              'absolute right-1 top-1 flex min-h-11 min-w-11 items-center justify-center rounded',
              'transition-colors duration-150 active:bg-gray-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900',
              saved ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'
            )}
          >
            <FiBookmark size={20} className={saved ? 'fill-current' : ''} aria-hidden="true" />
          </button>
        </div>

        {/* Product Info (clickable) */}
        <div className="border-t border-gray-100 p-4 pb-0 sm:p-3 sm:pb-0">
          <span className="flex items-center gap-1.5">
            <BrandLogo
              domain={product.shopify_store_domain}
              brandName={product.brands?.brand_name || 'Brand'}
              size="sm"
            />
            <span className="truncate text-xs text-gray-500">
              {product.brands?.brand_name || product.shopify_store_domain || ''}
            </span>
          </span>
          <h3 className="mt-1 text-base font-medium leading-6 tracking-normal text-gray-900 line-clamp-2 group-hover:underline sm:text-sm sm:leading-5">
            {product.product_name}
          </h3>

          {reviewCount > 0 && (
            <div className="mt-1 flex items-center gap-1.5">
              <Rating value={rating} size="sm" />
              <span className="text-xs text-gray-500">({reviewCount.toLocaleString()})</span>
            </div>
          )}

          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-gray-900">
              ${formatPrice(product.product_price)}
            </span>
            {costPerServing > 0 && (
              <span className="text-xs text-gray-500">
                ${formatPrice(costPerServing)}/serving
              </span>
            )}
          </div>

          {signalMatch && signalMatch.score > 0 && (
            <div className="mt-3 border-t border-gray-100 pt-2">
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm">
                  {signalMatch.score}
                </Badge>
                <span className="text-xs font-medium text-gray-700">Signal match</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                {signalMatch.reasons.join(' · ')}
              </p>
            </div>
          )}
        </div>
      </Link>

      {/* Non-clickable actions section */}
      <div className="mt-auto flex flex-col gap-2 p-4 sm:p-3">
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={handleStartCheckout}
          disabled={!canPurchase(product)}
          isLoading={isStartingCheckout}
          className="h-11 text-sm sm:h-8 sm:text-xs"
        >
          {purchaseLabel}
        </Button>

        <Button
          onClick={handleAddToStack}
          disabled={isInStack || isUpdating}
          variant={isInStack ? 'outline' : 'ghost'}
          size="sm"
          fullWidth
          leftIcon={isInStack ? <FaCheck className="w-3.5 h-3.5" /> : <FaShoppingCart className="w-3.5 h-3.5" />}
          isLoading={isUpdating}
          className={cn(
            'h-11 text-sm sm:h-8 sm:text-xs',
            isInStack ? 'bg-success-50 text-success-700 border-success-200 hover:bg-success-100' : ''
          )}
        >
          {isInStack ? 'In Stack' : 'Add to Stack'}
        </Button>
      </div>

      <EmbeddedCheckout
        product={product}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}
