-- Expand phase for private account-profile storage.
--
-- Rollout order:
--   1. Apply this additive migration. Existing clients continue to work.
--   2. Deploy the web client that uses the account-profile RPCs.
--   3. After the remote client has converged, add/apply a contract migration
--      that performs a final backfill, removes the compatibility trigger and
--      legacy private columns, and narrows user_profiles grants.
--
-- The staged rollout matters because the Capacitor app remotely loads the web
-- client; database and client releases cannot be switched atomically.

-- One authenticated person must own at most one profile. Do not guess how to
-- merge duplicates because profile IDs are referenced by stacks, reviews,
-- likes, and follows; stop with a useful preflight error instead.
DO $$
BEGIN
  IF EXISTS (
    SELECT user_id
    FROM public.user_profiles
    WHERE user_id IS NOT NULL
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot enforce one profile per user: duplicate user_profiles.user_id values exist'
      USING HINT = 'Resolve duplicate profile ownership and its foreign-key references before retrying migration 0026.';
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_user_id_unique
  ON public.user_profiles (user_id)
  WHERE user_id IS NOT NULL;

-- Public identity remains in user_profiles so existing foreign keys and
-- PostgREST embedded relationships stay intact. Optional body/account details
-- move behind an owner-only Interface.
CREATE TABLE IF NOT EXISTS public.user_private_profiles (
  profile_id UUID PRIMARY KEY
    REFERENCES public.user_profiles(profile_id) ON DELETE CASCADE,
  user_id UUID NOT NULL UNIQUE
    REFERENCES auth.users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender VARCHAR(30),
  height NUMERIC(5,2),
  weight NUMERIC(6,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT user_private_profiles_height_range
    CHECK (height IS NULL OR height BETWEEN 30 AND 300),
  CONSTRAINT user_private_profiles_weight_range
    CHECK (weight IS NULL OR weight BETWEEN 1 AND 1000)
);

ALTER TABLE public.user_private_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_private_profiles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_private_profiles_owner" ON public.user_private_profiles;
CREATE POLICY "user_private_profiles_owner"
  ON public.user_private_profiles
  FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- The private table is reachable only through the authenticated RPCs below.
-- RLS remains as defense in depth for future server-side Adapters.
REVOKE ALL ON TABLE public.user_private_profiles FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.user_private_profiles TO service_role;

-- Preserve questionable legacy values for manual review rather than silently
-- coercing them. A clear preflight failure is safer than a partial backfill.
DO $$
DECLARE
  v_has_invalid_measurement BOOLEAN := false;
BEGIN
  IF (
    SELECT COUNT(*) = 2
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name IN ('height', 'weight')
  ) THEN
    EXECUTE $validation$
      SELECT EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE (height IS NOT NULL AND (height < 30 OR height > 300))
           OR (weight IS NOT NULL AND (weight < 1 OR weight > 1000))
      )
    $validation$
    INTO v_has_invalid_measurement;
  END IF;

  IF v_has_invalid_measurement THEN
    RAISE EXCEPTION 'Cannot backfill private profiles: height or weight is outside the supported range'
      USING HINT = 'Review legacy profile measurements before retrying migration 0026; no values were changed.';
  END IF;
END;
$$;

-- Dynamic SQL lets the same guarded backfill pattern be reused safely by the
-- later contract migration after schema state has begun to change.
DO $$
BEGIN
  IF (
    SELECT COUNT(*) = 4
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name IN ('date_of_birth', 'gender', 'height', 'weight')
  ) THEN
    EXECUTE $backfill$
      INSERT INTO public.user_private_profiles (
        profile_id,
        user_id,
        date_of_birth,
        gender,
        height,
        weight,
        updated_at
      )
      SELECT
        profile_id,
        user_id,
        date_of_birth,
        gender,
        height,
        weight,
        COALESCE(updated_at, NOW())
      FROM public.user_profiles
      WHERE user_id IS NOT NULL
      ON CONFLICT (profile_id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        date_of_birth = EXCLUDED.date_of_birth,
        gender = EXCLUDED.gender,
        height = EXCLUDED.height,
        weight = EXCLUDED.weight,
        updated_at = EXCLUDED.updated_at
    $backfill$;
  END IF;
END;
$$;

-- During the expand window, an already-loaded legacy client may still write
-- the old columns. Mirror those writes so the later contract step cannot lose
-- a profile edit.
CREATE OR REPLACE FUNCTION public.sync_user_profile_private_legacy()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.user_private_profiles (
    profile_id,
    user_id,
    date_of_birth,
    gender,
    height,
    weight,
    updated_at
  ) VALUES (
    NEW.profile_id,
    NEW.user_id,
    NEW.date_of_birth,
    NEW.gender,
    NEW.height,
    NEW.weight,
    NOW()
  )
  ON CONFLICT (profile_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    date_of_birth = EXCLUDED.date_of_birth,
    gender = EXCLUDED.gender,
    height = EXCLUDED.height,
    weight = EXCLUDED.weight,
    updated_at = EXCLUDED.updated_at;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_user_profile_private_legacy() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trigger_sync_user_profile_private_legacy ON public.user_profiles;
CREATE TRIGGER trigger_sync_user_profile_private_legacy
  AFTER INSERT OR UPDATE OF user_id, date_of_birth, gender, height, weight
  ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_profile_private_legacy();

-- A small ownership Interface replaces repeated policy/client queries against
-- the soon-to-be-hidden user_profiles.user_id column.
CREATE OR REPLACE FUNCTION public.current_user_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT profile_id
  FROM public.user_profiles
  WHERE user_id = (SELECT auth.uid())
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.current_user_profile_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_profile_id() TO anon, authenticated;

-- Move profile-dependent ownership policies onto the hardened helper before
-- the contract phase hides user_id from client roles.
DROP POLICY IF EXISTS "Public stacks are viewable by everyone" ON public.stacks;
CREATE POLICY "Public stacks are viewable by everyone" ON public.stacks
  FOR SELECT USING (
    is_public = true OR profile_id = public.current_user_profile_id()
  );

DROP POLICY IF EXISTS "Users can manage own stacks" ON public.stacks;
CREATE POLICY "Users can manage own stacks" ON public.stacks
  FOR ALL
  USING (profile_id = public.current_user_profile_id())
  WITH CHECK (profile_id = public.current_user_profile_id());

DROP POLICY IF EXISTS "Stack supplements visible based on stack visibility" ON public.stack_supplements;
CREATE POLICY "Stack supplements visible based on stack visibility" ON public.stack_supplements
  FOR SELECT USING (
    stack_id IN (
      SELECT stack_id
      FROM public.stacks
      WHERE is_public = true OR profile_id = public.current_user_profile_id()
    )
  );

DROP POLICY IF EXISTS "Users can manage own stack supplements" ON public.stack_supplements;
CREATE POLICY "Users can manage own stack supplements" ON public.stack_supplements
  FOR ALL
  USING (
    stack_id IN (
      SELECT stack_id
      FROM public.stacks
      WHERE profile_id = public.current_user_profile_id()
    )
  )
  WITH CHECK (
    stack_id IN (
      SELECT stack_id
      FROM public.stacks
      WHERE profile_id = public.current_user_profile_id()
    )
  );

DROP POLICY IF EXISTS "Users can manage own likes" ON public.stack_likes;
CREATE POLICY "Users can manage own likes" ON public.stack_likes
  FOR ALL
  USING (profile_id = public.current_user_profile_id())
  WITH CHECK (profile_id = public.current_user_profile_id());

DROP POLICY IF EXISTS "Users can manage own follows" ON public.user_follows;
CREATE POLICY "Users can manage own follows" ON public.user_follows
  FOR ALL
  USING (follower_id = public.current_user_profile_id())
  WITH CHECK (follower_id = public.current_user_profile_id());

-- Once direct UPDATE is removed from authenticated users, the follower trigger
-- still needs narrowly trusted permission to maintain its two counters.
CREATE OR REPLACE FUNCTION public.update_follower_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_profiles
    SET follower_count = follower_count + 1
    WHERE profile_id = NEW.following_id;

    UPDATE public.user_profiles
    SET following_count = following_count + 1
    WHERE profile_id = NEW.follower_id;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_profiles
    SET follower_count = GREATEST(0, follower_count - 1)
    WHERE profile_id = OLD.following_id;

    UPDATE public.user_profiles
    SET following_count = GREATEST(0, following_count - 1)
    WHERE profile_id = OLD.follower_id;

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.update_follower_counts() FROM PUBLIC, anon, authenticated;

-- Deep Account Profile Interface: callers provide identity defaults once and
-- receive the authenticated owner's combined public/private profile. Creation,
-- ownership, and concurrency stay inside one transaction.
CREATE OR REPLACE FUNCTION public.get_or_create_own_account_profile(
  p_username TEXT,
  p_display_name TEXT,
  p_profile_image TEXT
)
RETURNS TABLE (
  profile_id UUID,
  user_id UUID,
  username VARCHAR(50),
  display_name VARCHAR(100),
  profile_image VARCHAR(500),
  bio TEXT,
  date_of_birth DATE,
  gender VARCHAR(30),
  height NUMERIC(5,2),
  weight NUMERIC(6,2),
  website VARCHAR(500),
  twitter_handle VARCHAR(50),
  instagram_handle VARCHAR(50),
  youtube_channel VARCHAR(500)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := (SELECT auth.uid());
  v_profile_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;

  IF NULLIF(BTRIM(p_username), '') IS NULL OR CHAR_LENGTH(p_username) > 50 THEN
    RAISE EXCEPTION 'Username must contain 1 to 50 characters' USING ERRCODE = '22023';
  END IF;

  IF p_display_name IS NOT NULL AND CHAR_LENGTH(p_display_name) > 100 THEN
    RAISE EXCEPTION 'Display name exceeds 100 characters' USING ERRCODE = '22023';
  END IF;

  IF p_profile_image IS NOT NULL AND CHAR_LENGTH(p_profile_image) > 500 THEN
    RAISE EXCEPTION 'Profile image URL exceeds 500 characters' USING ERRCODE = '22023';
  END IF;

  -- Serialize only concurrent first-profile creation for this user.
  PERFORM pg_advisory_xact_lock(hashtextextended(v_user_id::TEXT, 0));

  SELECT up.profile_id
  INTO v_profile_id
  FROM public.user_profiles AS up
  WHERE up.user_id = v_user_id
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    INSERT INTO public.user_profiles AS inserted_profile (
      user_id,
      username,
      display_name,
      profile_image,
      is_public
    ) VALUES (
      v_user_id,
      BTRIM(p_username),
      NULLIF(BTRIM(p_display_name), ''),
      NULLIF(BTRIM(p_profile_image), ''),
      true
    )
    RETURNING inserted_profile.profile_id INTO v_profile_id;
  END IF;

  INSERT INTO public.user_private_profiles (profile_id, user_id)
  VALUES (v_profile_id, v_user_id)
  ON CONFLICT (profile_id) DO NOTHING;

  RETURN QUERY
  SELECT
    up.profile_id,
    up.user_id,
    up.username,
    up.display_name,
    up.profile_image,
    up.bio,
    private_profile.date_of_birth,
    private_profile.gender,
    private_profile.height,
    private_profile.weight,
    up.website,
    up.twitter_handle,
    up.instagram_handle,
    up.youtube_channel
  FROM public.user_profiles AS up
  LEFT JOIN public.user_private_profiles AS private_profile
    ON private_profile.profile_id = up.profile_id
  WHERE up.profile_id = v_profile_id
    AND up.user_id = v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_own_account_profile(TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_own_account_profile(TEXT, TEXT, TEXT) TO authenticated;

-- Atomic public/private edit. The transition implementation intentionally
-- writes the legacy columns too, allowing older loaded clients to read the
-- latest values until the contract migration removes them.
CREATE OR REPLACE FUNCTION public.update_own_account_profile(
  p_display_name TEXT,
  p_bio TEXT,
  p_website TEXT,
  p_twitter_handle TEXT,
  p_instagram_handle TEXT,
  p_youtube_channel TEXT,
  p_date_of_birth DATE,
  p_gender TEXT,
  p_height NUMERIC,
  p_weight NUMERIC
)
RETURNS TABLE (
  profile_id UUID,
  user_id UUID,
  username VARCHAR(50),
  display_name VARCHAR(100),
  profile_image VARCHAR(500),
  bio TEXT,
  date_of_birth DATE,
  gender VARCHAR(30),
  height NUMERIC(5,2),
  weight NUMERIC(6,2),
  website VARCHAR(500),
  twitter_handle VARCHAR(50),
  instagram_handle VARCHAR(50),
  youtube_channel VARCHAR(500)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := (SELECT auth.uid());
  v_profile_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;

  IF p_display_name IS NOT NULL AND CHAR_LENGTH(p_display_name) > 100 THEN
    RAISE EXCEPTION 'Display name exceeds 100 characters' USING ERRCODE = '22023';
  END IF;

  IF p_bio IS NOT NULL AND CHAR_LENGTH(p_bio) > 2000 THEN
    RAISE EXCEPTION 'Bio exceeds 2000 characters' USING ERRCODE = '22023';
  END IF;

  IF p_website IS NOT NULL AND CHAR_LENGTH(p_website) > 500 THEN
    RAISE EXCEPTION 'Website exceeds 500 characters' USING ERRCODE = '22023';
  END IF;

  IF p_twitter_handle IS NOT NULL AND CHAR_LENGTH(p_twitter_handle) > 50 THEN
    RAISE EXCEPTION 'Twitter handle exceeds 50 characters' USING ERRCODE = '22023';
  END IF;

  IF p_instagram_handle IS NOT NULL AND CHAR_LENGTH(p_instagram_handle) > 50 THEN
    RAISE EXCEPTION 'Instagram handle exceeds 50 characters' USING ERRCODE = '22023';
  END IF;

  IF p_youtube_channel IS NOT NULL AND CHAR_LENGTH(p_youtube_channel) > 500 THEN
    RAISE EXCEPTION 'YouTube channel exceeds 500 characters' USING ERRCODE = '22023';
  END IF;

  IF p_gender IS NOT NULL AND CHAR_LENGTH(p_gender) > 30 THEN
    RAISE EXCEPTION 'Gender exceeds 30 characters' USING ERRCODE = '22023';
  END IF;

  IF p_date_of_birth IS NOT NULL AND p_date_of_birth > CURRENT_DATE THEN
    RAISE EXCEPTION 'Date of birth cannot be in the future' USING ERRCODE = '22023';
  END IF;

  IF p_height IS NOT NULL AND (p_height < 30 OR p_height > 300) THEN
    RAISE EXCEPTION 'Height must be between 30 and 300 centimeters' USING ERRCODE = '22023';
  END IF;

  IF p_weight IS NOT NULL AND (p_weight < 1 OR p_weight > 1000) THEN
    RAISE EXCEPTION 'Weight must be between 1 and 1000 kilograms' USING ERRCODE = '22023';
  END IF;

  UPDATE public.user_profiles AS up
  SET
    display_name = NULLIF(BTRIM(p_display_name), ''),
    bio = NULLIF(BTRIM(p_bio), ''),
    website = NULLIF(BTRIM(p_website), ''),
    twitter_handle = NULLIF(BTRIM(p_twitter_handle), ''),
    instagram_handle = NULLIF(BTRIM(p_instagram_handle), ''),
    youtube_channel = NULLIF(BTRIM(p_youtube_channel), ''),
    date_of_birth = p_date_of_birth,
    gender = NULLIF(BTRIM(p_gender), ''),
    height = p_height,
    weight = p_weight,
    updated_at = NOW()
  WHERE up.user_id = v_user_id
  RETURNING up.profile_id INTO v_profile_id;

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Account profile not found' USING ERRCODE = 'P0002';
  END IF;

  -- The compatibility trigger has already mirrored these values; the explicit
  -- upsert documents and enforces the private store as the authoritative result.
  INSERT INTO public.user_private_profiles (
    profile_id,
    user_id,
    date_of_birth,
    gender,
    height,
    weight,
    updated_at
  ) VALUES (
    v_profile_id,
    v_user_id,
    p_date_of_birth,
    NULLIF(BTRIM(p_gender), ''),
    p_height,
    p_weight,
    NOW()
  )
  ON CONFLICT (profile_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    date_of_birth = EXCLUDED.date_of_birth,
    gender = EXCLUDED.gender,
    height = EXCLUDED.height,
    weight = EXCLUDED.weight,
    updated_at = EXCLUDED.updated_at;

  RETURN QUERY
  SELECT
    up.profile_id,
    up.user_id,
    up.username,
    up.display_name,
    up.profile_image,
    up.bio,
    private_profile.date_of_birth,
    private_profile.gender,
    private_profile.height,
    private_profile.weight,
    up.website,
    up.twitter_handle,
    up.instagram_handle,
    up.youtube_channel
  FROM public.user_profiles AS up
  JOIN public.user_private_profiles AS private_profile
    ON private_profile.profile_id = up.profile_id
  WHERE up.profile_id = v_profile_id
    AND up.user_id = v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_own_account_profile(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, NUMERIC, NUMERIC
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_own_account_profile(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, NUMERIC, NUMERIC
) TO authenticated;

COMMENT ON TABLE public.user_private_profiles IS
  'Owner-only optional account/body details. Never expose through public profile reads.';
COMMENT ON FUNCTION public.get_or_create_own_account_profile(TEXT, TEXT, TEXT) IS
  'Returns or atomically creates the authenticated user account profile.';
COMMENT ON FUNCTION public.update_own_account_profile(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, NUMERIC, NUMERIC
) IS
  'Atomically updates the authenticated user public identity and private account details.';
