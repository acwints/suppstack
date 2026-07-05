-- ============================================================================
-- 0002 · Commerce (Shopify/UCP metadata + checkout session tracking)
-- Depends on 0001 (supplements, products).
-- ============================================================================

-- Shopify/UCP metadata on catalog rows.
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
  ADD COLUMN IF NOT EXISTS subscriptions_available BOOLEAN DEFAULT false,
  -- Review-system / API-sourcing metadata (previously added ad hoc).
  ADD COLUMN IF NOT EXISTS supplement_facts JSONB,
  ADD COLUMN IF NOT EXISTS amazon_asin VARCHAR(20),
  ADD COLUMN IF NOT EXISTS amazon_rating DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS amazon_review_count INTEGER,
  ADD COLUMN IF NOT EXISTS last_api_sync TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS data_source VARCHAR(50) DEFAULT 'manual';

CREATE INDEX IF NOT EXISTS idx_supplements_category ON supplements(category);
CREATE INDEX IF NOT EXISTS idx_products_commerce_channel ON products(commerce_channel);
CREATE INDEX IF NOT EXISTS idx_products_ucp_enabled ON products(ucp_enabled);
CREATE INDEX IF NOT EXISTS idx_products_shopify_variant_gid ON products(shopify_variant_gid);

-- ── Checkout session tracking ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commerce_checkout_events (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id TEXT,
  supplement_id INTEGER REFERENCES supplements(supplement_id) ON DELETE SET NULL,
  provider VARCHAR(60) NOT NULL,
  session_mode VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL,
  purchase_url TEXT,
  fallback_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commerce_checkout_events_product_id
  ON commerce_checkout_events(product_id);
CREATE INDEX IF NOT EXISTS idx_commerce_checkout_events_created_at
  ON commerce_checkout_events(created_at DESC);

-- This table is written only by the /api/commerce/checkout server route using
-- the service-role key (which bypasses RLS). Enabling & forcing RLS with no
-- policies denies all anon/authenticated access, so the event log cannot be
-- read or spammed by clients.
ALTER TABLE commerce_checkout_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE commerce_checkout_events FORCE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS shopify_merchant_capabilities (
  capability_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_domain VARCHAR(255) UNIQUE NOT NULL,
  origin TEXT,
  discovery_url TEXT,
  endpoint TEXT,
  capabilities JSONB DEFAULT '{}'::jsonb,
  tools JSONB DEFAULT '[]'::jsonb,
  ucp_status VARCHAR(60) DEFAULT 'unverified',
  checkout_status VARCHAR(60) DEFAULT 'unverified',
  last_error TEXT,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shopify_merchant_capabilities_status
  ON shopify_merchant_capabilities(ucp_status, checkout_status);
