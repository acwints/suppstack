-- Tracks purchase intent/session outcomes without requiring checkout completion webhooks.
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
