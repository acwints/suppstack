import type { User } from '@supabase/supabase-js';
import { supabase } from '@/app/supabase';

/**
 * The user's product links (their stack). users_products is owned by
 * user_id since migration 0007.
 */
export async function fetchUserProductLinks<T = unknown>(
  user: User,
  select: string
): Promise<T[]> {
  const { data, error } = await supabase
    .from('users_products')
    .select(select)
    .eq('user_id', user.id);

  if (error) throw error;
  return (data ?? []) as T[];
}
