-- Contract phase for private account profiles (expand: 0026).
--
-- Private account details (date of birth, gender, height, weight) live only
-- in owner-only user_private_profiles. Remove the legacy copies from the
-- publicly readable user_profiles table, the compatibility trigger that kept
-- them mirrored, and the RPC's legacy writes. No public profile held values
-- in these columns at contract time.

BEGIN;

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
#variable_conflict use_column
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
    updated_at = NOW()
  WHERE up.user_id = v_user_id
  RETURNING up.profile_id INTO v_profile_id;

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Account profile not found' USING ERRCODE = 'P0002';
  END IF;

  -- Private account details live only in user_private_profiles.
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


DROP TRIGGER IF EXISTS trigger_sync_user_profile_private_legacy ON public.user_profiles;
DROP FUNCTION IF EXISTS public.sync_user_profile_private_legacy();

ALTER TABLE public.user_profiles
  DROP COLUMN IF EXISTS date_of_birth,
  DROP COLUMN IF EXISTS gender,
  DROP COLUMN IF EXISTS height,
  DROP COLUMN IF EXISTS weight;

COMMIT;
