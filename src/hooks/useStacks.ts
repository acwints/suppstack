'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import type { Stack, StackInput, StackSupplementInput } from '@/types';
import { getOrCreateUserProfile } from '@/lib/account/profile';
import { resolveDatabaseSupplementId } from '@/lib/catalog/supplement-sync';

/**
 * Stack inputs may reference static catalog supplements (IDs 9000+), which
 * must be mapped to real `supplements` rows before hitting foreign keys.
 * Resolution happens before any stack row is written so a failed sync never
 * leaves an orphaned, empty stack behind.
 */
async function resolveStackSupplementRows(supplements: StackSupplementInput[]) {
  return Promise.all(
    supplements.map(async (supp) => ({
      supplement_id: await resolveDatabaseSupplementId(supp.supplement_id),
      dosage: supp.dosage || null,
      frequency: supp.frequency || null,
      notes: supp.notes || null,
      is_core: supp.is_core ?? true,
      order_index: supp.order_index,
    }))
  );
}

export type StackSortBy = 'newest' | 'popular' | 'most_liked' | 'most_copied';
export type StackFilter = 'all' | 'featured' | 'verified' | 'my_stacks';

export interface UseStacksOptions {
  filter?: StackFilter;
  sortBy?: StackSortBy;
  limit?: number;
  userId?: string;
  enabled?: boolean;
}

export interface UseStacksResult {
  stacks: Stack[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  createStack: (input: StackInput) => Promise<Stack>;
  updateStack: (stackId: string, input: Partial<StackInput>) => Promise<void>;
  deleteStack: (stackId: string) => Promise<void>;
  copyStack: (stackId: string) => Promise<Stack>;
  getStack: (stackId: string) => Promise<Stack | null>;
  getUserStacks: (profileId: string) => Promise<Stack[]>;
}

const PAGE_SIZE = 12;

export function useStacks(options: UseStacksOptions = {}): UseStacksResult {
  const {
    filter = 'all',
    sortBy = 'popular',
    limit,
    userId,
    enabled = true,
  } = options;

  const { user } = useAuth();
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch stacks with filters
  const fetchStacks = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (filter === 'my_stacks' && !user) {
        setStacks([]);
        setTotalCount(0);
        setIsLoading(false);
        return;
      }

      let query = supabase
        .from('stacks')
        .select(`
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
            frequency,
            notes,
            is_core,
            order_index,
            supplements(supplement_name)
          )
        `, { count: 'exact' });

      // Apply filters
      if (filter === 'featured') {
        query = query.eq('is_featured', true);
      } else if (filter === 'verified') {
        query = query.eq('is_verified', true);
      } else if (filter === 'my_stacks' && user) {
        const profile = await getOrCreateUserProfile(user);
        query = query.eq('profile_id', profile.profile_id);
      }

      // Only show public stacks unless viewing own
      if (filter !== 'my_stacks') {
        query = query.eq('is_public', true);
      }

      // Filter by specific user
      if (userId) {
        query = query.eq('profile_id', userId);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'most_liked':
          query = query.order('like_count', { ascending: false });
          break;
        case 'most_copied':
          query = query.order('copy_count', { ascending: false });
          break;
        case 'popular':
        default:
          query = query.order('view_count', { ascending: false });
      }

      // Apply pagination
      const pageSize = limit || PAGE_SIZE;
      const from = pageNum * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      // Transform data to match Stack type
      const transformedStacks = (data || []).map((stack: any) => ({
        ...stack,
        supplements: (stack.stack_supplements || []).map((ss: any) => ({
          supplement_id: ss.supplement_id,
          supplement_name: ss.supplements?.supplement_name || '',
          dosage: ss.dosage,
          frequency: ss.frequency,
          notes: ss.notes,
          is_core: ss.is_core,
          order_index: ss.order_index,
        })),
      }));

      if (append) {
        setStacks(prev => [...prev, ...transformedStacks]);
      } else {
        setStacks(transformedStacks);
      }
      setTotalCount(count || 0);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stacks'));
      console.error('Error fetching stacks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, filter, sortBy, limit, userId, user]);

  // Initial fetch
  useEffect(() => {
    setPage(0);
    fetchStacks(0, false);
  }, [fetchStacks, filter, sortBy, userId]);

  // Load more
  const loadMore = useCallback(async () => {
    await fetchStacks(page + 1, true);
  }, [fetchStacks, page]);

  const hasMore = stacks.length < totalCount;

  // Create a new stack
  const createStack = useCallback(async (input: StackInput): Promise<Stack> => {
    if (!user) throw new Error('Must be logged in to create a stack');

    // Resolve supplements to database rows first so a failed sync never
    // leaves an orphaned, empty stack behind.
    const [profile, supplementRows] = await Promise.all([
      getOrCreateUserProfile(user),
      resolveStackSupplementRows(input.supplements),
    ]);

    // Create the stack
    const { data: stack, error: stackError } = await supabase
      .from('stacks')
      .insert({
        profile_id: profile.profile_id,
        stack_name: input.stack_name,
        stack_description: input.stack_description,
        stack_image: input.stack_image || null,
        is_public: input.is_public ?? true,
        source_title: input.source_title || null,
        source_url: input.source_url || null,
        source_type: input.source_type || null,
        source_date: input.source_date || null,
      })
      .select()
      .single();

    if (stackError) throw stackError;

    // Add supplements to stack
    if (supplementRows.length > 0) {
      const { error: suppError } = await supabase
        .from('stack_supplements')
        .insert(supplementRows.map((row) => ({ ...row, stack_id: stack.stack_id })));

      if (suppError) throw suppError;
    }

    // Refetch to get complete data
    await fetchStacks(0, false);

    return stack;
  }, [user, fetchStacks]);

  // Update a stack
  const updateStack = useCallback(async (stackId: string, input: Partial<StackInput>): Promise<void> => {
    if (!user) throw new Error('Must be logged in to update a stack');

    // Update stack details
    const updateData: any = {};
    if (input.stack_name !== undefined) updateData.stack_name = input.stack_name;
    if (input.stack_description !== undefined) updateData.stack_description = input.stack_description;
    if (input.stack_image !== undefined) updateData.stack_image = input.stack_image;
    if (input.is_public !== undefined) updateData.is_public = input.is_public;
    if (input.source_title !== undefined) updateData.source_title = input.source_title;
    if (input.source_url !== undefined) updateData.source_url = input.source_url;
    if (input.source_type !== undefined) updateData.source_type = input.source_type;
    if (input.source_date !== undefined) updateData.source_date = input.source_date;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('stacks')
        .update(updateData)
        .eq('stack_id', stackId);

      if (updateError) throw updateError;
    }

    // Update supplements if provided
    if (input.supplements) {
      // Resolve before deleting so a failed sync leaves the stack intact.
      const supplementRows = await resolveStackSupplementRows(input.supplements);

      // Delete existing supplements
      await supabase
        .from('stack_supplements')
        .delete()
        .eq('stack_id', stackId);

      // Add new supplements
      if (supplementRows.length > 0) {
        const { error: suppError } = await supabase
          .from('stack_supplements')
          .insert(supplementRows.map((row) => ({ ...row, stack_id: stackId })));

        if (suppError) throw suppError;
      }
    }

    await fetchStacks(0, false);
  }, [user, fetchStacks]);

  // Delete a stack
  const deleteStack = useCallback(async (stackId: string): Promise<void> => {
    if (!user) throw new Error('Must be logged in to delete a stack');

    const { error: deleteError } = await supabase
      .from('stacks')
      .delete()
      .eq('stack_id', stackId);

    if (deleteError) throw deleteError;

    setStacks(prev => prev.filter(s => s.stack_id !== stackId));
  }, [user]);

  // Copy a stack (create a copy for the current user)
  const copyStack = useCallback(async (stackId: string): Promise<Stack> => {
    if (!user) throw new Error('Must be logged in to copy a stack');

    // Get the original stack
    const { data: original, error: fetchError } = await supabase
      .from('stacks')
      .select(`
        *,
        stack_supplements(*)
      `)
      .eq('stack_id', stackId)
      .single();

    if (fetchError || !original) throw new Error('Stack not found');

    const profile = await getOrCreateUserProfile(user);

    // Create a copy
    const { data: newStack, error: createError } = await supabase
      .from('stacks')
      .insert({
        profile_id: profile.profile_id,
        stack_name: `${original.stack_name} (Copy)`,
        stack_description: original.stack_description,
        stack_image: original.stack_image,
        is_public: false, // Private by default
        source_title: original.source_title,
        source_url: original.source_url,
        source_type: original.source_type,
        source_date: original.source_date,
      })
      .select()
      .single();

    if (createError) throw createError;

    // Copy supplements
    if (original.stack_supplements?.length > 0) {
      const supplementsData = original.stack_supplements.map((supp: any) => ({
        stack_id: newStack.stack_id,
        supplement_id: supp.supplement_id,
        dosage: supp.dosage,
        frequency: supp.frequency,
        notes: supp.notes,
        is_core: supp.is_core,
        order_index: supp.order_index,
      }));

      await supabase.from('stack_supplements').insert(supplementsData);
    }

    // Increment copy count on original
    await supabase
      .from('stacks')
      .update({ copy_count: (original.copy_count || 0) + 1 })
      .eq('stack_id', stackId);

    return newStack;
  }, [user]);

  // Get a single stack by ID
  const getStack = useCallback(async (stackId: string): Promise<Stack | null> => {
    const { data, error: queryError } = await supabase
      .from('stacks')
      .select(`
        *,
        profile:user_profiles(
          profile_id,
          username,
          display_name,
          profile_image,
          is_verified,
          is_influencer,
          bio,
          follower_count
        ),
        stack_supplements(
          supplement_id,
          dosage,
          frequency,
          notes,
          is_core,
          order_index,
          supplements(supplement_name)
        )
      `)
      .eq('stack_id', stackId)
      .single();

    if (queryError) {
      console.error('Error fetching stack:', queryError);
      return null;
    }

    // Increment view count
    await supabase
      .from('stacks')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('stack_id', stackId);

    // Transform data
    return {
      ...data,
      supplements: (data.stack_supplements || []).map((ss: any) => ({
        supplement_id: ss.supplement_id,
        supplement_name: ss.supplements?.supplement_name || '',
        dosage: ss.dosage,
        frequency: ss.frequency,
        notes: ss.notes,
        is_core: ss.is_core,
        order_index: ss.order_index,
      })),
    };
  }, []);

  // Get stacks for a specific user
  const getUserStacks = useCallback(async (profileId: string): Promise<Stack[]> => {
    const { data, error: queryError } = await supabase
      .from('stacks')
      .select(`
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
          frequency,
          notes,
          is_core,
          order_index,
          supplements(supplement_name)
        )
      `)
      .eq('profile_id', profileId)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error('Error fetching user stacks:', queryError);
      return [];
    }

    return (data || []).map((stack: any) => ({
      ...stack,
      supplements: (stack.stack_supplements || []).map((ss: any) => ({
        supplement_id: ss.supplement_id,
        supplement_name: ss.supplements?.supplement_name || '',
        dosage: ss.dosage,
        frequency: ss.frequency,
        notes: ss.notes,
        is_core: ss.is_core,
        order_index: ss.order_index,
      })),
    }));
  }, []);

  const refetch = useCallback(async () => {
    await fetchStacks(0, false);
  }, [fetchStacks]);

  return {
    stacks,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch,
    createStack,
    updateStack,
    deleteStack,
    copyStack,
    getStack,
    getUserStacks,
  };
}

export default useStacks;
