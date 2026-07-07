'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import type {
  SupplementLog,
  SupplementLogInput,
  DailyTrackingSummary,
  DailyWellnessInput,
  TrackingStats,
  TimeOfDay,
} from '@/types';

export interface UseSupplementLogsOptions {
  productId?: string;
  date?: string; // YYYY-MM-DD format
  startDate?: string;
  endDate?: string;
}

export interface UseSupplementLogsResult {
  logs: SupplementLog[];
  todayLogs: SupplementLog[];
  dailySummary: DailyTrackingSummary | null;
  stats: TrackingStats | null;
  isLoading: boolean;
  error: Error | null;
  logSupplement: (input: SupplementLogInput) => Promise<SupplementLog>;
  unlogSupplement: (logId: string) => Promise<void>;
  updateLog: (logId: string, updates: Partial<SupplementLogInput>) => Promise<void>;
  saveWellnessData: (data: DailyWellnessInput) => Promise<void>;
  isLoggedToday: (productId: string, timeOfDay?: TimeOfDay) => boolean;
  getLogsForDate: (date: string) => SupplementLog[];
  refreshLogs: () => Promise<void>;
}

function getLocalDateString(date: Date = new Date()): string {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().split('T')[0];
}

function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function useSupplementLogs(options: UseSupplementLogsOptions = {}): UseSupplementLogsResult {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SupplementLog[]>([]);
  const [dailySummary, setDailySummary] = useState<DailyTrackingSummary | null>(null);
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const today = getLocalDateString();

  // Fetch logs for the specified date range or today
  const fetchLogs = useCallback(async () => {
    if (!user) {
      setLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('supplement_logs')
        .select(`
          *,
          products (
            product_id,
            product_name,
            product_image,
            supplements (supplement_name)
          )
        `)
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false });

      // Apply filters
      if (options.productId) {
        query = query.eq('product_id', options.productId);
      }

      if (options.date) {
        query = query.eq('log_date', options.date);
      } else if (options.startDate && options.endDate) {
        query = query.gte('log_date', options.startDate).lte('log_date', options.endDate);
      } else {
        // Default: fetch last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('log_date', getLocalDateString(thirtyDaysAgo));
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      setLogs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch logs'));
      console.error('Error fetching supplement logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, options.productId, options.date, options.startDate, options.endDate]);

  // Fetch daily summary
  const fetchDailySummary = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error: queryError } = await supabase
        .from('daily_tracking_summary')
        .select('*')
        .eq('user_id', user.id)
        .eq('summary_date', today)
        .limit(1);

      if (queryError) {
        throw queryError;
      }

      setDailySummary(((data || [])[0] as DailyTrackingSummary | undefined) || null);
    } catch (err) {
      console.error('Error fetching daily summary:', err);
    }
  }, [user, today]);

  // Fetch tracking stats
  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      // Get current streak from daily summary
      const { data: summaryData } = await supabase
        .from('daily_tracking_summary')
        .select('current_streak, completion_percentage')
        .eq('user_id', user.id)
        .order('summary_date', { ascending: false })
        .limit(30);

      // Calculate stats
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      const { count: weekCount } = await supabase
        .from('supplement_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('log_date', getLocalDateString(weekAgo));

      const { count: monthCount } = await supabase
        .from('supplement_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('log_date', getLocalDateString(monthAgo));

      // Calculate perfect days and average completion
      const summaries = summaryData || [];
      const perfectDays = summaries.filter(s => s.completion_percentage >= 100).length;
      const avgCompletion = summaries.length > 0
        ? summaries.reduce((sum, s) => sum + (s.completion_percentage || 0), 0) / summaries.length
        : 0;

      // Find longest streak (simplified - just use current)
      const currentStreak = summaries[0]?.current_streak || 0;

      setStats({
        currentStreak,
        longestStreak: currentStreak, // Would need historical data for true longest
        totalLogsThisWeek: weekCount || 0,
        totalLogsThisMonth: monthCount || 0,
        averageCompletion: Math.round(avgCompletion),
        perfectDays,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchLogs();
    fetchDailySummary();
    fetchStats();
  }, [fetchLogs, fetchDailySummary, fetchStats]);

  // Log a supplement
  const logSupplement = useCallback(async (input: SupplementLogInput): Promise<SupplementLog> => {
    if (!user) {
      throw new Error('Please log in to track supplements');
    }

    const logData = {
      user_id: user.id,
      product_id: input.product_id,
      log_date: today,
      logged_at: new Date().toISOString(),
      time_of_day: input.time_of_day || getCurrentTimeOfDay(),
      servings_taken: input.servings_taken || 1,
      notes: input.notes || null,
      mood_before: input.mood_before || null,
      mood_after: input.mood_after || null,
      energy_level: input.energy_level || null,
      side_effects: input.side_effects || null,
    };

    const { data, error: insertError } = await supabase
      .from('supplement_logs')
      .insert(logData)
      .select(`
        *,
        products (
          product_id,
          product_name,
          product_image,
          supplements (supplement_name)
        )
      `)
      .single();

    if (insertError) {
      throw insertError;
    }

    // Update local state
    setLogs(prev => [data, ...prev]);

    // Refresh summary and stats
    fetchDailySummary();
    fetchStats();

    return data;
  }, [user, today, fetchDailySummary, fetchStats]);

  // Unlog a supplement
  const unlogSupplement = useCallback(async (logId: string): Promise<void> => {
    if (!user) {
      throw new Error('Please log in to manage supplements');
    }

    const { error: deleteError } = await supabase
      .from('supplement_logs')
      .delete()
      .eq('log_id', logId)
      .eq('user_id', user.id);

    if (deleteError) {
      throw deleteError;
    }

    // Update local state
    setLogs(prev => prev.filter(log => log.log_id !== logId));

    // Refresh summary and stats
    fetchDailySummary();
    fetchStats();
  }, [user, fetchDailySummary, fetchStats]);

  // Update a log
  const updateLog = useCallback(async (logId: string, updates: Partial<SupplementLogInput>): Promise<void> => {
    if (!user) {
      throw new Error('Please log in to manage supplements');
    }

    const { error: updateError } = await supabase
      .from('supplement_logs')
      .update(updates)
      .eq('log_id', logId)
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Update local state
    setLogs(prev => prev.map(log =>
      log.log_id === logId ? { ...log, ...updates } : log
    ));
  }, [user]);

  // Check if product is logged today
  const isLoggedToday = useCallback((productId: string, timeOfDay?: TimeOfDay): boolean => {
    return logs.some(log =>
      log.product_id === productId &&
      log.log_date === today &&
      (timeOfDay ? log.time_of_day === timeOfDay : true)
    );
  }, [logs, today]);

  // Get logs for a specific date
  const getLogsForDate = useCallback((date: string): SupplementLog[] => {
    return logs.filter(log => log.log_date === date);
  }, [logs]);

  // Get today's logs
  const todayLogs = logs.filter(log => log.log_date === today);

  // Save wellness data (mood, energy, sleep)
  const saveWellnessData = useCallback(async (data: DailyWellnessInput): Promise<void> => {
    if (!user) {
      throw new Error('Please log in to save wellness data');
    }

    const wellnessData = {
      user_id: user.id,
      summary_date: today,
      overall_mood: data.overall_mood || null,
      overall_energy: data.overall_energy || null,
      sleep_quality: data.sleep_quality || null,
      sleep_hours: data.sleep_hours || null,
      daily_notes: data.daily_notes || null,
    };

    // Check if summary exists for today
    const { data: existingRows, error: existingError } = await supabase
      .from('daily_tracking_summary')
      .select('summary_id')
      .eq('user_id', user.id)
      .eq('summary_date', today)
      .limit(1);

    if (existingError) throw existingError;
    const existing = (existingRows || [])[0] as { summary_id: string } | undefined;

    if (existing) {
      // Update existing
      const { error: updateError } = await supabase
        .from('daily_tracking_summary')
        .update({
          overall_mood: wellnessData.overall_mood,
          overall_energy: wellnessData.overall_energy,
          sleep_quality: wellnessData.sleep_quality,
          sleep_hours: wellnessData.sleep_hours,
          daily_notes: wellnessData.daily_notes,
        })
        .eq('summary_id', existing.summary_id);

      if (updateError) throw updateError;
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from('daily_tracking_summary')
        .insert(wellnessData);

      if (insertError) throw insertError;
    }

    // Refresh summary
    await fetchDailySummary();
  }, [user, today, fetchDailySummary]);

  // Refresh function
  const refreshLogs = useCallback(async () => {
    await Promise.all([fetchLogs(), fetchDailySummary(), fetchStats()]);
  }, [fetchLogs, fetchDailySummary, fetchStats]);

  return {
    logs,
    todayLogs,
    dailySummary,
    stats,
    isLoading,
    error,
    logSupplement,
    unlogSupplement,
    updateLog,
    saveWellnessData,
    isLoggedToday,
    getLogsForDate,
    refreshLogs,
  };
}

export default useSupplementLogs;
