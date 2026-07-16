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
 * database) whose composition includes `ingredientSupplementId`, deduped on
 * the underlying product while preserving each winner's edge
 * (`amount`/`unit`/`is_primary`).
 */
export function useProductsWithIngredient(
  ingredientSupplementId: number
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
        const catalogMatches = curatedProductsContainingIngredient(ingredientSupplementId);

        const { data, error: dbError } = await supabase
          .from('product_ingredients')
          .select(DB_SELECT)
          .eq('ingredient_supplement_id', ingredientSupplementId);

        if (dbError) throw dbError;

        const dbMatches = ((data ?? []) as any[])
          .map(mapDbRow)
          .filter((match): match is ProductContainingIngredient => match !== null);

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
  }, [ingredientSupplementId]);

  return { products, isLoading, error };
}
