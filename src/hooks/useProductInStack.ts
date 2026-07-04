'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import { getOrCreateUserProfile } from '@/lib/account/profile';
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

/**
 * Tracks whether a product is in the user's collection (`users_products`).
 * Works for both database products and curated catalog products — catalog
 * products are synced into the `products` table on first add.
 */
export function useProductInStack(product: Product | null): UseProductInStackResult {
  const { user } = useAuth();
  const [isInStack, setIsInStack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Check if product is in user's collection
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

      const profile = await getOrCreateUserProfile(user);
      const { data, error: queryError } = await supabase
        .from('users_products')
        .select('product_id')
        .eq('profile_id', profile.profile_id)
        .eq('product_id', databaseProductId)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        throw queryError;
      }

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
      const [profile, databaseProductId] = await Promise.all([
        getOrCreateUserProfile(user),
        resolveDatabaseProductId(product),
      ]);

      const { error: insertError } = await supabase
        .from('users_products')
        .insert({
          profile_id: profile.profile_id,
          product_id: databaseProductId,
        });

      if (insertError) {
        throw insertError;
      }

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

      const profile = await getOrCreateUserProfile(user);
      const { error: deleteError } = await supabase
        .from('users_products')
        .delete()
        .eq('profile_id', profile.profile_id)
        .eq('product_id', databaseProductId);

      if (deleteError) {
        throw deleteError;
      }

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
