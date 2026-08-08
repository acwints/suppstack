'use client';

import type { ProductRatingStats } from '@/types';
import { calculateRatingDistribution, getRatingLabel } from '@/lib/utils/rating';
import Rating from './Rating';

export interface RatingBreakdownProps {
  stats: ProductRatingStats;
  showRecommendation?: boolean;
}

export function RatingBreakdown({ stats, showRecommendation = true }: RatingBreakdownProps) {
  const distribution = calculateRatingDistribution(stats);

  return (
    <div className="space-y-4">
      {/* Overall Rating */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-4xl font-bold tabular-nums text-gray-900">
            {stats.average_rating.toFixed(1)}
          </div>
          <Rating value={stats.average_rating} size="md" />
          <div className="text-sm text-gray-500 mt-1">
            {stats.total_reviews.toLocaleString()} reviews
          </div>
        </div>

        {/* Distribution Bars */}
        <div className="flex-1 space-y-2">
          {distribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-6">{rating}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning-400 rounded-full transition-[width] duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-10 text-end text-xs tabular-nums text-gray-500">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      {showRecommendation && stats.recommendation_percentage > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-success-600">
              {stats.recommendation_percentage.toFixed(0)}%
            </div>
            <span className="text-sm text-gray-600">
              of reviewers would recommend this product
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default RatingBreakdown;
