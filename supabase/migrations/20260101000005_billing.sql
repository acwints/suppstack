-- ============================================================================
-- 0005 · Billing (premium subscription entitlements)
-- Depends on 0001 (auth.users via Supabase).
--
-- Subscriptions are sold through RevenueCat (Apple IAP in the iOS app,
-- RevenueCat Web Billing on the web). RevenueCat is the billing system of
-- record; this table is a mirror kept in sync by the
-- /api/billing/revenuecat webhook so the app can check premium status with
-- a plain RLS-protected query — no client billing SDK required on web.
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_entitlements (
  entitlement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Entitlement identifier as configured in RevenueCat (e.g. 'premium').
  entitlement VARCHAR(60) NOT NULL DEFAULT 'premium',

  -- active | trialing | cancelled | billing_issue | expired
  -- 'cancelled' means auto-renew is off but the paid period may still be
  -- running; access checks must also consult current_period_end.
  status VARCHAR(30) NOT NULL,

  -- app_store | play_store | stripe | rc_billing | promotional | unknown
  store VARCHAR(30) NOT NULL DEFAULT 'unknown',
  product_id VARCHAR(120),

  -- RevenueCat app_user_id (we configure clients so this equals user_id).
  rc_app_user_id VARCHAR(120),

  current_period_end TIMESTAMP WITH TIME ZONE,
  will_renew BOOLEAN NOT NULL DEFAULT false,

  -- Raw context from the most recent webhook event (event type, period type,
  -- environment) for debugging billing questions.
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (user_id, entitlement)
);

CREATE INDEX IF NOT EXISTS idx_user_entitlements_user_id
  ON user_entitlements(user_id);

-- Keep updated_at fresh on every webhook-driven upsert.
CREATE OR REPLACE FUNCTION update_user_entitlements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_entitlements_updated_at ON user_entitlements;
CREATE TRIGGER trigger_user_entitlements_updated_at
  BEFORE UPDATE ON user_entitlements
  FOR EACH ROW EXECUTE FUNCTION update_user_entitlements_updated_at();

-- RLS: users may read their own entitlement rows. All writes go through the
-- webhook route using the service-role key (which bypasses RLS) — clients
-- must never be able to grant themselves premium.
ALTER TABLE user_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_entitlements FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own entitlements" ON user_entitlements;
CREATE POLICY "Users can view own entitlements" ON user_entitlements
  FOR SELECT USING (auth.uid() = user_id);
