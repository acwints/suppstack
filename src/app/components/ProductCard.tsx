'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaPlus, FaCheck, FaShoppingCart, FaHeart, FaShareAlt } from 'react-icons/fa';
import type { Product } from '@/types';
import { useAuth } from '../context/AuthContext';
import { useProductInStack, usePriceCalculations } from '@/hooks';
import { formatPrice, generateFakeRating, generateFakeReviewCount } from '@/lib/utils';
import { Button, Badge } from '@/components/ui';
import { Rating } from '@/components/composite/Rating';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();

  // Use custom hook for stack management
  const { isInStack, isUpdating, addToStack } = useProductInStack(product.product_id);

  // Use custom hook for price calculations
  const { costPerServing, monthlyCost } = usePriceCalculations(
    product.product_price,
    product.servings_per_container,
    product.servings_per_day
  );

  // Generate rating (will be replaced with real ratings from product_rating_stats)
  const rating = generateFakeRating(product.product_name);
  const reviewCount = generateFakeReviewCount(rating);

  const handleAddToStack = async () => {
    if (!user) {
      alert('Please log in to add products to your stack');
      return;
    }

    try {
      await addToStack();
    } catch (error) {
      alert('Failed to add product to stack. Please try again.');
    }
  };

  return (
    <div
      className="card group hover:scale-105 transition-all duration-300 animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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

        {/* Badges */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary">Best Seller</Badge>
        </div>

        {/* Quick Actions */}
        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-medium hover:bg-neutral-50 transition-colors duration-200">
            <FaHeart className="w-3 h-3 text-neutral-600" />
          </button>
          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-medium hover:bg-neutral-50 transition-colors duration-200">
            <FaShareAlt className="w-3 h-3 text-neutral-600" />
          </button>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 left-3 bg-primary-600 text-white px-3 py-1.5 rounded-xl font-bold shadow-medium">
          ${formatPrice(product.product_price)}
        </div>
      </div>

      {/* Product Details */}
      <div className="card-body">
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
            {rating.toFixed(1)} ({reviewCount.toLocaleString()})
          </span>
        </div>

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
