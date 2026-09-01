BEGIN;

SELECT plan(24);

SELECT ok(
  to_regclass('public.user_private_profiles') IS NOT NULL,
  'private account profile table exists'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND indexname = 'user_profiles_user_id_unique'
      AND indexdef ILIKE '%UNIQUE%'
  ),
  'one profile per authenticated user is uniquely enforced'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.user_private_profiles'::regclass),
  'private profile RLS is enabled'
);

SELECT ok(
  (SELECT relforcerowsecurity FROM pg_class WHERE oid = 'public.user_private_profiles'::regclass),
  'private profile RLS is forced'
);

SELECT ok(
  NOT has_table_privilege('anon', 'public.user_private_profiles', 'SELECT'),
  'anonymous clients cannot read the private profile table directly'
);

SELECT ok(
  NOT has_table_privilege('authenticated', 'public.user_private_profiles', 'SELECT'),
  'authenticated clients cannot read the private profile table directly'
);

SELECT ok(
  NOT has_table_privilege('authenticated', 'public.user_private_profiles', 'INSERT'),
  'authenticated clients cannot insert private rows directly'
);

SELECT ok(
  NOT has_table_privilege('authenticated', 'public.user_private_profiles', 'UPDATE'),
  'authenticated clients cannot update private rows directly'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_private_profiles'
      AND policyname = 'user_private_profiles_owner'
      AND qual ILIKE '%auth.uid%'
      AND with_check ILIKE '%auth.uid%'
  ),
  'private profile policy is owner-scoped for reads and writes'
);

SELECT ok(
  (SELECT prosecdef FROM pg_proc WHERE oid = 'public.current_user_profile_id()'::regprocedure),
  'profile ownership helper is security definer'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM unnest(
      (SELECT proconfig FROM pg_proc WHERE oid = 'public.current_user_profile_id()'::regprocedure)
    ) AS config
    WHERE config ILIKE 'search_path=%public%pg_temp%'
  ),
  'profile ownership helper pins its search path'
);

SELECT ok(
  (SELECT prosecdef FROM pg_proc WHERE oid = 'public.get_or_create_own_account_profile(text,text,text)'::regprocedure),
  'account profile get-or-create command is security definer'
);

SELECT ok(
  has_function_privilege(
    'authenticated',
    'public.get_or_create_own_account_profile(text,text,text)'::regprocedure,
    'EXECUTE'
  ),
  'authenticated clients can execute account profile get-or-create'
);

SELECT ok(
  NOT has_function_privilege(
    'anon',
    'public.get_or_create_own_account_profile(text,text,text)'::regprocedure,
    'EXECUTE'
  ),
  'anonymous clients cannot execute account profile get-or-create'
);

SELECT ok(
  (
    SELECT prosecdef
    FROM pg_proc
    WHERE oid = 'public.update_own_account_profile(text,text,text,text,text,text,date,text,numeric,numeric)'::regprocedure
  ),
  'account profile update command is security definer'
);

SELECT ok(
  has_function_privilege(
    'authenticated',
    'public.update_own_account_profile(text,text,text,text,text,text,date,text,numeric,numeric)'::regprocedure,
    'EXECUTE'
  ),
  'authenticated clients can execute account profile update'
);

SELECT ok(
  NOT has_function_privilege(
    'anon',
    'public.update_own_account_profile(text,text,text,text,text,text,date,text,numeric,numeric)'::regprocedure,
    'EXECUTE'
  ),
  'anonymous clients cannot execute account profile update'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgrelid = 'public.user_profiles'::regclass
      AND tgname = 'trigger_sync_user_profile_private_legacy'
      AND NOT tgisinternal
      AND tgenabled <> 'D'
  ),
  'legacy profile edits are mirrored during the rollout window'
);

SELECT ok(
  (SELECT prosecdef FROM pg_proc WHERE oid = 'public.sync_user_profile_private_legacy()'::regprocedure),
  'legacy compatibility trigger is security definer'
);

SELECT ok(
  (SELECT prosecdef FROM pg_proc WHERE oid = 'public.update_follower_counts()'::regprocedure),
  'follower counter trigger remains writable after client grants are narrowed'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'stacks'
      AND policyname = 'Users can manage own stacks'
      AND qual ILIKE '%current_user_profile_id%'
  ),
  'stack ownership uses the hardened profile helper'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'stack_supplements'
      AND policyname = 'Users can manage own stack supplements'
      AND qual ILIKE '%current_user_profile_id%'
  ),
  'stack supplement ownership uses the hardened profile helper'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'stack_likes'
      AND policyname = 'Users can manage own likes'
      AND qual ILIKE '%current_user_profile_id%'
  ),
  'like ownership uses the hardened profile helper'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_follows'
      AND policyname = 'Users can manage own follows'
      AND qual ILIKE '%current_user_profile_id%'
  ),
  'follow ownership uses the hardened profile helper'
);

SELECT * FROM finish();

ROLLBACK;
