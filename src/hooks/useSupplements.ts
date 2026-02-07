'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/app/supabase';
import type { Supplement } from '@/types';
import { SUPPLEMENT_CATEGORIES } from '@/types';

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

export function useSupplements({
  searchTerm = '',
  categoryId = 'all',
  sortBy = 'name',
  enabled = true,
}: UseSupplementsOptions = {}): UseSupplementsResult {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSupplements = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('supplements')
        .select('*')
        .order('supplement_name');

      if (queryError) {
        throw queryError;
      }

      setSupplements(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch supplements'));
      console.error('Error fetching supplements:', err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchSupplements();
  }, [fetchSupplements]);

  // Calculate categories with counts
  const categories = useMemo((): CategoryWithCount[] => {
    return SUPPLEMENT_CATEGORIES.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      count: cat.id === 'all'
        ? supplements.length
        : supplements.filter(s =>
            cat.keywords.some(k => s.supplement_name.toLowerCase().includes(k))
          ).length,
    }));
  }, [supplements]);

  // Filter and sort supplements
  const filteredSupplements = useMemo(() => {
    let result = [...supplements];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s =>
        s.supplement_name.toLowerCase().includes(term) ||
        s.supplement_description.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (categoryId && categoryId !== 'all') {
      const categoryDef = SUPPLEMENT_CATEGORIES.find(c => c.id === categoryId);

      if (categoryDef && categoryDef.keywords.length > 0) {
        result = result.filter(s =>
          categoryDef.keywords.some(k => s.supplement_name.toLowerCase().includes(k))
        );
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        // Preserve DB insertion order as default when no popularity metrics are available
        break;
      case 'name':
      default:
        result = result.sort((a, b) => a.supplement_name.localeCompare(b.supplement_name));
    }

    return result;
  }, [supplements, searchTerm, categoryId, sortBy]);

  return {
    supplements,
    isLoading,
    error,
    refetch: fetchSupplements,
    categories,
    filteredSupplements,
  };
}

export default useSupplements;
