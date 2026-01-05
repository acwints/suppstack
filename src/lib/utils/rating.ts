import type { ProductRatingStats } from '@/types';

/**
 * Generate a deterministic "fake" rating based on product name
 * This is a placeholder until real reviews are implemented
 * @deprecated Use real ratings from product_rating_stats table
 */
export function generateFakeRating(productName: string): number {
  const hash = productName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return 4.0 + (Math.abs(hash) % 10) / 10; // Rating between 4.0-4.9
}

/**
 * Generate a fake review count based on rating
 * @deprecated Use real review counts from product_rating_stats table
 */
export function generateFakeReviewCount(rating: number): number {
  return Math.floor(Math.abs(rating * 100)) + 50;
}

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
 * Get rating color class based on numeric value
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 4.0) return 'text-green-500';
  if (rating >= 3.5) return 'text-yellow-500';
  if (rating >= 3.0) return 'text-yellow-600';
  if (rating >= 2.0) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Get recommendation text based on percentage
 */
export function getRecommendationText(percentage: number): string {
  if (percentage >= 90) return 'Highly Recommended';
  if (percentage >= 75) return 'Recommended';
  if (percentage >= 50) return 'Mixed Reviews';
  return 'Not Recommended';
}

/**
 * Calculate weighted average from multiple rating dimensions
 */
export function calculateWeightedRating(
  ratings: {
    overall: number;
    effectiveness?: number;
    value?: number;
    quality?: number;
  },
  weights: {
    overall: number;
    effectiveness: number;
    value: number;
    quality: number;
  } = { overall: 0.4, effectiveness: 0.25, value: 0.2, quality: 0.15 }
): number {
  let totalWeight = weights.overall;
  let weightedSum = ratings.overall * weights.overall;

  if (ratings.effectiveness !== undefined) {
    weightedSum += ratings.effectiveness * weights.effectiveness;
    totalWeight += weights.effectiveness;
  }
  if (ratings.value !== undefined) {
    weightedSum += ratings.value * weights.value;
    totalWeight += weights.value;
  }
  if (ratings.quality !== undefined) {
    weightedSum += ratings.quality * weights.quality;
    totalWeight += weights.quality;
  }

  return weightedSum / totalWeight;
}

/**
 * Format rating for display
 */
export function formatRating(rating: number, precision: number = 1): string {
  return rating.toFixed(precision);
}

/**
 * Check if a rating is considered "good" (4+ stars)
 */
export function isGoodRating(rating: number): boolean {
  return rating >= 4.0;
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
