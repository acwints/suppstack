'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Product } from '@/types';
import { getProductImageSrc } from '@/lib/catalog/product-image';

const STORAGE_KEY = 'suppstack_saved_products';
const MAX_SAVED = 200;

/**
 * Snapshot of a product at save time. Kept local-first (works logged out);
 * entries link back to /product/[id] for live data.
 */
export interface SavedProduct {
  product_id: string;
  product_name: string;
  brand_name: string;
  product_price: number;
  image_src: string | null;
  saved_at: string;
}

interface SavedProductsContextValue {
  savedProducts: SavedProduct[];
  isSaved: (productId: string) => boolean;
  toggleSaved: (product: Product) => boolean;
  removeSaved: (productId: string) => void;
}

const SavedProductsContext = createContext<SavedProductsContextValue | null>(null);

function readStorage(): SavedProduct[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Error reading saved products:', error);
    return [];
  }
}

function writeStorage(items: SavedProduct[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Error persisting saved products:', error);
  }
}

export function SavedProductsProvider({ children }: { children: ReactNode }) {
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);

  useEffect(() => {
    setSavedProducts(readStorage());
  }, []);

  const isSaved = useCallback(
    (productId: string) => savedProducts.some((item) => item.product_id === productId),
    [savedProducts]
  );

  /** Returns true when the product ends up saved, false when unsaved. */
  const toggleSaved = useCallback((product: Product): boolean => {
    const productId = String(product.product_id);
    let nowSaved = false;
    setSavedProducts((prev) => {
      const existing = prev.some((item) => item.product_id === productId);
      const next = existing
        ? prev.filter((item) => item.product_id !== productId)
        : [
            {
              product_id: productId,
              product_name: product.product_name,
              brand_name: product.brands?.brand_name || '',
              product_price: product.product_price,
              image_src: getProductImageSrc(product.product_image),
              saved_at: new Date().toISOString(),
            },
            ...prev,
          ].slice(0, MAX_SAVED);
      nowSaved = !existing;
      writeStorage(next);
      return next;
    });
    return nowSaved;
  }, []);

  const removeSaved = useCallback((productId: string) => {
    setSavedProducts((prev) => {
      const next = prev.filter((item) => item.product_id !== productId);
      writeStorage(next);
      return next;
    });
  }, []);

  return (
    <SavedProductsContext.Provider value={{ savedProducts, isSaved, toggleSaved, removeSaved }}>
      {children}
    </SavedProductsContext.Provider>
  );
}

export function useSavedProducts(): SavedProductsContextValue {
  const context = useContext(SavedProductsContext);
  if (!context) {
    throw new Error('useSavedProducts must be used within a SavedProductsProvider');
  }
  return context;
}
