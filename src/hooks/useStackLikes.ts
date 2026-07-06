'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import type { Stack } from '@/types';

export interface UseStackLikesResult {
  isLiked: boolean;
  likeCount: number;
  isLoading: boolean;
  toggleLike: () => Promise<void>;
  likedStacks: Stack[];
  fetchLikedStacks: () => Promise<void>;
}

export function useStackLikes(stackId?: string): UseStackLikesResult {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [likedStacks, setLikedStacks] = useState<Stack[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Get user's profile ID
  useEffect(() => {
    async function getProfileId() {
      if (!user) {
        setProfileId(null);
        return;
      }

      const { data } = await supabase
        .from('user_profiles')
        .select('profile_id')
        .eq('user_id', user.id)
        .single();

      setProfileId(data?.profile_id || null);
    }

    getProfileId();
  }, [user]);

  // Check if stack is liked and get like count
  useEffect(() => {
    async function checkLikeStatus() {
      if (!stackId) return;

      // Get like count
      const { data: stack } = await supabase
        .from('stacks')
        .select('like_count')
        .eq('stack_id', stackId)
        .single();

      setLikeCount(stack?.like_count || 0);

      // Check if user has liked
      if (profileId) {
        const { data: like } = await supabase
          .from('stack_likes')
          .select('like_id')
          .eq('stack_id', stackId)
          .eq('profile_id', profileId)
          .single();

        setIsLiked(!!like);
      }
    }

    checkLikeStatus();
  }, [stackId, profileId]);

  // Toggle like
  const toggleLike = useCallback(async () => {
    if (!user || !stackId || !profileId) {
      throw new Error('Must be logged in to like stacks');
    }

    setIsLoading(true);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('stack_likes')
          .delete()
          .eq('stack_id', stackId)
          .eq('profile_id', profileId);

        if (error) throw error;

        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from('stack_likes')
          .insert({
            stack_id: stackId,
            profile_id: profileId,
          });

        if (error) throw error;

        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }

      // stacks.like_count is maintained by the trigger_update_like_counts
      // database trigger; re-read the authoritative value instead of writing
      // it a second time here (a double-write would drift the count).
      const { data: stack } = await supabase
        .from('stacks')
        .select('like_count')
        .eq('stack_id', stackId)
        .single();

      if (typeof stack?.like_count === 'number') {
        setLikeCount(stack.like_count);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, stackId, profileId, isLiked]);

  // Fetch all stacks the user has liked
  const fetchLikedStacks = useCallback(async () => {
    if (!profileId) {
      setLikedStacks([]);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('stack_likes')
        .select(`
          stack:stacks(
            *,
            profile:user_profiles(
              profile_id,
              username,
              display_name,
              profile_image,
              is_verified,
              is_influencer
            ),
            stack_supplements(
              supplement_id,
              dosage,
              is_core,
              order_index,
              supplements(supplement_name)
            )
          )
        `)
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const stacks = (data || [])
        .map((item: any) => item.stack)
        .filter(Boolean)
        .map((stack: any) => ({
          ...stack,
          supplements: (stack.stack_supplements || []).map((ss: any) => ({
            supplement_id: ss.supplement_id,
            supplement_name: ss.supplements?.supplement_name || '',
            dosage: ss.dosage,
            is_core: ss.is_core,
            order_index: ss.order_index,
          })),
        }));

      setLikedStacks(stacks);
    } catch (err) {
      console.error('Error fetching liked stacks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  return {
    isLiked,
    likeCount,
    isLoading,
    toggleLike,
    likedStacks,
    fetchLikedStacks,
  };
}

export default useStackLikes;
