'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import { getLocalDateKey } from '@/lib/utils';
import { DEFAULT_SCHEDULE_DAYS, type Product } from '@/types';
import { findDatabaseProductId, resolveDatabaseProductId } from '@/lib/catalog/catalog-sync';

export interface UseProductInStackResult {
  isInStack: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  error: Error | null;
  addToStack: () => Promise<void>;
}

const UNIQUE_VIOLATION = '23505';

async function isInUserStack(userId: string, productId: number | string): Promise<boolean> {
  const [linkResult, settingResult] = await Promise.all([
    supabase
      .from('users_products')
      .select('product_id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .limit(1),
    supabase
      .from('user_supplement_settings')
      .select('status')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle(),
  ]);

  if (linkResult.error) throw linkResult.error;
  if (settingResult.error) throw settingResult.error;
  // Legacy 'stopped' rows count as removed; adding the product again
  // reactivates them.
  return (linkResult.data?.length ?? 0) > 0 && settingResult.data?.status !== 'stopped';
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
        start_date: getLocalDateKey(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,product_id' }
    );

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

  // Callers often pass a fresh object for the same product each render; key
  // the callbacks on the product id and read the latest object from a ref.
  const productId = product?.product_id;
  const productRef = useRef(product);
  useEffect(() => {
    productRef.current = product;
  }, [product]);

  // Check if product is in user's stack
  const checkIfInStack = useCallback(async () => {
    const product = productRef.current;
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

      setIsInStack(await isInUserStack(user.id, databaseProductId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check stack status'));
      console.error('Error checking if product is in stack:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkIfInStack();
  }, [checkIfInStack, productId]);

  const addToStack = useCallback(async () => {
    if (!user) {
      throw new Error('Please log in to add products to your stack');
    }

    const product = productRef.current;
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
  }, [user, isInStack]);

  return {
    isInStack,
    isLoading,
    isUpdating,
    error,
    addToStack,
  };
}
