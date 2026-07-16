'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/supabase';
import { curatedProductsContainingIngredient } from '@/lib/catalog/supplement-catalog';
import { mergeProductSources } from '@/lib/commerce/product-source';
import type { IngredientUnit, Product, ProductContainingIngredient } from '@/types';

export interface UseProductsWithIngredientResult {
  products: ProductContainingIngredient[];
  isLoading: boolean;
  error: string | null;
}

const DB_SELECT = 'amount, unit, is_primary, products(*, brands(brand_name), supplements(supplement_name))';

/** Map a DB `product_ingredients` row into a `ProductContainingIngredient`. */
function mapDbRow(row: any): ProductContainingIngredient | null {
  const product = row.products as Product | null;
  if (!product) return null;
  return {
    product,
    amount: row.amount ?? null,
    unit: (row.unit ?? null) as IngredientUnit | null,
    is_primary: row.is_primary ?? undefined,
  };
}

/**
 * Reverse lookup for the ingredient page: every product (curated catalog +
 * database) whose composition includes the ingredient named `ingredientName`,
 * deduped on the underlying product while preserving each winner's edge
 * (`amount`/`unit`/`is_primary`).
 *
 * Keyed on the ingredient NAME rather than an id: the route id is a catalog id
 * (9000+) on catalog routes but a DB SERIAL id on DB routes, so an id-keyed
 * lookup misses one source. Resolving the name to DB supplement id(s) here
 * lets both the catalog and DB sides match regardless of the route's id space.
 */
export function useProductsWithIngredient(
  ingredientName: string
): UseProductsWithIngredientResult {
  const [products, setProducts] = useState<ProductContainingIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const catalogMatches = curatedProductsContainingIngredient(ingredientName);

        // Resolve the ingredient name to DB supplement id(s) so the DB reverse
        // query keys on the same natural key as the catalog side.
        const { data: supplementRows, error: supplementError } = await supabase
          .from('supplements')
          .select('supplement_id')
          .eq('supplement_name', ingredientName);

        if (supplementError) throw supplementError;

        const dbSupplementIds = (supplementRows ?? [])
          .map((row: any) => row.supplement_id)
          .filter((id: unknown): id is number => typeof id === 'number');

        let dbMatches: ProductContainingIngredient[] = [];
        if (dbSupplementIds.length > 0) {
          const { data, error: dbError } = await supabase
            .from('product_ingredients')
            .select(DB_SELECT)
            .in('ingredient_supplement_id', dbSupplementIds);

          if (dbError) throw dbError;

          dbMatches = ((data ?? []) as any[])
            .map(mapDbRow)
            .filter((match): match is ProductContainingIngredient => match !== null);
        }

        // Dedupe on the underlying product (catalog preferred as primary),
        // carrying each winner's edge — mirrors `mergeProductSources`
        // semantics while preserving the per-product edge.
        const matches = [...catalogMatches, ...dbMatches];
        const dedupedProducts = mergeProductSources(
          catalogMatches.map((match) => match.product),
          dbMatches.map((match) => match.product)
        );

        const merged = dedupedProducts.flatMap((product) => {
          const match = matches.find((candidate) => candidate.product === product);
          return match ? [match] : [];
        });

        if (!cancelled) setProducts(merged);
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching products with ingredient:', err);
        setError('Could not load products for this ingredient.');
        setProducts([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [ingredientName]);

  return { products, isLoading, error };
}
