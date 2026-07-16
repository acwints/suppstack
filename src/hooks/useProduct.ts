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

      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('product_id', productId)
        .single();

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
