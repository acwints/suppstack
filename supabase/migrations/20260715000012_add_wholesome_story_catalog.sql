-- ============================================================================
-- 0012 · Wholesome Story catalog coverage
-- Adds Wholesome Story as an official Shopify merchant and syncs its core
-- women-focused wellness products into canonical supplement families.
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
VALUES ('Wholesome Story', 'https://wholesomestory.com')
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
    'Vitex',
    'Chaste tree berry extract used in menstrual-cycle, PMS, and hormone-support routines.',
    'https://cdn.shopify.com/s/files/1/0412/0094/3266/products/Vitex-LG-Shopify.png?v=1671144704',
    'Women''s Health',
    ARRAY['chaste tree berry', 'chasteberry', 'vitex agnus castus']::text[],
    'moderate',
    ARRAY['Cycle regularity', 'Hormonal support']::text[],
    ARRAY['Capsule']::text[],
    'Use label serving guidance; commonly 1 capsule daily'
  ),
  (
    'Saw Palmetto',
    'Botanical used in hormone, urinary tract, and hair-support routines for women and men.',
    'https://cdn.shopify.com/s/files/1/0412/0094/3266/products/Saw-Palmetto-LG-Shopify.png?v=1671144681',
    'Women''s Health',
    ARRAY['serenoa repens']::text[],
    'moderate',
    ARRAY['Hormonal support', 'Hair support', 'Urinary tract support']::text[],
    ARRAY['Capsule']::text[],
    'Use label serving guidance; commonly 1 capsule daily'
  ),
  (
    'DIM',
    'Diindolylmethane formula used in estrogen-metabolism and hormone-support routines.',
    'https://cdn.shopify.com/s/files/1/0412/0094/3266/products/DIM-LG-Shopify.png?v=1671144588',
    'Women''s Health',
    ARRAY['diindolylmethane', 'broccoli seed extract', 'pomegranate extract']::text[],
    'emerging',
    ARRAY['Hormonal support', 'Antioxidant support']::text[],
    ARRAY['Capsule']::text[],
    'Use label serving guidance; commonly 1 capsule daily'
  ),
  (
    'Spearmint',
    'Spearmint leaf supplement used in hormone-support, digestive-comfort, and gentle daily wellness routines.',
    'https://cdn.shopify.com/s/files/1/0412/0094/3266/files/Spearmint_Front.png?v=1753384991',
    'Herbs & Adaptogens',
    ARRAY['mentha spicata', 'spearmint leaf']::text[],
    'emerging',
    ARRAY['Hormonal support', 'Digestive comfort']::text[],
    ARRAY['Capsule', 'Tea']::text[],
    'Use label serving guidance; commonly 1 serving daily'
  )
ON CONFLICT (supplement_name) DO UPDATE
SET
  supplement_description = EXCLUDED.supplement_description,
  image_url = EXCLUDED.image_url,
  category = EXCLUDED.category,
  aliases = EXCLUDED.aliases,
  evidence_rating = EXCLUDED.evidence_rating,
  primary_goals = EXCLUDED.primary_goals,
  typical_forms = EXCLUDED.typical_forms,
  common_dosage = EXCLUDED.common_dosage,
  updated_at = NOW();

CREATE TEMP TABLE IF NOT EXISTS wholesome_story_catalog_products (
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

TRUNCATE wholesome_story_catalog_products;

INSERT INTO wholesome_story_catalog_products (
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
  ('Berberine', 'Wholesome Story berberine HCl capsules for glucose, metabolic wellness, and healthy-weight support routines.', 34.95, 'https://wholesomestory.com/products/berberine', '', 'https://cdn.shopify.com/s/files/1/0412/0094/3266/files/3_df9be2c0-20e7-439b-b507-ac0c0971086e.png?v=1756926079', 90, 1, 'Berberine', 'Wholesome Story', 'gid://shopify/Product/5854458052770', 'gid://shopify/ProductVariant/46025540075778', 'wholesomestory.com', 'shopify', true, 'in_stock', ARRAY['500 mg', 'Verified merchant', '90 servings']::text[], true, 'official_page'),
  ('Ashwagandha', 'Wholesome Story vegan KSM-66 ashwagandha capsules for stress response, stamina, vitality, and calm-support routines.', 23.95, 'https://wholesomestory.com/products/ashwagandha', '', 'https://cdn.shopify.com/s/files/1/0412/0094/3266/files/9.png?v=1756927109', 60, 2, 'Ashwagandha', 'Wholesome Story', 'gid://shopify/Product/8107070095618', 'gid://shopify/ProductVariant/43841851359490', 'wholesomestory.com', 'shopify', true, 'in_stock', ARRAY['KSM-66', 'Verified merchant', '60 servings']::text[], true, 'official_page'),
  ('Magnesium Glycinate + Vitamin B6 + Zinc Picolinate', 'Wholesome Story magnesium glycinate blend with vitamin B6 and zinc picolinate for mineral, immune, and relaxation-support routines.', 27.95, 'https://wholesomestory.com/products/zinc-magnesium-vitamin-b6', '', 'https://cdn.shopify.com/s/files/1/0412/0094/3266/files/4_2f4cf985-e70d-4d47-be10-424cc52b368b.png?v=1756925707', 30, 1, 'Magnesium Glycinate', 'Wholesome Story', 'gid://shopify/Product/5854551638178', 'gid://shopify/ProductVariant/36742241517730', 'wholesomestory.com', 'shopify', true, 'in_stock', ARRAY['B6 + zinc', 'Verified merchant', '30 servings']::text[], true, 'official_page'),
  ('NAC (N-Acetyl-L-Cysteine)', 'Wholesome Story NAC capsules for antioxidant, glutathione, respiratory, and reproductive-wellness support routines.', 27.95, 'https://wholesomestory.com/products/nac', '', 'https://cdn.shopify.com/s/files/1/0412/0094/3266/files/NAC120front.png?v=1741732254', 120, 1, 'NAC', 'Wholesome Story', 'gid://shopify/Product/5531895890082', 'gid://shopify/ProductVariant/37004864979106', 'wholesomestory.com', 'shopify', true, 'in_stock', ARRAY['600 mg', 'Verified merchant', '120 servings']::text[], true, 'official_page'),
  ('Vitex (Chaste Tree Berry)', 'Wholesome Story organic chaste tree berry extract for cycle regularity, PMS, hormone, and reproductive-health support routines.', 25.95, 'https://wholesomestory.com/products/vitex-chaste-tree-berry', '', 'https://cdn.shopify.com/s/files/1/0412/0094/3266/products/Vitex-LG-Shopify.png?v=1671144704', 120, 1, 'Vitex', 'Wholesome Story', 'gid://shopify/Product/5500799484066', 'gid://shopify/ProductVariant/37004807209122', 'wholesomestory.com', 'shopify', true, 'in_stock', ARRAY['Chaste tree berry', 'Verified merchant', '120 servings']::text[], true, 'official_page'),
  ('Saw Palmetto', 'Wholesome Story saw palmetto capsules for hormone, reproductive, urinary-tract, and hair-support routines.', 27.95, 'https://wholesomestory.com/products/saw-palmetto', '', 'https://cdn.shopify.com/s/files/1/0412/0094/3266/products/Saw-Palmetto-LG-Shopify.png?v=1671144681', 100, 1, 'Saw Palmetto', 'Wholesome Story', 'gid://shopify/Product/5500813246626', 'gid://shopify/ProductVariant/35314501976226', 'wholesomestory.com', 'shopify', true, 'in_stock', ARRAY['500 mg', 'Verified merchant', '100 servings']::text[], true, 'official_page'),
  ('DIM with Pomegranate + Broccoli Seed Extract', 'Wholesome Story DIM formula with pomegranate, broccoli seed extract, and black pepper for hormone and antioxidant-support routines.', 27.95, 'https://wholesomestory.com/products/dim', '', 'https://cdn.shopify.com/s/files/1/0412/0094/3266/products/DIM-LG-Shopify.png?v=1671144588', 60, 1, 'DIM', 'Wholesome Story', 'gid://shopify/Product/7826743197954', 'gid://shopify/ProductVariant/43280630251778', 'wholesomestory.com', 'shopify', true, 'in_stock', ARRAY['150 mg DIM', 'Verified merchant', '60 servings']::text[], true, 'official_page'),
  ('Spearmint', 'Wholesome Story organic spearmint leaf capsules for hormone, digestive-comfort, and gentle daily wellness routines.', 27.95, 'https://wholesomestory.com/products/spearmint', '', 'https://cdn.shopify.com/s/files/1/0412/0094/3266/files/Spearmint_Front.png?v=1753384991', 30, 1, 'Spearmint', 'Wholesome Story', 'gid://shopify/Product/7943717290242', 'gid://shopify/ProductVariant/43549130326274', 'wholesomestory.com', 'shopify', true, 'in_stock', ARRAY['Organic leaf', 'Verified merchant', '30 servings']::text[], true, 'official_page');

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
FROM wholesome_story_catalog_products incoming
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
FROM wholesome_story_catalog_products incoming
JOIN supplements s ON s.supplement_name = incoming.supplement_name
JOIN brands b ON b.brand_name = incoming.brand_name
WHERE NOT EXISTS (
  SELECT 1
  FROM products existing
  WHERE existing.product_url = incoming.product_url
);

WITH affected_supplements AS (
  SELECT DISTINCT supplement_name
  FROM wholesome_story_catalog_products
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
