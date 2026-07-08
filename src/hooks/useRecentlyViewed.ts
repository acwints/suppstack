'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Product } from '@/types';
import { getProductImageSrc } from '@/lib/catalog/product-image';

const STORAGE_KEY = 'suppstack_recently_viewed';
const MAX_ITEMS = 12;

export interface RecentlyViewedProduct {
  product_id: string;
  product_name: string;
  brand_name: string;
  product_price: number;
  image_src: string | null;
  viewed_at: string;
}

function readStorage(): RecentlyViewedProduct[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Error reading recently viewed products:', error);
    return [];
  }
}

function writeStorage(items: RecentlyViewedProduct[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Error persisting recently viewed products:', error);
  }
}

/** Records a product view. Safe to call from an effect on the PDP. */
export function recordProductView(product: Product): void {
  if (typeof window === 'undefined') return;
  const productId = String(product.product_id);
  const entry: RecentlyViewedProduct = {
    product_id: productId,
    product_name: product.product_name,
    brand_name: product.brands?.brand_name || '',
    product_price: product.product_price,
    image_src: getProductImageSrc(product.product_image),
    viewed_at: new Date().toISOString(),
  };
  const rest = readStorage().filter((item) => item.product_id !== productId);
  writeStorage([entry, ...rest].slice(0, MAX_ITEMS));
}

/** Read-side hook: the list of recently viewed products, newest first. */
export function useRecentlyViewed(): {
  recentlyViewed: RecentlyViewedProduct[];
  clearRecentlyViewed: () => void;
} {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    setRecentlyViewed(readStorage());
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    writeStorage([]);
    setRecentlyViewed([]);
  }, []);

  return { recentlyViewed, clearRecentlyViewed };
}
