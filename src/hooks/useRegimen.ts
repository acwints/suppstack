'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/app/supabase';
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
      const [data, settingsResult] = await Promise.all([
        fetchUserProductLinks<any>(user, REGIMEN_SELECT),
        supabase
          .from('user_supplement_settings')
          .select('product_id, servings_per_day, schedule_days, status, custom_dosage')
          .eq('user_id', user.id),
      ]);

      if (settingsResult.error) throw settingsResult.error;

      const settingsByProductId = new Map(
        (settingsResult.data ?? []).map((setting: any) => [String(setting.product_id), setting])
      );

      setRegimen(
        (data || [])
          .map((item: any) => {
            const setting = settingsByProductId.get(String(item.product_id));
            const servingsPerDay =
              setting?.servings_per_day ?? item.products?.servings_per_day ?? 1;

            return {
              product_id: String(item.product_id),
              products: {
                product_name: item.products?.product_name || '',
                product_description: item.products?.product_description || '',
                product_price: item.products?.product_price || 0,
                servings_per_container: item.products?.servings_per_container || 0,
                servings_per_day: servingsPerDay || 1,
                brands: { brand_name: item.products?.brands?.brand_name || '' },
                supplements: { supplement_name: item.products?.supplements?.supplement_name || '' },
              },
              settings: {
                servings_per_day: servingsPerDay || 1,
                schedule_days: setting?.schedule_days ?? [1, 2, 3, 4, 5, 6, 7],
                status: setting?.status ?? 'active',
                custom_dosage: setting?.custom_dosage ?? undefined,
              },
            } satisfies RegimenItem;
          })
          .filter((item: RegimenItem) => item.settings?.status !== 'stopped')
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

  const activeRegimen = regimen.filter((item) => (item.settings?.status ?? 'active') === 'active');
  const pausedRegimen = regimen.filter((item) => item.settings?.status === 'paused');

  return { regimen, activeRegimen, pausedRegimen, isLoading, error, refetch };
}
