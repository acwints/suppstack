'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaCheck, FaShoppingCart } from 'react-icons/fa';
import type { Product, ProductRatingStats } from '@/types';
import { useAuth } from '../context/AuthContext';
import { useProductInStack, usePriceCalculations } from '@/hooks';
import { useCommerceCheckout } from '@/hooks';
import { formatPrice } from '@/lib/utils';
import { Button, Badge, useToast } from '@/components/ui';
import { Rating } from '@/components/composite/Rating';
import { EmbeddedCheckout } from '@/components/composite/Commerce';
import { BrandLogo } from '@/components/composite/Brand';
import { supabase } from '../supabase';
import {
  canPurchase,
  getInventoryLabel,
  getPurchaseDestination,
  getPurchaseLabel,
} from '@/lib/commerce/shopify-ucp';
import { hasShopifyVariant } from '@/lib/commerce/product-source';

interface ProductCardProps {
  product: Product;
  ratingStats?: ProductRatingStats | null;
}

export default function ProductCard({ product, ratingStats: initialStats }: ProductCardProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [ratingStats, setRatingStats] = useState<ProductRatingStats | null>(initialStats || null);
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const productId = String(product.product_id);

  // Use custom hook for stack management
  const { isInStack, isUpdating, addToStack } = useProductInStack(product);
  const { isStartingCheckout, startCheckout } = useCommerceCheckout();

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
        .single();

      if (data) setRatingStats(data);
    }
    fetchRatings();
  }, [productId, initialStats]);

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
    <div className="group flex h-full flex-col overflow-hidden rounded border border-gray-200 bg-white transition-all duration-150 hover:border-gray-300 hover:shadow-md">
      {/* Clickable Product Link - wraps image and basic info */}
      <Link href={`/product/${productId}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-white">
          {product.product_image ? (
            <Image
              src={product.product_image}
              alt={product.product_name}
              fill
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
        </div>

        {/* Product Info (clickable) */}
        <div className="border-t border-gray-100 p-3 pb-0">
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
          <h3 className="mt-0.5 text-sm font-medium leading-5 text-gray-900 line-clamp-2 group-hover:underline">
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
            <span className="text-xs text-gray-500">
              ${formatPrice(costPerServing)}/serving
            </span>
          </div>
        </div>
      </Link>

      {/* Non-clickable actions section */}
      <div className="mt-auto flex flex-col gap-2 p-3">
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={handleStartCheckout}
          disabled={!canPurchase(product)}
          isLoading={isStartingCheckout}
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
          className={isInStack ? 'bg-success-50 text-success-700 border-success-200 hover:bg-success-100' : ''}
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
