'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import type { Product } from '@/types';
import { findDatabaseProductId, resolveDatabaseProductId } from '@/lib/catalog/supplement-sync';

export interface UseProductInStackResult {
  isInStack: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  error: Error | null;
  addToStack: () => Promise<void>;
  removeFromStack: () => Promise<void>;
  toggleInStack: () => Promise<void>;
}

const UNIQUE_VIOLATION = '23505';
const DEFAULT_SCHEDULE_DAYS = [1, 2, 3, 4, 5, 6, 7];

async function findUserProductLink(userId: string, productId: number | string) {
  const { data, error } = await supabase
    .from('users_products')
    .select('product_id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .limit(1);

  if (error) throw error;
  return data?.[0] ?? null;
}

async function insertUserProductLink(userId: string, productId: number | string) {
  const { error } = await supabase
    .from('users_products')
    .insert({ user_id: userId, product_id: productId });
  if (error && error.code !== UNIQUE_VIOLATION) throw error;
}

async function upsertDefaultProductSettings(
  userId: string,
  productId: number | string,
  product: Product
) {
  const servingsPerDay =
    product.servings_per_day && product.servings_per_day > 0 ? product.servings_per_day : 1;

  const { error } = await supabase
    .from('user_supplement_settings')
    .upsert(
      {
        user_id: userId,
        product_id: productId,
        servings_per_day: servingsPerDay,
        schedule_days: DEFAULT_SCHEDULE_DAYS,
        status: 'active',
        reminders_enabled: false,
        start_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,product_id' }
    );

  if (error) throw error;
}

async function deleteUserProductLink(userId: string, productId: number | string) {
  const { error } = await supabase
    .from('users_products')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) throw error;
}

async function deleteUserProductSettings(userId: string, productId: number | string) {
  const { error } = await supabase
    .from('user_supplement_settings')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) throw error;
}

/**
 * Tracks whether a product is in the user's stack (`users_products`).
 * Works for both database products and curated catalog products — catalog
 * products are synced into the `products` table on first add.
 */
export function useProductInStack(product: Product | null): UseProductInStackResult {
  const { user } = useAuth();
  const [isInStack, setIsInStack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Check if product is in user's stack
  const checkIfInStack = useCallback(async () => {
    if (!user || !product) {
      setIsInStack(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const databaseProductId = await findDatabaseProductId(product);
      if (databaseProductId === null) {
        setIsInStack(false);
        return;
      }

      const data = await findUserProductLink(user.id, databaseProductId);

      setIsInStack(!!data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check stack status'));
      console.error('Error checking if product is in stack:', err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, product?.product_id]);

  useEffect(() => {
    checkIfInStack();
  }, [checkIfInStack]);

  const addToStack = useCallback(async () => {
    if (!user) {
      throw new Error('Please log in to add products to your stack');
    }

    if (!product) {
      throw new Error('Product is still loading');
    }

    if (isInStack) {
      return; // Already in stack
    }

    setIsUpdating(true);
    setError(null);

    try {
      const databaseProductId = await resolveDatabaseProductId(product);
      await insertUserProductLink(user.id, databaseProductId);
      await upsertDefaultProductSettings(user.id, databaseProductId, product);

      setIsInStack(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add product to stack'));
      throw err;
    } finally {
      setIsUpdating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, product?.product_id, isInStack]);

  const removeFromStack = useCallback(async () => {
    if (!user || !product) {
      throw new Error('Please log in to manage your stack');
    }

    if (!isInStack) {
      return; // Not in stack
    }

    setIsUpdating(true);
    setError(null);

    try {
      const databaseProductId = await findDatabaseProductId(product);
      if (databaseProductId === null) {
        setIsInStack(false);
        return;
      }

      await deleteUserProductLink(user.id, databaseProductId);
      await deleteUserProductSettings(user.id, databaseProductId);

      setIsInStack(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove product from stack'));
      throw err;
    } finally {
      setIsUpdating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, product?.product_id, isInStack]);

  const toggleInStack = useCallback(async () => {
    if (isInStack) {
      await removeFromStack();
    } else {
      await addToStack();
    }
  }, [isInStack, addToStack, removeFromStack]);

  return {
    isInStack,
    isLoading,
    isUpdating,
    error,
    addToStack,
    removeFromStack,
    toggleInStack,
  };
}

export default useProductInStack;
