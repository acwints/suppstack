-- Adds first-class Shopify/UCP commerce metadata without breaking existing products.
-- Run in Supabase SQL editor after createTables.sql.

ALTER TABLE supplements
  ADD COLUMN IF NOT EXISTS aliases TEXT[],
  ADD COLUMN IF NOT EXISTS evidence_rating VARCHAR(20),
  ADD COLUMN IF NOT EXISTS primary_goals TEXT[],
  ADD COLUMN IF NOT EXISTS typical_forms TEXT[],
  ADD COLUMN IF NOT EXISTS common_dosage VARCHAR(255),
  ADD COLUMN IF NOT EXISTS product_count INTEGER,
  ADD COLUMN IF NOT EXISTS average_price DECIMAL(10,2);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS shopify_product_gid VARCHAR(255),
  ADD COLUMN IF NOT EXISTS shopify_variant_gid VARCHAR(255),
  ADD COLUMN IF NOT EXISTS shopify_store_domain VARCHAR(255),
  ADD COLUMN IF NOT EXISTS shopify_checkout_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS commerce_channel VARCHAR(40) DEFAULT 'official',
  ADD COLUMN IF NOT EXISTS ucp_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS inventory_status VARCHAR(40) DEFAULT 'in_stock',
  ADD COLUMN IF NOT EXISTS quality_badges TEXT[],
  ADD COLUMN IF NOT EXISTS subscriptions_available BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_supplements_category ON supplements(category);
CREATE INDEX IF NOT EXISTS idx_products_commerce_channel ON products(commerce_channel);
CREATE INDEX IF NOT EXISTS idx_products_ucp_enabled ON products(ucp_enabled);
CREATE INDEX IF NOT EXISTS idx_products_shopify_variant_gid ON products(shopify_variant_gid);
