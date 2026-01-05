'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import type { Review, ReviewInput, ProductRatingStats } from '@/types';

export type ReviewSortBy = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';

export interface UseReviewsOptions {
  productId: string;
  sortBy?: ReviewSortBy;
  limit?: number;
  enabled?: boolean;
}

export interface UseReviewsResult {
  reviews: Review[];
  stats: ProductRatingStats | null;
  isLoading: boolean;
  error: Error | null;
  userReview: Review | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  submitReview: (review: ReviewInput) => Promise<void>;
  updateReview: (reviewId: string, review: Partial<ReviewInput>) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  voteHelpful: (reviewId: string, isHelpful: boolean) => Promise<void>;
}

const PAGE_SIZE = 10;

export function useReviews({
  productId,
  sortBy = 'newest',
  limit,
  enabled = true,
}: UseReviewsOptions): UseReviewsResult {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ProductRatingStats | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch reviews
  const fetchReviews = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (!enabled || !productId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build query
      let query = supabase
        .from('product_reviews')
        .select(`
          *,
          profile:user_profiles(
            profile_id,
            username,
            display_name,
            profile_image
          )
        `, { count: 'exact' })
        .eq('product_id', productId)
        .eq('is_approved', true);

      // Apply sorting
      switch (sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest':
          query = query.order('overall_rating', { ascending: false });
          break;
        case 'lowest':
          query = query.order('overall_rating', { ascending: true });
          break;
        case 'helpful':
          query = query.order('helpful_count', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const pageSize = limit || PAGE_SIZE;
      const from = pageNum * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      if (append) {
        setReviews(prev => [...prev, ...(data || [])]);
      } else {
        setReviews(data || []);
      }
      setTotalCount(count || 0);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch reviews'));
      console.error('Error fetching reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, productId, sortBy, limit]);

  // Fetch rating stats
  const fetchStats = useCallback(async () => {
    if (!enabled || !productId) return;

    try {
      const { data, error: queryError } = await supabase
        .from('product_rating_stats')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        throw queryError;
      }

      setStats(data);
    } catch (err) {
      console.error('Error fetching rating stats:', err);
    }
  }, [enabled, productId]);

  // Fetch user's review if logged in
  const fetchUserReview = useCallback(async () => {
    if (!enabled || !productId || !user) {
      setUserReview(null);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        throw queryError;
      }

      setUserReview(data);
    } catch (err) {
      console.error('Error fetching user review:', err);
    }
  }, [enabled, productId, user]);

  // Initial fetch
  useEffect(() => {
    setPage(0);
    fetchReviews(0, false);
    fetchStats();
    fetchUserReview();
  }, [productId, sortBy]);

  // Load more reviews
  const loadMore = useCallback(async () => {
    await fetchReviews(page + 1, true);
  }, [fetchReviews, page]);

  const hasMore = useMemo(() => {
    const pageSize = limit || PAGE_SIZE;
    return reviews.length < totalCount && reviews.length >= pageSize;
  }, [reviews.length, totalCount, limit]);

  // Submit a new review
  const submitReview = useCallback(async (review: ReviewInput) => {
    if (!user) throw new Error('Must be logged in to submit a review');

    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('profile_id')
        .eq('user_id', user.id)
        .single();

      const { error: insertError } = await supabase
        .from('product_reviews')
        .insert({
          ...review,
          user_id: user.id,
          profile_id: profile?.profile_id,
        });

      if (insertError) throw insertError;

      // Refresh data
      await Promise.all([
        fetchReviews(0, false),
        fetchStats(),
        fetchUserReview(),
      ]);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to submit review');
    }
  }, [user, fetchReviews, fetchStats, fetchUserReview]);

  // Update an existing review
  const updateReview = useCallback(async (reviewId: string, review: Partial<ReviewInput>) => {
    if (!user) throw new Error('Must be logged in to update a review');

    try {
      const { error: updateError } = await supabase
        .from('product_reviews')
        .update({
          ...review,
          updated_at: new Date().toISOString(),
        })
        .eq('review_id', reviewId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Refresh data
      await Promise.all([
        fetchReviews(0, false),
        fetchStats(),
        fetchUserReview(),
      ]);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update review');
    }
  }, [user, fetchReviews, fetchStats, fetchUserReview]);

  // Delete a review
  const deleteReview = useCallback(async (reviewId: string) => {
    if (!user) throw new Error('Must be logged in to delete a review');

    try {
      const { error: deleteError } = await supabase
        .from('product_reviews')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Refresh data
      await Promise.all([
        fetchReviews(0, false),
        fetchStats(),
        fetchUserReview(),
      ]);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete review');
    }
  }, [user, fetchReviews, fetchStats, fetchUserReview]);

  // Vote on a review's helpfulness
  const voteHelpful = useCallback(async (reviewId: string, isHelpful: boolean) => {
    if (!user) throw new Error('Must be logged in to vote');

    try {
      // Check for existing vote
      const { data: existingVote } = await supabase
        .from('review_votes')
        .select('vote_id, is_helpful')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        if (existingVote.is_helpful === isHelpful) {
          // Remove vote if clicking same option
          await supabase
            .from('review_votes')
            .delete()
            .eq('vote_id', existingVote.vote_id);
        } else {
          // Update vote
          await supabase
            .from('review_votes')
            .update({ is_helpful: isHelpful })
            .eq('vote_id', existingVote.vote_id);
        }
      } else {
        // Insert new vote
        await supabase
          .from('review_votes')
          .insert({
            review_id: reviewId,
            user_id: user.id,
            is_helpful: isHelpful,
          });
      }

      // Refresh reviews to update helpful counts
      await fetchReviews(0, false);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to vote');
    }
  }, [user, fetchReviews]);

  const refetch = useCallback(async () => {
    await Promise.all([
      fetchReviews(0, false),
      fetchStats(),
      fetchUserReview(),
    ]);
  }, [fetchReviews, fetchStats, fetchUserReview]);

  return {
    reviews,
    stats,
    isLoading,
    error,
    userReview,
    hasMore,
    loadMore,
    refetch,
    submitReview,
    updateReview,
    deleteReview,
    voteHelpful,
  };
}

export default useReviews;
