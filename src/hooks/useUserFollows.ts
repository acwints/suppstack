'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import type { UserProfile } from '@/types';

export interface UseUserFollowsResult {
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
  isLoading: boolean;
  toggleFollow: () => Promise<void>;
  followers: UserProfile[];
  following: UserProfile[];
  fetchFollowers: (profileId: string) => Promise<void>;
  fetchFollowing: (profileId: string) => Promise<void>;
}

export function useUserFollows(targetProfileId?: string): UseUserFollowsResult {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [myProfileId, setMyProfileId] = useState<string | null>(null);

  // Get current user's profile ID
  useEffect(() => {
    async function getMyProfileId() {
      if (!user) {
        setMyProfileId(null);
        return;
      }

      const { data } = await supabase
        .from('user_profiles')
        .select('profile_id')
        .eq('user_id', user.id)
        .single();

      setMyProfileId(data?.profile_id || null);
    }

    getMyProfileId();
  }, [user]);

  // Check follow status and counts
  useEffect(() => {
    async function checkFollowStatus() {
      if (!targetProfileId) return;

      // Get follower/following counts
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('follower_count, following_count')
        .eq('profile_id', targetProfileId)
        .single();

      setFollowerCount(profile?.follower_count || 0);
      setFollowingCount(profile?.following_count || 0);

      // Check if current user is following
      if (myProfileId && targetProfileId !== myProfileId) {
        const { data: follow } = await supabase
          .from('user_follows')
          .select('follow_id')
          .eq('follower_id', myProfileId)
          .eq('following_id', targetProfileId)
          .single();

        setIsFollowing(!!follow);
      }
    }

    checkFollowStatus();
  }, [targetProfileId, myProfileId]);

  // Toggle follow
  const toggleFollow = useCallback(async () => {
    if (!user || !targetProfileId || !myProfileId) {
      throw new Error('Must be logged in to follow users');
    }

    if (targetProfileId === myProfileId) {
      throw new Error('Cannot follow yourself');
    }

    setIsLoading(true);

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', myProfileId)
          .eq('following_id', targetProfileId);

        if (error) throw error;

        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: myProfileId,
            following_id: targetProfileId,
          });

        if (error) throw error;

        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }

      // follower_count / following_count are maintained by the
      // trigger_update_follower_counts database trigger. Re-read the target's
      // authoritative follower count rather than writing it again here — the
      // previous manual updates double-counted and drifted over time.
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('follower_count')
        .eq('profile_id', targetProfileId)
        .single();

      if (typeof profile?.follower_count === 'number') {
        setFollowerCount(profile.follower_count);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, targetProfileId, myProfileId, isFollowing]);

  // Fetch followers for a profile
  const fetchFollowers = useCallback(async (profileId: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          follower:user_profiles!user_follows_follower_id_fkey(
            profile_id,
            user_id,
            username,
            display_name,
            profile_image,
            bio,
            is_verified,
            is_influencer,
            follower_count
          )
        `)
        .eq('following_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const followerProfiles = (data || [])
        .map((item: any) => item.follower)
        .filter(Boolean);

      setFollowers(followerProfiles);
    } catch (err) {
      console.error('Error fetching followers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch who a profile is following
  const fetchFollowing = useCallback(async (profileId: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          following:user_profiles!user_follows_following_id_fkey(
            profile_id,
            user_id,
            username,
            display_name,
            profile_image,
            bio,
            is_verified,
            is_influencer,
            follower_count
          )
        `)
        .eq('follower_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const followingProfiles = (data || [])
        .map((item: any) => item.following)
        .filter(Boolean);

      setFollowing(followingProfiles);
    } catch (err) {
      console.error('Error fetching following:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isFollowing,
    followerCount,
    followingCount,
    isLoading,
    toggleFollow,
    followers,
    following,
    fetchFollowers,
    fetchFollowing,
  };
}

export default useUserFollows;
