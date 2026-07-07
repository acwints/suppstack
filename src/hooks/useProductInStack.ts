'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import { getUserProfileId } from '@/lib/account/profile';
import { isMissingColumnError } from '@/lib/account/user-products';
import type { Product } from '@/types';
import {
  findDatabaseProductId,
  resolveDatabaseProductId,
  resolveDatabaseSupplementId,
} from '@/lib/catalog/supplement-sync';

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

async function findUserProductLink(profileId: string, userId: string, productId: number | string) {
  const byUser = await supabase
    .from('users_products')
    .select('product_id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .limit(1);

  if (!byUser.error) return byUser.data?.[0] ?? null;
  if (!isMissingColumnError(byUser.error, 'user_id')) throw byUser.error;

  const byProfile = await supabase
    .from('users_products')
    .select('product_id')
    .eq('profile_id', profileId)
    .eq('product_id', productId)
    .limit(1);

  if (byProfile.error) throw byProfile.error;
  return byProfile.data?.[0] ?? null;
}

async function insertUserProductLink({
  profileId,
  userId,
  productId,
  supplementId,
}: {
  profileId: string;
  userId: string;
  productId: number | string;
  supplementId: number | null;
}) {
  const fullPayload = {
    product_id: productId,
    supplement_id: supplementId,
    status: 'active',
  };
  const minimalPayload = {
    product_id: productId,
  };
  const attempts = [
    { ...minimalPayload, user_id: userId },
    { ...minimalPayload, profile_id: profileId, user_id: userId },
    { ...fullPayload, profile_id: profileId, user_id: userId },
    { ...fullPayload, user_id: userId },
    { ...minimalPayload, profile_id: profileId },
    { ...fullPayload, profile_id: profileId },
  ];

  let lastError: { code?: string; message?: string } | null = null;

  for (const payload of attempts) {
    const { error } = await supabase.from('users_products').insert(payload);
    if (!error || error.code === UNIQUE_VIOLATION) return;

    const canRetry =
      isMissingColumnError(error, 'profile_id') ||
      isMissingColumnError(error, 'user_id') ||
      isMissingColumnError(error, 'supplement_id') ||
      isMissingColumnError(error, 'status');

    lastError = error;
    if (!canRetry) break;
  }

  throw lastError ?? new Error('Failed to add product to stack');
}

async function deleteUserProductLink(profileId: string, userId: string, productId: number | string) {
  const byUser = await supabase
    .from('users_products')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (!byUser.error) return;
  if (!isMissingColumnError(byUser.error, 'user_id')) throw byUser.error;

  const byProfile = await supabase
    .from('users_products')
    .delete()
    .eq('profile_id', profileId)
    .eq('product_id', productId);

  if (byProfile.error) throw byProfile.error;
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

      const profileId = await getUserProfileId(user);
      const data = await findUserProductLink(profileId, user.id, databaseProductId);

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
      const [profileId, databaseProductId, databaseSupplementId] = await Promise.all([
        getUserProfileId(user),
        resolveDatabaseProductId(product),
        product.supplement_id ? resolveDatabaseSupplementId(product.supplement_id) : Promise.resolve(null),
      ]);

      await insertUserProductLink({
        profileId,
        userId: user.id,
        productId: databaseProductId,
        supplementId: databaseSupplementId,
      });

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

      const profileId = await getUserProfileId(user);
      await deleteUserProductLink(profileId, user.id, databaseProductId);

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
