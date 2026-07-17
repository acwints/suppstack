'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useStackIngredients, type UseStackIngredientsResult } from '@/hooks/useStackIngredients';
import { EMPTY_STACK_INTAKE } from '@/lib/ingredients';

/**
 * Shares a SINGLE `useStackIngredients` fetch across the app so
 * `ProductActions` (rendered inside every product tile/card) reads the stack's
 * ingredient ids from context instead of firing one stack+composition fetch
 * per card. `/stack` consumes the same context so the rollup and the toast
 * share one fetch.
 */

/** Safe default when the provider is absent — never blocks the add-to-stack flow. */
const DEFAULT_VALUE: UseStackIngredientsResult = {
  intake: EMPTY_STACK_INTAKE,
  ingredientNames: new Set<string>(),
  stackProductUrls: new Set<string>(),
  isLoading: false,
  error: null,
  refetch: async () => {},
};

const StackIngredientsContext = createContext<UseStackIngredientsResult | null>(null);

export function StackIngredientsProvider({ children }: { children: ReactNode }) {
  const value = useStackIngredients();
  return (
    <StackIngredientsContext.Provider value={value}>{children}</StackIngredientsContext.Provider>
  );
}

/**
 * Read the shared stack-intake state. Tolerates being called outside a
 * provider (e.g. product grids) by returning a safe default instead of
 * throwing, so `ProductActions` degrades gracefully.
 */
export function useStackIngredientsContext(): UseStackIngredientsResult {
  return useContext(StackIngredientsContext) ?? DEFAULT_VALUE;
}
