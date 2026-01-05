'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/app/supabase';
import type { Supplement, SupplementCategory, SUPPLEMENT_CATEGORIES } from '@/types';

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
    const categoryDefs: SupplementCategory[] = [
      { id: 'all', name: 'All Supplements', icon: '🌟', keywords: [] },
      { id: 'vitamins', name: 'Vitamins', icon: '💊', keywords: ['vitamin'] },
      { id: 'minerals', name: 'Minerals', icon: '⚡', keywords: ['magnesium', 'zinc', 'calcium', 'iron', 'potassium'] },
      { id: 'protein', name: 'Protein', icon: '💪', keywords: ['protein', 'whey', 'casein', 'collagen'] },
      { id: 'herbs', name: 'Herbs', icon: '🌿', keywords: ['ashwagandha', 'turmeric', 'ginseng', 'rhodiola'] },
      { id: 'omega', name: 'Omega & Fish Oil', icon: '🐟', keywords: ['omega', 'fish oil', 'krill'] },
      { id: 'probiotics', name: 'Probiotics', icon: '🦠', keywords: ['probiotic', 'prebiotic', 'gut'] },
      { id: 'performance', name: 'Performance', icon: '🏃', keywords: ['creatine', 'pre-workout', 'bcaa', 'beta-alanine'] },
    ];

    return categoryDefs.map(cat => ({
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
      const category = categories.find(c => c.id === categoryId);
      const categoryDef = [
        { id: 'vitamins', keywords: ['vitamin'] },
        { id: 'minerals', keywords: ['magnesium', 'zinc', 'calcium', 'iron', 'potassium'] },
        { id: 'protein', keywords: ['protein', 'whey', 'casein', 'collagen'] },
        { id: 'herbs', keywords: ['ashwagandha', 'turmeric', 'ginseng', 'rhodiola'] },
        { id: 'omega', keywords: ['omega', 'fish oil', 'krill'] },
        { id: 'probiotics', keywords: ['probiotic', 'prebiotic', 'gut'] },
        { id: 'performance', keywords: ['creatine', 'pre-workout', 'bcaa', 'beta-alanine'] },
      ].find(c => c.id === categoryId);

      if (categoryDef) {
        result = result.filter(s =>
          categoryDef.keywords.some(k => s.supplement_name.toLowerCase().includes(k))
        );
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        // Shuffle for "popular" - in real app would be based on usage count
        result = result.sort(() => Math.random() - 0.5);
        break;
      case 'name':
      default:
        result = result.sort((a, b) => a.supplement_name.localeCompare(b.supplement_name));
    }

    return result;
  }, [supplements, searchTerm, categoryId, sortBy, categories]);

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
