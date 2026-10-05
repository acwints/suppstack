'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import { getLocalDateKey } from '@/lib/utils';
import type { SupplementLog, SupplementLogInput } from '@/types';

/** How far back the stack screen needs history (weekly calendar + streak). */
const HISTORY_DAYS = 60;

const LOG_COLUMNS = 'log_id, user_id, product_id, logged_at, log_date, servings_taken, created_at';

/** Postgres unique_violation: the product is already logged for that day. */
const UNIQUE_VIOLATION = '23505';

export interface UseSupplementLogsResult {
  logs: SupplementLog[];
  todayLogs: SupplementLog[];
  isLoading: boolean;
  error: Error | null;
  logSupplement: (input: SupplementLogInput) => Promise<SupplementLog>;
  unlogSupplement: (logId: string) => Promise<void>;
}

/**
 * The signed-in user's recent supplement logs (one row per product per local
 * calendar day), with check-off and undo.
 */
export function useSupplementLogs(): UseSupplementLogsResult {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SupplementLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const today = getLocalDateKey();

  const fetchLogs = useCallback(async () => {
    if (!user) {
      setLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const since = new Date();
      since.setDate(since.getDate() - HISTORY_DAYS);

      const { data, error: queryError } = await supabase
        .from('supplement_logs')
        .select(LOG_COLUMNS)
        .eq('user_id', user.id)
        .gte('log_date', getLocalDateKey(since))
        .order('logged_at', { ascending: false });

      if (queryError) throw queryError;
      setLogs((data ?? []) as SupplementLog[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch logs'));
      console.error('Error fetching supplement logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const logSupplement = useCallback(
    async (input: SupplementLogInput): Promise<SupplementLog> => {
      if (!user) throw new Error('Please log in to track supplements');

      const { data, error: insertError } = await supabase
        .from('supplement_logs')
        .insert({
          user_id: user.id,
          product_id: input.product_id,
          log_date: today,
          logged_at: new Date().toISOString(),
          servings_taken: input.servings_taken || 1,
        })
        .select(LOG_COLUMNS)
        .single();

      if (insertError) {
        // A double tap (or a second device) hits the one-log-per-day
        // constraint: the product is already logged, which is not an error.
        if (insertError.code === UNIQUE_VIOLATION) {
          const { data: existing } = await supabase
            .from('supplement_logs')
            .select(LOG_COLUMNS)
            .eq('user_id', user.id)
            .eq('product_id', input.product_id)
            .eq('log_date', today)
            .maybeSingle();
          await fetchLogs();
          if (existing) return existing as SupplementLog;
        }
        throw insertError;
      }

      const log = data as SupplementLog;
      setLogs((prev) => [log, ...prev]);
      return log;
    },
    [user, today, fetchLogs]
  );

  const unlogSupplement = useCallback(
    async (logId: string): Promise<void> => {
      if (!user) throw new Error('Please log in to manage supplements');

      const { error: deleteError } = await supabase
        .from('supplement_logs')
        .delete()
        .eq('log_id', logId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      setLogs((prev) => prev.filter((log) => log.log_id !== logId));
    },
    [user]
  );

  const todayLogs = logs.filter((log) => log.log_date === today);

  return { logs, todayLogs, isLoading, error, logSupplement, unlogSupplement };
}
