-- ============================================================================
-- 0014 · Colostrum, organ, and ready-to-drink protein brand coverage
-- Adds official Pioneer Pastures, David Protein, ARMRA, Cowboy Colostrum, and
-- Heart & Soil catalog rows plus the canonical supplement buckets needed to
-- classify them cleanly.
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
VALUES
  ('Pioneer Pastures', 'https://pioneerpastures.com'),
  ('David Protein', 'https://davidprotein.com'),
  ('ARMRA', 'https://armra.com'),
  ('Cowboy Colostrum', 'https://cowboycolostrum.com'),
  ('Heart & Soil', 'https://heartandsoil.co')
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
    'Protein Shakes',
    'Ready-to-drink protein shakes for closing daily protein gaps without a shaker, tub, or meal-prep step.',
    'https://cdn.shopify.com/s/files/1/0674/2402/6813/files/chocolateshake11oz15.jpg?v=1775244539',
    'Protein',
    ARRAY['ready-to-drink protein', 'rtd protein', 'protein drink', 'protein shake']::text[],
    'strong',
    ARRAY['Protein intake', 'Convenient nutrition']::text[],
    ARRAY['Ready-to-drink']::text[],
    '1 bottle as needed to meet protein targets'
  ),
  (
    'Colostrum',
    'Bovine colostrum powders, capsules, and sticks used for gut, immune, recovery, and whole-food nutrition routines.',
    'https://cdn.shopify.com/s/files/1/0291/1564/6027/files/armra-unflavored-travel-sticks-3369289.jpg?v=1765473636',
    'Foundational Nutrition',
    ARRAY['bovine colostrum', 'grass-fed colostrum', 'colostrum powder', 'first milk']::text[],
    'emerging',
    ARRAY['Gut support', 'Immune support', 'Recovery']::text[],
    ARRAY['Powder', 'Capsule', 'Stick Pack']::text[],
    'Use label serving guidance; commonly 1 serving daily'
  ),
  (
    'Organ Supplements',
    'Desiccated organ blends used as whole-food micronutrient support for energy, nutrient density, and targeted wellness routines.',
    'https://shop.heartandsoil.co/cdn/shop/files/HS-BO-Gallery-Photo1.png?v=1757691656&width=400',
    'Foundational Nutrition',
    ARRAY['beef organs', 'organ complex', 'liver capsules', 'desiccated organs']::text[],
    'emerging',
    ARRAY['Nutrient density', 'Energy metabolism', 'Daily essentials']::text[],
    ARRAY['Capsule']::text[],
    'Use label serving guidance; commonly 1 serving daily'
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

CREATE TEMP TABLE IF NOT EXISTS colostrum_organ_protein_catalog_products (
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

TRUNCATE colostrum_organ_protein_catalog_products;

INSERT INTO colostrum_organ_protein_catalog_products (
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
  ('Chocolate A2 Protein Shake', 'Pioneer Pastures ultra-filtered A2 dairy protein shake with 30g protein in a ready-to-drink bottle for convenient protein intake.', 3.49, 'https://pioneerpastures.com/products/a2-chocolate-protein-shake', '', 'https://cdn.shopify.com/s/files/1/0674/2402/6813/files/chocolateshake11oz15.jpg?v=1775244539', 1, 1, 'Protein Shakes', 'Pioneer Pastures', 'gid://shopify/Product/7908744691901', 'gid://shopify/ProductVariant/44619717542077', 'pioneerpastures.com', 'shopify', true, 'in_stock', ARRAY['30g protein', 'Verified merchant', 'A2 dairy']::text[], false, 'official_page'),
  ('Vanilla A2 Protein Shake', 'Pioneer Pastures ultra-filtered A2 dairy protein shake in vanilla for a single-serving protein option with a direct brand-store product page.', 3.49, 'https://pioneerpastures.com/products/a2-vanilla-protein-shake', '', 'https://cdn.shopify.com/s/files/1/0674/2402/6813/files/Vanillaproteinshake11oz22.jpg?v=1775244491', 1, 1, 'Protein Shakes', 'Pioneer Pastures', 'gid://shopify/Product/7908745314493', 'gid://shopify/ProductVariant/44619720786109', 'pioneerpastures.com', 'shopify', true, 'in_stock', ARRAY['30g protein', 'Verified merchant', 'A2 dairy']::text[], false, 'official_page'),
  ('David Protein Bar - Cake Batter', 'David Protein 12-bar carton with 28g protein, 150 calories, and 0g sugar per bar for portable protein routines.', 39.00, 'https://davidprotein.com/products/cake-batter-carton', '', 'https://cdn.shopify.com/s/files/1/0632/4741/7511/files/CB_Food_Imagery.png?v=1777414127', 12, 1, 'Protein Bars', 'David Protein', 'gid://shopify/Product/8468354105511', 'gid://shopify/ProductVariant/46575377088679', 'davidprotein.com', 'shopify', true, 'in_stock', ARRAY['28g protein', 'Verified merchant', '12 bars']::text[], true, 'official_page'),
  ('David Protein Bar - Blueberry Pie', 'David Protein 12-bar carton for shoppers comparing high-protein, no-sugar bars across flavors.', 39.00, 'https://davidprotein.com/products/blueberry-pie-carton', '', 'https://cdn.shopify.com/s/files/1/0632/4741/7511/files/BB_Food_Imagery.png?v=1777414960', 12, 1, 'Protein Bars', 'David Protein', 'gid://shopify/Product/8468353810599', 'gid://shopify/ProductVariant/46575376793767', 'davidprotein.com', 'shopify', true, 'in_stock', ARRAY['28g protein', 'Verified merchant', '12 bars']::text[], true, 'official_page'),
  ('David Protein Bar - Salted Peanut Butter', 'David Protein 12-bar carton in salted peanut butter for compact protein stacks and travel-friendly snack coverage.', 39.00, 'https://davidprotein.com/products/salted-peanut-butter-carton', '', 'https://cdn.shopify.com/s/files/1/0632/4741/7511/files/09_SaltedPB_Frontal_250616_final_2.jpg?v=1772504971', 12, 1, 'Protein Bars', 'David Protein', 'gid://shopify/Product/8468354203815', 'gid://shopify/ProductVariant/46575377186983', 'davidprotein.com', 'shopify', true, 'in_stock', ARRAY['28g protein', 'Verified merchant', '12 bars']::text[], true, 'official_page'),
  ('David Protein Bar - Chocolate Chip Cookie Dough', 'David Protein 12-bar carton in chocolate chip cookie dough for high-protein, low-sugar snack routines.', 39.00, 'https://davidprotein.com/products/chocolate-chip-cookie-dough-carton', '', 'https://cdn.shopify.com/s/files/1/0632/4741/7511/files/CCCD_Food_Imagery.png?v=1772504972', 12, 1, 'Protein Bars', 'David Protein', 'gid://shopify/Product/8468354007207', 'gid://shopify/ProductVariant/46575376990375', 'davidprotein.com', 'shopify', true, 'in_stock', ARRAY['28g protein', 'Verified merchant', '12 bars']::text[], true, 'official_page'),
  ('ARMRA Colostrum Unflavored Jar', 'ARMRA unflavored colostrum jar for daily gut, immune, and recovery-support routines with a neutral powder format.', 119.99, 'https://armra.com/products/armra-unflavored-jar', '', 'https://cdn.shopify.com/s/files/1/0291/1564/6027/files/armra-transformer-bundle-8192291.jpg?v=1776720022', 120, 1, 'Colostrum', 'ARMRA', 'gid://shopify/Product/7067202617522', 'gid://shopify/ProductVariant/43220908769502', 'armra.com', 'shopify', true, 'in_stock', ARRAY['Colostrum', 'Verified merchant', 'Jar']::text[], true, 'official_page'),
  ('ARMRA Colostrum Unflavored Travel Sticks', 'ARMRA unflavored colostrum travel sticks for portable daily colostrum routines without measuring a scoop.', 43.99, 'https://armra.com/products/armra-unflavored-travel-sticks', '', 'https://cdn.shopify.com/s/files/1/0291/1564/6027/files/armra-unflavored-travel-sticks-3369289.jpg?v=1765473636', 30, 1, 'Colostrum', 'ARMRA', 'gid://shopify/Product/4552344797259', 'gid://shopify/ProductVariant/43220918894814', 'armra.com', 'shopify', true, 'in_stock', ARRAY['Travel sticks', 'Verified merchant', 'Colostrum']::text[], true, 'official_page'),
  ('ARMRA Colostrum Soda Variety 12-Pack', 'ARMRA ready-to-drink colostrum soda variety pack for shoppers who want a functional beverage format rather than powder.', 49.99, 'https://armra.com/products/colostrum-soda-variety-pack', '', 'https://cdn.shopify.com/s/files/1/0291/1564/6027/files/armra-colostrum-soda-variety-12-pack-3340644.jpg?v=1776910401', 12, 1, 'Colostrum', 'ARMRA', 'gid://shopify/Product/9165732479198', 'gid://shopify/ProductVariant/48055144317150', 'armra.com', 'shopify', true, 'in_stock', ARRAY['12-pack', 'Verified merchant', 'Ready-to-drink']::text[], true, 'official_page'),
  ('Cowboy Colostrum - Vanilla', 'Cowboy Colostrum vanilla powder for a first-milking colostrum slot in gut, immune, skin, and recovery routines.', 69.00, 'https://cowboycolostrum.com/products/natures-gold-vanilla-colostrum', '', 'https://cdn.shopify.com/s/files/1/0776/8689/8983/files/Carousel.jpg?v=1774307342', 40, 1, 'Colostrum', 'Cowboy Colostrum', 'gid://shopify/Product/8888178082087', 'gid://shopify/ProductVariant/47279878275367', 'cowboycolostrum.com', 'shopify', true, 'in_stock', ARRAY['40 servings', 'Verified merchant', 'First-milking']::text[], true, 'official_page'),
  ('Cowboy Colostrum - Chocolate', 'Cowboy Colostrum chocolate powder for shoppers comparing flavored colostrum options from a direct brand store.', 69.00, 'https://cowboycolostrum.com/products/natures-gold-chocolate-colostrum', '', 'https://cdn.shopify.com/s/files/1/0776/8689/8983/files/Carousel_64155c3d-692e-46a6-963b-a23a0f211a76.jpg?v=1774307461', 40, 1, 'Colostrum', 'Cowboy Colostrum', 'gid://shopify/Product/9663891636519', 'gid://shopify/ProductVariant/49482209460519', 'cowboycolostrum.com', 'shopify', true, 'in_stock', ARRAY['40 servings', 'Verified merchant', 'First-milking']::text[], true, 'official_page'),
  ('Cowboy Colostrum - Unflavored', 'Cowboy Colostrum unflavored powder for a simple colostrum option that can mix into existing daily routines.', 69.00, 'https://cowboycolostrum.com/products/natures-gold-unflavored-colostrum', '', 'https://cdn.shopify.com/s/files/1/0776/8689/8983/files/Carousel_75dfb51c-8f27-4c17-a7d8-6d9bda6b93a6.jpg?v=1774914764', 40, 1, 'Colostrum', 'Cowboy Colostrum', 'gid://shopify/Product/8888178671911', 'gid://shopify/ProductVariant/47279884992807', 'cowboycolostrum.com', 'shopify', true, 'in_stock', ARRAY['40 servings', 'Verified merchant', 'First-milking']::text[], true, 'official_page'),
  ('Heart & Soil Beef Organs', 'Heart & Soil desiccated organ capsules made with liver, heart, pancreas, spleen, and kidney for whole-food nutrient support.', 52.00, 'https://shop.heartandsoil.co/products/beef-organs', '', 'https://shop.heartandsoil.co/cdn/shop/files/HS-BO-Gallery-Photo1.png?v=1757691656&width=400', 30, 1, 'Organ Supplements', 'Heart & Soil', NULL, NULL, 'shop.heartandsoil.co', 'official', false, 'in_stock', ARRAY['180 capsules', 'Official store', 'Informed Sport']::text[], true, 'official_page'),
  ('Heart & Soil Warrior', 'Heart & Soil Warrior combines grass-fed heart and liver capsules for energy, strength, performance, and recovery routines.', 50.00, 'https://shop.heartandsoil.co/products/warrior', '', 'https://shop.heartandsoil.co/cdn/shop/products/Warrior-1_e0f043d7-1eef-4143-ad89-919e9b52c225.png?v=1762198162&width=400', 30, 1, 'Organ Supplements', 'Heart & Soil', NULL, NULL, 'shop.heartandsoil.co', 'official', false, 'in_stock', ARRAY['Heart + liver', 'Official store', '180 capsules']::text[], true, 'official_page'),
  ('Heart & Soil Bone Marrow & Liver', 'Heart & Soil bone marrow and liver capsules for organ-based support across bone, connective tissue, skin, and vitality routines.', 50.00, 'https://shop.heartandsoil.co/products/bone-marrow-liver', '', 'https://shop.heartandsoil.co/cdn/shop/files/HS-BML-Gallery-Photo1.png?v=1762205549&width=400', 30, 1, 'Organ Supplements', 'Heart & Soil', NULL, NULL, 'shop.heartandsoil.co', 'official', false, 'in_stock', ARRAY['Bone marrow + liver', 'Official store', '180 capsules']::text[], true, 'official_page'),
  ('Heart & Soil Grass-Fed Colostrum', 'Heart & Soil free-form grass-fed colostrum powder with 60 servings for gut, immune, and exercise-recovery support routines.', 119.00, 'https://shop.heartandsoil.co/products/free-form-grass-fed-colostrum', '', 'https://shop.heartandsoil.co/cdn/shop/files/Heart_Soil_Colostrum.webp?v=1772120437&width=400', 60, 1, 'Colostrum', 'Heart & Soil', NULL, NULL, 'shop.heartandsoil.co', 'official', false, 'in_stock', ARRAY['60 servings', 'Official store', 'Grass-fed']::text[], true, 'official_page');

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
FROM colostrum_organ_protein_catalog_products incoming
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
FROM colostrum_organ_protein_catalog_products incoming
JOIN supplements s ON s.supplement_name = incoming.supplement_name
JOIN brands b ON b.brand_name = incoming.brand_name
WHERE NOT EXISTS (
  SELECT 1
  FROM products existing
  WHERE existing.product_url = incoming.product_url
);

WITH affected_supplements AS (
  SELECT DISTINCT supplement_name
  FROM colostrum_organ_protein_catalog_products
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
