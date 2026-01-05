'use client';

import { useMemo } from 'react';
import { calculatePrices, type PriceCalculations } from '@/lib/utils/price';

/**
 * Hook for calculating product price breakdowns
 */
export function usePriceCalculations(
  price: number,
  servingsPerContainer: number,
  servingsPerDay: number
): PriceCalculations {
  return useMemo(
    () => calculatePrices(price, servingsPerContainer, servingsPerDay),
    [price, servingsPerContainer, servingsPerDay]
  );
}

/**
 * Hook for calculating total regimen cost
 */
export function useRegimenCost(
  items: Array<{
    product_price: number;
    servings_per_container: number;
    servings_per_day: number;
  }>
): {
  totalDailyCost: number;
  totalMonthlyCost: number;
  totalAnnualCost: number;
  itemCount: number;
} {
  return useMemo(() => {
    const totals = items.reduce(
      (acc, item) => {
        const prices = calculatePrices(
          item.product_price,
          item.servings_per_container,
          item.servings_per_day
        );
        return {
          totalDailyCost: acc.totalDailyCost + prices.dailyCost,
          totalMonthlyCost: acc.totalMonthlyCost + prices.monthlyCost,
          totalAnnualCost: acc.totalAnnualCost + prices.annualCost,
        };
      },
      { totalDailyCost: 0, totalMonthlyCost: 0, totalAnnualCost: 0 }
    );

    return {
      ...totals,
      itemCount: items.length,
    };
  }, [items]);
}

export default usePriceCalculations;
