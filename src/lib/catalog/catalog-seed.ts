import type { IngredientUnit, Product } from '@/types';

/** A hand-curated or Shopify-sourced product before catalog ids are assigned. */
export type CuratedProductSeed = Omit<Product, 'supplement_id' | 'supplements' | 'ingredients'> & {
  supplement_name: string;
  ingredients?: {
    supplement_name: string;
    amount: number | null;
    unit: IngredientUnit | null;
    is_primary?: boolean;
    notes?: string;
  }[];
};
