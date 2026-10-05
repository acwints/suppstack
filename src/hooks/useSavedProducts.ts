'use client';

import {
  useSavedProductsContext,
  type SavedProductsContextValue,
} from '@/app/context/SavedProductsContext';

export type UseSavedProductsResult = SavedProductsContextValue;

/**
 * Local-first saved products (works logged out). Backed by
 * SavedProductsProvider so every save toggle shares one list.
 */
export function useSavedProducts(): UseSavedProductsResult {
  return useSavedProductsContext();
}
