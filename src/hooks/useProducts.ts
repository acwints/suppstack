'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/app/supabase';
import type { Product, ProductFilters, ProductSortBy } from '@/types';

export interface UseProductsOptions {
  supplementId?: number;
  filters?: ProductFilters;
  sortBy?: ProductSortBy;
  limit?: number;
  enabled?: boolean;
}

export interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

const PAGE_SIZE = 15;

export function useProducts({
  supplementId,
  filters = {},
  sortBy = 'name',
  limit,
  enabled = true,
}: UseProductsOptions = {}): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  const fetchProducts = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          brands(brand_name),
          supplements(supplement_name)
        `, { count: 'exact' });

      // Apply supplement filter
      if (supplementId) {
        query = query.eq('supplement_id', supplementId);
      }

      // Apply additional filters
      if (filters.brandId) {
        query = query.eq('brand_id', filters.brandId);
      }
      if (filters.minPrice !== undefined) {
        query = query.gte('product_price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte('product_price', filters.maxPrice);
      }
      if (filters.searchTerm) {
        query = query.or(`product_name.ilike.%${filters.searchTerm}%,product_description.ilike.%${filters.searchTerm}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price_asc':
          query = query.order('product_price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('product_price', { ascending: false });
          break;
        case 'rating':
          query = query.order('product_name', { ascending: true }); // Placeholder until we have real ratings
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('product_name', { ascending: true }); // Placeholder
          break;
        case 'name':
        default:
          query = query.order('product_name', { ascending: true });
      }

      // Apply pagination
      const pageSize = limit || PAGE_SIZE;
      const from = pageNum * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: queryError, count } = await query;

      if (queryError) {
        throw queryError;
      }

      if (append) {
        setProducts(prev => [...prev, ...(data || [])]);
      } else {
        setProducts(data || []);
      }
      setTotalCount(count || 0);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, supplementId, filters, sortBy, limit]);

  // Initial fetch
  useEffect(() => {
    setPage(0);
    fetchProducts(0, false);
  }, [supplementId, JSON.stringify(filters), sortBy]);

  const loadMore = useCallback(async () => {
    await fetchProducts(page + 1, true);
  }, [fetchProducts, page]);

  const hasMore = useMemo(() => {
    const pageSize = limit || PAGE_SIZE;
    return products.length < totalCount && products.length >= pageSize;
  }, [products.length, totalCount, limit]);

  return {
    products,
    isLoading,
    error,
    totalCount,
    hasMore,
    loadMore,
    refetch: () => fetchProducts(0, false),
  };
}

export default useProducts;
