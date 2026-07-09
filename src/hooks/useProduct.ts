'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/supabase';
import { findCatalogProductById } from '@/lib/catalog/supplement-catalog';
import type { Product } from '@/types';

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
        .select('*, brands(brand_name), supplements(supplement_id, supplement_name)')
        .eq('product_id', productId)
        .single();

      if (cancelled) return;
      if (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } else {
        setProduct(data);
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
