import type { User } from '@supabase/supabase-js';
import { supabase } from '@/app/supabase';
import { getUserProfileId } from '@/lib/account/profile';

export function isMissingColumnError(error: { code?: string; message?: string } | null, column: string) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';

  return (
    error.code === 'PGRST204' ||
    error.code === '42703' ||
    message.includes(`'${column}'`) ||
    message.includes(`"${column}"`) ||
    message.includes(`column ${column}`)
  );
}

/**
 * Hosted environments have existed with either `user_id` or `profile_id` as
 * the owner column for users_products. Read through both shapes so older
 * databases do not throw noisy 400s in tracking/profile screens.
 */
export async function fetchUserProductLinks<T = unknown>(
  user: User,
  select: string
): Promise<T[]> {
  const byUser = await supabase
    .from('users_products')
    .select(select)
    .eq('user_id', user.id);

  if (!byUser.error) return (byUser.data ?? []) as T[];
  if (!isMissingColumnError(byUser.error, 'user_id')) throw byUser.error;

  const profileId = await getUserProfileId(user);
  const byProfile = await supabase
    .from('users_products')
    .select(select)
    .eq('profile_id', profileId);

  if (byProfile.error) throw byProfile.error;
  return (byProfile.data ?? []) as T[];
}
