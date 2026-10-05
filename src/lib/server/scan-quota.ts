import 'server-only';

import type { User } from '@supabase/supabase-js';
import { getSupabaseServiceClient } from '@/lib/server/supabase';
import {
  FREE_SCAN_LIMIT,
  PREMIUM_ENTITLEMENT,
  isEntitlementActive,
} from '@/lib/billing/entitlements';

export interface ScanAllowance {
  allowed: boolean;
  /** Null when scans are unmetered (Premium, or Premium not on sale yet). */
  freeScansRemaining: number | null;
}

function freeScansUsed(user: User): number {
  const used = Number(user.app_metadata?.free_scans_used ?? 0);
  return Number.isFinite(used) && used > 0 ? used : 0;
}

/**
 * Free accounts get FREE_SCAN_LIMIT lifetime AI scans; Premium is unlimited.
 * Metering only starts once Premium is purchasable in the app, so nobody is
 * ever blocked without a way to upgrade. The counter lives in app_metadata,
 * which only the service role can write.
 */
export async function getScanAllowance(user: User): Promise<ScanAllowance> {
  const service = getSupabaseServiceClient();
  if (!process.env.NEXT_PUBLIC_REVENUECAT_APPLE_API_KEY || !service) {
    return { allowed: true, freeScansRemaining: null };
  }

  const { data } = await service
    .from('user_entitlements')
    .select('status, current_period_end')
    .eq('user_id', user.id)
    .eq('entitlement', PREMIUM_ENTITLEMENT)
    .limit(1);
  if (isEntitlementActive(data?.[0] ?? null)) {
    return { allowed: true, freeScansRemaining: null };
  }

  const remaining = Math.max(0, FREE_SCAN_LIMIT - freeScansUsed(user));
  return { allowed: remaining > 0, freeScansRemaining: remaining };
}

/** Count one successful free scan; returns the scans left afterwards. */
export async function recordFreeScan(user: User): Promise<number> {
  const service = getSupabaseServiceClient();
  const used = freeScansUsed(user) + 1;
  if (service) {
    const { error } = await service.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, free_scans_used: used },
    });
    if (error) console.error('Failed to record free scan:', error);
  }
  return Math.max(0, FREE_SCAN_LIMIT - used);
}
