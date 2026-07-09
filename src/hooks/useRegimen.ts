'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { fetchUserProductLinks } from '@/lib/account/user-products';
import type { RegimenItem } from '@/types';

const REGIMEN_SELECT = `
  product_id,
  products (
    product_name, product_description, product_price,
    servings_per_container, servings_per_day,
    brands (brand_name),
    supplements (supplement_name)
  )
`;

/** The user's current stack (products they take), shared by Log and stack UI. */
export function useRegimen() {
  const { user } = useAuth();
  const [regimen, setRegimen] = useState<RegimenItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setRegimen([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUserProductLinks<any>(user, REGIMEN_SELECT);
      setRegimen(
        (data || []).map((item: any) => ({
          product_id: item.product_id,
          products: {
            product_name: item.products?.product_name || '',
            product_description: item.products?.product_description || '',
            product_price: item.products?.product_price || 0,
            servings_per_container: item.products?.servings_per_container || 0,
            servings_per_day: item.products?.servings_per_day || 0,
            brands: { brand_name: item.products?.brands?.brand_name || '' },
            supplements: { supplement_name: item.products?.supplements?.supplement_name || '' },
          },
        }))
      );
    } catch (err) {
      console.error('Error fetching regimen:', err);
      setError('Could not load your stack.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { regimen, isLoading, error, refetch };
}
