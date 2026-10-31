-- Public signup count and referral attribution.
--
-- Additive only. Apply on the Railway Postgres service, then confirm PostgREST
-- reloaded its schema (NOTIFY below). Both product flags stay off until this
-- has been applied.
--
-- The count reads auth.users through a security-definer function so anon can
-- see a number without a grant on auth.users. GoTrue v2.189.0 stores soft
-- deletes in auth.users.deleted_at; those rows are excluded. There is no seed
-- offset.
--
-- Codes are generated with gen_random_uuid(), which PostgreSQL 18 provides
-- without pgcrypto. This stack does not install the Supabase `extensions`
-- schema in migrations, so extensions.gen_random_bytes is not used.
--
-- RLS is enabled and not forced. The security-definer RPCs run as the table
-- owner and must bypass RLS to insert. Clients have no insert, update, or
-- delete grant and no write policy. Forcing RLS on a non-superuser owner
-- would make those RPCs fail.

BEGIN;

CREATE OR REPLACE FUNCTION public.signup_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT count(*)::bigint
  FROM auth.users
  WHERE deleted_at IS NULL;
$$;

REVOKE ALL ON FUNCTION public.signup_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.signup_count() TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.referral_codes (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT referral_codes_code_format CHECK (code ~ '^[a-z0-9]{6,12}$')
);

CREATE TABLE IF NOT EXISTS public.referrals (
  referred_user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT referrals_no_self_referral CHECK (referred_user_id <> referrer_user_id)
);

CREATE INDEX IF NOT EXISTS referrals_referrer_user_id_idx
  ON public.referrals (referrer_user_id);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS referral_codes_owner_select ON public.referral_codes;
CREATE POLICY referral_codes_owner_select
  ON public.referral_codes
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS referrals_referrer_select ON public.referrals;
CREATE POLICY referrals_referrer_select
  ON public.referrals
  FOR SELECT
  USING ((SELECT auth.uid()) = referrer_user_id);

REVOKE ALL ON TABLE public.referral_codes FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.referral_codes TO authenticated;

REVOKE ALL ON TABLE public.referrals FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.referrals TO authenticated;

CREATE OR REPLACE FUNCTION public.get_or_create_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v text;
  attempt integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT code INTO v
  FROM public.referral_codes
  WHERE user_id = auth.uid();
  IF v IS NOT NULL THEN
    RETURN v;
  END IF;

  FOR attempt IN 1..8 LOOP
    v := substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
    BEGIN
      INSERT INTO public.referral_codes (user_id, code)
      VALUES (auth.uid(), v);
      RETURN v;
    EXCEPTION WHEN unique_violation THEN
      SELECT code INTO v
      FROM public.referral_codes
      WHERE user_id = auth.uid();
      IF v IS NOT NULL THEN
        RETURN v;
      END IF;
    END;
  END LOOP;

  RAISE EXCEPTION 'could not allocate referral code';
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_referral_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_referral_code() TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_referral(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_referrer uuid;
  v_created timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  IF p_code IS NULL OR lower(p_code) !~ '^[a-z0-9]{6,12}$' THEN
    RETURN false;
  END IF;

  SELECT created_at INTO v_created
  FROM auth.users
  WHERE id = auth.uid();
  IF v_created IS NULL OR v_created < now() - interval '24 hours' THEN
    RETURN false;
  END IF;

  SELECT user_id INTO v_referrer
  FROM public.referral_codes
  WHERE code = lower(p_code);
  IF v_referrer IS NULL OR v_referrer = auth.uid() THEN
    RETURN false;
  END IF;

  INSERT INTO public.referrals (referred_user_id, referrer_user_id)
  VALUES (auth.uid(), v_referrer)
  ON CONFLICT DO NOTHING;

  RETURN found;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_referral(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_referral(text) TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
