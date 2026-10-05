'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/app/supabase';
import { fetchUserProductLinks } from '@/lib/account/user-products';
import {
  mapEmbeddedIngredient,
  type EmbeddedIngredientRow,
} from '@/lib/catalog/product-ingredient-embed';
import {
  computeStackIntake,
  normalizeIngredientName,
  normalizeProductUrl,
  toIngredientInputs,
  EMPTY_STACK_INTAKE,
  type StackIntake,
  type StackIntakeItem,
} from '@/lib/ingredients';
import type { Product, StoredSupplementStatus } from '@/types';

/**
 * Shares a SINGLE stack-ingredients fetch across the app so `ProductActions`
 * (rendered inside every product tile/card) reads the stack's ingredient
 * names from context instead of firing one stack+composition fetch per card.
 * `/stack` consumes the same context so the rollup and the toast share one
 * fetch. Consumers read it via `useStackIngredients` from '@/hooks'.
 */

/**
 * Composition-aware stack fetch: each linked product carries its ingredient
 * edges (via `product_ingredients`), each edge referencing a catalog
 * supplement (2-tier model). `product_url` is a stable natural key used to
 * mark "in your stack" across the catalog-id / DB-id namespace split.
 */
const STACK_INGREDIENTS_SELECT = `
  product_id,
  products (
    product_name,
    product_url,
    servings_per_day,
    brands (brand_name),
    product_ingredients (
      amount, unit, order_index,
      supplements (supplement_id, supplement_name)
    )
  )
`;

/** Row shape of STACK_INGREDIENTS_SELECT (one `users_products` link). */
interface StackIngredientsRow {
  product_id: number;
  products:
    | (Pick<Product, 'product_name' | 'product_url' | 'servings_per_day'> & {
        brands: { brand_name: string } | null;
        product_ingredients: EmbeddedIngredientRow[] | null;
      })
    | null;
}

/** Row shape of the `user_supplement_settings` select below. */
interface StackSettingRow {
  product_id: number;
  servings_per_day: number | null;
  status: StoredSupplementStatus | null;
}

export interface StackIngredientsContextValue {
  intake: StackIntake;
  /** Set of NORMALIZED ingredient names in the active stack (overlap key). */
  ingredientNames: Set<string>;
  /**
   * Normalized `product_url` for EVERY linked product (active or not) — the
   * natural key for the "is this product in my stack" marker, robust to the
   * catalog-id vs DB-SERIAL-id namespace split.
   */
  stackProductUrls: Set<string>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Rolls the user's ACTIVE stack up to the ingredient level via the pure
 * `computeStackIntake`. Runs once inside `StackIngredientsProvider`.
 */
function useStackIngredientsState(): StackIngredientsContextValue {
  const { user } = useAuth();
  const [intake, setIntake] = useState<StackIntake>(EMPTY_STACK_INTAKE);
  const [stackProductUrls, setStackProductUrls] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setIntake(EMPTY_STACK_INTAKE);
      setStackProductUrls(new Set());
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [data, settingsResult] = await Promise.all([
        fetchUserProductLinks<StackIngredientsRow>(user, STACK_INGREDIENTS_SELECT),
        supabase
          .from('user_supplement_settings')
          .select('product_id, servings_per_day, status')
          .eq('user_id', user.id),
      ]);

      if (settingsResult.error) throw settingsResult.error;

      const settingsByProductId = new Map<string, StackSettingRow>(
        (settingsResult.data ?? []).map((setting: StackSettingRow) => [String(setting.product_id), setting])
      );

      // Single pass: collect ALL linked product urls (the in-stack marker)
      // and the ACTIVE items fed to the intake computation.
      const productUrls = new Set<string>();
      const items: StackIntakeItem[] = [];

      for (const item of data || []) {
        const setting = settingsByProductId.get(String(item.product_id));
        // Legacy 'stopped' rows count as removed from the stack.
        if (setting?.status === 'stopped') continue;

        const url = normalizeProductUrl(item.products?.product_url);
        if (url) productUrls.add(url);

        const status = setting?.status ?? 'active';
        if (status !== 'active') continue;

        const servingsPerDay = setting?.servings_per_day ?? item.products?.servings_per_day ?? 1;
        const ingredients = (item.products?.product_ingredients ?? []).map(mapEmbeddedIngredient);

        items.push({
          productId: String(item.product_id),
          productName: item.products?.product_name || '',
          brandName: item.products?.brands?.brand_name || undefined,
          servingsPerDay: servingsPerDay || 1,
          ingredients: toIngredientInputs(ingredients),
        });
      }

      setStackProductUrls(productUrls);
      setIntake(computeStackIntake({ items }));
    } catch (err) {
      console.error('Error fetching stack ingredients:', err);
      setError(err instanceof Error ? err : new Error('Could not load your stack ingredients.'));
      setIntake(EMPTY_STACK_INTAKE);
      setStackProductUrls(new Set());
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

  return { intake, ingredientNames, stackProductUrls, isLoading, error, refetch };
}

/** Safe default when the provider is absent — never blocks the add-to-stack flow. */
const DEFAULT_VALUE: StackIngredientsContextValue = {
  intake: EMPTY_STACK_INTAKE,
  ingredientNames: new Set<string>(),
  stackProductUrls: new Set<string>(),
  isLoading: false,
  error: null,
  refetch: async () => {},
};

const StackIngredientsContext = createContext<StackIngredientsContextValue | null>(null);

export function StackIngredientsProvider({ children }: { children: ReactNode }) {
  const value = useStackIngredientsState();
  return (
    <StackIngredientsContext.Provider value={value}>{children}</StackIngredientsContext.Provider>
  );
}

/**
 * Read the shared stack-intake state. Tolerates being called outside a
 * provider (e.g. product grids) by returning a safe default instead of
 * throwing, so `ProductActions` degrades gracefully.
 */
export function useStackIngredientsContext(): StackIngredientsContextValue {
  return useContext(StackIngredientsContext) ?? DEFAULT_VALUE;
}
