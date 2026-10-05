import type { ProductRatingStats } from '@/types';

/**
 * Calculate rating distribution percentages
 */
export function calculateRatingDistribution(stats: ProductRatingStats): Array<{
  rating: number;
  count: number;
  percentage: number;
}> {
  const total = stats.total_reviews || 1; // Avoid division by zero

  return [5, 4, 3, 2, 1].map(rating => {
    const countKey = `rating_${rating}_count` as keyof ProductRatingStats;
    const count = stats[countKey] as number || 0;
    return {
      rating,
      count,
      percentage: (count / total) * 100,
    };
  });
}

/**
 * Get rating label based on numeric value
 */
export function getRatingLabel(rating: number): string {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4.0) return 'Very Good';
  if (rating >= 3.5) return 'Good';
  if (rating >= 3.0) return 'Average';
  if (rating >= 2.0) return 'Below Average';
  return 'Poor';
}

/**
 * Get star fill type for a given position
 */
export function getStarFill(
  position: number,
  rating: number,
  precision: 'full' | 'half' = 'half'
): 'full' | 'half' | 'empty' {
  if (position <= Math.floor(rating)) {
    return 'full';
  }
  if (precision === 'half' && position === Math.ceil(rating) && rating % 1 >= 0.5) {
    return 'half';
  }
  return 'empty';
}
