-- Schema tightening (2026-07-08 rationalization pass)
--
-- 1. Drop dead tables: shopify_merchant_capabilities and review_images have
--    zero references anywhere in the application.
-- 2. Normalize users_products to a single owner column (user_id, matching
--    RLS's auth.uid() check) and drop columns the app never reads or writes.
--    This retires the multi-shape insert fallback in useProductInStack.
-- 3. Drop products columns that were only ever populated from the static
--    catalog objects, never from the database.
--
-- Kept deliberately:
-- - commerce_checkout_events: service-role analytics/audit sink for checkout.
-- - user_supplement_settings reminder columns: local notifications are a
--   planned feature; the schedule data is already collected.
-- Idempotent: safe to run on databases in any prior state.

-- 1. Dead tables ------------------------------------------------------------

DROP TABLE IF EXISTS review_images;
DROP TABLE IF EXISTS shopify_merchant_capabilities;

-- 2. users_products: single owner, membership-only ---------------------------

-- Backfill user_id from profile ownership before dropping profile_id.
UPDATE users_products up
SET user_id = p.user_id
FROM user_profiles p
WHERE up.user_id IS NULL
  AND up.profile_id = p.profile_id;

-- Rows with no resolvable owner are unreachable by any user; remove them.
DELETE FROM users_products WHERE user_id IS NULL;

-- Dedupe per (user_id, product_id) keeping the oldest row, so the new
-- unique constraint can be applied.
DELETE FROM users_products a
USING users_products b
WHERE a.user_id = b.user_id
  AND a.product_id = b.product_id
  AND a.created_at > b.created_at;

ALTER TABLE users_products
  DROP CONSTRAINT IF EXISTS users_products_profile_product_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_products_user_product_key'
  ) THEN
    ALTER TABLE users_products
      ADD CONSTRAINT users_products_user_product_key UNIQUE (user_id, product_id);
  END IF;
END;
$$;

ALTER TABLE users_products
  ALTER COLUMN user_id SET NOT NULL;

-- Drop every existing policy first: hosted databases carry differently-named
-- legacy policies, some of which depend on profile_id and would otherwise
-- block the column drop below.
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users_products'
  LOOP
    EXECUTE format('DROP POLICY %I ON users_products', pol.policyname);
  END LOOP;
END;
$$;

ALTER TABLE users_products
  DROP COLUMN IF EXISTS profile_id,
  DROP COLUMN IF EXISTS supplement_id,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS start_date,
  DROP COLUMN IF EXISTS end_date,
  DROP COLUMN IF EXISTS personal_rating,
  DROP COLUMN IF EXISTS personal_notes,
  DROP COLUMN IF EXISTS side_effects;

-- Recreate the single-owner policy.
ALTER TABLE users_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_products_owner" ON users_products
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. products: drop catalog-only columns -------------------------------------

ALTER TABLE products
  DROP COLUMN IF EXISTS amazon_asin,
  DROP COLUMN IF EXISTS amazon_rating,
  DROP COLUMN IF EXISTS amazon_review_count,
  DROP COLUMN IF EXISTS last_api_sync;
