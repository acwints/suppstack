'use client';

import { useMemo } from 'react';
import type { Supplement } from '@/types';
import { SUPPLEMENT_CATEGORIES } from '@/types';
import { supplementCatalog } from '@/lib/catalog/supplement-catalog';

export interface UseSupplementsOptions {
  searchTerm?: string;
  categoryId?: string;
  sortBy?: 'name' | 'popular';
  enabled?: boolean;
}

export interface UseSupplementsResult {
  supplements: Supplement[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  categories: CategoryWithCount[];
  filteredSupplements: Supplement[];
}

interface CategoryWithCount {
  id: string;
  name: string;
  icon: string;
  count: number;
}

/**
 * The storefront browses the verified static catalog only. Every entry has a
 * real merchant product image, a real price derived from curated products,
 * and a working checkout path. Legacy database supplements (old seed data
 * with stock photography and no purchasable products) are intentionally not
 * surfaced here — they remain reachable for existing stacks and tracking.
 */
export function useSupplements({
  searchTerm = '',
  categoryId = 'all',
  sortBy = 'name',
}: UseSupplementsOptions = {}): UseSupplementsResult {
  const supplements = supplementCatalog;

  // Calculate categories with counts
  const categories = useMemo((): CategoryWithCount[] => {
    return SUPPLEMENT_CATEGORIES.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      count: cat.id === 'all'
        ? supplements.length
        : supplements.filter(s => {
            const name = s.supplement_name.toLowerCase();
            const category = s.category?.toLowerCase() ?? '';

            return (
              category === cat.name.toLowerCase() ||
              cat.keywords.some(k => name.includes(k) || category.includes(k))
            );
          }).length,
    }));
  }, [supplements]);

  // Filter and sort supplements
  const filteredSupplements = useMemo(() => {
    let result = [...supplements];

    // Apply search filter (name, aliases, and description)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s =>
        s.supplement_name.toLowerCase().includes(term) ||
        (s.aliases ?? []).some(alias => alias.toLowerCase().includes(term)) ||
        s.supplement_description.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (categoryId && categoryId !== 'all') {
      const categoryDef = SUPPLEMENT_CATEGORIES.find(c => c.id === categoryId);

      if (categoryDef && categoryDef.keywords.length > 0) {
        result = result.filter(s => {
          const name = s.supplement_name.toLowerCase();
          const category = s.category?.toLowerCase() ?? '';

          return (
            category === categoryDef.name.toLowerCase() ||
            categoryDef.keywords.some(k => name.includes(k) || category.includes(k))
          );
        });
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        result = result.sort((a, b) => (b.product_count ?? 0) - (a.product_count ?? 0));
        break;
      case 'name':
      default:
        result = result.sort((a, b) => a.supplement_name.localeCompare(b.supplement_name));
    }

    return result;
  }, [supplements, searchTerm, categoryId, sortBy]);

  return {
    supplements,
    isLoading: false,
    error: null,
    refetch: async () => {},
    categories,
    filteredSupplements,
  };
}

export default useSupplements;
