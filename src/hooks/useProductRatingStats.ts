'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/supabase';
import { isCuratedCatalogProductId } from '@/lib/commerce/product-source';
import type { ProductRatingStats } from '@/types';

/**
 * Rating stats for a product card. Catalog-prefixed ids skip the query —
 * their stats live under the lazily-resolved database id (see the product
 * page), and listings shouldn't fan out a query per card for them.
 */
export function useProductRatingStats(
  productId: string,
  initial?: ProductRatingStats | null
): ProductRatingStats | null {
  const [stats, setStats] = useState<ProductRatingStats | null>(initial ?? null);

  useEffect(() => {
    if (initial !== undefined || isCuratedCatalogProductId(productId)) return;

    let cancelled = false;
    supabase
      .from('product_rating_stats')
      .select('*')
      .eq('product_id', productId)
      .limit(1)
      .then(({ data }) => {
        if (!cancelled && data?.[0]) setStats(data[0]);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, initial]);

  return stats;
}
