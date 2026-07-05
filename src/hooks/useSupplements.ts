'use client';

import { useMemo } from 'react';
import type { Supplement } from '@/types';
import { SUPPLEMENT_CATEGORIES } from '@/types';
import { supplementCatalog } from '@/lib/catalog/supplement-catalog';
import {
  groupSupplementsForBrowse,
  type SupplementBrowseGroup,
} from '@/lib/catalog/supplement-families';

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
  /**
   * Browse tiles: ingredient families collapsed into single entries
   * (one Creatine tile spanning Monohydrate and HCl), everything else 1:1.
   */
  browseGroups: SupplementBrowseGroup[];
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

  // Calculate categories with counts. Counts reflect browse tiles, so an
  // ingredient family (e.g. Creatine) counts once even with multiple forms.
  const categories = useMemo((): CategoryWithCount[] => {
    return SUPPLEMENT_CATEGORIES.map(cat => {
      const matching = cat.id === 'all'
        ? supplements
        : supplements.filter(s => {
            const name = s.supplement_name.toLowerCase();
            const category = s.category?.toLowerCase() ?? '';

            return (
              category === cat.name.toLowerCase() ||
              cat.keywords.some(k => name.includes(k) || category.includes(k))
            );
          });

      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        count: groupSupplementsForBrowse(matching).length,
      };
    });
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

  // Collapse ingredient families into single tiles, then re-sort so family
  // tiles order by their own name/aggregate rather than a member's.
  const browseGroups = useMemo(() => {
    const groups = groupSupplementsForBrowse(filteredSupplements);

    switch (sortBy) {
      case 'popular':
        return groups.sort((a, b) => (b.productCount ?? 0) - (a.productCount ?? 0));
      case 'name':
      default:
        return groups.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [filteredSupplements, sortBy]);

  return {
    supplements,
    isLoading: false,
    error: null,
    refetch: async () => {},
    categories,
    filteredSupplements,
    browseGroups,
  };
}

export default useSupplements;
