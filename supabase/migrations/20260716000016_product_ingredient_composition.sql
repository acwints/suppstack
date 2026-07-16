-- ============================================================================
-- 0016 · Product ingredient composition
-- Introduces the `product_ingredients` join table (2-tier model: an
-- ingredient's identity IS a catalog supplement) and seeds the explicit
-- composite compositions authored in the static catalog
-- (src/lib/catalog/supplement-catalog.ts, Task 3). A fallback backfill then
-- gives every pre-existing single-active product one unquantified edge so
-- existing user stacks keep showing up in ingredient intake.
--
-- NO RLS — INTENTIONAL. `product_ingredients` describes the open catalog
-- (products/supplements/brands), none of which have RLS enabled (see 0001).
-- The catalog is read AND written through the anon Supabase client in
-- src/lib/catalog/supplement-sync.ts (composition is materialized there on
-- product sync). Enabling RLS here would block that anon write path and break
-- catalog sync, exactly as it would for products/supplements/brands. This
-- table therefore deliberately inherits the same open exposure. Do NOT enable
-- RLS. This migration is strictly ADDITIVE, IDEMPOTENT, and NON-DESTRUCTIVE;
-- it never touches products.supplement_id.
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_ingredients (
  product_ingredient_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  ingredient_supplement_id INTEGER NOT NULL REFERENCES supplements(supplement_id),
  amount NUMERIC(12,3),
  unit TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'product_ingredients_product_ingredient_key'
  ) THEN
    ALTER TABLE product_ingredients
      ADD CONSTRAINT product_ingredients_product_ingredient_key
      UNIQUE (product_id, ingredient_supplement_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_product_ingredients_product_id
  ON product_ingredients(product_id);
CREATE INDEX IF NOT EXISTS idx_product_ingredients_ingredient
  ON product_ingredients(ingredient_supplement_id);

-- ── Explicit composite seed (temp-staging + double name-join, mirrors 0009) ──
-- Staging is keyed by product_url + ingredient_supplement_name so it can join
-- to the bridged SERIAL ids in products/supplements by natural key. Rows whose
-- product or ingredient supplement is not yet present in the DB this run are
-- simply skipped (inner joins drop them) and healed later by the sync write.
-- These rows MIRROR EXACTLY the `ingredients` arrays on the catch-all product
-- seeds in supplement-catalog.ts (same product_url, ingredient names, amounts,
-- units, order by array position, is_primary on the first entry).
CREATE TEMP TABLE IF NOT EXISTS product_ingredient_seed (
  product_url TEXT NOT NULL,
  ingredient_supplement_name TEXT NOT NULL,
  amount NUMERIC(12,3),
  unit TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT
) ON COMMIT DROP;

TRUNCATE product_ingredient_seed;

INSERT INTO product_ingredient_seed (
  product_url, ingredient_supplement_name, amount, unit, order_index, is_primary, notes
)
VALUES
  -- Gruns Superfood Gummies (Multivitamin)
  ('https://gruns.co/products/gruns', 'Vitamin C', 45, 'mg', 0, TRUE, NULL),
  ('https://gruns.co/products/gruns', 'Vitamin D3', 500, 'IU', 1, FALSE, NULL),
  ('https://gruns.co/products/gruns', 'Vitamin B12', 2.4, 'mcg', 2, FALSE, NULL),
  ('https://gruns.co/products/gruns', 'Folate', 200, 'mcg DFE', 3, FALSE, NULL),
  ('https://gruns.co/products/gruns', 'Biotin', 30, 'mcg', 4, FALSE, NULL),
  ('https://gruns.co/products/gruns', 'Zinc', 5, 'mg', 5, FALSE, NULL),
  ('https://gruns.co/products/gruns', 'Iodine', 75, 'mcg', 6, FALSE, NULL),
  -- Mars Men Natural Testosterone Support (Testosterone Support)
  ('https://mengotomars.com/products/natural-testosterone-support-mm-0012', 'Zinc', 15, 'mg', 0, TRUE, NULL),
  -- Blueprint Essential Capsules (Multivitamin)
  ('https://blueprint.bryanjohnson.com/products/essentials-capsules', 'Glucosamine', 750, 'mg', 0, TRUE, NULL),
  ('https://blueprint.bryanjohnson.com/products/essentials-capsules', 'Ashwagandha', 600, 'mg', 1, FALSE, NULL),
  ('https://blueprint.bryanjohnson.com/products/essentials-capsules', 'Garlic Extract', 600, 'mg', 2, FALSE, NULL),
  ('https://blueprint.bryanjohnson.com/products/essentials-capsules', 'Turmeric Curcumin', 500, 'mg', 3, FALSE, NULL),
  ('https://blueprint.bryanjohnson.com/products/essentials-capsules', 'Ginger', 500, 'mg', 4, FALSE, NULL),
  ('https://blueprint.bryanjohnson.com/products/essentials-capsules', 'Zinc', 15, 'mg', 5, FALSE, NULL),
  -- Alpha BRAIN 90 Count (Nootropic Formula)
  ('https://www.onnit.com/products/alpha-brain-90-ct', 'Alpha-GPC', 100, 'mg', 0, TRUE, NULL),
  ('https://www.onnit.com/products/alpha-brain-90-ct', 'Bacopa Monnieri', 100, 'mg', 1, FALSE, NULL),
  ('https://www.onnit.com/products/alpha-brain-90-ct', 'L-Theanine', 200, 'mg', 2, FALSE, NULL),
  ('https://www.onnit.com/products/alpha-brain-90-ct', 'L-Tyrosine', 300, 'mg', 3, FALSE, NULL),
  ('https://www.onnit.com/products/alpha-brain-90-ct', 'Phosphatidylserine', 50, 'mg', 4, FALSE, NULL),
  -- Alpha BRAIN Neuro Gummies (Nootropic Formula)
  ('https://www.onnit.com/products/alpha-brain-neuro-gummies-90-ct', 'Alpha-GPC', 100, 'mg', 0, TRUE, NULL),
  ('https://www.onnit.com/products/alpha-brain-neuro-gummies-90-ct', 'Bacopa Monnieri', 100, 'mg', 1, FALSE, NULL),
  ('https://www.onnit.com/products/alpha-brain-neuro-gummies-90-ct', 'L-Theanine', 100, 'mg', 2, FALSE, NULL),
  ('https://www.onnit.com/products/alpha-brain-neuro-gummies-90-ct', 'L-Tyrosine', 300, 'mg', 3, FALSE, NULL),
  -- Total Human 30 Day Supply (Multivitamin)
  ('https://www.onnit.com/products/total-human-30-day-supply', 'Vitamin D3', 2000, 'IU', 0, TRUE, NULL),
  ('https://www.onnit.com/products/total-human-30-day-supply', 'Vitamin K2', 600, 'mcg', 1, FALSE, NULL),
  ('https://www.onnit.com/products/total-human-30-day-supply', 'Zinc', 30, 'mg', 2, FALSE, NULL),
  ('https://www.onnit.com/products/total-human-30-day-supply', 'Magnesium Glycinate', 400, 'mg', 3, FALSE, NULL),
  ('https://www.onnit.com/products/total-human-30-day-supply', 'Omega-3 Fish Oil', 1000, 'mg', 4, FALSE, NULL),
  ('https://www.onnit.com/products/total-human-30-day-supply', 'Alpha-GPC', 100, 'mg', 5, FALSE, NULL),
  ('https://www.onnit.com/products/total-human-30-day-supply', 'Bacopa Monnieri', 100, 'mg', 6, FALSE, NULL),
  ('https://www.onnit.com/products/total-human-30-day-supply', 'L-Theanine', 200, 'mg', 7, FALSE, NULL),
  -- Basic Nutrients 2/Day - NSF Certified for Sport (Multivitamin)
  ('https://www.thorne.com/products/dp/basic-nutrients-2-day', 'Vitamin C', 200, 'mg', 0, TRUE, NULL),
  ('https://www.thorne.com/products/dp/basic-nutrients-2-day', 'Vitamin D3', 1000, 'IU', 1, FALSE, NULL),
  ('https://www.thorne.com/products/dp/basic-nutrients-2-day', 'Vitamin K2', 180, 'mcg', 2, FALSE, NULL),
  ('https://www.thorne.com/products/dp/basic-nutrients-2-day', 'Vitamin B12', 600, 'mcg', 3, FALSE, NULL),
  ('https://www.thorne.com/products/dp/basic-nutrients-2-day', 'Folate', 665, 'mcg DFE', 4, FALSE, NULL),
  ('https://www.thorne.com/products/dp/basic-nutrients-2-day', 'Biotin', 400, 'mcg', 5, FALSE, NULL),
  ('https://www.thorne.com/products/dp/basic-nutrients-2-day', 'Zinc', 15, 'mg', 6, FALSE, NULL),
  ('https://www.thorne.com/products/dp/basic-nutrients-2-day', 'Selenium', 100, 'mcg', 7, FALSE, NULL),
  -- AG1 Next Gen Pouch (Greens Powder)
  ('https://drinkag1.com/products/greens-powder-pouch', 'Vitamin C', 420, 'mg', 0, TRUE, NULL),
  ('https://drinkag1.com/products/greens-powder-pouch', 'Vitamin D3', 100, 'IU', 1, FALSE, NULL),
  ('https://drinkag1.com/products/greens-powder-pouch', 'Vitamin K2', 55, 'mcg', 2, FALSE, NULL),
  ('https://drinkag1.com/products/greens-powder-pouch', 'Vitamin B12', 20, 'mcg', 3, FALSE, NULL),
  ('https://drinkag1.com/products/greens-powder-pouch', 'Zinc', 15, 'mg', 4, FALSE, NULL),
  ('https://drinkag1.com/products/greens-powder-pouch', 'Selenium', 20, 'mcg', 5, FALSE, NULL),
  ('https://drinkag1.com/products/greens-powder-pouch', 'Probiotics', 7.2, 'billion CFU', 6, FALSE, NULL),
  ('https://drinkag1.com/products/greens-powder-pouch', 'Ashwagandha', 300, 'mg', 7, FALSE, NULL),
  -- Daily Ultimate Essentials Pro (Greens Powder)
  ('https://im8health.com/products/essentials-pro', 'Vitamin C', 250, 'mg', 0, TRUE, NULL),
  ('https://im8health.com/products/essentials-pro', 'Vitamin D3', 1000, 'IU', 1, FALSE, NULL),
  ('https://im8health.com/products/essentials-pro', 'Vitamin B12', 100, 'mcg', 2, FALSE, NULL),
  ('https://im8health.com/products/essentials-pro', 'Zinc', 10, 'mg', 3, FALSE, NULL),
  ('https://im8health.com/products/essentials-pro', 'Probiotics', 5, 'billion CFU', 4, FALSE, NULL),
  ('https://im8health.com/products/essentials-pro', 'CoQ10', 30, 'mg', 5, FALSE, NULL),
  ('https://im8health.com/products/essentials-pro', 'MSM', 500, 'mg', 6, FALSE, NULL),
  -- Daily Ultimate Longevity (Longevity Blend)
  ('https://im8health.com/products/longevity', 'NMN', 250, 'mg', 0, TRUE, NULL),
  ('https://im8health.com/products/longevity', 'Resveratrol', 150, 'mg', 1, FALSE, NULL),
  ('https://im8health.com/products/longevity', 'Spermidine', 1, 'mg', 2, FALSE, NULL),
  ('https://im8health.com/products/longevity', 'Quercetin', 250, 'mg', 3, FALSE, NULL),
  ('https://im8health.com/products/longevity', 'CoQ10', 100, 'mg', 4, FALSE, NULL),
  ('https://im8health.com/products/longevity', 'PQQ', 20, 'mg', 5, FALSE, NULL),
  ('https://im8health.com/products/longevity', 'Glutathione', 250, 'mg', 6, FALSE, NULL),
  -- Daily30 (Greens Powder)
  ('https://zoe.com/en-us/daily30', 'Prebiotic Fiber', 5, 'g', 0, TRUE, NULL),
  ('https://zoe.com/en-us/daily30', 'Psyllium Husk', 2, 'g', 1, FALSE, NULL),
  ('https://zoe.com/en-us/daily30', 'Reishi Mushroom', 500, 'mg', 2, FALSE, NULL),
  -- O.N.E. Multivitamin (Multivitamin)
  ('https://www.pureencapsulationspro.com/o-n-e-multivitamin.html', 'Vitamin C', 125, 'mg', 0, TRUE, NULL),
  ('https://www.pureencapsulationspro.com/o-n-e-multivitamin.html', 'Vitamin D3', 1000, 'IU', 1, FALSE, NULL),
  ('https://www.pureencapsulationspro.com/o-n-e-multivitamin.html', 'Vitamin K2', 45, 'mcg', 2, FALSE, NULL),
  ('https://www.pureencapsulationspro.com/o-n-e-multivitamin.html', 'Vitamin B12', 500, 'mcg', 3, FALSE, NULL),
  ('https://www.pureencapsulationspro.com/o-n-e-multivitamin.html', 'Folate', 667, 'mcg DFE', 4, FALSE, NULL),
  ('https://www.pureencapsulationspro.com/o-n-e-multivitamin.html', 'Biotin', 400, 'mcg', 5, FALSE, NULL),
  ('https://www.pureencapsulationspro.com/o-n-e-multivitamin.html', 'Zinc', 12.5, 'mg', 6, FALSE, NULL),
  ('https://www.pureencapsulationspro.com/o-n-e-multivitamin.html', 'Selenium', 100, 'mcg', 7, FALSE, NULL);

INSERT INTO product_ingredients (
  product_id, ingredient_supplement_id, amount, unit, order_index, is_primary, notes
)
SELECT
  p.product_id,
  s.supplement_id,
  seed.amount,
  seed.unit,
  seed.order_index,
  seed.is_primary,
  seed.notes
FROM product_ingredient_seed seed
JOIN products p ON p.product_url = seed.product_url
JOIN supplements s ON s.supplement_name = seed.ingredient_supplement_name
ON CONFLICT (product_id, ingredient_supplement_id) DO UPDATE
SET
  amount = EXCLUDED.amount,
  unit = EXCLUDED.unit,
  order_index = EXCLUDED.order_index,
  is_primary = EXCLUDED.is_primary,
  notes = EXCLUDED.notes;

-- ── Fallback backfill for existing single-active DB products (review #1) ─────
-- Every existing product that has NO composition row yet gets ONE unquantified
-- edge from its single supplement FK, so existing user stacks pointing at old
-- DB products keep appearing in ingredient intake (useStackIngredients reads
-- only product_ingredients). Mirrors the static single-ingredient fallback
-- (amount: null, unit: null, is_primary: true, order_index: 0).
--
-- Catch-all supplements are EXCLUDED BY NAME (ids are bridged SERIALs, not the
-- catalog 9000+ ids) so a catch-all product whose explicit composite rows did
-- not land this run does NOT get a lone fallback edge pointing at the very
-- catch-all supplement this feature exists to eliminate — it simply gets no
-- fallback this run and is healed later by the sync write.
INSERT INTO product_ingredients (
  product_id, ingredient_supplement_id, amount, unit, order_index, is_primary, notes
)
SELECT
  p.product_id,
  p.supplement_id,
  NULL,
  NULL,
  0,
  TRUE,
  NULL
FROM products p
WHERE p.supplement_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM product_ingredients pi
    WHERE pi.product_id = p.product_id
  )
  AND p.supplement_id NOT IN (
    SELECT supplement_id FROM supplements
    WHERE supplement_name IN (
      'Greens Powder',
      'Nootropic Formula',
      'Testosterone Support',
      'Multivitamin',
      'Longevity Blend'
    )
  )
ON CONFLICT (product_id, ingredient_supplement_id) DO NOTHING;
