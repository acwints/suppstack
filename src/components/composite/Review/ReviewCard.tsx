'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaThumbsUp, FaThumbsDown, FaCheckCircle, FaTimesCircle, FaFlag } from 'react-icons/fa';
import type { Review } from '@/types';
import { formatRelativeTime, getInitials } from '@/lib/utils/format';
import { getRatingLabel } from '@/lib/utils/rating';
import { cn } from '@/lib/design-system/utils';
import { Rating } from '@/components/composite/Rating';
import { Badge, Button } from '@/components/ui';
import { USAGE_DURATION_OPTIONS } from '@/types';

export interface ReviewCardProps {
  review: Review;
  onVoteHelpful?: (reviewId: string, isHelpful: boolean) => void;
  showProduct?: boolean;
}

export function ReviewCard({
  review,
  onVoteHelpful,
  showProduct = false,
}: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongReview = review.review_body.length > 300;

  const usageDurationLabel = USAGE_DURATION_OPTIONS.find(
    opt => opt.value === review.usage_duration
  )?.label;

  return (
    <div className="border-b border-gray-100 py-6 last:border-0">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {review.profile?.profile_image ? (
            <Image
              src={review.profile.profile_image}
              alt={review.profile.display_name || 'Reviewer'}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {getInitials(review.profile?.display_name || 'Anonymous')}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">
              {review.profile?.display_name || 'Anonymous'}
            </span>
            {review.verified_purchase && (
              <Badge variant="success" size="sm" icon={<FaCheckCircle className="w-3 h-3" />}>
                Verified Purchase
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Rating value={review.overall_rating} size="sm" />
            <span>{getRatingLabel(review.overall_rating)}</span>
            <span>•</span>
            <span>{formatRelativeTime(review.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      {review.review_title && (
        <h4 className="font-semibold text-gray-900 mb-2">
          {review.review_title}
        </h4>
      )}

      {/* Body */}
      <div className="text-gray-700 mb-4">
        {isLongReview && !isExpanded ? (
          <>
            <p>{review.review_body.slice(0, 300)}...</p>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-accent-600 hover:text-accent-700 font-medium mt-1"
            >
              Read more
            </button>
          </>
        ) : (
          <p className="whitespace-pre-wrap">{review.review_body}</p>
        )}
      </div>

      {/* Pros and Cons */}
      {(review.pros?.length || review.cons?.length) && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {review.pros && review.pros.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-success-700 mb-2">Pros</h5>
              <ul className="space-y-1">
                {review.pros.map((pro, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-success-500 mt-0.5">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {review.cons && review.cons.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-error-700 mb-2">Cons</h5>
              <ul className="space-y-1">
                {review.cons.map((con, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-error-500 mt-0.5">-</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Additional Ratings */}
      {(review.effectiveness_rating || review.value_rating || review.quality_rating) && (
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          {review.effectiveness_rating && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Effectiveness:</span>
              <Rating value={review.effectiveness_rating} size="sm" />
            </div>
          )}
          {review.value_rating && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Value:</span>
              <Rating value={review.value_rating} size="sm" />
            </div>
          )}
          {review.quality_rating && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Quality:</span>
              <Rating value={review.quality_rating} size="sm" />
            </div>
          )}
        </div>
      )}

      {/* Usage Duration */}
      {usageDurationLabel && (
        <p className="text-sm text-gray-500 mb-4">
          Used for: {usageDurationLabel}
        </p>
      )}

      {/* Recommendation */}
      {review.would_recommend !== undefined && (
        <p
          className={cn(
            'mb-4 flex items-center gap-1.5 text-sm font-medium',
            review.would_recommend ? 'text-success-600' : 'text-error-600'
          )}
        >
          {review.would_recommend ? (
            <FaCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <FaTimesCircle className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {review.would_recommend ? 'Would recommend' : 'Would not recommend'}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Was this helpful?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onVoteHelpful?.(review.review_id, true)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-success-600 transition-colors"
            >
              <FaThumbsUp className="w-3 h-3" />
              <span>Yes ({review.helpful_count})</span>
            </button>
            <button
              onClick={() => onVoteHelpful?.(review.review_id, false)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-error-600 transition-colors"
            >
              <FaThumbsDown className="w-3 h-3" />
              <span>No</span>
            </button>
          </div>
        </div>

        <button className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
          <FaFlag className="w-3 h-3" />
          Report
        </button>
      </div>
    </div>
  );
}

export default ReviewCard;
