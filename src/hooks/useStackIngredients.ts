'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/app/supabase';
import { fetchUserProductLinks } from '@/lib/account/user-products';
import {
  computeStackIntake,
  normalizeIngredientName,
  EMPTY_STACK_INTAKE,
  type StackIntake,
  type StackIntakeItem,
} from '@/lib/ingredients';
import { toIngredientInputs } from '@/lib/ingredients/mapProductIngredients';
import type { IngredientUnit, ProductIngredient } from '@/types';

/**
 * Composition-aware stack fetch: each linked product carries its ingredient
 * edges (via `product_ingredients`), each edge referencing a catalog
 * supplement (2-tier model).
 */
const STACK_INGREDIENTS_SELECT = `
  product_id,
  products (
    product_name,
    servings_per_day,
    brands (brand_name),
    product_ingredients (
      amount, unit, order_index,
      supplements (supplement_id, supplement_name)
    )
  )
`;

export interface UseStackIngredientsResult {
  intake: StackIntake;
  /** Set of NORMALIZED ingredient names in the active stack (overlap key). */
  ingredientNames: Set<string>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/** Map a nested `product_ingredients` embed row into the DB/catalog `ProductIngredient` shape. */
function mapEmbedRow(row: any): ProductIngredient {
  return {
    supplement_id: row.supplements?.supplement_id,
    supplement_name: row.supplements?.supplement_name ?? '',
    amount: row.amount ?? null,
    unit: (row.unit ?? null) as IngredientUnit | null,
    order_index: row.order_index ?? undefined,
  };
}

/**
 * Rolls the user's ACTIVE stack up to the ingredient level via the pure
 * `computeStackIntake`. Shared once through `StackIngredientsProvider`; the
 * `/stack` rollup and the add-to-stack overlap toast both read from it.
 */
export function useStackIngredients(): UseStackIngredientsResult {
  const { user } = useAuth();
  const [intake, setIntake] = useState<StackIntake>(EMPTY_STACK_INTAKE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setIntake(EMPTY_STACK_INTAKE);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [data, settingsResult] = await Promise.all([
        fetchUserProductLinks<any>(user, STACK_INGREDIENTS_SELECT),
        supabase
          .from('user_supplement_settings')
          .select('product_id, servings_per_day, status')
          .eq('user_id', user.id),
      ]);

      if (settingsResult.error) throw settingsResult.error;

      const settingsByProductId = new Map(
        (settingsResult.data ?? []).map((setting: any) => [String(setting.product_id), setting])
      );

      const items: StackIntakeItem[] = (data || [])
        .map((item: any) => {
          const setting = settingsByProductId.get(String(item.product_id));
          const status = setting?.status ?? 'active';
          const servingsPerDay =
            setting?.servings_per_day ?? item.products?.servings_per_day ?? 1;
          const ingredients = ((item.products?.product_ingredients ?? []) as any[]).map(
            mapEmbedRow
          );

          return {
            status,
            item: {
              productId: String(item.product_id),
              productName: item.products?.product_name || '',
              brandName: item.products?.brands?.brand_name || undefined,
              servingsPerDay: servingsPerDay || 1,
              ingredients: toIngredientInputs(ingredients),
            } satisfies StackIntakeItem,
          };
        })
        .filter((entry: { status: string }) => entry.status === 'active')
        .map((entry: { item: StackIntakeItem }) => entry.item);

      setIntake(computeStackIntake({ items }));
    } catch (err) {
      console.error('Error fetching stack ingredients:', err);
      setError('Could not load your stack ingredients.');
      setIntake(EMPTY_STACK_INTAKE);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const ingredientNames = useMemo(
    () =>
      new Set(intake.ingredients.map((ingredient) => normalizeIngredientName(ingredient.ingredientName))),
    [intake]
  );

  return { intake, ingredientNames, isLoading, error, refetch };
}
