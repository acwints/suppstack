'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/app/supabase';
import { fetchUserProductLinks } from '@/lib/account/user-products';
import {
  DEFAULT_SCHEDULE_DAYS,
  type MyStackItem,
  type Product,
  type StoredSupplementStatus,
  type UserSupplementSettingsInput,
} from '@/types';

const MY_STACK_SELECT = `
  product_id,
  products (
    product_name, product_description, product_price,
    servings_per_container, servings_per_day,
    brands (brand_name),
    supplements (supplement_name)
  )
`;

/** Row shape of MY_STACK_SELECT (one `users_products` link). */
interface MyStackLinkRow {
  product_id: number;
  products:
    | (Pick<
        Product,
        | 'product_name'
        | 'product_description'
        | 'product_price'
        | 'servings_per_container'
        | 'servings_per_day'
      > & {
        brands: { brand_name: string } | null;
        supplements: { supplement_name: string } | null;
      })
    | null;
}

/** Row shape of the `user_supplement_settings` select below. */
interface MyStackSettingRow {
  product_id: number;
  servings_per_day: number | null;
  schedule_days: number[] | null;
  status: StoredSupplementStatus | null;
  custom_dosage: string | null;
}

/** ISO weekday (1 = Monday … 7 = Sunday), matching `schedule_days`. */
export function isoWeekday(date: Date = new Date()): number {
  return date.getDay() === 0 ? 7 : date.getDay();
}

/** Whether a stack item is scheduled on the given ISO weekday. */
export function isScheduledOn(item: MyStackItem, weekday: number): boolean {
  const days = item.settings.schedule_days;
  return days.length === 0 || days.includes(weekday);
}

export interface UseMyStackResult {
  /** Every product in the stack, active or paused. */
  stack: MyStackItem[];
  /** Products currently being taken (not paused). */
  activeItems: MyStackItem[];
  /** Active products scheduled for today. */
  todayItems: MyStackItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  /** Upsert one product's dose/schedule/status, then refetch. */
  saveItemSettings: (input: UserSupplementSettingsInput) => Promise<void>;
  /** Delete a product (and its settings) from the stack, then refetch. */
  removeItem: (productId: string) => Promise<void>;
}

/**
 * The signed-in user's personal stack: the products they take
 * (`users_products`) merged with their per-product settings.
 */
export function useMyStack(): UseMyStackResult {
  const { user } = useAuth();
  const [stack, setStack] = useState<MyStackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setStack([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [links, settingsResult] = await Promise.all([
        fetchUserProductLinks<MyStackLinkRow>(user, MY_STACK_SELECT),
        supabase
          .from('user_supplement_settings')
          .select('product_id, servings_per_day, schedule_days, status, custom_dosage')
          .eq('user_id', user.id),
      ]);

      if (settingsResult.error) throw settingsResult.error;

      const settingsByProductId = new Map<string, MyStackSettingRow>(
        (settingsResult.data ?? []).map((setting: MyStackSettingRow) => [String(setting.product_id), setting])
      );

      const items: MyStackItem[] = [];
      for (const link of links) {
        const setting = settingsByProductId.get(String(link.product_id));
        // Legacy 'stopped' rows count as removed from the stack.
        if (setting?.status === 'stopped') continue;

        const servingsPerDay =
          setting?.servings_per_day ?? link.products?.servings_per_day ?? 1;

        items.push({
          product_id: String(link.product_id),
          products: {
            product_name: link.products?.product_name || '',
            product_description: link.products?.product_description || '',
            product_price: link.products?.product_price || 0,
            servings_per_container: link.products?.servings_per_container || 0,
            servings_per_day: servingsPerDay || 1,
            brands: { brand_name: link.products?.brands?.brand_name || '' },
            supplements: { supplement_name: link.products?.supplements?.supplement_name || '' },
          },
          settings: {
            servings_per_day: servingsPerDay || 1,
            schedule_days: setting?.schedule_days ?? DEFAULT_SCHEDULE_DAYS,
            status: setting?.status ?? 'active',
            custom_dosage: setting?.custom_dosage ?? undefined,
          },
        });
      }
      setStack(items);
    } catch (err) {
      console.error('Error fetching stack:', err);
      setError(err instanceof Error ? err : new Error('Could not load your stack.'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const saveItemSettings = useCallback(
    async (input: UserSupplementSettingsInput): Promise<void> => {
      if (!user) throw new Error('Please log in to manage your stack');

      // start_date is left alone: it was set when the product was added and
      // drives restock estimates, so editing settings must not reset it.
      const { error: upsertError } = await supabase.from('user_supplement_settings').upsert(
        {
          user_id: user.id,
          product_id: input.product_id,
          custom_dosage: input.custom_dosage || null,
          servings_per_day: input.servings_per_day || 1,
          schedule_days: input.schedule_days || DEFAULT_SCHEDULE_DAYS,
          status: input.status || 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,product_id' }
      );
      if (upsertError) throw upsertError;

      await refetch();
    },
    [user, refetch]
  );

  const removeItem = useCallback(
    async (productId: string): Promise<void> => {
      if (!user) throw new Error('Please log in to manage your stack');

      const { error: linkError } = await supabase
        .from('users_products')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (linkError) throw linkError;

      const { error: settingsError } = await supabase
        .from('user_supplement_settings')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (settingsError) throw settingsError;

      await refetch();
    },
    [user, refetch]
  );

  const activeItems = stack.filter((item) => item.settings.status === 'active');
  const todayItems = activeItems.filter((item) => isScheduledOn(item, isoWeekday()));

  return {
    stack,
    activeItems,
    todayItems,
    isLoading,
    error,
    refetch,
    saveItemSettings,
    removeItem,
  };
}
