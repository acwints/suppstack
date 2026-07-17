'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/supabase';
import { findCatalogProductById } from '@/lib/catalog/supplement-catalog';
import { mapEmbeddedIngredient } from '@/lib/catalog/product-ingredient-embed';
import type { Product } from '@/types';

const PRODUCT_SELECT = `
  *,
  brands(brand_name),
  supplements(supplement_id, supplement_name),
  product_ingredients(
    amount, unit, order_index,
    supplements(supplement_id, supplement_name)
  )
`;

// Composition-free fallback: used when the `product_ingredients` embed fails
// (e.g. the composition migration hasn't been applied to this environment yet).
// The product page must still load — it just renders without the "What's
// inside" panel — rather than 404ing the entire page.
const PRODUCT_SELECT_NO_COMPOSITION = `
  *,
  brands(brand_name),
  supplements(supplement_id, supplement_name)
`;

/**
 * A single product by id: curated catalog first (string ids), database
 * fallback (integer ids). `product === null && !isLoading` means not found.
 */
export function useProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      setIsLoading(true);

      const catalogProduct = findCatalogProductById(productId);
      if (catalogProduct) {
        if (!cancelled) {
          setProduct(catalogProduct);
          setIsLoading(false);
        }
        return;
      }

      let { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('product_id', productId)
        .single();

      // The composition embed can fail if `product_ingredients` isn't present
      // in this environment yet. Retry without the embed so the page still
      // loads (minus the "What's inside" panel) instead of rendering "not found".
      if (error) {
        const fallback = await supabase
          .from('products')
          .select(PRODUCT_SELECT_NO_COMPOSITION)
          .eq('product_id', productId)
          .single();
        data = fallback.data;
        error = fallback.error;
      }

      if (cancelled) return;
      if (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } else {
        const { product_ingredients: embeddedIngredients, ...productRow } = (data ?? {}) as any;
        const ingredients = ((embeddedIngredients ?? []) as any[]).map(mapEmbeddedIngredient);
        setProduct({
          ...(productRow as Product),
          ...(ingredients.length > 0 ? { ingredients } : {}),
        });
      }
      setIsLoading(false);
    }

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { product, isLoading };
}
