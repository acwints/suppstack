'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product, ProductRatingStats } from '@/types';
import { BrandLogo } from '@/components/composite/Brand';
import { ProductActions } from './ProductActions';
import { ProductPriceLine } from './ProductPriceLine';
import { ProductSourceBadge } from './ProductSourceBadge';
import {
  getProductImageSrc,
  isRemoteImageSrc,
  PRODUCT_IMAGE_FALLBACK,
} from '@/lib/catalog/product-image';

export interface ProductTileProps {
  product: Product;
  ratingStats?: ProductRatingStats | null;
}

export function ProductTile({ product }: ProductTileProps) {
  const productId = String(product.product_id);
  const [imageSrc, setImageSrc] = useState<string | null>(() =>
    getProductImageSrc(product.product_image)
  );

  useEffect(() => {
    setImageSrc(getProductImageSrc(product.product_image));
  }, [product.product_image]);

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded border border-gray-200 bg-white transition-colors duration-150 hover:border-gray-300">
      <div className="relative aspect-square border-b border-gray-100 bg-white">
        <Link href={`/product/${productId}`} className="block h-full" aria-label={product.product_name}>
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.product_name}
              fill
              className="object-contain p-4 transition-transform duration-200 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized={isRemoteImageSrc(imageSrc)}
              onError={() => setImageSrc(PRODUCT_IMAGE_FALLBACK)}
            />
          ) : (
            <span className="flex h-full items-center justify-center text-3xl font-semibold text-gray-300">
              {product.product_name.charAt(0)}
            </span>
          )}
        </Link>
        <div className="absolute left-2 top-2 z-10 max-w-[calc(100%-3.5rem)]">
          <ProductSourceBadge product={product} compact />
        </div>
        <ProductActions product={product} variant="compact" className="absolute right-2 top-2 z-10" />
      </div>

      <Link href={`/product/${productId}`} className="flex flex-1 flex-col p-3">
        <span className="flex min-w-0 items-center gap-1.5">
          <BrandLogo
            domain={product.shopify_store_domain}
            brandName={product.brands?.brand_name || 'Brand'}
            size="sm"
          />
          <span className="truncate text-xs text-gray-500">
            {product.brands?.brand_name || product.shopify_store_domain || ''}
          </span>
        </span>
        <h3 className="mt-1 text-sm font-medium leading-5 text-gray-900 line-clamp-2 group-hover:underline">
          {product.product_name}
        </h3>
        <ProductPriceLine product={product} className="mt-auto pt-2" />
      </Link>
    </article>
  );
}

export default ProductTile;
