-- ============================================================================
-- 0013 · Complete Wholesome Story backfill
-- Production did not have the Myo-Inositol and NAC supplement rows yet, so the
-- first Wholesome Story migration could only sync products whose supplement FK
-- already existed. This migration creates the missing supplement rows and
-- replays the skipped product sync idempotently.
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
    'Myo-Inositol',
    'Inositol form used for ovarian, metabolic, and insulin sensitivity support.',
    'https://cdn.shopify.com/s/files/1/0412/0094/3266/files/Myo_D120ctFrontPanelV.ARev12_25.png?v=1769496959',
    'Metabolic',
    ARRAY['inositol']::text[],
    'strong',
    ARRAY['Metabolic health', 'Hormonal support']::text[],
    ARRAY['Powder', 'Capsule']::text[],
    '2-4 g daily'
  ),
  (
    'NAC',
    'N-acetyl cysteine supports glutathione production and respiratory antioxidant defense.',
    'https://cdn.shopify.com/s/files/1/0412/0094/3266/files/NAC120front.png?v=1741732254',
    'Amino Acids',
    ARRAY['n-acetyl cysteine', 'n acetyl cysteine', 'nac n acetyl cysteine']::text[],
    'strong',
    ARRAY['Antioxidant support', 'Respiratory support']::text[],
    ARRAY['Capsule']::text[],
    '600-1200 mg daily'
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

CREATE TEMP TABLE IF NOT EXISTS wholesome_story_missing_products (
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

TRUNCATE wholesome_story_missing_products;

INSERT INTO wholesome_story_missing_products (
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
  ('Myo-Inositol & D-Chiro Inositol', 'Wholesome Story 40:1 myo-inositol and D-chiro inositol capsules for hormone, ovarian, reproductive, and metabolic-support routines.', 27.95, 'https://wholesomestory.com/products/myo-d-chiro-inositol', '', 'https://cdn.shopify.com/s/files/1/0412/0094/3266/files/Myo_D120ctFrontPanelV.ARev12_25.png?v=1769496959', 30, 1, 'Myo-Inositol', 'Wholesome Story', 'gid://shopify/Product/5334770155682', 'gid://shopify/ProductVariant/35171000254626', 'wholesomestory.com', 'shopify', true, 'in_stock', ARRAY['40:1 inositol', 'Verified merchant', '30 servings']::text[], true, 'official_page'),
  ('Inositol (Myo-Inositol)', 'Wholesome Story standalone myo-inositol capsules for hormone balance, ovarian health, and metabolic-support stacks.', 21.95, 'https://wholesomestory.com/products/pure-myo-inositol', '', 'https://cdn.shopify.com/s/files/1/0412/0094/3266/files/Inositol_Front_Panel_V.A_Rev_1_3_25.png?v=1742858533', 30, 1, 'Myo-Inositol', 'Wholesome Story', 'gid://shopify/Product/8158792220930', 'gid://shopify/ProductVariant/43871658443010', 'wholesomestory.com', 'shopify', true, 'in_stock', ARRAY['Myo-inositol', 'Verified merchant', '30 servings']::text[], true, 'official_page'),
  ('NAC (N-Acetyl-L-Cysteine)', 'Wholesome Story NAC capsules for antioxidant, glutathione, respiratory, and reproductive-wellness support routines.', 27.95, 'https://wholesomestory.com/products/nac', '', 'https://cdn.shopify.com/s/files/1/0412/0094/3266/files/NAC120front.png?v=1741732254', 120, 1, 'NAC', 'Wholesome Story', 'gid://shopify/Product/5531895890082', 'gid://shopify/ProductVariant/37004864979106', 'wholesomestory.com', 'shopify', true, 'in_stock', ARRAY['600 mg', 'Verified merchant', '120 servings']::text[], true, 'official_page');

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
FROM wholesome_story_missing_products incoming
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
FROM wholesome_story_missing_products incoming
JOIN supplements s ON s.supplement_name = incoming.supplement_name
JOIN brands b ON b.brand_name = incoming.brand_name
WHERE NOT EXISTS (
  SELECT 1
  FROM products existing
  WHERE existing.product_url = incoming.product_url
);

WITH affected_supplements AS (
  SELECT DISTINCT supplement_name
  FROM wholesome_story_missing_products
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
