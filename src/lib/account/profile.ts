import type { User } from '@supabase/supabase-js';
import { supabase } from '@/app/supabase';

export interface AccountProfile {
  profile_id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  profile_image: string | null;
  bio: string | null;
  date_of_birth: string | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  website: string | null;
  twitter_handle: string | null;
  instagram_handle: string | null;
  youtube_channel: string | null;
}

function slugUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 28);
}

function profileDefaults(user: User) {
  const metadata = user.user_metadata ?? {};
  const emailName = user.email?.split('@')[0] ?? 'member';
  const sourceName = metadata.user_name || metadata.preferred_username || metadata.full_name || emailName;
  const baseUsername = slugUsername(sourceName) || 'member';

  return {
    user_id: user.id,
    username: `${baseUsername}-${user.id.slice(0, 6)}`,
    display_name: metadata.full_name || metadata.name || emailName,
    profile_image: metadata.avatar_url || metadata.picture || null,
  };
}

// profile_id never changes for a user, so it is safe to memoize per session.
// This keeps product grids (15+ cards each checking stack membership)
// from re-running the account-profile command once per card.
const profileIdCache = new Map<string, Promise<string>>();

export function getUserProfileId(user: User): Promise<string> {
  const cached = profileIdCache.get(user.id);
  if (cached) return cached;

  const promise = getOrCreateUserProfile(user).then((profile) => profile.profile_id);
  profileIdCache.set(user.id, promise);
  promise.catch(() => profileIdCache.delete(user.id));
  return promise;
}

export async function getOrCreateUserProfile(user: User): Promise<AccountProfile> {
  const defaults = profileDefaults(user);
  const { data, error } = await supabase
    .rpc('get_or_create_own_account_profile', {
      p_username: defaults.username,
      p_display_name: defaults.display_name,
      p_profile_image: defaults.profile_image,
    })
    .single();

  if (error) throw error;
  if (!data) throw new Error('Unable to load account profile');
  return data as AccountProfile;
}

export interface UpdateUserProfileInput {
  date_of_birth: string | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  display_name: string | null;
  bio: string | null;
  website: string | null;
  twitter_handle: string | null;
  instagram_handle: string | null;
  youtube_channel: string | null;
}

/** Atomically update the authenticated user's public and private profile fields. */
export async function updateUserProfile(
  input: UpdateUserProfileInput
): Promise<AccountProfile> {
  const { data, error } = await supabase
    .rpc('update_own_account_profile', {
      p_display_name: input.display_name,
      p_bio: input.bio,
      p_website: input.website,
      p_twitter_handle: input.twitter_handle,
      p_instagram_handle: input.instagram_handle,
      p_youtube_channel: input.youtube_channel,
      p_date_of_birth: input.date_of_birth,
      p_gender: input.gender,
      p_height: input.height,
      p_weight: input.weight,
    })
    .single();

  if (error) throw error;
  if (!data) throw new Error('Unable to update account profile');
  return data as AccountProfile;
}
