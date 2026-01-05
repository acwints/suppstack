'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';

export interface UseProductInStackResult {
  isInStack: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  error: Error | null;
  addToStack: () => Promise<void>;
  removeFromStack: () => Promise<void>;
  toggleInStack: () => Promise<void>;
}

export function useProductInStack(productId: string): UseProductInStackResult {
  const { user } = useAuth();
  const [isInStack, setIsInStack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Check if product is in user's stack
  const checkIfInStack = useCallback(async () => {
    if (!user || !productId) {
      setIsInStack(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('users_products')
        .select('product_id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
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
  }, [user, productId]);

  useEffect(() => {
    checkIfInStack();
  }, [checkIfInStack]);

  const addToStack = useCallback(async () => {
    if (!user) {
      throw new Error('Please log in to add products to your stack');
    }

    if (isInStack) {
      return; // Already in stack
    }

    setIsUpdating(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('users_products')
        .insert({
          user_id: user.id,
          product_id: productId,
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
  }, [user, productId, isInStack]);

  const removeFromStack = useCallback(async () => {
    if (!user) {
      throw new Error('Please log in to manage your stack');
    }

    if (!isInStack) {
      return; // Not in stack
    }

    setIsUpdating(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('users_products')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

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
  }, [user, productId, isInStack]);

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
