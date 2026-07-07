'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/supabase';

export interface UseSupabaseQueryOptions {
  table: string;
  select?: string;
  filters?: Array<{
    column: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';
    value: any;
  }>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  enabled?: boolean;
}

export interface UseSupabaseQueryResult<T> {
  data: T[] | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useSupabaseQuery<T = any>({
  table,
  select = '*',
  filters = [],
  orderBy,
  limit,
  enabled = true,
}: UseSupabaseQueryOptions): UseSupabaseQueryResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from(table).select(select);

      // Apply filters
      for (const filter of filters) {
        switch (filter.operator) {
          case 'eq':
            query = query.eq(filter.column, filter.value);
            break;
          case 'neq':
            query = query.neq(filter.column, filter.value);
            break;
          case 'gt':
            query = query.gt(filter.column, filter.value);
            break;
          case 'gte':
            query = query.gte(filter.column, filter.value);
            break;
          case 'lt':
            query = query.lt(filter.column, filter.value);
            break;
          case 'lte':
            query = query.lte(filter.column, filter.value);
            break;
          case 'like':
            query = query.like(filter.column, filter.value);
            break;
          case 'ilike':
            query = query.ilike(filter.column, filter.value);
            break;
          case 'in':
            query = query.in(filter.column, filter.value);
            break;
        }
      }

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      setData(result as T[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error(`Error fetching from ${table}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [table, select, JSON.stringify(filters), JSON.stringify(orderBy), limit, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    error,
    isLoading,
    refetch: fetchData,
  };
}

/**
 * Hook for fetching a single record by ID
 */
export function useSupabaseRecord<T = any>(
  table: string,
  id: string | number | undefined,
  select: string = '*'
): {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: result, error: queryError } = await supabase
        .from(table)
        .select(select)
        .eq('id', id)
        .limit(1);

      if (queryError) {
        throw queryError;
      }

      setData(((result || [])[0] as T | undefined) || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [table, id, select]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    error,
    isLoading,
    refetch: fetchData,
  };
}

export default useSupabaseQuery;
