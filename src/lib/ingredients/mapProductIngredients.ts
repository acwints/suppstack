/**
 * Impure boundary mapper between the DB/catalog `ProductIngredient` shape
 * (`supplement_id`/`supplement_name`/`amount`/`unit`) and the pure intake
 * module's `ProductIngredientInput` shape
 * (`ingredientId`/`ingredientName`/`amountPerServing`/`unit`).
 *
 * This is the SINGLE place those two field vocabularies translate. The pure
 * `intake.ts` module never imports `@/types`; this file is the deliberate
 * seam that imports both `@/types` and the pure module. Do not "unify" the
 * field names — the boundary is intentional.
 */

import type { ProductIngredient } from '@/types';
import { summarizeAddition, type ProductIngredientInput } from '@/lib/ingredients';

/**
 * Map the DB/catalog `ProductIngredient[]` shape to the pure module's
 * `ProductIngredientInput[]`: `supplement_id → ingredientId`,
 * `supplement_name → ingredientName`, `amount → amountPerServing`,
 * `unit → unit`.
 */
export function toIngredientInputs(ingredients: ProductIngredient[]): ProductIngredientInput[] {
  return ingredients.map((ingredient) => ({
    ingredientId: ingredient.supplement_id,
    ingredientName: ingredient.supplement_name,
    amountPerServing: ingredient.amount,
    unit: ingredient.unit,
  }));
}

/**
 * Summarize what adding a product (in DB/catalog `ProductIngredient` shape)
 * would contribute to a stack. Thin adapter over the pure
 * `summarizeAddition` — maps field names first, then delegates.
 */
export function summarizeProductAddition(
  ingredients: ProductIngredient[],
  existingIds: Set<number>
): ReturnType<typeof summarizeAddition> {
  return summarizeAddition(toIngredientInputs(ingredients), existingIds);
}
