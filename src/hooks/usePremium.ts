'use client';

import { usePremiumContext, type PremiumContextValue } from '@/app/context/PremiumContext';

export type UsePremiumResult = PremiumContextValue;

/**
 * Premium status, purchasability, and the paywall trigger for the current
 * user. Backed by PremiumProvider so every gate shares one entitlement read.
 */
export function usePremium(): UsePremiumResult {
  return usePremiumContext();
}
