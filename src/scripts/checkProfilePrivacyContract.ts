import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures: string[] = [];

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function requireText(source: string, expected: string, message: string) {
  if (!source.includes(expected)) failures.push(message);
}

function forbidText(source: string, forbidden: string, message: string) {
  if (source.includes(forbidden)) failures.push(message);
}

const accountProfile = read('src/lib/account/profile.ts');
requireText(
  accountProfile,
  ".rpc('get_or_create_own_account_profile'",
  'Account profiles must be loaded/created through the authenticated database command.'
);
requireText(
  accountProfile,
  ".rpc('update_own_account_profile'",
  'Account profiles must be updated through the atomic authenticated database command.'
);
forbidText(
  accountProfile,
  ".from('user_profiles')",
  'The Account Profile Module must not expose direct user_profiles table orchestration.'
);
forbidText(accountProfile, ".select('*')", 'Account profile reads must never use wildcard selects.');

for (const relativePath of [
  'src/hooks/useReviews.ts',
  'src/hooks/useStackLikes.ts',
  'src/hooks/useUserFollows.ts',
]) {
  const source = read(relativePath);
  if (/\.from\('user_profiles'\)[\s\S]{0,300}\.eq\('user_id',\s*user\.id\)/.test(source)) {
    failures.push(`${relativePath} must resolve profile ownership through the Account Profile Module.`);
  }
}

for (const relativePath of ['src/hooks/useStacks.ts', 'src/hooks/useUserFollows.ts']) {
  if (/^\s*user_id,\s*$/m.test(read(relativePath))) {
    failures.push(`${relativePath} must not request internal owner IDs in public profile embeds.`);
  }
}

const sharedTypes = read('src/types/index.ts');
const publicProfileType = sharedTypes.match(
  /export interface UserProfile \{([\s\S]*?)\n\}/
)?.[1];

if (!publicProfileType) {
  failures.push('The public UserProfile Interface could not be found.');
} else {
  for (const forbiddenField of ['user_id', 'date_of_birth', 'gender', 'height', 'weight']) {
    if (new RegExp(`\\b${forbiddenField}\\b`).test(publicProfileType)) {
      failures.push(`Public UserProfile must not expose ${forbiddenField}.`);
    }
  }
}

const migration = read('supabase/migrations/20260831000026_expand_private_account_profiles.sql');
for (const requiredFragment of [
  'CREATE TABLE IF NOT EXISTS public.user_private_profiles',
  'ALTER TABLE public.user_private_profiles FORCE ROW LEVEL SECURITY',
  'CREATE OR REPLACE FUNCTION public.current_user_profile_id()',
  'CREATE OR REPLACE FUNCTION public.get_or_create_own_account_profile(',
  'CREATE OR REPLACE FUNCTION public.update_own_account_profile(',
  'SECURITY DEFINER',
  'SET search_path = public, pg_temp',
]) {
  requireText(migration, requiredFragment, `Profile privacy migration is missing: ${requiredFragment}`);
}

if (!fs.existsSync(path.join(root, 'supabase/tests/profile_privacy_expand_test.sql'))) {
  failures.push('Database contract coverage for the profile privacy expand phase is missing.');
}

if (failures.length > 0) {
  console.error('Profile privacy contract check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Profile privacy source contract checks passed.');
