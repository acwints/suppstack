'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaCheck, FaShoppingCart } from 'react-icons/fa';
import { FiExternalLink, FiShield } from 'react-icons/fi';
import type { Product, ProductRatingStats } from '@/types';
import { useAuth } from '../context/AuthContext';
import { useProductInStack, usePriceCalculations } from '@/hooks';
import { formatPrice } from '@/lib/utils';
import { Button, Badge, useToast } from '@/components/ui';
import { Rating } from '@/components/composite/Rating';
import { supabase } from '../supabase';
import {
  canPurchase,
  getInventoryLabel,
  getPreferredPurchaseUrl,
  getPurchaseLabel,
} from '@/lib/commerce/shopify-ucp';

interface ProductCardProps {
  product: Product;
  ratingStats?: ProductRatingStats | null;
}

export default function ProductCard({ product, ratingStats: initialStats }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [ratingStats, setRatingStats] = useState<ProductRatingStats | null>(initialStats || null);
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const productId = String(product.product_id);

  // Use custom hook for stack management
  const { isInStack, isUpdating, addToStack } = useProductInStack(productId);

  // Use custom hook for price calculations
  const { costPerServing, monthlyCost } = usePriceCalculations(
    product.product_price,
    product.servings_per_container,
    product.servings_per_day
  );

  // Fetch real ratings from database if not provided
  useEffect(() => {
    if (initialStats !== undefined || productId.startsWith('catalog-')) return;

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
  const isCatalogProduct = product.data_source === 'catalog_fallback' || productId.startsWith('catalog-');
  const purchaseUrl = getPreferredPurchaseUrl(product);
  const purchaseLabel = getPurchaseLabel(product);
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

  return (
    <div
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-100 bg-white transition-colors duration-150 hover:border-gray-300 animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Clickable Product Link - wraps image and basic info */}
      <Link href={`/product/${productId}`} className="block">
        {/* Product Image */}
        <div className="relative h-64 overflow-hidden border-b border-gray-100 bg-gray-50">
          {product.product_image ? (
            <Image
              src={product.product_image}
              alt={product.product_name}
              fill
              className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-white">
                <span className="text-2xl font-semibold text-gray-900">
                  {product.product_name.charAt(0)}
                </span>
              </div>
            </div>
          )}

          <div className="absolute left-3 top-3">
            <Badge variant={product.ucp_enabled ? 'success' : 'primary'}>
              {product.ucp_enabled ? 'Shopify' : inventoryLabel}
            </Badge>
          </div>

          <div className="absolute bottom-3 left-3 rounded bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white">
            ${formatPrice(product.product_price)}
          </div>
        </div>

        {/* Product Info (clickable) */}
        <div className="p-5 pb-0">
          <div className="mb-2 text-sm font-medium text-gray-500">
            {product.brands?.brand_name || 'Premium Brand'}
          </div>

          <h3 className="mb-3 font-serif text-xl text-gray-900 line-clamp-2">
            {product.product_name}
          </h3>

          <div className="flex items-center gap-2 mb-4">
            <Rating value={rating} size="md" />
            <span className="text-sm font-medium text-gray-600">
              {rating > 0 ? `${Number(rating).toFixed(1)} (${reviewCount.toLocaleString()})` : 'No reviews yet'}
            </span>
          </div>
        </div>
      </Link>

      {/* Non-clickable actions section */}
      <div className="flex flex-1 flex-col px-5 pb-5">
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="rounded border border-gray-100 bg-gray-50 p-3 text-center">
            <div className="font-semibold text-gray-900">${formatPrice(costPerServing)}</div>
            <div className="text-gray-500">per serving</div>
          </div>
          <div className="rounded border border-gray-100 bg-gray-50 p-3 text-center">
            <div className="font-semibold text-gray-900">${formatPrice(monthlyCost)}</div>
            <div className="text-gray-500">per month</div>
          </div>
        </div>

        <div className="mb-3 text-xs font-medium text-gray-500">
          {product.servings_per_container} servings • {product.servings_per_day} per day recommended
        </div>

        {product.quality_badges && product.quality_badges.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {product.quality_badges.slice(0, 2).map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1 rounded border border-gray-100 px-2 py-1 text-xs text-gray-600">
                <FiShield className="h-3 w-3" />
                {badge}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto space-y-3">
          <a href={purchaseUrl} target="_blank" rel="noopener noreferrer">
            <Button
              variant="primary"
              fullWidth
              disabled={!canPurchase(product)}
              rightIcon={<FiExternalLink />}
            >
              {purchaseLabel}
            </Button>
          </a>

          {!isCatalogProduct && (
            <Button
              onClick={handleAddToStack}
              disabled={isInStack || isUpdating}
              variant={isInStack ? 'outline' : 'ghost'}
              fullWidth
              leftIcon={isInStack ? <FaCheck className="w-4 h-4" /> : <FaShoppingCart className="w-4 h-4" />}
              isLoading={isUpdating}
              className={isInStack ? 'bg-success-50 text-success-700 border-success-200 hover:bg-success-100' : ''}
            >
              {isInStack ? 'Added to Stack' : 'Add to My Stack'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
