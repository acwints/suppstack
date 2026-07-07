'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import {
  buildHealthTrackerPlan,
  type HealthDataSource,
  type HealthMetricSnapshot,
} from '@/lib/health/health-intelligence';
import {
  healthMigrationMessage,
  isRemoteHealthStorageEnabled,
  isMissingHealthColumnError,
  isMissingHealthRelationError,
} from '@/lib/health/health-schema';
import type { HealthGoalId } from '@/lib/catalog/health-goal-directory';

interface HealthSnapshotRow {
  snapshot_id: string;
  user_id: string;
  source: HealthDataSource;
  captured_at: string;
  date_range_days: number;
  sleep_hours_avg: number | string | null;
  sleep_quality_avg: number | string | null;
  sleep_days_tracked: number | null;
  sleep_debt_hours: number | string | null;
  sleep_consistency_score: number | string | null;
  sleep_rem_hours_avg?: number | string | null;
  sleep_deep_hours_avg?: number | string | null;
  sleep_awake_hours_avg?: number | string | null;
  weight_kg: number | string | null;
  weight_trend_kg: number | string | null;
  body_fat_percent: number | string | null;
  body_fat_trend_percent: number | string | null;
  active_energy_burned_kcal_avg: number | string | null;
  resting_energy_burned_kcal_avg: number | string | null;
  steps_avg: number | string | null;
  exercise_minutes_avg?: number | string | null;
  resting_heart_rate_bpm_avg?: number | string | null;
  heart_rate_variability_ms_avg?: number | string | null;
  vo2_max_ml_kg_min?: number | string | null;
  readiness_score: number | null;
  focus_goal_id: HealthGoalId | null;
  created_at: string;
}

export interface SavedHealthSnapshot extends HealthMetricSnapshot {
  snapshotId: string;
  userId: string;
  capturedAt: string;
  readinessScore: number | null;
  focusGoalId: HealthGoalId | null;
}

export interface UseHealthSnapshotsOptions {
  limit?: number;
}

export interface UseHealthSnapshotsResult {
  snapshots: SavedHealthSnapshot[];
  latestSnapshot: SavedHealthSnapshot | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  schemaWarning: string | null;
  saveSnapshot: (snapshot: HealthMetricSnapshot) => Promise<SavedHealthSnapshot>;
  refreshSnapshots: () => Promise<void>;
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function rowToSnapshot(row: HealthSnapshotRow): SavedHealthSnapshot {
  return {
    snapshotId: row.snapshot_id,
    userId: row.user_id,
    capturedAt: row.captured_at,
    readinessScore: row.readiness_score,
    focusGoalId: row.focus_goal_id,
    source: row.source,
    dateRangeDays: row.date_range_days,
    lastSyncedAt: row.captured_at,
    sleepHoursAvg: toNumber(row.sleep_hours_avg),
    sleepQualityAvg: toNumber(row.sleep_quality_avg),
    sleepDaysTracked: row.sleep_days_tracked,
    sleepDebtHours: toNumber(row.sleep_debt_hours),
    sleepConsistencyScore: toNumber(row.sleep_consistency_score),
    sleepRemHoursAvg: toNumber(row.sleep_rem_hours_avg),
    sleepDeepHoursAvg: toNumber(row.sleep_deep_hours_avg),
    sleepAwakeHoursAvg: toNumber(row.sleep_awake_hours_avg),
    weightKg: toNumber(row.weight_kg),
    weightTrendKg: toNumber(row.weight_trend_kg),
    bodyFatPercent: toNumber(row.body_fat_percent),
    bodyFatTrendPercent: toNumber(row.body_fat_trend_percent),
    activeEnergyBurnedKcalAvg: toNumber(row.active_energy_burned_kcal_avg),
    restingEnergyBurnedKcalAvg: toNumber(row.resting_energy_burned_kcal_avg),
    stepsAvg: toNumber(row.steps_avg),
    exerciseMinutesAvg: toNumber(row.exercise_minutes_avg),
    restingHeartRateBpmAvg: toNumber(row.resting_heart_rate_bpm_avg),
    heartRateVariabilityMsAvg: toNumber(row.heart_rate_variability_ms_avg),
    vo2MaxMlKgMin: toNumber(row.vo2_max_ml_kg_min),
  };
}

function metricValue(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

const OPTIONAL_HEALTH_COLUMNS = [
  'sleep_rem_hours_avg',
  'sleep_deep_hours_avg',
  'sleep_awake_hours_avg',
  'exercise_minutes_avg',
  'resting_heart_rate_bpm_avg',
  'heart_rate_variability_ms_avg',
  'vo2_max_ml_kg_min',
];

const LOCAL_SNAPSHOT_STORAGE_PREFIX = 'suppstack.health.snapshots.v1.';

function localSnapshotStorageKey(userId: string) {
  return `${LOCAL_SNAPSHOT_STORAGE_PREFIX}${userId}`;
}

function localSnapshotWarning(feature = 'Health history') {
  return `${healthMigrationMessage(feature)} Saving locally in this browser until the hosted database is updated.`;
}

function localOnlySnapshotWarning(feature = 'Health history') {
  return `${feature} is saving locally in this browser. Set NEXT_PUBLIC_HEALTH_REMOTE_STORAGE=enabled after applying the Supabase health migration to use hosted history.`;
}

function localId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function readLocalSnapshots(userId: string, limit: number) {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(localSnapshotStorageKey(userId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((snapshot): snapshot is SavedHealthSnapshot =>
        Boolean(
          snapshot &&
            typeof snapshot === 'object' &&
            typeof snapshot.snapshotId === 'string' &&
            typeof snapshot.userId === 'string' &&
            typeof snapshot.capturedAt === 'string'
        )
      )
      .sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime())
      .slice(0, limit);
  } catch {
    return [];
  }
}

function writeLocalSnapshots(userId: string, snapshots: SavedHealthSnapshot[]) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    localSnapshotStorageKey(userId),
    JSON.stringify(snapshots)
  );
}

function snapshotToLocalSaved(
  snapshot: HealthMetricSnapshot,
  userId: string
): SavedHealthSnapshot {
  const tracker = buildHealthTrackerPlan(snapshot);
  const capturedAt = snapshot.lastSyncedAt ?? new Date().toISOString();

  return {
    ...snapshot,
    snapshotId: localId('local_snapshot'),
    userId,
    capturedAt,
    lastSyncedAt: capturedAt,
    readinessScore: tracker.readinessScore,
    focusGoalId: tracker.focusExperiment.goalId,
  };
}

function saveLocalSnapshot(
  userId: string,
  snapshot: HealthMetricSnapshot,
  limit: number
) {
  const saved = snapshotToLocalSaved(snapshot, userId);
  const nextSnapshots = [saved, ...readLocalSnapshots(userId, limit * 2)].slice(0, limit);
  writeLocalSnapshots(userId, nextSnapshots);
  return saved;
}

export function useHealthSnapshots(
  options: UseHealthSnapshotsOptions = {}
): UseHealthSnapshotsResult {
  const { user } = useAuth();
  const [snapshots, setSnapshots] = useState<SavedHealthSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [schemaWarning, setSchemaWarning] = useState<string | null>(null);
  const limit = options.limit ?? 8;

  const fetchSnapshots = useCallback(async () => {
    if (!user) {
      setSnapshots([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSchemaWarning(null);

    if (!isRemoteHealthStorageEnabled()) {
      setSnapshots(readLocalSnapshots(user.id, limit));
      setSchemaWarning(localOnlySnapshotWarning());
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from('health_metric_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('captured_at', { ascending: false })
        .limit(limit);

      if (queryError) throw queryError;
      setSnapshots(((data as HealthSnapshotRow[] | null) ?? []).map(rowToSnapshot));
    } catch (err) {
      if (isMissingHealthRelationError(err)) {
        setSnapshots(readLocalSnapshots(user.id, limit));
        setSchemaWarning(localSnapshotWarning());
        setError(null);
        return;
      }

      const nextError = err instanceof Error ? err : new Error('Failed to fetch health snapshots');
      setError(nextError);
      console.error('Error fetching health snapshots:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit, user]);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  const saveSnapshot = useCallback(
    async (snapshot: HealthMetricSnapshot): Promise<SavedHealthSnapshot> => {
      if (!user) {
        throw new Error('Please log in to save health data');
      }

      setIsSaving(true);
      setError(null);
      setSchemaWarning(null);

      if (!isRemoteHealthStorageEnabled()) {
        const saved = saveLocalSnapshot(user.id, snapshot, limit);
        setSnapshots((previous) => [saved, ...previous].slice(0, limit));
        setSchemaWarning(localOnlySnapshotWarning());
        setIsSaving(false);
        return saved;
      }

      try {
        const tracker = buildHealthTrackerPlan(snapshot);
        const capturedAt = snapshot.lastSyncedAt ?? new Date().toISOString();
        const basePayload = {
          user_id: user.id,
          source: snapshot.source,
          captured_at: capturedAt,
          date_range_days: snapshot.dateRangeDays,
          sleep_hours_avg: metricValue(snapshot.sleepHoursAvg),
          sleep_quality_avg: metricValue(snapshot.sleepQualityAvg),
          sleep_days_tracked: metricValue(snapshot.sleepDaysTracked),
          sleep_debt_hours: metricValue(snapshot.sleepDebtHours),
          sleep_consistency_score: metricValue(snapshot.sleepConsistencyScore),
          weight_kg: metricValue(snapshot.weightKg),
          weight_trend_kg: metricValue(snapshot.weightTrendKg),
          body_fat_percent: metricValue(snapshot.bodyFatPercent),
          body_fat_trend_percent: metricValue(snapshot.bodyFatTrendPercent),
          active_energy_burned_kcal_avg: metricValue(snapshot.activeEnergyBurnedKcalAvg),
          resting_energy_burned_kcal_avg: metricValue(snapshot.restingEnergyBurnedKcalAvg),
          steps_avg: metricValue(snapshot.stepsAvg),
          readiness_score: tracker.readinessScore,
          focus_goal_id: tracker.focusExperiment.goalId,
        };
        const payload = {
          ...basePayload,
          sleep_rem_hours_avg: metricValue(snapshot.sleepRemHoursAvg),
          sleep_deep_hours_avg: metricValue(snapshot.sleepDeepHoursAvg),
          sleep_awake_hours_avg: metricValue(snapshot.sleepAwakeHoursAvg),
          exercise_minutes_avg: metricValue(snapshot.exerciseMinutesAvg),
          resting_heart_rate_bpm_avg: metricValue(snapshot.restingHeartRateBpmAvg),
          heart_rate_variability_ms_avg: metricValue(snapshot.heartRateVariabilityMsAvg),
          vo2_max_ml_kg_min: metricValue(snapshot.vo2MaxMlKgMin),
        };

        let { data, error: insertError } = await supabase
          .from('health_metric_snapshots')
          .insert(payload)
          .select('*')
          .single();

        if (insertError && isMissingHealthColumnError(insertError, OPTIONAL_HEALTH_COLUMNS)) {
          setSchemaWarning(
            healthMigrationMessage('Expanded health history')
          );
          const retry = await supabase
            .from('health_metric_snapshots')
            .insert(basePayload)
            .select('*')
            .single();
          data = retry.data;
          insertError = retry.error;
        }

        if (insertError) {
          if (isMissingHealthRelationError(insertError)) {
            const saved = saveLocalSnapshot(user.id, snapshot, limit);
            setSnapshots((previous) => [saved, ...previous].slice(0, limit));
            setSchemaWarning(localSnapshotWarning());
            return saved;
          }
          throw insertError;
        }

        const saved = rowToSnapshot(data as HealthSnapshotRow);
        setSnapshots((previous) => [saved, ...previous].slice(0, limit));
        return saved;
      } catch (err) {
        const nextError = err instanceof Error ? err : new Error('Failed to save health snapshot');
        setError(nextError);
        console.error('Error saving health snapshot:', err);
        throw nextError;
      } finally {
        setIsSaving(false);
      }
    },
    [limit, user]
  );

  return {
    snapshots,
    latestSnapshot: snapshots[0] ?? null,
    isLoading,
    isSaving,
    error,
    schemaWarning,
    saveSnapshot,
    refreshSnapshots: fetchSnapshots,
  };
}

export default useHealthSnapshots;
