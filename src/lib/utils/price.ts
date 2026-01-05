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

/**
 * Format a price value to a display string
 */
export function formatPrice(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format price with currency symbol
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Calculate total monthly cost for a list of regimen items
 */
export function calculateTotalMonthlyCost(
  items: Array<{
    product_price: number;
    servings_per_container: number;
    servings_per_day: number;
  }>
): number {
  return items.reduce((total, item) => {
    const { monthlyCost } = calculatePrices(
      item.product_price,
      item.servings_per_container,
      item.servings_per_day
    );
    return total + monthlyCost;
  }, 0);
}

/**
 * Get price tier label based on cost per serving
 */
export function getPriceTier(costPerServing: number): {
  label: string;
  color: string;
} {
  if (costPerServing < 0.10) {
    return { label: 'Budget', color: 'text-green-600' };
  } else if (costPerServing < 0.30) {
    return { label: 'Value', color: 'text-blue-600' };
  } else if (costPerServing < 0.75) {
    return { label: 'Premium', color: 'text-purple-600' };
  } else {
    return { label: 'Luxury', color: 'text-amber-600' };
  }
}
