'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import type {
  UserSupplementSettings,
  UserSupplementSettingsInput,
  SupplementStatus,
} from '@/types';

export interface UseSupplementSettingsResult {
  settings: UserSupplementSettings[];
  activeSettings: UserSupplementSettings[];
  isLoading: boolean;
  error: Error | null;
  getSettings: (productId: string) => UserSupplementSettings | undefined;
  updateSettings: (productId: string, updates: Partial<UserSupplementSettingsInput>) => Promise<void>;
  createSettings: (input: UserSupplementSettingsInput) => Promise<UserSupplementSettings>;
  updateStatus: (productId: string, status: SupplementStatus) => Promise<void>;
  deleteSettings: (productId: string) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

export function useSupplementSettings(): UseSupplementSettingsResult {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSupplementSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all settings
  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('user_supplement_settings')
        .select(`
          *,
          products (
            product_id,
            product_name,
            product_image,
            product_price,
            servings_per_container,
            supplements (supplement_name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      setSettings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch settings'));
      console.error('Error fetching supplement settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Get settings for a specific product
  const getSettings = useCallback((productId: string): UserSupplementSettings | undefined => {
    return settings.find(s => String(s.product_id) === String(productId));
  }, [settings]);

  // Create new settings
  const createSettings = useCallback(async (input: UserSupplementSettingsInput): Promise<UserSupplementSettings> => {
    if (!user) {
      throw new Error('Please log in to manage supplement settings');
    }

    const settingsData = {
      user_id: user.id,
      product_id: input.product_id,
      custom_dosage: input.custom_dosage || null,
      servings_per_day: input.servings_per_day || 1,
      schedule_times: input.schedule_times || null,
      schedule_days: input.schedule_days || [1, 2, 3, 4, 5, 6, 7], // Default to every day
      take_with_food: input.take_with_food || false,
      timing_notes: input.timing_notes || null,
      status: input.status || 'active',
      goal: input.goal || null,
      target_duration_days: input.target_duration_days || null,
      reminders_enabled: input.reminders_enabled || false,
      start_date: new Date().toISOString().split('T')[0],
    };

    const { data, error: insertError } = await supabase
      .from('user_supplement_settings')
      .upsert(settingsData, { onConflict: 'user_id,product_id' })
      .select(`
        *,
        products (
          product_id,
          product_name,
          product_image,
          product_price,
          servings_per_container,
          supplements (supplement_name)
        )
      `)
      .single();

    if (insertError) {
      throw insertError;
    }

    // Update local state
    setSettings(prev => {
      const existing = prev.findIndex(s => String(s.product_id) === String(input.product_id));
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = data;
        return updated;
      }
      return [data, ...prev];
    });

    return data;
  }, [user]);

  // Update settings
  const updateSettings = useCallback(async (productId: string, updates: Partial<UserSupplementSettingsInput>): Promise<void> => {
    if (!user) {
      throw new Error('Please log in to manage supplement settings');
    }

    const { error: updateError } = await supabase
      .from('user_supplement_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (updateError) {
      throw updateError;
    }

    // Update local state
    setSettings(prev => prev.map(s =>
      String(s.product_id) === String(productId) ? { ...s, ...updates } : s
    ));
  }, [user]);

  // Update status specifically
  const updateStatus = useCallback(async (productId: string, status: SupplementStatus): Promise<void> => {
    await updateSettings(productId, {
      status,
      ...(status === 'stopped' ? { end_date: new Date().toISOString().split('T')[0] } : {}),
    });
  }, [updateSettings]);

  // Delete settings
  const deleteSettings = useCallback(async (productId: string): Promise<void> => {
    if (!user) {
      throw new Error('Please log in to manage supplement settings');
    }

    const { error: deleteError } = await supabase
      .from('user_supplement_settings')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (deleteError) {
      throw deleteError;
    }

    // Update local state
    setSettings(prev => prev.filter(s => String(s.product_id) !== String(productId)));
  }, [user]);

  // Filter active settings
  const activeSettings = settings.filter(s => s.status === 'active');

  return {
    settings,
    activeSettings,
    isLoading,
    error,
    getSettings,
    updateSettings,
    createSettings,
    updateStatus,
    deleteSettings,
    refreshSettings: fetchSettings,
  };
}

export default useSupplementSettings;
