'use client';

import type { Product, ProductRatingStats } from '@/types';
import { ProductTile } from '@/components/composite/Product';

interface ProductCardProps {
  product: Product;
  ratingStats?: ProductRatingStats | null;
}

export default function ProductCard({ product, ratingStats }: ProductCardProps) {
  return <ProductTile product={product} ratingStats={ratingStats} />;
}
