-- ============================================================================
-- 0025 · Repair Hiya Health catalog support rows
-- Ensures the hosted database has the canonical supplement rows needed by the
-- Hiya Health product and composition inserts after 0024 has already run.
-- ============================================================================

ALTER TABLE supplements
  ADD COLUMN IF NOT EXISTS aliases TEXT[],
  ADD COLUMN IF NOT EXISTS evidence_rating VARCHAR(20),
  ADD COLUMN IF NOT EXISTS primary_goals TEXT[],
  ADD COLUMN IF NOT EXISTS typical_forms TEXT[],
  ADD COLUMN IF NOT EXISTS common_dosage VARCHAR(255),
  ADD COLUMN IF NOT EXISTS product_count INTEGER,
  ADD COLUMN IF NOT EXISTS average_price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

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

CREATE TEMP TABLE IF NOT EXISTS hiya_health_fiber_product (
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

TRUNCATE hiya_health_fiber_product;

INSERT INTO hiya_health_fiber_product (
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
VALUES (
  'Kids Daily Fiber+',
  'Hiya kids fiber powder with a prebiotic fiber blend, psyllium husk, fruit powders, and Himalayan salt for regularity, digestive comfort, microbiome, and immune support.',
  29.00,
  'https://hiyahealth.com/products/kids-daily-fiber',
  '',
  'https://cdn.shopify.com/s/files/1/0255/3249/8001/files/fiber_-_product_image.jpg?v=1771342848',
  30,
  1,
  'Prebiotic Fiber',
  'Hiya Health',
  NULL,
  NULL,
  'hiyahealth.com',
  'official',
  false,
  'in_stock',
  ARRAY['Prebiotic fiber', 'Official store', 'Kids 2-12']::text[],
  true,
  'official_page'
);

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
FROM hiya_health_fiber_product incoming
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
FROM hiya_health_fiber_product incoming
JOIN supplements s ON s.supplement_name = incoming.supplement_name
JOIN brands b ON b.brand_name = incoming.brand_name
WHERE NOT EXISTS (
  SELECT 1
  FROM products existing
  WHERE existing.product_url = incoming.product_url
);

WITH composition(product_url, ingredient_supplement_name, amount, unit, order_index, is_primary, notes) AS (
  VALUES
    ('https://hiyahealth.com/products/kids-daily-probiotic', 'Prebiotic Fiber', NULL::numeric, NULL::text, 1, false, NULL::text),
    ('https://hiyahealth.com/products/kids-daily-hydration', 'Prebiotic Fiber', NULL::numeric, NULL::text, 1, false, NULL::text),
    ('https://hiyahealth.com/products/kids-daily-protein', 'Prebiotic Fiber', NULL::numeric, NULL::text, 1, false, NULL::text),
    ('https://hiyahealth.com/products/kids-daily-protein', 'MCT Oil', NULL::numeric, NULL::text, 2, false, NULL::text),
    ('https://hiyahealth.com/products/kids-daily-fiber', 'Prebiotic Fiber', NULL::numeric, NULL::text, 0, true, NULL::text),
    ('https://hiyahealth.com/products/kids-daily-fiber', 'Psyllium Husk', NULL::numeric, NULL::text, 1, false, NULL::text)
)
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
  composition.amount,
  composition.unit,
  composition.order_index,
  composition.is_primary,
  composition.notes
FROM composition
JOIN products p ON p.product_url = composition.product_url
JOIN supplements s ON s.supplement_name = composition.ingredient_supplement_name
ON CONFLICT (product_id, ingredient_supplement_id) DO UPDATE
SET
  amount = EXCLUDED.amount,
  unit = EXCLUDED.unit,
  order_index = EXCLUDED.order_index,
  is_primary = EXCLUDED.is_primary,
  notes = EXCLUDED.notes;

WITH affected AS (
  SELECT unnest(ARRAY[
    'Prebiotic Fiber',
    'MCT Oil',
    'Probiotics',
    'Electrolytes',
    'Whey Protein'
  ]) AS supplement_name
),
stats AS (
  SELECT
    s.supplement_id,
    COUNT(p.product_id)::integer AS product_count,
    ROUND(AVG(p.product_price), 2) AS average_price,
    (ARRAY_AGG(p.product_image ORDER BY p.product_id))[1] AS image_url
  FROM supplements s
  JOIN products p ON p.supplement_id = s.supplement_id
  WHERE s.supplement_name IN (SELECT supplement_name FROM affected)
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
