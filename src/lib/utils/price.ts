import { DAYS_PER_MONTH } from '@/types';

export interface PriceCalculations {
  costPerServing: number;
  dailyCost: number;
  monthlyCost: number;
  annualCost: number;
}

/**
 * Calculate all price breakdowns for a product
 */
export function calculatePrices(
  price: number,
  servingsPerContainer: number,
  servingsPerDay: number
): PriceCalculations {
  const costPerServing = servingsPerContainer > 0
    ? price / servingsPerContainer
    : 0;

  const dailyCost = costPerServing * servingsPerDay;
  const monthlyCost = dailyCost * DAYS_PER_MONTH;
  const annualCost = monthlyCost * 12;

  return {
    costPerServing,
    dailyCost,
    monthlyCost,
    annualCost,
  };
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a USD amount for display, e.g. 12.99 -> "$12.99".
 * The single money formatter for the app — never hand-build "$" strings.
 */
export function formatCurrency(value: number): string {
  return usdFormatter.format(value);
}
