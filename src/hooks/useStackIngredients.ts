'use client';

import {
  useStackIngredientsContext,
  type StackIngredientsContextValue,
} from '@/app/context/StackIngredientsContext';

export type UseStackIngredientsResult = StackIngredientsContextValue;

/**
 * The current user's active stack rolled up to the ingredient level, plus the
 * "already in my stack" product-url set. Backed by StackIngredientsProvider so
 * every product card shares one fetch.
 */
export function useStackIngredients(): UseStackIngredientsResult {
  return useStackIngredientsContext();
}
