import type { IngredientUnit, ProductIngredient } from '@/types';

/**
 * Maps a nested `product_ingredients` embed row (as returned by a Supabase
 * `products(... product_ingredients(amount, unit, order_index,
 * supplements(supplement_id, supplement_name)))` select) into the DB/catalog
 * `ProductIngredient` shape.
 *
 * This is the DB→`ProductIngredient` embed mapping shared by `useProduct` and
 * `useStackIngredients`. It is NOT the pure-input boundary — that translation
 * (`ProductIngredient` → `ProductIngredientInput`) lives in
 * `src/lib/ingredients/mapProductIngredients.ts`.
 */
export function mapEmbeddedIngredient(row: any): ProductIngredient {
  return {
    supplement_id: row.supplements?.supplement_id,
    supplement_name: row.supplements?.supplement_name ?? '',
    amount: row.amount ?? null,
    unit: (row.unit ?? null) as IngredientUnit | null,
    order_index: row.order_index ?? undefined,
  };
}
