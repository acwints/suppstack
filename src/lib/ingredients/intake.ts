/**
 * Pure ingredient-intake module.
 *
 * Rolls a user's ACTIVE stack up to the ingredient level: total daily amount
 * per ingredient (bucketed by canonical unit) and overlap flags (an ingredient
 * supplied by two or more products).
 *
 * This module is intentionally PURE: it imports NOTHING from React, Supabase,
 * `@/types`, or the catalog. It defines its own IO types (`ProductIngredientInput`
 * uses `ingredientId`/`ingredientName`, decoupled from the DB/catalog
 * `ProductIngredient` shape). The mapping from the DB/Product shape lives at the
 * hooks boundary, not here.
 *
 * Unit safety by canonicalization, NEVER conversion: mg is never summed with IU.
 * Amounts are bucketed by canonical unit; mixed units for one ingredient are
 * kept in separate buckets and flagged.
 */

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface ProductIngredientInput {
  ingredientId: number;
  ingredientName: string;
  amountPerServing: number | null;
  unit: string | null;
}

export interface StackIntakeItem {
  productId: string;
  productName: string;
  brandName?: string;
  servingsPerDay: number;
  ingredients: ProductIngredientInput[];
}

export interface StackIntakeInput {
  items: StackIntakeItem[];
}

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface IngredientContributor {
  productId: string;
  productName: string;
  brandName?: string;
  amountPerServing: number | null;
  unit: string | null;
  /** Daily amount contributed by this product; null when unquantified. */
  dailyAmount: number | null;
}

export interface IngredientUnitTotal {
  canonicalUnit: string;
  /** First original unit label seen for this bucket. */
  displayUnit: string;
  total: number;
  contributors: IngredientContributor[];
}

export interface IngredientIntake {
  ingredientId: number;
  ingredientName: string;
  amountsByUnit: IngredientUnitTotal[];
  contributors: IngredientContributor[];
  isOverlap: boolean;
  hasMixedUnits: boolean;
  hasUnquantified: boolean;
}

export interface StackIntake {
  ingredients: IngredientIntake[];
  overlaps: IngredientIntake[];
  ingredientCount: number;
  overlapCount: number;
}

// ---------------------------------------------------------------------------
// Unit normalization
// ---------------------------------------------------------------------------

/**
 * Canonicalize a unit string. Trim + lowercase, then map known synonyms to a
 * single canonical token. Returns null for null/empty input; returns the
 * cleaned token for unknown units. NEVER converts magnitudes — this only
 * groups equivalent labels so that identical units bucket together.
 */
export function normalizeUnit(unit: string | null): string | null {
  if (unit == null) return null;
  const cleaned = unit.trim().toLowerCase();
  if (cleaned === '') return null;

  const synonyms: Record<string, string> = {
    'µg': 'mcg',
    'ug': 'mcg',
    'mcg': 'mcg',
    'iu': 'iu',
    'i.u.': 'iu',
    'mg': 'mg',
    'g': 'g',
    'gram': 'g',
    'grams': 'g',
    'billion cfu': 'cfu',
    'cfu': 'cfu',
    'ml': 'ml',
    'mcg dfe': 'mcg dfe',
    'mg ne': 'mg ne',
  };

  return synonyms[cleaned] ?? cleaned;
}

// ---------------------------------------------------------------------------
// Stack intake computation
// ---------------------------------------------------------------------------

interface PreSummedRow {
  ingredientId: number;
  ingredientName: string;
  canonicalUnit: string | null;
  displayUnit: string | null;
  amountPerServing: number | null;
}

/**
 * Compute the ingredient-level intake for an ACTIVE stack.
 *
 * No cross-unit arithmetic occurs anywhere: contributions are only ever summed
 * within a single (ingredientId, canonicalUnit) bucket.
 */
export function computeStackIntake(input: StackIntakeInput): StackIntake {
  const byIngredient = new Map<number, IngredientIntake>();

  for (const item of input.items) {
    // 1) Pre-sum duplicate rows of the same ingredientId + canonicalUnit
    //    WITHIN this product. Quantified rows accumulate; an unquantified row
    //    (null amount) stays a distinct null-amount contribution.
    const quantified = new Map<string, PreSummedRow>();
    const unquantified: PreSummedRow[] = [];

    for (const ing of item.ingredients) {
      const canonicalUnit = normalizeUnit(ing.unit);
      const displayUnit = ing.unit != null && ing.unit.trim() !== '' ? ing.unit.trim() : null;

      if (ing.amountPerServing == null) {
        unquantified.push({
          ingredientId: ing.ingredientId,
          ingredientName: ing.ingredientName,
          canonicalUnit,
          displayUnit,
          amountPerServing: null,
        });
        continue;
      }

      const key = `${ing.ingredientId}::${canonicalUnit ?? ''}`;
      const existing = quantified.get(key);
      if (existing) {
        existing.amountPerServing = (existing.amountPerServing ?? 0) + ing.amountPerServing;
      } else {
        quantified.set(key, {
          ingredientId: ing.ingredientId,
          ingredientName: ing.ingredientName,
          canonicalUnit,
          displayUnit,
          amountPerServing: ing.amountPerServing,
        });
      }
    }

    // 2) Emit contributions into the per-ingredient aggregates.
    const emit = (row: PreSummedRow) => {
      const intake = getOrCreateIntake(byIngredient, row.ingredientId, row.ingredientName);
      const dailyAmount =
        row.amountPerServing == null ? null : row.amountPerServing * item.servingsPerDay;

      const contributor: IngredientContributor = {
        productId: item.productId,
        productName: item.productName,
        ...(item.brandName !== undefined ? { brandName: item.brandName } : {}),
        amountPerServing: row.amountPerServing,
        unit: row.displayUnit,
        dailyAmount,
      };

      if (dailyAmount == null || row.canonicalUnit == null) {
        // Unquantified (or unitless) contribution: tracked as a contributor but
        // never bucketed into a numeric total.
        intake.hasUnquantified = intake.hasUnquantified || dailyAmount == null;
        intake.contributors.push(contributor);
        return;
      }

      // Quantified contribution: bucket by canonical unit.
      let bucket = intake.amountsByUnit.find((b) => b.canonicalUnit === row.canonicalUnit);
      if (!bucket) {
        bucket = {
          canonicalUnit: row.canonicalUnit,
          displayUnit: row.displayUnit ?? row.canonicalUnit,
          total: 0,
          contributors: [],
        };
        intake.amountsByUnit.push(bucket);
      }
      bucket.total += dailyAmount;
      bucket.contributors.push(contributor);
      intake.contributors.push(contributor);
    };

    for (const row of Array.from(quantified.values())) emit(row);
    for (const row of unquantified) emit(row);
  }

  // 3) Finalize per-ingredient flags and dedupe contributors by productId.
  const ingredients: IngredientIntake[] = [];
  for (const intake of Array.from(byIngredient.values())) {
    intake.contributors = uniqueByProductId(intake.contributors);
    const distinctProducts = new Set(intake.contributors.map((c) => c.productId)).size;
    intake.isOverlap = distinctProducts >= 2;
    intake.hasMixedUnits = intake.amountsByUnit.length > 1;
    ingredients.push(intake);
  }

  ingredients.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));

  const overlaps = ingredients.filter((i) => i.isOverlap);

  return {
    ingredients,
    overlaps,
    ingredientCount: ingredients.length,
    overlapCount: overlaps.length,
  };
}

function getOrCreateIntake(
  map: Map<number, IngredientIntake>,
  ingredientId: number,
  ingredientName: string
): IngredientIntake {
  const existing = map.get(ingredientId);
  if (existing) return existing;
  const created: IngredientIntake = {
    ingredientId,
    ingredientName,
    amountsByUnit: [],
    contributors: [],
    isOverlap: false,
    hasMixedUnits: false,
    hasUnquantified: false,
  };
  map.set(ingredientId, created);
  return created;
}

/** Keep the first contributor seen per productId, preserving order. */
function uniqueByProductId(contributors: IngredientContributor[]): IngredientContributor[] {
  const seen = new Set<string>();
  const result: IngredientContributor[] = [];
  for (const c of contributors) {
    if (seen.has(c.productId)) continue;
    seen.add(c.productId);
    result.push(c);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Add-to-stack summary
// ---------------------------------------------------------------------------

/**
 * Summarize what adding a product would contribute to a stack.
 *
 * `addedCount` = distinct ingredientIds in the product; `overlapCount` /
 * `overlapNames` cover those ingredientIds already present in the stack.
 */
export function summarizeAddition(
  productIngredients: ProductIngredientInput[],
  existingIngredientIds: Set<number>
): { addedCount: number; overlapCount: number; overlapNames: string[] } {
  const seen = new Set<number>();
  const overlapNames: string[] = [];
  const overlapSeen = new Set<number>();

  for (const ing of productIngredients) {
    if (!seen.has(ing.ingredientId)) {
      seen.add(ing.ingredientId);
    }
    if (existingIngredientIds.has(ing.ingredientId) && !overlapSeen.has(ing.ingredientId)) {
      overlapSeen.add(ing.ingredientId);
      overlapNames.push(ing.ingredientName);
    }
  }

  return {
    addedCount: seen.size,
    overlapCount: overlapSeen.size,
    overlapNames,
  };
}
