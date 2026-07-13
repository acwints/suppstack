-- ============================================================================
-- 0009 · Major brand catalog coverage
-- Adds official Onnit, Thorne, AG1, IM8, and Momentous products plus the
-- supplement categories needed to classify them cleanly.
-- ============================================================================

ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS brand_website VARCHAR(500);

CREATE UNIQUE INDEX IF NOT EXISTS brands_brand_name_key
  ON brands (brand_name);

ALTER TABLE supplements
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

INSERT INTO brands (brand_name, brand_website)
VALUES
  ('Onnit', 'https://www.onnit.com'),
  ('Thorne', 'https://www.thorne.com'),
  ('AG1', 'https://drinkag1.com'),
  ('IM8', 'https://im8health.com'),
  ('Momentous', 'https://www.livemomentous.com')
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
    'Greens Powder',
    'Daily greens and all-in-one nutrition powders that combine vitamins, minerals, phytonutrients, probiotics, adaptogens, and superfood blends for broad nutrient-gap support.',
    'https://cdn.sanity.io/images/jf30o7wb/production/1d23d0d656b5a93a3abddce3429bfafae69f0dae-3600x2400.jpg?w=1920&auto=format',
    'Foundational Nutrition',
    ARRAY['greens', 'super greens', 'daily greens', 'athletic greens', 'all-in-one greens']::text[],
    'moderate',
    ARRAY['Daily essentials', 'Nutrient gaps', 'Gut health']::text[],
    ARRAY['Powder', 'Stick Pack']::text[],
    '1 serving daily'
  ),
  (
    'Nootropic Formula',
    'Multi-ingredient cognitive-support formulas built around focus, memory, attention, and mental-performance routines rather than a single standalone nootropic ingredient.',
    'https://cdn.shopify.com/s/files/1/0910/2901/2770/files/media_0d26030c-9e9b-40bd-82ae-df059b2ad547.png?v=1773124741',
    'Brain & Focus',
    ARRAY['nootropic blend', 'cognitive support', 'focus formula', 'alpha brain']::text[],
    'emerging',
    ARRAY['Focus', 'Memory', 'Mental performance']::text[],
    ARRAY['Capsule', 'Gummy', 'Drink Mix']::text[],
    'Use label serving guidance'
  ),
  (
    'Magnesium L-Threonate',
    'A magnesium form often positioned for sleep quality, relaxation, and cognitive support because magnesium L-threonate is designed to support brain magnesium levels.',
    'https://cdn.shopify.com/s/files/1/1400/2351/files/V3_Magnesium-L-Threonate-Bottle_2000x2000_07142025.png?v=1757606826',
    'Minerals',
    ARRAY['magnesium threonate', 'magtein']::text[],
    'moderate',
    ARRAY['Sleep quality', 'Cognitive support', 'Relaxation']::text[],
    ARRAY['Capsule']::text[],
    'Use label serving guidance; commonly 1.5-2 g magnesium L-threonate daily'
  ),
  (
    'Longevity Blend',
    'Healthy-aging formulas that combine nutrients, botanicals, and specialty ingredients for cellular health, recovery, mitochondrial support, and long-range wellness routines.',
    'https://im8health.com/cdn/shop/files/long-up.png?v=1760704215&width=400',
    'Longevity',
    ARRAY['longevity formula', 'healthy aging blend', 'cellular health blend']::text[],
    'emerging',
    ARRAY['Healthy aging', 'Cellular health', 'Recovery']::text[],
    ARRAY['Powder', 'Capsule']::text[],
    '1 serving daily as directed'
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

CREATE TEMP TABLE IF NOT EXISTS major_brand_catalog_products (
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

TRUNCATE major_brand_catalog_products;

INSERT INTO major_brand_catalog_products (
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
  ('Alpha BRAIN 90 Count', 'Onnit capsule nootropic for focus, memory, mental processing speed, and caffeine-free cognitive support routines.', 79.95, 'https://www.onnit.com/products/alpha-brain-90-ct', '', 'https://cdn.shopify.com/s/files/1/0910/2901/2770/files/media_0d26030c-9e9b-40bd-82ae-df059b2ad547.png?v=1773124741', 45, 1, 'Nootropic Formula', 'Onnit', 'gid://shopify/Product/9718274392354', 'gid://shopify/ProductVariant/49885392503074', 'www.onnit.com', 'shopify', true, 'in_stock', ARRAY['Caffeine-free', 'Verified merchant', '90 count']::text[], true, 'manual'),
  ('Alpha BRAIN Neuro Gummies', 'Onnit cognitive-support gummies for shoppers who want Alpha BRAIN support in a portable, citrus-punch gummy format.', 24.99, 'https://www.onnit.com/products/alpha-brain-neuro-gummies-90-ct', '', 'https://cdn.shopify.com/s/files/1/0910/2901/2770/files/media_533d6cb7-1e4b-4b45-90fe-3174d15feb5c.png?v=1781110783', 45, 1, 'Nootropic Formula', 'Onnit', 'gid://shopify/Product/9718307815714', 'gid://shopify/ProductVariant/49885535666466', 'www.onnit.com', 'shopify', true, 'in_stock', ARRAY['Gummy format', 'Verified merchant', 'Brain support']::text[], true, 'manual'),
  ('Total Human 30 Day Supply', 'Onnit day-and-night supplement packs positioned as an all-in-one daily wellness routine with vitamins, minerals, omega-3s, herbs, and amino acids.', 137.95, 'https://www.onnit.com/products/total-human-30-day-supply', '', 'https://cdn.shopify.com/s/files/1/0910/2901/2770/files/05-Hero-TH_f54b302c-489d-4573-8bc7-88452e5f77d1.png?v=1752620710', 30, 1, 'Multivitamin', 'Onnit', NULL, NULL, 'www.onnit.com', 'official', false, 'in_stock', ARRAY['Day + night packs', 'Verified merchant', '30 days']::text[], true, 'official_page'),
  ('Onnit Creatine Monohydrate', 'Onnit creatine monohydrate powder for strength, power, muscle recovery, and daily performance routines.', 14.99, 'https://www.onnit.com/products/creatine-unflavored-30-serving-tub', '', 'https://cdn.shopify.com/s/files/1/0910/2901/2770/files/03-hero-Creatine-new.png?v=1766002606', 30, 1, 'Creatine Monohydrate', 'Onnit', NULL, NULL, 'www.onnit.com', 'official', false, 'in_stock', ARRAY['Creatine mono', 'Verified merchant', '30 servings']::text[], true, 'official_page'),
  ('Grass Fed Whey Isolate Vanilla', 'Onnit grass-fed whey isolate with 20 g protein per serving for recovery, lean protein intake, and post-workout shakes.', 59.95, 'https://www.onnit.com/products/grass-fed-whey-isolate-protein-vanilla-30-serving-tub', '', 'https://cdn.shopify.com/s/files/1/0910/2901/2770/files/Onnit-Shopify-Flavor-Option-Assets-whey.png?v=1754342263', 30, 1, 'Whey Protein', 'Onnit', NULL, NULL, 'www.onnit.com', 'official', false, 'in_stock', ARRAY['20g protein', 'Verified merchant', 'Grass-fed whey']::text[], true, 'official_page'),
  ('Onnit MCT Oil', 'Onnit coconut-sourced MCT oil for ketogenic routines, quick dietary fat, and brain/body fuel.', 24.95, 'https://www.onnit.com/products/mct-oil-24-fl-oz', '', 'https://cdn.shopify.com/s/files/1/0910/2901/2770/files/03-Hero-MCT.png?v=1770694328', 47, 1, 'MCT Oil', 'Onnit', NULL, NULL, 'www.onnit.com', 'official', false, 'in_stock', ARRAY['Coconut MCTs', 'Verified merchant', '47 servings']::text[], true, 'official_page'),
  ('Basic Nutrients 2/Day - NSF Certified for Sport', 'Thorne two-capsule multivitamin with broad daily micronutrient coverage and NSF Certified for Sport positioning.', 40, 'https://www.thorne.com/products/dp/basic-nutrients-2-day', '', 'https://d1vo8zfysxy97v.cloudfront.net/media/product/vm2__v22fab5aec14f3a11312849c9781a5ef32c69c8d4.png', 30, 1, 'Multivitamin', 'Thorne', NULL, NULL, 'www.thorne.com', 'official', false, 'in_stock', ARRAY['NSF Certified', 'Verified merchant', 'Daily multi']::text[], true, 'official_api'),
  ('Magnesium Bisglycinate', 'Thorne magnesium bisglycinate powder for gentle magnesium support, muscle function, relaxation, and sleep-adjacent routines.', 52, 'https://www.thorne.com/products/dp/magnesium-bisglycinate', '', 'https://d1vo8zfysxy97v.cloudfront.net/media/product/m204__v4276839dcfb0dd565beb88920a98df340c4ecb91.png', 60, 1, 'Magnesium Glycinate', 'Thorne', NULL, NULL, 'www.thorne.com', 'official', false, 'in_stock', ARRAY['Bisglycinate', 'Verified merchant', 'Powder format']::text[], true, 'official_api'),
  ('Creatine - 90 Servings', 'Thorne creatine monohydrate powder for strength, power, lean mass, and high-intensity training support.', 44, 'https://www.thorne.com/products/dp/creatine', '', 'https://d1vo8zfysxy97v.cloudfront.net/media/product/sf903__ve8382489c6ce9fb7f28cdddef00e6f1ece146591.png', 90, 1, 'Creatine Monohydrate', 'Thorne', NULL, NULL, 'www.thorne.com', 'official', false, 'in_stock', ARRAY['90 servings', 'Verified merchant', 'Creatine mono']::text[], true, 'official_api'),
  ('Vitamin D + K2 Liquid', 'Thorne liquid vitamin D3 plus K2 for bone, immune, and cardiovascular-support routines.', 34, 'https://www.thorne.com/products/dp/vitamin-d-k2-liquid', '', 'https://d1vo8zfysxy97v.cloudfront.net/media/product/kd500__v1f2f6991180c90d1d7e83b441748f077d3d853d8.png', 30, 1, 'Vitamin D3', 'Thorne', NULL, NULL, 'www.thorne.com', 'official', false, 'in_stock', ARRAY['D3 + K2', 'Verified merchant', 'Liquid drops']::text[], true, 'official_api'),
  ('Super EPA - NSF Certified for Sport', 'Thorne fish oil softgels with EPA and DHA for heart, brain, eye, and inflammatory-balance support.', 45, 'https://www.thorne.com/products/dp/super-epa', '', 'https://d1vo8zfysxy97v.cloudfront.net/media/product/sp608__v85ffd3158c5fcd199d35f8f66966125217d62306.png', 60, 1, 'Omega-3 Fish Oil', 'Thorne', NULL, NULL, 'www.thorne.com', 'official', false, 'in_stock', ARRAY['NSF Certified', 'Verified merchant', 'EPA + DHA']::text[], true, 'official_api'),
  ('Berberine', 'Thorne berberine supplement for metabolic wellness routines and glucose-support stacks.', 44, 'https://www.thorne.com/products/dp/berberine-500', '', 'https://d1vo8zfysxy97v.cloudfront.net/media/product/sf800__vd424273289116ed602cb97bcef5ca314e2b9ff03.png', 60, 1, 'Berberine', 'Thorne', NULL, NULL, 'www.thorne.com', 'official', false, 'in_stock', ARRAY['500 mg', 'Verified merchant', 'Metabolic support']::text[], true, 'official_api'),
  ('NAC - N-Acetylcysteine - 90 Servings', 'Thorne NAC for glutathione support, respiratory wellness, and antioxidant routines.', 33, 'https://www.thorne.com/products/dp/cysteplus-reg', '', 'https://d1vo8zfysxy97v.cloudfront.net/media/product/sa560__v9249e43d5234140b60ada72238c5fb10f53ee558.png', 90, 1, 'NAC', 'Thorne', NULL, NULL, 'www.thorne.com', 'official', false, 'in_stock', ARRAY['90 servings', 'Verified merchant', 'Antioxidant support']::text[], true, 'official_api'),
  ('Stress B-Complex', 'Thorne B-complex formula for energy metabolism, nervous-system support, and stress-support routines.', 26, 'https://www.thorne.com/products/dp/stress-b-complex', '', 'https://d1vo8zfysxy97v.cloudfront.net/media/product/b107__v5dabbd1393b8a7ff4f391f3839b63fa757822234.png', 60, 1, 'B-Complex', 'Thorne', NULL, NULL, 'www.thorne.com', 'official', false, 'in_stock', ARRAY['B vitamins', 'Verified merchant', 'Stress support']::text[], true, 'official_api'),
  ('AG1 Next Gen Pouch', 'AG1 daily health drink combining a multivitamin, prebiotics, probiotics, superfoods, antioxidants, and phytonutrients in one greens powder.', 99, 'https://drinkag1.com/products/greens-powder-pouch', '', 'https://cdn.sanity.io/images/jf30o7wb/production/1d23d0d656b5a93a3abddce3429bfafae69f0dae-3600x2400.jpg?w=1920&auto=format', 30, 1, 'Greens Powder', 'AG1', NULL, NULL, 'drinkag1.com', 'official', false, 'in_stock', ARRAY['75+ ingredients', 'Verified merchant', 'NSF Certified']::text[], true, 'official_page'),
  ('AG Vitamin D3+K2', 'AG1 liquid vitamin D3 plus K2 drops for immune, bone, and cardiovascular-support routines.', 29, 'https://drinkag1.com/products/vitamin-d3-k2-liquid', '', 'https://cdn.sanity.io/images/jf30o7wb/production/f3b082a4011edc45d4f461b5f09155327e2c561b-1125x750.png?w=1125&auto=format', 600, 1, 'Vitamin D3', 'AG1', NULL, NULL, 'drinkag1.com', 'official', false, 'in_stock', ARRAY['D3 + K2', 'Verified merchant', '600 servings']::text[], true, 'official_page'),
  ('Daily Ultimate Essentials Pro', 'IM8 all-in-one daily drink with vitamins, minerals, antioxidants, greens, prebiotics, probiotics, postbiotics, CoQ10, and MSM.', 112, 'https://im8health.com/products/essentials-pro', '', 'https://im8health.com/cdn/shop/files/essjar-up.png?v=1770960975&width=400', 30, 1, 'Greens Powder', 'IM8', NULL, NULL, 'im8health.com', 'official', false, 'in_stock', ARRAY['90 ingredients', 'Verified merchant', 'All-in-one']::text[], true, 'official_page'),
  ('Daily Ultimate Longevity', 'IM8 healthy-aging formula positioned around cellular health, recovery, and the hallmarks of aging.', 119, 'https://im8health.com/products/longevity', '', 'https://im8health.com/cdn/shop/files/long-up.png?v=1760704215&width=400', 30, 1, 'Longevity Blend', 'IM8', NULL, NULL, 'im8health.com', 'official', false, 'in_stock', ARRAY['NSF Certified', 'Verified merchant', 'Longevity']::text[], true, 'official_page'),
  ('Magnesium L-Threonate', 'Momentous Magtein magnesium L-threonate capsules for sleep quality, relaxation, and cognitive-support routines.', 49.95, 'https://www.livemomentous.com/products/magnesium-threonate', '', 'https://cdn.shopify.com/s/files/1/1400/2351/files/V3_Magnesium-L-Threonate-Bottle_2000x2000_07142025.png?v=1757606826', 30, 1, 'Magnesium L-Threonate', 'Momentous', NULL, NULL, 'www.livemomentous.com', 'official', false, 'in_stock', ARRAY['Magtein', 'Verified merchant', '30 servings']::text[], true, 'official_page'),
  ('L-Theanine', 'Momentous L-theanine capsules for relaxation, mental clarity, and stress-response support without sedation.', 39.95, 'https://www.livemomentous.com/products/l-theanine', '', 'https://cdn.shopify.com/s/files/1/1400/2351/files/L-Theanine_HERO.png?v=1776802571', 60, 1, 'L-Theanine', 'Momentous', NULL, NULL, 'www.livemomentous.com', 'official', false, 'in_stock', ARRAY['200 mg', 'Verified merchant', '60 servings']::text[], true, 'official_page'),
  ('Omega-3', 'Momentous omega-3 softgels with EPA and DHA for heart, brain, joint, and inflammatory-balance support.', 39.95, 'https://www.livemomentous.com/products/omega-3', '', 'https://cdn.shopify.com/s/files/1/1400/2351/files/Omega3_HERO_Jar.png?v=1776803640', 30, 1, 'Omega-3 Fish Oil', 'Momentous', NULL, NULL, 'www.livemomentous.com', 'official', false, 'in_stock', ARRAY['EPA + DHA', 'Verified merchant', '30 servings']::text[], true, 'official_page'),
  ('Collagen Peptides', 'Momentous collagen peptides powder with vitamin C for skin, joint, tendon, ligament, and connective-tissue support.', 51.95, 'https://www.livemomentous.com/products/collagen-peptides', '', 'https://cdn.shopify.com/s/files/1/1400/2351/files/Collagen_HERO_Jar_1.png?v=1776800578', 30, 1, 'Collagen Peptides', 'Momentous', NULL, NULL, 'www.livemomentous.com', 'official', false, 'in_stock', ARRAY['15g collagen', 'Verified merchant', 'Vitamin C']::text[], true, 'official_page');

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
FROM major_brand_catalog_products incoming
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
FROM major_brand_catalog_products incoming
JOIN supplements s ON s.supplement_name = incoming.supplement_name
JOIN brands b ON b.brand_name = incoming.brand_name
WHERE NOT EXISTS (
  SELECT 1
  FROM products existing
  WHERE existing.product_url = incoming.product_url
);

WITH affected_supplements AS (
  SELECT DISTINCT supplement_name
  FROM major_brand_catalog_products
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
