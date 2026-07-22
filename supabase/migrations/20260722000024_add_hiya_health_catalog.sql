-- ============================================================================
-- 0024 · Hiya Health catalog coverage
-- Adds Hiya Health official kids supplement products and the one canonical
-- formula bucket needed to avoid misclassifying multi-ingredient immune sticks.
-- ============================================================================

ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS brand_website VARCHAR(500);

CREATE UNIQUE INDEX IF NOT EXISTS brands_brand_name_key
  ON brands (brand_name);

ALTER TABLE supplements
  ADD COLUMN IF NOT EXISTS aliases TEXT[],
  ADD COLUMN IF NOT EXISTS evidence_rating VARCHAR(20),
  ADD COLUMN IF NOT EXISTS primary_goals TEXT[],
  ADD COLUMN IF NOT EXISTS typical_forms TEXT[],
  ADD COLUMN IF NOT EXISTS common_dosage VARCHAR(255),
  ADD COLUMN IF NOT EXISTS product_count INTEGER,
  ADD COLUMN IF NOT EXISTS average_price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

INSERT INTO brands (brand_name, brand_website)
VALUES ('Hiya Health', 'https://hiyahealth.com')
ON CONFLICT (brand_name) DO UPDATE
SET brand_website = EXCLUDED.brand_website;

INSERT INTO supplements (
  supplement_name,
  supplement_description,
  image_url,
  category,
  aliases,
  evidence_rating,
  primary_goals,
  typical_forms,
  common_dosage
)
VALUES
  (
    'Prebiotic Fiber',
    'Fermentable fibers that feed beneficial gut microbes and support bowel regularity.',
    NULL,
    'Gut Health',
    ARRAY['inulin', 'fos', 'prebiotics']::text[],
    'strong',
    ARRAY['Gut health', 'Regularity']::text[],
    ARRAY['Powder', 'Gummy']::text[],
    '3-10 g daily'
  ),
  (
    'MCT Oil',
    'Medium-chain triglyceride oil used for quick dietary fat, ketogenic diets, and energy routines.',
    NULL,
    'Metabolic',
    ARRAY['medium chain triglycerides']::text[],
    'moderate',
    ARRAY['Ketogenic support', 'Energy']::text[],
    ARRAY['Oil', 'Powder']::text[],
    '1 tbsp daily as tolerated'
  ),
  (
    'Immune Support Formula',
    'Multi-ingredient immune formulas that combine vitamins, botanicals, prebiotics, or specialty ingredients for seasonal and daily immune-support routines.',
    'https://cdn.shopify.com/s/files/1/0255/3249/8001/files/immunesticks-productimage.png?v=1783534792',
    'Immune Support',
    ARRAY['immune formula', 'immune support blend', 'daily immune', 'immune sticks']::text[],
    'emerging',
    ARRAY['Immune support', 'Antioxidant support', 'Seasonal wellness']::text[],
    ARRAY['Chewable', 'Stick Pack', 'Powder']::text[],
    'Use label serving guidance'
  )
ON CONFLICT (supplement_name) DO UPDATE
SET
  supplement_description = EXCLUDED.supplement_description,
  image_url = COALESCE(supplements.image_url, EXCLUDED.image_url),
  category = EXCLUDED.category,
  aliases = EXCLUDED.aliases,
  evidence_rating = EXCLUDED.evidence_rating,
  primary_goals = EXCLUDED.primary_goals,
  typical_forms = EXCLUDED.typical_forms,
  common_dosage = EXCLUDED.common_dosage,
  updated_at = NOW();

CREATE TEMP TABLE IF NOT EXISTS hiya_health_catalog_products (
  product_name TEXT NOT NULL,
  product_description TEXT,
  product_price DECIMAL(10,2),
  product_url TEXT NOT NULL,
  amazon_url TEXT,
  product_image TEXT,
  servings_per_container INTEGER,
  servings_per_day INTEGER,
  supplement_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  shopify_product_gid TEXT,
  shopify_variant_gid TEXT,
  shopify_store_domain TEXT,
  commerce_channel TEXT,
  ucp_enabled BOOLEAN,
  inventory_status TEXT,
  quality_badges TEXT[],
  subscriptions_available BOOLEAN,
  data_source TEXT
) ON COMMIT DROP;

TRUNCATE hiya_health_catalog_products;

INSERT INTO hiya_health_catalog_products (
  product_name,
  product_description,
  product_price,
  product_url,
  amazon_url,
  product_image,
  servings_per_container,
  servings_per_day,
  supplement_name,
  brand_name,
  shopify_product_gid,
  shopify_variant_gid,
  shopify_store_domain,
  commerce_channel,
  ucp_enabled,
  inventory_status,
  quality_badges,
  subscriptions_available,
  data_source
)
VALUES
  ('Kids Daily Multivitamin', 'Hiya chewable kids multivitamin with 15+ essential vitamins and minerals for immunity, growth, development, focus, energy, and daily nutrient-gap support.', 15.00, 'https://hiyahealth.com/products/kids-daily-essential', '', 'https://cdn.shopify.com/s/files/1/0255/3249/8001/files/multi-productimage_1.jpg?v=1763742258', 30, 1, 'Multivitamin', 'Hiya Health', NULL, NULL, 'hiyahealth.com', 'official', false, 'in_stock', ARRAY['Kids 2-12', 'Official store', 'Zero added sugar']::text[], true, 'official_page'),
  ('Kids Daily Probiotic', 'Hiya chewable kids probiotic with 10 billion live cultures and prebiotic support for childhood immunity, gut health, digestion, and nutrient absorption.', 15.00, 'https://hiyahealth.com/products/kids-daily-probiotic', '', 'https://cdn.shopify.com/s/files/1/0255/3249/8001/files/probiotic_-_product_image.jpg?v=1769189543', 30, 1, 'Probiotics', 'Hiya Health', NULL, NULL, 'hiyahealth.com', 'official', false, 'in_stock', ARRAY['10B cultures', 'Official store', 'Kids 2+']::text[], true, 'official_page'),
  ('Kids Bedtime Essentials', 'Hiya melatonin-free nightly chewable for kids, built around L-theanine, GABA, chamomile, B6, calcium, and magnesium for calm, focus, relaxation, and bedtime routines.', 17.50, 'https://hiyahealth.com/products/kids-bedtime-essentials', '', 'https://cdn.shopify.com/s/files/1/0255/3249/8001/files/bedtime_-_product_image.jpg?v=1769186486', 30, 1, 'L-Theanine', 'Hiya Health', NULL, NULL, 'hiyahealth.com', 'official', false, 'in_stock', ARRAY['Melatonin-free', 'Official store', 'Kids 2-12']::text[], true, 'official_page'),
  ('Kids Daily Iron+', 'Hiya chewable carbonyl iron supplement with vitamin C for oxygen flow, brain function, muscle function, healthy development, and pediatric iron-support routines.', 15.00, 'https://hiyahealth.com/products/kids-daily-iron', '', 'https://cdn.shopify.com/s/files/1/0255/3249/8001/files/iron_-_product_image.jpg?v=1769716798', 30, 1, 'Iron', 'Hiya Health', NULL, NULL, 'hiyahealth.com', 'official', false, 'in_stock', ARRAY['Carbonyl iron', 'Official store', 'Kids 2-12']::text[], true, 'official_page'),
  ('Kids Daily Greens + Superfoods', 'Hiya chocolate greens powder for kids with 55 whole-food sourced ingredients positioned around growth, digestion, brain health, energy, development, and immune support.', 29.00, 'https://hiyahealth.com/products/kids-daily-greens', '', 'https://cdn.shopify.com/s/files/1/0255/3249/8001/files/greens_-_chocolate_-_product_image.jpg?v=1769716448', 30, 1, 'Greens Powder', 'Hiya Health', NULL, NULL, 'hiyahealth.com', 'official', false, 'in_stock', ARRAY['55 ingredients', 'Official store', 'Zero added sugar']::text[], true, 'official_page'),
  ('Kids Daily Hydration', 'Hiya clean hydration powder for kids with electrolytes, real fruit powders, Himalayan pink salt, vitamin C, minerals, and prebiotic fiber for water-mix routines.', 21.00, 'https://hiyahealth.com/products/kids-daily-hydration', '', 'https://cdn.shopify.com/s/files/1/0255/3249/8001/files/hydration_-_canister_-_product_image.jpg?v=1769721180', 30, 1, 'Electrolytes', 'Hiya Health', NULL, NULL, 'hiyahealth.com', 'official', false, 'in_stock', ARRAY['Electrolytes', 'Official store', 'Kids 2-12']::text[], true, 'official_page'),
  ('Kids Immune Sticks', 'Hiya kids immune stick packs with vitamin C, beta-glucans, elderberry, and a fruit-based immune blend for immune support, wellness, antioxidants, and gut-health routines.', 15.00, 'https://hiyahealth.com/products/kids-immune-sticks-3', '', 'https://cdn.shopify.com/s/files/1/0255/3249/8001/files/immunesticks-productimage.png?v=1783534792', 20, 1, 'Immune Support Formula', 'Hiya Health', NULL, NULL, 'hiyahealth.com', 'official', false, 'in_stock', ARRAY['Immune sticks', 'Official store', 'Zero added sugar']::text[], true, 'official_page'),
  ('Kids Daily Growth + Protein', 'Hiya kids protein powder with grass-fed whey protein isolate, amino acids, MCT oil, minerals, and prebiotic fiber for growth, nutrition gaps, and active kids.', 29.00, 'https://hiyahealth.com/products/kids-daily-protein', '', 'https://cdn.shopify.com/s/files/1/0255/3249/8001/files/protein_-_product_image_1.jpg?v=1778161500', 30, 1, 'Whey Protein', 'Hiya Health', NULL, NULL, 'hiyahealth.com', 'official', false, 'in_stock', ARRAY['Grass-fed whey', 'Official store', 'Kids 2-12']::text[], true, 'official_page'),
  ('Kids Daily Fiber+', 'Hiya kids fiber powder with a prebiotic fiber blend, psyllium husk, fruit powders, and Himalayan salt for regularity, digestive comfort, microbiome, and immune support.', 29.00, 'https://hiyahealth.com/products/kids-daily-fiber', '', 'https://cdn.shopify.com/s/files/1/0255/3249/8001/files/fiber_-_product_image.jpg?v=1771342848', 30, 1, 'Prebiotic Fiber', 'Hiya Health', NULL, NULL, 'hiyahealth.com', 'official', false, 'in_stock', ARRAY['Prebiotic fiber', 'Official store', 'Kids 2-12']::text[], true, 'official_page');

UPDATE products p
SET
  product_name = incoming.product_name,
  product_description = incoming.product_description,
  product_price = incoming.product_price,
  amazon_url = incoming.amazon_url,
  product_image = incoming.product_image,
  servings_per_container = incoming.servings_per_container,
  servings_per_day = incoming.servings_per_day,
  supplement_id = s.supplement_id,
  brand_id = b.brand_id,
  shopify_product_gid = incoming.shopify_product_gid,
  shopify_variant_gid = incoming.shopify_variant_gid,
  shopify_store_domain = incoming.shopify_store_domain,
  commerce_channel = incoming.commerce_channel,
  ucp_enabled = incoming.ucp_enabled,
  inventory_status = incoming.inventory_status,
  quality_badges = incoming.quality_badges,
  subscriptions_available = incoming.subscriptions_available,
  data_source = incoming.data_source
FROM hiya_health_catalog_products incoming
JOIN supplements s ON s.supplement_name = incoming.supplement_name
JOIN brands b ON b.brand_name = incoming.brand_name
WHERE p.product_url = incoming.product_url;

INSERT INTO products (
  product_name,
  product_description,
  product_price,
  product_url,
  amazon_url,
  product_image,
  servings_per_container,
  servings_per_day,
  supplement_id,
  brand_id,
  shopify_product_gid,
  shopify_variant_gid,
  shopify_store_domain,
  commerce_channel,
  ucp_enabled,
  inventory_status,
  quality_badges,
  subscriptions_available,
  data_source
)
SELECT
  incoming.product_name,
  incoming.product_description,
  incoming.product_price,
  incoming.product_url,
  incoming.amazon_url,
  incoming.product_image,
  incoming.servings_per_container,
  incoming.servings_per_day,
  s.supplement_id,
  b.brand_id,
  incoming.shopify_product_gid,
  incoming.shopify_variant_gid,
  incoming.shopify_store_domain,
  incoming.commerce_channel,
  incoming.ucp_enabled,
  incoming.inventory_status,
  incoming.quality_badges,
  incoming.subscriptions_available,
  incoming.data_source
FROM hiya_health_catalog_products incoming
JOIN supplements s ON s.supplement_name = incoming.supplement_name
JOIN brands b ON b.brand_name = incoming.brand_name
WHERE NOT EXISTS (
  SELECT 1
  FROM products existing
  WHERE existing.product_url = incoming.product_url
);

CREATE TEMP TABLE IF NOT EXISTS hiya_health_product_ingredients (
  product_url TEXT NOT NULL,
  ingredient_supplement_name TEXT NOT NULL,
  amount DECIMAL(10,2),
  unit TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  notes TEXT
) ON COMMIT DROP;

TRUNCATE hiya_health_product_ingredients;

INSERT INTO hiya_health_product_ingredients (
  product_url,
  ingredient_supplement_name,
  amount,
  unit,
  order_index,
  is_primary,
  notes
)
VALUES
  ('https://hiyahealth.com/products/kids-daily-essential', 'Multivitamin', NULL, NULL, 0, true, NULL),
  ('https://hiyahealth.com/products/kids-daily-probiotic', 'Probiotics', 10, 'billion CFU', 0, true, NULL),
  ('https://hiyahealth.com/products/kids-daily-probiotic', 'Prebiotic Fiber', NULL, NULL, 1, false, NULL),
  ('https://hiyahealth.com/products/kids-bedtime-essentials', 'L-Theanine', 50, 'mg', 0, true, NULL),
  ('https://hiyahealth.com/products/kids-bedtime-essentials', 'GABA', 5, 'mg', 1, false, NULL),
  ('https://hiyahealth.com/products/kids-daily-iron', 'Iron', NULL, NULL, 0, true, 'Carbonyl iron'),
  ('https://hiyahealth.com/products/kids-daily-iron', 'Vitamin C', NULL, NULL, 1, false, NULL),
  ('https://hiyahealth.com/products/kids-daily-greens', 'Greens Powder', NULL, NULL, 0, true, NULL),
  ('https://hiyahealth.com/products/kids-daily-hydration', 'Electrolytes', NULL, NULL, 0, true, NULL),
  ('https://hiyahealth.com/products/kids-daily-hydration', 'Prebiotic Fiber', NULL, NULL, 1, false, NULL),
  ('https://hiyahealth.com/products/kids-immune-sticks-3', 'Immune Support Formula', NULL, NULL, 0, true, NULL),
  ('https://hiyahealth.com/products/kids-immune-sticks-3', 'Vitamin C', 60, 'mg', 1, false, NULL),
  ('https://hiyahealth.com/products/kids-immune-sticks-3', 'Elderberry', 12.5, 'mg', 2, false, NULL),
  ('https://hiyahealth.com/products/kids-daily-protein', 'Whey Protein', NULL, NULL, 0, true, 'Grass-fed whey protein isolate'),
  ('https://hiyahealth.com/products/kids-daily-protein', 'Prebiotic Fiber', NULL, NULL, 1, false, NULL),
  ('https://hiyahealth.com/products/kids-daily-protein', 'MCT Oil', NULL, NULL, 2, false, NULL),
  ('https://hiyahealth.com/products/kids-daily-fiber', 'Prebiotic Fiber', NULL, NULL, 0, true, NULL),
  ('https://hiyahealth.com/products/kids-daily-fiber', 'Psyllium Husk', NULL, NULL, 1, false, NULL);

INSERT INTO product_ingredients (
  product_id,
  ingredient_supplement_id,
  amount,
  unit,
  order_index,
  is_primary,
  notes
)
SELECT
  p.product_id,
  s.supplement_id,
  ingredient.amount,
  ingredient.unit,
  ingredient.order_index,
  ingredient.is_primary,
  ingredient.notes
FROM hiya_health_product_ingredients ingredient
JOIN products p ON p.product_url = ingredient.product_url
JOIN supplements s ON s.supplement_name = ingredient.ingredient_supplement_name
ON CONFLICT (product_id, ingredient_supplement_id) DO UPDATE
SET
  amount = EXCLUDED.amount,
  unit = EXCLUDED.unit,
  order_index = EXCLUDED.order_index,
  is_primary = EXCLUDED.is_primary,
  notes = EXCLUDED.notes;

WITH affected_supplements AS (
  SELECT DISTINCT supplement_name
  FROM hiya_health_catalog_products
),
stats AS (
  SELECT
    s.supplement_id,
    COUNT(p.product_id)::integer AS product_count,
    ROUND(AVG(p.product_price), 2) AS average_price,
    (ARRAY_AGG(p.product_image ORDER BY p.product_id))[1] AS image_url
  FROM supplements s
  JOIN products p ON p.supplement_id = s.supplement_id
  WHERE s.supplement_name IN (SELECT supplement_name FROM affected_supplements)
  GROUP BY s.supplement_id
)
UPDATE supplements s
SET
  product_count = stats.product_count,
  average_price = stats.average_price,
  image_url = COALESCE(s.image_url, stats.image_url),
  updated_at = NOW()
FROM stats
WHERE s.supplement_id = stats.supplement_id;
