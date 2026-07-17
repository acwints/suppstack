/**
 * Intake-math assertion gate for the pure ingredient module.
 *
 * Exercises the unit-safety and rollup invariants of `computeStackIntake` and
 * friends without any React/Supabase/catalog dependency:
 *   1) mg + IU for one ingredient stay in separate buckets (never summed)
 *   2) daily amount scales by servings/day
 *   3) an ingredient from >= 2 products is flagged as an overlap
 *   4) unquantified (null amount) rows are handled without producing NaN
 *   5) an empty stack yields an empty result
 *
 * Run: npm run check:ingredient-intake
 */
import {
  computeStackIntake,
  normalizeUnit,
  normalizeIngredientName,
  summarizeAddition,
} from '../lib/ingredients';
import type { StackIntakeInput } from '../lib/ingredients';

let failures = 0;

function check(condition: boolean, message: string) {
  if (!condition) {
    failures++;
    console.log(`FAIL ${message}`);
  }
}

// --- normalizeUnit synonym map -------------------------------------------
check(normalizeUnit('MG') === 'mg', 'normalizeUnit trims/lowercases mg');
check(normalizeUnit(' µg ') === 'mcg', 'normalizeUnit maps µg -> mcg');
check(normalizeUnit('ug') === 'mcg', 'normalizeUnit maps ug -> mcg');
check(normalizeUnit('I.U.') === 'iu', 'normalizeUnit maps I.U. -> iu');
check(normalizeUnit('grams') === 'g', 'normalizeUnit maps grams -> g');
check(normalizeUnit('Billion CFU') === 'cfu', 'normalizeUnit maps billion cfu -> cfu');
check(normalizeUnit(null) === null, 'normalizeUnit null -> null');
check(normalizeUnit('   ') === null, 'normalizeUnit empty -> null');
check(normalizeUnit('Scoops') === 'scoops', 'normalizeUnit unknown -> cleaned token');

// --- Test 1: mg + IU for one ingredient stay separate --------------------
{
  const input: StackIntakeInput = {
    items: [
      {
        productId: 'p1',
        productName: 'Product One',
        servingsPerDay: 1,
        ingredients: [{ ingredientId: 10, ingredientName: 'Vitamin D3', amountPerServing: 25, unit: 'mcg' }],
      },
      {
        productId: 'p2',
        productName: 'Product Two',
        servingsPerDay: 1,
        ingredients: [{ ingredientId: 10, ingredientName: 'Vitamin D3', amountPerServing: 1000, unit: 'IU' }],
      },
    ],
  };
  const result = computeStackIntake(input);
  const d3 = result.ingredients.find((i) => i.ingredientId === 10);
  check(!!d3, 'test1: Vitamin D3 present');
  check(!!d3 && d3.hasMixedUnits === true, 'test1: hasMixedUnits true for mg/mcg vs IU');
  check(!!d3 && d3.amountsByUnit.length === 2, 'test1: two separate unit buckets');
  if (d3) {
    const mcgBucket = d3.amountsByUnit.find((b) => b.canonicalUnit === 'mcg');
    const iuBucket = d3.amountsByUnit.find((b) => b.canonicalUnit === 'iu');
    check(!!mcgBucket && mcgBucket.total === 25, 'test1: mcg bucket total = 25 (not summed with IU)');
    check(!!iuBucket && iuBucket.total === 1000, 'test1: iu bucket total = 1000 (not summed with mcg)');
    // Guard: no bucket equals a cross-unit sum.
    check(!d3.amountsByUnit.some((b) => b.total === 1025), 'test1: no cross-unit summed value exists');
  }
}

// --- Test 2: servings scaling --------------------------------------------
{
  const input: StackIntakeInput = {
    items: [
      {
        productId: 'p1',
        productName: 'Creatine',
        servingsPerDay: 2,
        ingredients: [{ ingredientId: 20, ingredientName: 'Creatine', amountPerServing: 2.5, unit: 'g' }],
      },
    ],
  };
  const result = computeStackIntake(input);
  const creatine = result.ingredients.find((i) => i.ingredientId === 20);
  check(!!creatine, 'test2: Creatine present');
  if (creatine) {
    const bucket = creatine.amountsByUnit.find((b) => b.canonicalUnit === 'g');
    check(!!bucket && bucket.total === 5, 'test2: 2.5g * 2 servings/day = 5');
    check(creatine.contributors[0]?.dailyAmount === 5, 'test2: contributor dailyAmount = 5');
  }
}

// --- Test 3: overlap when ingredient from >= 2 products -------------------
{
  const input: StackIntakeInput = {
    items: [
      {
        productId: 'p1',
        productName: 'Multi A',
        servingsPerDay: 1,
        ingredients: [
          { ingredientId: 30, ingredientName: 'Magnesium', amountPerServing: 200, unit: 'mg' },
          { ingredientId: 31, ingredientName: 'Zinc', amountPerServing: 10, unit: 'mg' },
        ],
      },
      {
        productId: 'p2',
        productName: 'Multi B',
        servingsPerDay: 1,
        ingredients: [{ ingredientId: 30, ingredientName: 'Magnesium', amountPerServing: 150, unit: 'mg' }],
      },
    ],
  };
  const result = computeStackIntake(input);
  const mag = result.ingredients.find((i) => i.ingredientId === 30);
  const zinc = result.ingredients.find((i) => i.ingredientId === 31);
  check(!!mag && mag.isOverlap === true, 'test3: Magnesium flagged as overlap (2 products)');
  check(!!zinc && zinc.isOverlap === false, 'test3: Zinc not an overlap (1 product)');
  check(!!mag && mag.contributors.length === 2, 'test3: Magnesium has 2 contributors');
  if (mag) {
    const bucket = mag.amountsByUnit.find((b) => b.canonicalUnit === 'mg');
    check(!!bucket && bucket.total === 350, 'test3: same-unit overlap totals sum (200 + 150 = 350)');
  }
  check(result.overlapCount === 1, 'test3: overlapCount = 1');
  check(result.overlaps.length === 1 && result.overlaps[0]?.ingredientId === 30, 'test3: overlaps contains Magnesium');
}

// --- Test 4: unquantified (null amount) handled, no NaN -------------------
{
  const input: StackIntakeInput = {
    items: [
      {
        productId: 'p1',
        productName: 'Proprietary Blend',
        servingsPerDay: 3,
        ingredients: [
          { ingredientId: 40, ingredientName: 'Herb X', amountPerServing: null, unit: 'mg' },
          { ingredientId: 41, ingredientName: 'Herb Y', amountPerServing: 100, unit: 'mg' },
        ],
      },
    ],
  };
  const result = computeStackIntake(input);
  const herbX = result.ingredients.find((i) => i.ingredientId === 40);
  const herbY = result.ingredients.find((i) => i.ingredientId === 41);
  check(!!herbX && herbX.hasUnquantified === true, 'test4: hasUnquantified true for null amount');
  check(!!herbX && herbX.amountsByUnit.length === 0, 'test4: unquantified produces no numeric bucket');
  check(!!herbX && herbX.contributors[0]?.dailyAmount === null, 'test4: unquantified contributor dailyAmount = null');
  check(!!herbY && herbY.hasUnquantified === false, 'test4: quantified ingredient not flagged unquantified');
  // NaN guard across all buckets.
  const anyNaN = result.ingredients.some((i) =>
    i.amountsByUnit.some((b) => Number.isNaN(b.total)) ||
    i.contributors.some((c) => c.dailyAmount != null && Number.isNaN(c.dailyAmount))
  );
  check(!anyNaN, 'test4: no NaN in any total or dailyAmount');
}

// --- Test 5: empty stack -> empty result ---------------------------------
{
  const result = computeStackIntake({ items: [] });
  check(result.ingredients.length === 0, 'test5: no ingredients');
  check(result.overlaps.length === 0, 'test5: no overlaps');
  check(result.ingredientCount === 0, 'test5: ingredientCount = 0');
  check(result.overlapCount === 0, 'test5: overlapCount = 0');
}

// --- Bonus: normalizeIngredientName --------------------------------------
check(normalizeIngredientName('  Magnesium ') === 'magnesium', 'bonus: normalizeIngredientName trims/lowercases');

// --- Bonus: summarizeAddition (name-based overlap) -----------------------
{
  // Set of ALREADY-normalized names, as supplied by the caller. Uses different
  // casing/whitespace on the product rows to prove name (not id) matching and
  // that overlapNames returns the original casing.
  const existing = new Set<string>(['magnesium', 'zinc']);
  const summary = summarizeAddition(
    [
      { ingredientId: 9030, ingredientName: 'Magnesium', amountPerServing: 100, unit: 'mg' },
      { ingredientId: 9050, ingredientName: 'Vitamin C', amountPerServing: 500, unit: 'mg' },
      { ingredientId: 9050, ingredientName: 'Vitamin C', amountPerServing: 250, unit: 'mg' },
    ],
    existing
  );
  check(summary.addedCount === 2, 'bonus: addedCount counts distinct normalized names (Magnesium, Vitamin C)');
  check(summary.overlapCount === 1, 'bonus: overlapCount = 1 (Magnesium already present, by name)');
  check(
    summary.overlapNames.length === 1 && summary.overlapNames[0] === 'Magnesium',
    'bonus: overlapNames returns original-cased [Magnesium]'
  );

  // Overlap must match by normalized name even when ids differ and casing varies.
  const summary2 = summarizeAddition(
    [{ ingredientId: 12345, ingredientName: 'MAGNESIUM', amountPerServing: 50, unit: 'mg' }],
    existing
  );
  check(summary2.overlapCount === 1, 'bonus: overlap matches by normalized name across differing ids/casing');
  check(summary2.overlapNames[0] === 'MAGNESIUM', 'bonus: overlapNames preserves the original casing');
}

// --- Result --------------------------------------------------------------
if (failures > 0) {
  console.log(`\nIngredient intake checks FAILED: ${failures} failure(s)`);
  process.exit(1);
}
console.log('Ingredient intake checks passed.');
