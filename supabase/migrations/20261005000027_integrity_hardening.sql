-- Integrity and least-privilege hardening (2026-10-05 audit).
--
-- 1. Account deletion must remove every user-owned row. users_products (the
--    user's stack) and user_profiles had no foreign key to auth.users, so a
--    deleted account could leave its stack behind.
-- 2. One supplement log per product per day. Double taps created duplicates
--    that inflated completion; the client now treats a conflict as "already
--    logged".
-- 3. Client roles never need TRUNCATE/REFERENCES/TRIGGER, anon never writes,
--    and billing/checkout tables are written only by the service role.
-- 4. Drop a redundant unique constraint and index the remaining foreign keys.
--
-- Idempotent: safe to re-run.

BEGIN;

-- 1. Ownership foreign keys --------------------------------------------------

DELETE FROM public.users_products up
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = up.user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_products_user_id_fkey'
  ) THEN
    ALTER TABLE public.users_products
      ADD CONSTRAINT users_products_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_user_id_fkey'
  ) THEN
    DELETE FROM public.user_profiles p
    WHERE p.user_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.user_id);

    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. One log per product per day ---------------------------------------------

DELETE FROM public.supplement_logs l
USING public.supplement_logs keep
WHERE l.user_id = keep.user_id
  AND l.product_id = keep.product_id
  AND l.log_date = keep.log_date
  AND (l.logged_at, l.log_id) > (keep.logged_at, keep.log_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'supplement_logs_user_product_day_key'
  ) THEN
    ALTER TABLE public.supplement_logs
      ADD CONSTRAINT supplement_logs_user_product_day_key
      UNIQUE (user_id, product_id, log_date);
  END IF;
END $$;

-- 3. Least privilege -----------------------------------------------------------

REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.user_entitlements FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.commerce_checkout_events FROM authenticated;

-- 4. Redundant constraint and foreign-key indexes ------------------------------

ALTER TABLE public.users_products DROP CONSTRAINT IF EXISTS users_products_user_product_key;

CREATE INDEX IF NOT EXISTS users_products_product_id_idx ON public.users_products (product_id);
CREATE INDEX IF NOT EXISTS stack_supplements_supplement_id_idx ON public.stack_supplements (supplement_id);
CREATE INDEX IF NOT EXISTS products_brand_id_idx ON public.products (brand_id);
CREATE INDEX IF NOT EXISTS products_supplement_id_idx ON public.products (supplement_id);
CREATE INDEX IF NOT EXISTS product_reviews_profile_id_idx ON public.product_reviews (profile_id);
CREATE INDEX IF NOT EXISTS stack_likes_profile_id_idx ON public.stack_likes (profile_id);
CREATE INDEX IF NOT EXISTS review_votes_user_id_idx ON public.review_votes (user_id);
CREATE INDEX IF NOT EXISTS commerce_checkout_events_user_id_idx ON public.commerce_checkout_events (user_id);

COMMIT;
