-- ============================================================================
-- 0015 · Requested brand catalog coverage
-- Adds first-party rows for BPN, Four Sigmatic, Ancestral Supplements, Dose
-- Daily, Maui Nui Venison, Sports Research, Vital Proteins, Nutrafol, ZOE,
-- Seed, and Pure Encapsulations. Existing Thorne, Jocko Fuel, and Double Wood
-- brand records are refreshed here without duplicating their product rows.
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
  ('Bare Performance Nutrition', 'https://www.bareperformancenutrition.com'),
  ('Four Sigmatic', 'https://us.foursigmatic.com'),
  ('Ancestral Supplements', 'https://ancestralsupplements.com'),
  ('ZOE', 'https://zoe.com'),
  ('Thorne', 'https://www.thorne.com'),
  ('Dose Daily', 'https://dosedaily.co'),
  ('Maui Nui Venison', 'https://mauinuivenison.com'),
  ('Jocko Fuel', 'https://jockofuel.com'),
  ('Pure Encapsulations', 'https://www.pureencapsulations.com'),
  ('Sports Research', 'https://www.sportsresearch.com'),
  ('Double Wood Supplements', 'https://doublewoodsupplements.com'),
  ('Nutrafol', 'https://nutrafol.com'),
  ('Vital Proteins', 'https://www.vitalproteins.com'),
  ('Seed', 'https://seed.com')
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
    'Functional Coffee',
    'Coffee-based supplement blends that pair caffeine with functional mushrooms, protein, creatine, collagen, or adaptogens for focus and daily routine support.',
    'https://cdn.shopify.com/s/files/1/0739/9341/files/protein-coffee-shop-all.jpg?v=1778590828',
    'Brain & Focus',
    ARRAY['mushroom coffee', 'protein coffee', 'functional mushroom coffee']::text[],
    'emerging',
    ARRAY['Focus', 'Protein intake', 'Daily ritual']::text[],
    ARRAY['Instant coffee', 'Ground coffee', 'Packets']::text[],
    'Use label serving guidance; commonly 1 serving daily'
  ),
  (
    'Liver Support Formula',
    'Multi-ingredient liver support formulas positioned around antioxidant defense, detoxification pathways, and daily liver-health routines.',
    'https://cdn.shopify.com/s/files/1/0348/3317/0477/files/2_1.png?v=1762198055',
    'Foundational Nutrition',
    ARRAY['liver support', 'liver formula', 'liver shot']::text[],
    'emerging',
    ARRAY['Liver support', 'Antioxidant support']::text[],
    ARRAY['Liquid', 'Capsule', 'Shot']::text[],
    'Use label serving guidance'
  ),
  (
    'Hair Growth Formula',
    'Multi-ingredient nutraceutical formulas positioned around hair growth, hair quality, shedding, and scalp-support routines.',
    'https://images.ctfassets.net/0rbfqd9c4jdo/6EvJn3QjASCPmZae2ArFDw/0306ce2e515782a80f11d9d738007614/WOM1_6.png',
    'Beauty',
    ARRAY['hair growth supplement', 'hair formula', 'hair wellness']::text[],
    'moderate',
    ARRAY['Hair support', 'Beauty support']::text[],
    ARRAY['Capsule']::text[],
    'Use label serving guidance; commonly 1 serving daily'
  ),
  (
    'Velvet Antler',
    'Deer velvet antler capsules used in traditional and performance-oriented routines for recovery, joint comfort, and vitality positioning.',
    'https://cdn.shopify.com/s/files/1/0276/7205/1852/files/Maui_Nui_Velvet_Antler_Supplements.jpg?v=1778278608',
    'Performance',
    ARRAY['deer velvet', 'antler velvet', 'velvet antler capsules']::text[],
    'emerging',
    ARRAY['Recovery', 'Joint comfort', 'Vitality']::text[],
    ARRAY['Capsule']::text[],
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

CREATE TEMP TABLE IF NOT EXISTS requested_brand_catalog_products (
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

TRUNCATE requested_brand_catalog_products;

INSERT INTO requested_brand_catalog_products (
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
  ('Grass-Fed Whey Protein Isolate', 'Bare Performance Nutrition whey isolate for shoppers comparing clean protein tubs, flavor choices, and direct brand-store refills.', 64.99, 'https://www.bareperformancenutrition.com/products/whey-protein-isolate', '', 'https://cdn.shopify.com/s/files/1/1103/4864/files/BPNGFWPI-VN-1_PRINT_JR_A_001_1.jpg?v=1773682535&width=900&height=900&crop=pad&pad_color=ffffff', 27, 1, 'Whey Protein', 'Bare Performance Nutrition', 'gid://shopify/Product/8494120665260', 'gid://shopify/ProductVariant/45523069042860', 'www.bareperformancenutrition.com', 'shopify', true, 'in_stock', ARRAY['Whey isolate', 'Verified merchant', 'BPN']::text[], true, 'manual'),
  ('Whey Protein', 'Bare Performance Nutrition whey protein powder for straightforward daily protein intake, training recovery, and brand-store refills.', 54.99, 'https://www.bareperformancenutrition.com/products/whey-protein-powder', '', 'https://cdn.shopify.com/s/files/1/1103/4864/files/WHEY_PROTEIN_Vanilla_Render_V01_BPNWPC-VN-9.png?v=1784150924&width=900&height=900&crop=pad&pad_color=ffffff', 27, 1, 'Whey Protein', 'Bare Performance Nutrition', 'gid://shopify/Product/10273783430', 'gid://shopify/ProductVariant/32564500791376', 'www.bareperformancenutrition.com', 'shopify', true, 'in_stock', ARRAY['Whey protein', 'Verified merchant', '27 servings']::text[], true, 'official_page'),
  ('G.1.M Sport', 'Bare Performance Nutrition electrolyte and carbohydrate drink mix for hydration, endurance sessions, and sweat-heavy training days.', 39.99, 'https://www.bareperformancenutrition.com/products/g-1-m-sport', '', 'https://cdn.shopify.com/s/files/1/1103/4864/files/G1M_SPORT_LL_Render_V01.jpg?v=1781907818&width=900&height=900&crop=pad&pad_color=ffffff', 25, 1, 'Electrolytes', 'Bare Performance Nutrition', 'gid://shopify/Product/4621102153808', 'gid://shopify/ProductVariant/43914834084012', 'www.bareperformancenutrition.com', 'shopify', true, 'in_stock', ARRAY['Hydration', 'Verified merchant', '25 servings']::text[], true, 'official_page'),
  ('Protein Coffee', 'Four Sigmatic protein coffee combining coffee, protein, creatine, collagen, and lion''s mane for a supplement routine built around a daily cup.', 30.00, 'https://us.foursigmatic.com/products/protein-coffee', '', 'https://cdn.shopify.com/s/files/1/0739/9341/files/protein-coffee-shop-all.jpg?v=1778590828&width=900&height=900&crop=pad&pad_color=ffffff', 10, 1, 'Functional Coffee', 'Four Sigmatic', 'gid://shopify/Product/8290307604516', 'gid://shopify/ProductVariant/44173288341540', 'us.foursigmatic.com', 'shopify', true, 'in_stock', ARRAY['Protein coffee', 'Verified merchant', '10 servings']::text[], true, 'official_page'),
  ('Original Mushroom Coffee', 'Four Sigmatic instant mushroom coffee for shoppers who want a lighter-caffeine functional coffee option with lion''s mane and chaga.', 50.00, 'https://us.foursigmatic.com/products/original-mushroom-coffee', '', 'https://cdn.shopify.com/s/files/1/0739/9341/files/ogm-instant-ms-shopall-2026.jpg?v=1777676911&width=900&height=900&crop=pad&pad_color=ffffff', 30, 1, 'Functional Coffee', 'Four Sigmatic', 'gid://shopify/Product/7804649799716', 'gid://shopify/ProductVariant/42124742754340', 'us.foursigmatic.com', 'shopify', true, 'in_stock', ARRAY['Mushroom coffee', 'Verified merchant', '30 servings']::text[], true, 'official_page'),
  ('Grass Fed Beef Liver', 'Ancestral Supplements grass-fed beef liver capsules for whole-food micronutrient density, energy-metabolism, and liver-based organ support.', 38.00, 'https://ancestralsupplements.com/products/grassfed-beef-liver-supplement-1', '', 'https://cdn.shopify.com/s/files/1/0310/6373/6457/files/BeefLivertransperant.png?v=1767031993&width=900&height=900&crop=pad&pad_color=ffffff', 30, 1, 'Organ Supplements', 'Ancestral Supplements', 'gid://shopify/Product/4502685548681', 'gid://shopify/ProductVariant/31925296595081', 'ancestralsupplements.com', 'shopify', true, 'in_stock', ARRAY['Beef liver', 'Verified merchant', 'Grass-fed']::text[], true, 'official_page'),
  ('Grass Fed Beef Organs', 'Ancestral Supplements beef organ complex with liver, heart, kidney, pancreas, and spleen for organ-based daily essentials.', 48.00, 'https://ancestralsupplements.com/products/grass-fed-beef-organs-liver-heart-kidney-pancreas-spleen-1', '', 'https://cdn.shopify.com/s/files/1/0310/6373/6457/files/BeefOrgansTranspertant.png?v=1767032316&width=900&height=900&crop=pad&pad_color=ffffff', 30, 1, 'Organ Supplements', 'Ancestral Supplements', 'gid://shopify/Product/4502684860553', 'gid://shopify/ProductVariant/31925295972489', 'ancestralsupplements.com', 'shopify', true, 'in_stock', ARRAY['Organ complex', 'Verified merchant', 'Grass-fed']::text[], true, 'official_page'),
  ('Grass Fed Beef Colostrum Jar', 'Ancestral Supplements grass-fed beef colostrum powder for gut, immune, and recovery-support routines.', 68.00, 'https://ancestralsupplements.com/products/grass-fed-beef-colostrum-jar', '', 'https://cdn.shopify.com/s/files/1/0310/6373/6457/files/Colostrum_jar_powder.png?v=1762199631&width=900&height=900&crop=pad&pad_color=ffffff', 30, 1, 'Colostrum', 'Ancestral Supplements', 'gid://shopify/Product/7812811096201', 'gid://shopify/ProductVariant/43988572307593', 'ancestralsupplements.com', 'shopify', true, 'in_stock', ARRAY['Colostrum', 'Verified merchant', 'Grass-fed']::text[], true, 'official_page'),
  ('Grass Fed Beef Living Collagen', 'Ancestral Supplements living collagen capsules for shoppers comparing collagen support in a whole-food capsule format.', 58.00, 'https://ancestralsupplements.com/products/grass-fed-collagen-by-ancestral-supplements-1', '', 'https://cdn.shopify.com/s/files/1/0310/6373/6457/files/LivingCollagenTransperant.png?v=1767037809&width=900&height=900&crop=pad&pad_color=ffffff', 30, 1, 'Collagen Peptides', 'Ancestral Supplements', 'gid://shopify/Product/4502685253769', 'gid://shopify/ProductVariant/31925296332937', 'ancestralsupplements.com', 'shopify', true, 'in_stock', ARRAY['Living collagen', 'Verified merchant', 'Grass-fed']::text[], true, 'official_page'),
  ('Dose for your Liver', 'Dose Daily liver-support shot with a clinically positioned liquid format for daily liver, antioxidant, and detoxification-pathway routines.', 90.00, 'https://dosedaily.co/products/dose-for-your-liver-new', '', 'https://cdn.shopify.com/s/files/1/0348/3317/0477/files/2_1.png?v=1762198055&width=900&height=900&crop=pad&pad_color=ffffff', 24, 1, 'Liver Support Formula', 'Dose Daily', 'gid://shopify/Product/9446557483249', 'gid://shopify/ProductVariant/47713478672625', 'dosedaily.co', 'shopify', true, 'in_stock', ARRAY['Liver support', 'Verified merchant', 'Liquid shot']::text[], true, 'official_page'),
  ('Wild Harvested Axis Deer Organ Blend Supplement', 'Maui Nui Venison axis deer organ blend capsules for nutrient-dense organ support from wild-harvested venison.', 69.00, 'https://mauinuivenison.com/products/organ-blend-supplement', '', 'https://cdn.shopify.com/s/files/1/0276/7205/1852/files/Maui_Nui_Organ_Blend_Supplement.jpg?v=1778278413&width=900&height=900&crop=pad&pad_color=ffffff', 30, 1, 'Organ Supplements', 'Maui Nui Venison', NULL, NULL, 'mauinuivenison.com', 'official', false, 'in_stock', ARRAY['Axis deer organs', 'Official store', 'Wild harvested']::text[], true, 'official_page'),
  ('Wild Harvested Velvet Antler Capsules', 'Maui Nui Venison velvet antler capsules for shoppers comparing recovery, joint comfort, and vitality-oriented traditional supplements.', 99.00, 'https://mauinuivenison.com/products/velvet-antler-capsules', '', 'https://cdn.shopify.com/s/files/1/0276/7205/1852/files/Maui_Nui_Velvet_Antler_Supplements.jpg?v=1778278608&width=900&height=900&crop=pad&pad_color=ffffff', 30, 1, 'Velvet Antler', 'Maui Nui Venison', NULL, NULL, 'mauinuivenison.com', 'official', false, 'in_stock', ARRAY['Velvet antler', 'Official store', 'Wild harvested']::text[], true, 'official_page'),
  ('Hydrate Electrolytes Jar', 'Sports Research electrolyte powder for hydration, training, and daily mineral-support routines.', 39.95, 'https://www.sportsresearch.com/products/hydrate-electrolytes-jar', '', 'https://cdn.shopify.com/s/files/1/1813/6377/files/sr_web_render_fg370a_hydrate_jar_cherry_pomegranate_front_medium_7327b4b9-c55e-4f95-9b45-dbd4b0156333.png?v=1769631560&width=900&height=900&crop=pad&pad_color=ffffff', 40, 1, 'Electrolytes', 'Sports Research', NULL, NULL, 'www.sportsresearch.com', 'official', false, 'in_stock', ARRAY['Electrolytes', 'Official store', 'Hydration']::text[], true, 'official_page'),
  ('Colostrum Powder', 'Sports Research colostrum powder for gut, immune, and daily foundational nutrition routines.', 53.95, 'https://www.sportsresearch.com/products/colostrum-powder', '', 'https://cdn.shopify.com/s/files/1/1813/6377/files/sr_web_render_fg502a_colostrum_front_medium_9ee1b3af-9a62-4fe5-9b5d-be68b00cb4e3.png?v=1782255339&width=900&height=900&crop=pad&pad_color=ffffff', 30, 1, 'Colostrum', 'Sports Research', NULL, NULL, 'www.sportsresearch.com', 'official', false, 'in_stock', ARRAY['Colostrum powder', 'Official store', 'Gut support']::text[], true, 'official_page'),
  ('Vitamin D3 + K2 Supplement', 'Sports Research vitamin D3 plus K2 softgels for bone, immune, and cardiovascular-support routines.', 23.95, 'https://www.sportsresearch.com/products/vitamin-d3-k2', '', 'https://cdn.shopify.com/s/files/1/1813/6377/files/sr_web_render_fg218_d3_k2_front_medium_8bf76316-42d5-493f-ab5e-5aadfb7cc797.png?v=1778270249&width=900&height=900&crop=pad&pad_color=ffffff', 60, 1, 'Vitamin D3', 'Sports Research', NULL, NULL, 'www.sportsresearch.com', 'official', false, 'in_stock', ARRAY['D3 + K2', 'Official store', 'Bone support']::text[], true, 'official_page'),
  ('Collagen Peptides - Unflavored', 'Vital Proteins unflavored collagen peptides powder for skin, joint, and daily protein-adjacent collagen routines.', 27.00, 'https://www.vitalproteins.com/products/vp-collagen-peptides', '', 'https://cdn.shopify.com/s/files/1/2074/9385/files/1_HERO_CP10_Paper.jpg?v=1762971264&width=900&height=900&crop=pad&pad_color=ffffff', 14, 1, 'Collagen Peptides', 'Vital Proteins', 'gid://shopify/Product/7275207983288', 'gid://shopify/ProductVariant/42163184828600', 'www.vitalproteins.com', 'shopify', true, 'in_stock', ARRAY['Collagen peptides', 'Verified merchant', 'Unflavored']::text[], true, 'official_page'),
  ('Collagen Peptides Advanced', 'Vital Proteins collagen peptides with hyaluronic acid and vitamin C for skin, joint, and connective-tissue routines.', 29.99, 'https://www.vitalproteins.com/products/collagen-peptides', '', 'https://cdn.shopify.com/s/files/1/2074/9385/files/1_Hero_CPAdvanced10oz.png?v=1762272485&width=900&height=900&crop=pad&pad_color=ffffff', 14, 1, 'Collagen Peptides', 'Vital Proteins', 'gid://shopify/Product/10668353350', 'gid://shopify/ProductVariant/31900889153596', 'www.vitalproteins.com', 'shopify', true, 'in_stock', ARRAY['Hyaluronic acid', 'Verified merchant', 'Vitamin C']::text[], true, 'official_page'),
  ('Advanced Collagen Peptides + Colostrum + Prebiotic Fiber', 'Vital Proteins collagen, colostrum, and prebiotic fiber powder for gut, immune, and connective-tissue support routines.', 35.99, 'https://www.vitalproteins.com/products/advanced-collagen-colostrum-fiber', '', 'https://cdn.shopify.com/s/files/1/2074/9385/files/1_HERO_CPACLPF_1.jpg?v=1775767160&width=900&height=900&crop=pad&pad_color=ffffff', 14, 1, 'Colostrum', 'Vital Proteins', 'gid://shopify/Product/10259121668280', 'gid://shopify/ProductVariant/52993422590136', 'www.vitalproteins.com', 'shopify', true, 'in_stock', ARRAY['Collagen + colostrum', 'Verified merchant', 'Prebiotic fiber']::text[], true, 'official_page'),
  ('Nutrafol Core for Women', 'Nutrafol Core for Women hair-growth nutraceutical for shoppers comparing clinically positioned hair-support formulas.', 79.00, 'https://nutrafol.com/hair/women/product/core/women/', '', 'https://images.ctfassets.net/0rbfqd9c4jdo/6EvJn3QjASCPmZae2ArFDw/0306ce2e515782a80f11d9d738007614/WOM1_6.png', 30, 1, 'Hair Growth Formula', 'Nutrafol', NULL, NULL, 'nutrafol.com', 'official', false, 'in_stock', ARRAY['Hair support', 'Official store', '30 days']::text[], true, 'official_page'),
  ('Daily30', 'ZOE Daily30 whole-food plant powder with more than 30 plants for broad daily nutrition, gut-health, and food-diversity routines.', 65.00, 'https://zoe.com/en-us/daily30', '', 'https://www.datocms-assets.com/46938/1707578289-prebiotics-hero-gallery-1.png?auto=format&crop=focalpoint&fit=crop&h=630&q=75&w=1200', 30, 1, 'Greens Powder', 'ZOE', NULL, NULL, 'zoe.com', 'official', false, 'in_stock', ARRAY['30 plants', 'Official store', '30 servings']::text[], true, 'official_page'),
  ('DS-01 Daily Synbiotic', 'Seed daily probiotic and prebiotic synbiotic with 24 strains for digestive regularity, bloating, and gut-health routines.', 49.99, 'https://seed.com/daily-synbiotic', '', 'https://cdn.shopify.com/s/files/1/0929/7828/2785/files/Seed-2025_Come-To-Life-10_61789_A1_9677175888583194_adfc05e2-4481-41dc-8cf6-60295842a55e_1440x.png?v=1773682244&width=900&height=900&crop=pad&pad_color=ffffff', 30, 1, 'Probiotics', 'Seed', NULL, NULL, 'seed.com', 'official', false, 'in_stock', ARRAY['Synbiotic', 'Official store', '24 strains']::text[], true, 'official_page'),
  ('O.N.E. Multivitamin', 'Pure Encapsulations once-daily multivitamin with broad micronutrient coverage for daily foundational routines.', 25.00, 'https://www.pureencapsulationspro.com/o-n-e-multivitamin.html', '', 'https://cdn.shopify.com/s/files/1/0283/6145/7698/files/ONE3-1.png?v=1721824248&width=900&height=900&crop=pad&pad_color=ffffff', 30, 1, 'Multivitamin', 'Pure Encapsulations', NULL, NULL, 'www.pureencapsulations.com', 'official', false, 'in_stock', ARRAY['Once daily', 'Official store', 'Hypoallergenic']::text[], true, 'official_page'),
  ('Magnesium Glycinate', 'Pure Encapsulations magnesium glycinate for mineral support, muscle function, cardiovascular function, and gentle daily magnesium routines.', 27.00, 'https://www.pureencapsulationspro.com/magnesium-glycinate.html', '', 'https://cdn.shopify.com/s/files/1/0283/6145/7698/files/MG9_P0QLPLAV_ISP_01.jpg?v=1770048462&width=900&height=900&crop=pad&pad_color=ffffff', 90, 1, 'Magnesium Glycinate', 'Pure Encapsulations', NULL, NULL, 'www.pureencapsulations.com', 'official', false, 'in_stock', ARRAY['Glycinate', 'Official store', 'Vegan']::text[], true, 'official_page'),
  ('Digestive Enzymes Ultra', 'Pure Encapsulations vegetarian digestive enzyme blend for protein, carbohydrate, fat, fiber, and dairy digestion support.', 38.00, 'https://www.pureencapsulationspro.com/digestive-enzymes-ultra.html', '', 'https://cdn.shopify.com/s/files/1/0283/6145/7698/files/DEU9-1.png?v=1721824342&width=900&height=900&crop=pad&pad_color=ffffff', 45, 1, 'Digestive Enzymes', 'Pure Encapsulations', NULL, NULL, 'www.pureencapsulations.com', 'official', false, 'in_stock', ARRAY['Vegetarian enzymes', 'Official store', 'Digestive support']::text[], true, 'official_page');

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
FROM requested_brand_catalog_products incoming
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
FROM requested_brand_catalog_products incoming
JOIN supplements s ON s.supplement_name = incoming.supplement_name
JOIN brands b ON b.brand_name = incoming.brand_name
WHERE NOT EXISTS (
  SELECT 1
  FROM products existing
  WHERE existing.product_url = incoming.product_url
);

WITH affected_supplements AS (
  SELECT DISTINCT supplement_name
  FROM requested_brand_catalog_products
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
