import type { User } from '@supabase/supabase-js';
import { supabase } from '@/app/supabase';

export interface AccountProfile {
  profile_id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  profile_image: string | null;
  bio?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  height?: number | null;
  weight?: number | null;
  website?: string | null;
  twitter_handle?: string | null;
  instagram_handle?: string | null;
  youtube_channel?: string | null;
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
    is_public: true,
  };
}

export async function getOrCreateUserProfile(user: User): Promise<AccountProfile> {
  const { data: existing, error: fetchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  if (existing) {
    return existing as AccountProfile;
  }

  const defaults = profileDefaults(user);
  const { data: created, error: createError } = await supabase
    .from('user_profiles')
    .insert(defaults)
    .select('*')
    .single();

  if (!createError && created) {
    return created as AccountProfile;
  }

  const { data: retry, error: retryError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (retryError || !retry) {
    throw createError || retryError || new Error('Unable to create user profile');
  }

  return retry as AccountProfile;
}
