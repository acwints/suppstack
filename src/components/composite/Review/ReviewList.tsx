'use client';

import { useState } from 'react';
import { FaStar, FaEdit, FaPlus } from 'react-icons/fa';
import type { Review, ProductRatingStats, ReviewInput } from '@/types';
import type { ReviewSortBy } from '@/hooks/useReviews';
import { Button, Select, Skeleton } from '@/components/ui';
import { RatingBreakdown } from '@/components/composite/Rating';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

export interface ReviewListProps {
  productId: string;
  productName: string;
  reviews: Review[];
  stats: ProductRatingStats | null;
  userReview: Review | null;
  isLoading: boolean;
  hasMore: boolean;
  sortBy: ReviewSortBy;
  onSortChange: (sort: ReviewSortBy) => void;
  onLoadMore: () => void;
  onSubmitReview: (review: ReviewInput) => Promise<void>;
  onUpdateReview: (reviewId: string, review: Partial<ReviewInput>) => Promise<void>;
  onDeleteReview: (reviewId: string) => Promise<void>;
  onVoteHelpful: (reviewId: string, isHelpful: boolean) => void;
  isLoggedIn: boolean;
}

const sortOptions = [
  { value: 'newest', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
  { value: 'helpful', label: 'Most Helpful' },
];

export function ReviewList({
  productId,
  productName,
  reviews,
  stats,
  userReview,
  isLoading,
  hasMore,
  sortBy,
  onSortChange,
  onLoadMore,
  onSubmitReview,
  onUpdateReview,
  onDeleteReview,
  onVoteHelpful,
  isLoggedIn,
}: ReviewListProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);

  const handleSubmitReview = async (review: ReviewInput) => {
    await onSubmitReview(review);
    setShowReviewForm(false);
  };

  const handleUpdateReview = async (review: ReviewInput) => {
    if (userReview) {
      await onUpdateReview(userReview.review_id, review);
      setIsEditingReview(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Customer Reviews
        </h2>
        {isLoggedIn && !userReview && !showReviewForm && (
          <Button
            variant="primary"
            leftIcon={<FaPlus className="w-4 h-4" />}
            onClick={() => setShowReviewForm(true)}
          >
            Write a Review
          </Button>
        )}
      </div>

      {/* Stats Section */}
      {stats && stats.total_reviews > 0 && (
        <div className="bg-gray-50 rounded-xl p-6">
          <RatingBreakdown stats={stats} />
        </div>
      )}

      {/* User's Review Section */}
      {userReview && !isEditingReview && (
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Your Review</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FaEdit className="w-3 h-3" />}
                onClick={() => setIsEditingReview(true)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to delete your review?')) {
                    onDeleteReview(userReview.review_id);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
          <ReviewCard review={userReview} />
        </div>
      )}

      {/* Edit Review Form */}
      {isEditingReview && userReview && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <ReviewForm
            productId={productId}
            productName={productName}
            initialData={{
              overall_rating: userReview.overall_rating,
              effectiveness_rating: userReview.effectiveness_rating,
              value_rating: userReview.value_rating,
              quality_rating: userReview.quality_rating,
              review_title: userReview.review_title,
              review_body: userReview.review_body,
              pros: userReview.pros,
              cons: userReview.cons,
              usage_duration: userReview.usage_duration,
              would_recommend: userReview.would_recommend,
            }}
            onSubmit={handleUpdateReview}
            onCancel={() => setIsEditingReview(false)}
            isEdit
          />
        </div>
      )}

      {/* New Review Form */}
      {showReviewForm && !userReview && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <ReviewForm
            productId={productId}
            productName={productName}
            onSubmit={handleSubmitReview}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* Login Prompt */}
      {!isLoggedIn && !showReviewForm && (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <FaStar className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">
            Share your experience
          </h3>
          <p className="text-gray-600 mb-4">
            Log in to write a review and help others make informed decisions.
          </p>
          <Button variant="primary" onClick={() => window.location.href = '/login'}>
            Log In to Review
          </Button>
        </div>
      )}

      {/* Reviews List */}
      <div>
        {/* Sort Controls */}
        {reviews.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {stats?.total_reviews || reviews.length} reviews
            </p>
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as ReviewSortBy)}
              selectSize="sm"
              fullWidth={false}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && reviews.length === 0 && (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b border-gray-100 py-6">
                <div className="flex items-start gap-4 mb-4">
                  <Skeleton variant="circular" width={48} height={48} />
                  <div className="flex-1">
                    <Skeleton height={16} width={120} className="mb-2" />
                    <Skeleton height={12} width={200} />
                  </div>
                </div>
                <Skeleton height={16} width="60%" className="mb-2" />
                <Skeleton height={12} className="mb-1" />
                <Skeleton height={12} className="mb-1" />
                <Skeleton height={12} width="80%" />
              </div>
            ))}
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div>
            {reviews
              .filter(r => r.review_id !== userReview?.review_id)
              .map(review => (
                <ReviewCard
                  key={review.review_id}
                  review={review}
                  onVoteHelpful={onVoteHelpful}
                />
              ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && reviews.length === 0 && !userReview && (
          <div className="text-center py-12">
            <FaStar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your experience with this product.
            </p>
            {isLoggedIn && (
              <Button
                variant="primary"
                onClick={() => setShowReviewForm(true)}
              >
                Write the First Review
              </Button>
            )}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center pt-6">
            <Button
              variant="outline"
              onClick={onLoadMore}
              isLoading={isLoading}
            >
              Load More Reviews
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewList;
