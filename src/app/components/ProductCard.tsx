'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaPlus, FaCheck, FaShoppingCart, FaHeart, FaShareAlt } from 'react-icons/fa';
import type { Product, ProductRatingStats } from '@/types';
import { useAuth } from '../context/AuthContext';
import { useProductInStack, usePriceCalculations } from '@/hooks';
import { formatPrice } from '@/lib/utils';
import { Button, Badge, useToast } from '@/components/ui';
import { Rating } from '@/components/composite/Rating';
import { supabase } from '../supabase';

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

  // Use custom hook for stack management
  const { isInStack, isUpdating, addToStack } = useProductInStack(product.product_id);

  // Use custom hook for price calculations
  const { costPerServing, monthlyCost } = usePriceCalculations(
    product.product_price,
    product.servings_per_container,
    product.servings_per_day
  );

  // Fetch real ratings from database if not provided
  useEffect(() => {
    if (initialStats !== undefined) return;

    async function fetchRatings() {
      const { data } = await supabase
        .from('product_rating_stats')
        .select('*')
        .eq('product_id', product.product_id)
        .single();

      if (data) setRatingStats(data);
    }
    fetchRatings();
  }, [product.product_id, initialStats]);

  const rating = ratingStats?.average_rating || 0;
  const reviewCount = ratingStats?.total_reviews || 0;

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
      className="card group hover:scale-105 transition-all duration-300 animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Clickable Product Link - wraps image and basic info */}
      <Link href={`/product/${product.product_id}`} className="block">
        {/* Product Image */}
        <div className="relative h-64 bg-gradient-to-br from-neutral-50 to-neutral-100 overflow-hidden rounded-t-xl">
          {product.product_image ? (
            <Image
              src={product.product_image}
              alt={product.product_name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center shadow-medium">
                <span className="text-2xl font-bold text-primary-600">
                  {product.product_name.charAt(0)}
                </span>
              </div>
            </div>
          )}

          {/* Price Tag */}
          <div className="absolute bottom-3 left-3 bg-primary-600 text-white px-3 py-1.5 rounded-xl font-bold shadow-medium">
            ${formatPrice(product.product_price)}
          </div>
        </div>

        {/* Product Info (clickable) */}
        <div className="p-4 pb-0">
          {/* Brand */}
          <div className="text-sm text-primary-600 font-semibold mb-2">
            {product.brands?.brand_name || 'Premium Brand'}
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-lg mb-3 text-neutral-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.product_name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <Rating value={rating} size="md" />
            <span className="text-sm text-neutral-600 font-medium">
              {rating > 0 ? `${Number(rating).toFixed(1)} (${reviewCount.toLocaleString()})` : 'No reviews yet'}
            </span>
          </div>
        </div>
      </Link>

      {/* Non-clickable actions section */}
      <div className="px-4 pb-4">
        {/* Product Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="bg-neutral-50 rounded-xl p-3 text-center border border-neutral-100">
            <div className="font-bold text-neutral-900">${formatPrice(costPerServing)}</div>
            <div className="text-neutral-600">per serving</div>
          </div>
          <div className="bg-neutral-50 rounded-xl p-3 text-center border border-neutral-100">
            <div className="font-bold text-neutral-900">${formatPrice(monthlyCost)}</div>
            <div className="text-neutral-600">per month</div>
          </div>
        </div>

        {/* Serving Info */}
        <div className="text-xs text-neutral-500 mb-4 font-medium">
          {product.servings_per_container} servings • {product.servings_per_day} per day recommended
        </div>

        {/* Add to Stack Button */}
        <Button
          onClick={handleAddToStack}
          disabled={isInStack || isUpdating}
          variant={isInStack ? 'outline' : 'primary'}
          fullWidth
          leftIcon={isInStack ? <FaCheck className="w-4 h-4" /> : <FaShoppingCart className="w-4 h-4" />}
          isLoading={isUpdating}
          className={isInStack ? 'bg-success-50 text-success-700 border-success-200 hover:bg-success-100' : ''}
        >
          {isInStack ? 'Added to Stack' : 'Add to My Stack'}
        </Button>

        {/* Purchase Links */}
        <div className="flex gap-2 mt-3">
          {product.product_url && (
            <a
              href={product.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline flex-1 py-2 px-3 text-xs text-center rounded-xl transition-colors"
            >
              Official Store
            </a>
          )}
          {product.amazon_url && (
            <a
              href={product.amazon_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 text-xs text-center bg-accent-400 hover:bg-accent-500 text-white rounded-xl transition-colors font-semibold"
            >
              Amazon
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
