'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import type { HealthGoalId } from '@/lib/catalog/health-goal-directory';
import {
  healthMigrationMessage,
  isMissingHealthRelationError,
} from '@/lib/health/health-schema';

export type HealthExperimentStatus = 'planned' | 'active' | 'completed' | 'dismissed';

interface HealthExperimentRow {
  experiment_id: string;
  user_id: string;
  snapshot_id: string | null;
  outcome_snapshot_id: string | null;
  goal_id: HealthGoalId;
  title: string;
  status: HealthExperimentStatus;
  start_date: string | null;
  end_date: string | null;
  target_days: number;
  product_ids: string[] | null;
  supplement_names: string[] | null;
  baseline_readiness_score: number | null;
  baseline_sleep_hours_avg: number | string | null;
  outcome_readiness_score: number | null;
  outcome_sleep_hours_avg: number | string | null;
  outcome_weight_kg: number | string | null;
  outcome_body_fat_percent: number | string | null;
  outcome_active_energy_burned_kcal_avg: number | string | null;
  outcome_readiness_delta: number | null;
  outcome_sleep_delta_hours: number | string | null;
  outcome_summary: string | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthExperiment {
  experimentId: string;
  userId: string;
  snapshotId: string | null;
  outcomeSnapshotId: string | null;
  goalId: HealthGoalId;
  title: string;
  status: HealthExperimentStatus;
  startDate: string | null;
  endDate: string | null;
  targetDays: number;
  productIds: string[];
  supplementNames: string[];
  baselineReadinessScore: number | null;
  baselineSleepHoursAvg: number | null;
  outcomeReadinessScore: number | null;
  outcomeSleepHoursAvg: number | null;
  outcomeWeightKg: number | null;
  outcomeBodyFatPercent: number | null;
  outcomeActiveEnergyBurnedKcalAvg: number | null;
  outcomeReadinessDelta: number | null;
  outcomeSleepDeltaHours: number | null;
  outcomeSummary: string | null;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthExperimentInput {
  snapshotId?: string | null;
  goalId: HealthGoalId;
  title: string;
  status?: HealthExperimentStatus;
  targetDays?: number;
  productIds?: string[];
  supplementNames?: string[];
  baselineReadinessScore?: number | null;
  baselineSleepHoursAvg?: number | null;
  notes?: string | null;
}

export interface CompleteHealthExperimentInput {
  outcomeSnapshotId?: string | null;
  outcomeReadinessScore?: number | null;
  outcomeSleepHoursAvg?: number | null;
  outcomeWeightKg?: number | null;
  outcomeBodyFatPercent?: number | null;
  outcomeActiveEnergyBurnedKcalAvg?: number | null;
  outcomeReadinessDelta?: number | null;
  outcomeSleepDeltaHours?: number | null;
  outcomeSummary?: string | null;
}

export interface UseHealthExperimentsOptions {
  limit?: number;
}

export interface UseHealthExperimentsResult {
  experiments: HealthExperiment[];
  activeExperiments: HealthExperiment[];
  completedExperiments: HealthExperiment[];
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  schemaWarning: string | null;
  createExperiment: (input: CreateHealthExperimentInput) => Promise<HealthExperiment>;
  completeExperiment: (
    experimentId: string,
    input: CompleteHealthExperimentInput
  ) => Promise<HealthExperiment>;
  updateExperimentStatus: (
    experimentId: string,
    status: HealthExperimentStatus
  ) => Promise<HealthExperiment>;
  refreshExperiments: () => Promise<void>;
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysString(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().slice(0, 10);
}

function rowToExperiment(row: HealthExperimentRow): HealthExperiment {
  return {
    experimentId: row.experiment_id,
    userId: row.user_id,
    snapshotId: row.snapshot_id,
    outcomeSnapshotId: row.outcome_snapshot_id,
    goalId: row.goal_id,
    title: row.title,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    targetDays: row.target_days,
    productIds: row.product_ids ?? [],
    supplementNames: row.supplement_names ?? [],
    baselineReadinessScore: row.baseline_readiness_score,
    baselineSleepHoursAvg: toNumber(row.baseline_sleep_hours_avg),
    outcomeReadinessScore: row.outcome_readiness_score,
    outcomeSleepHoursAvg: toNumber(row.outcome_sleep_hours_avg),
    outcomeWeightKg: toNumber(row.outcome_weight_kg),
    outcomeBodyFatPercent: toNumber(row.outcome_body_fat_percent),
    outcomeActiveEnergyBurnedKcalAvg: toNumber(row.outcome_active_energy_burned_kcal_avg),
    outcomeReadinessDelta: row.outcome_readiness_delta,
    outcomeSleepDeltaHours: toNumber(row.outcome_sleep_delta_hours),
    outcomeSummary: row.outcome_summary,
    notes: row.notes,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const LOCAL_EXPERIMENT_STORAGE_PREFIX = 'suppstack.health.experiments.v1.';
const LOCAL_EXPERIMENT_ID_PREFIX = 'local_experiment';

function localExperimentStorageKey(userId: string) {
  return `${LOCAL_EXPERIMENT_STORAGE_PREFIX}${userId}`;
}

function localExperimentWarning(feature = 'Health experiments') {
  return `${healthMigrationMessage(feature)} Saving locally in this browser until the hosted database is updated.`;
}

function localId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function isLocalExperimentId(experimentId: string) {
  return experimentId.startsWith(`${LOCAL_EXPERIMENT_ID_PREFIX}_`);
}

function readLocalExperiments(userId: string, limit: number) {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(localExperimentStorageKey(userId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((experiment): experiment is HealthExperiment =>
        Boolean(
          experiment &&
            typeof experiment === 'object' &&
            typeof experiment.experimentId === 'string' &&
            typeof experiment.userId === 'string' &&
            typeof experiment.createdAt === 'string'
        )
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  } catch {
    return [];
  }
}

function writeLocalExperiments(userId: string, experiments: HealthExperiment[]) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    localExperimentStorageKey(userId),
    JSON.stringify(experiments)
  );
}

function buildLocalExperiment(
  userId: string,
  input: CreateHealthExperimentInput
): HealthExperiment {
  const targetDays = input.targetDays ?? 14;
  const startDate = todayString();
  const now = new Date().toISOString();

  return {
    experimentId: localId(LOCAL_EXPERIMENT_ID_PREFIX),
    userId,
    snapshotId: input.snapshotId ?? null,
    outcomeSnapshotId: null,
    goalId: input.goalId,
    title: input.title,
    status: input.status ?? 'active',
    startDate,
    endDate: addDaysString(new Date(), targetDays),
    targetDays,
    productIds: input.productIds ?? [],
    supplementNames: input.supplementNames ?? [],
    baselineReadinessScore: input.baselineReadinessScore ?? null,
    baselineSleepHoursAvg: input.baselineSleepHoursAvg ?? null,
    outcomeReadinessScore: null,
    outcomeSleepHoursAvg: null,
    outcomeWeightKg: null,
    outcomeBodyFatPercent: null,
    outcomeActiveEnergyBurnedKcalAvg: null,
    outcomeReadinessDelta: null,
    outcomeSleepDeltaHours: null,
    outcomeSummary: null,
    notes: input.notes ?? null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

function saveLocalExperiment(
  userId: string,
  input: CreateHealthExperimentInput,
  limit: number
) {
  const created = buildLocalExperiment(userId, input);
  const nextExperiments = [created, ...readLocalExperiments(userId, limit * 2)].slice(0, limit);
  writeLocalExperiments(userId, nextExperiments);
  return created;
}

function updateLocalExperiment(
  userId: string,
  experimentId: string,
  limit: number,
  updater: (experiment: HealthExperiment) => HealthExperiment
) {
  const experiments = readLocalExperiments(userId, limit * 2);
  const existing = experiments.find((experiment) => experiment.experimentId === experimentId);

  if (!existing) {
    throw new Error('Local health experiment was not found.');
  }

  const updated = updater(existing);
  const nextExperiments = experiments
    .map((experiment) => (experiment.experimentId === experimentId ? updated : experiment))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
  writeLocalExperiments(userId, nextExperiments);
  return updated;
}

export function useHealthExperiments(
  options: UseHealthExperimentsOptions = {}
): UseHealthExperimentsResult {
  const { user } = useAuth();
  const [experiments, setExperiments] = useState<HealthExperiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [schemaWarning, setSchemaWarning] = useState<string | null>(null);
  const limit = options.limit ?? 10;

  const fetchExperiments = useCallback(async () => {
    if (!user) {
      setExperiments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSchemaWarning(null);

    try {
      const { data, error: queryError } = await supabase
        .from('health_experiments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (queryError) throw queryError;
      setExperiments(((data as HealthExperimentRow[] | null) ?? []).map(rowToExperiment));
    } catch (err) {
      if (isMissingHealthRelationError(err)) {
        setExperiments(readLocalExperiments(user.id, limit));
        setSchemaWarning(localExperimentWarning());
        setError(null);
        return;
      }

      const nextError = err instanceof Error ? err : new Error('Failed to fetch health experiments');
      setError(nextError);
      console.error('Error fetching health experiments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit, user]);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  const createExperiment = useCallback(
    async (input: CreateHealthExperimentInput): Promise<HealthExperiment> => {
      if (!user) {
        throw new Error('Please log in to start a health experiment');
      }

      setIsSaving(true);
      setError(null);
      setSchemaWarning(null);

      try {
        const targetDays = input.targetDays ?? 14;
        const startDate = todayString();
        const payload = {
          user_id: user.id,
          snapshot_id: input.snapshotId ?? null,
          goal_id: input.goalId,
          title: input.title,
          status: input.status ?? 'active',
          start_date: startDate,
          end_date: addDaysString(new Date(), targetDays),
          target_days: targetDays,
          product_ids: input.productIds ?? [],
          supplement_names: input.supplementNames ?? [],
          baseline_readiness_score: input.baselineReadinessScore ?? null,
          baseline_sleep_hours_avg: input.baselineSleepHoursAvg ?? null,
          notes: input.notes ?? null,
        };

        const { data, error: insertError } = await supabase
          .from('health_experiments')
          .insert(payload)
          .select('*')
          .single();

        if (insertError) {
          if (isMissingHealthRelationError(insertError)) {
            const created = saveLocalExperiment(user.id, input, limit);
            setExperiments((previous) => [created, ...previous].slice(0, limit));
            setSchemaWarning(localExperimentWarning());
            return created;
          }
          throw insertError;
        }

        const created = rowToExperiment(data as HealthExperimentRow);
        setExperiments((previous) => [created, ...previous].slice(0, limit));
        return created;
      } catch (err) {
        const nextError = err instanceof Error ? err : new Error('Failed to start health experiment');
        setError(nextError);
        console.error('Error creating health experiment:', err);
        throw nextError;
      } finally {
        setIsSaving(false);
      }
    },
    [limit, user]
  );

  const completeExperiment = useCallback(
    async (
      experimentId: string,
      input: CompleteHealthExperimentInput
    ): Promise<HealthExperiment> => {
      if (!user) {
        throw new Error('Please log in to complete a health experiment');
      }

      setIsSaving(true);
      setError(null);
      setSchemaWarning(null);

      try {
        if (isLocalExperimentId(experimentId)) {
          const completed = updateLocalExperiment(user.id, experimentId, limit, (experiment) => ({
            ...experiment,
            status: 'completed',
            outcomeSnapshotId: input.outcomeSnapshotId ?? null,
            outcomeReadinessScore: input.outcomeReadinessScore ?? null,
            outcomeSleepHoursAvg: input.outcomeSleepHoursAvg ?? null,
            outcomeWeightKg: input.outcomeWeightKg ?? null,
            outcomeBodyFatPercent: input.outcomeBodyFatPercent ?? null,
            outcomeActiveEnergyBurnedKcalAvg: input.outcomeActiveEnergyBurnedKcalAvg ?? null,
            outcomeReadinessDelta: input.outcomeReadinessDelta ?? null,
            outcomeSleepDeltaHours: input.outcomeSleepDeltaHours ?? null,
            outcomeSummary: input.outcomeSummary ?? null,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          setExperiments((previous) =>
            previous.map((experiment) =>
              experiment.experimentId === experimentId ? completed : experiment
            )
          );
          setSchemaWarning(localExperimentWarning());
          return completed;
        }

        const updates = {
          status: 'completed' as HealthExperimentStatus,
          outcome_snapshot_id: input.outcomeSnapshotId ?? null,
          outcome_readiness_score: input.outcomeReadinessScore ?? null,
          outcome_sleep_hours_avg: input.outcomeSleepHoursAvg ?? null,
          outcome_weight_kg: input.outcomeWeightKg ?? null,
          outcome_body_fat_percent: input.outcomeBodyFatPercent ?? null,
          outcome_active_energy_burned_kcal_avg: input.outcomeActiveEnergyBurnedKcalAvg ?? null,
          outcome_readiness_delta: input.outcomeReadinessDelta ?? null,
          outcome_sleep_delta_hours: input.outcomeSleepDeltaHours ?? null,
          outcome_summary: input.outcomeSummary ?? null,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const { data, error: updateError } = await supabase
          .from('health_experiments')
          .update(updates)
          .eq('experiment_id', experimentId)
          .eq('user_id', user.id)
          .select('*')
          .single();

        if (updateError) {
          if (isMissingHealthRelationError(updateError)) {
            const completed = updateLocalExperiment(user.id, experimentId, limit, (experiment) => ({
              ...experiment,
              status: 'completed',
              outcomeSnapshotId: input.outcomeSnapshotId ?? null,
              outcomeReadinessScore: input.outcomeReadinessScore ?? null,
              outcomeSleepHoursAvg: input.outcomeSleepHoursAvg ?? null,
              outcomeWeightKg: input.outcomeWeightKg ?? null,
              outcomeBodyFatPercent: input.outcomeBodyFatPercent ?? null,
              outcomeActiveEnergyBurnedKcalAvg: input.outcomeActiveEnergyBurnedKcalAvg ?? null,
              outcomeReadinessDelta: input.outcomeReadinessDelta ?? null,
              outcomeSleepDeltaHours: input.outcomeSleepDeltaHours ?? null,
              outcomeSummary: input.outcomeSummary ?? null,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }));
            setExperiments((previous) =>
              previous.map((experiment) =>
                experiment.experimentId === experimentId ? completed : experiment
              )
            );
            setSchemaWarning(localExperimentWarning());
            return completed;
          }
          throw updateError;
        }

        const completed = rowToExperiment(data as HealthExperimentRow);
        setExperiments((previous) =>
          previous.map((experiment) =>
            experiment.experimentId === experimentId ? completed : experiment
          )
        );
        return completed;
      } catch (err) {
        const nextError = err instanceof Error ? err : new Error('Failed to complete health experiment');
        setError(nextError);
        console.error('Error completing health experiment:', err);
        throw nextError;
      } finally {
        setIsSaving(false);
      }
    },
    [limit, user]
  );

  const updateExperimentStatus = useCallback(
    async (
      experimentId: string,
      status: HealthExperimentStatus
    ): Promise<HealthExperiment> => {
      if (!user) {
        throw new Error('Please log in to update a health experiment');
      }

      setIsSaving(true);
      setError(null);
      setSchemaWarning(null);

      try {
        if (isLocalExperimentId(experimentId)) {
          const updated = updateLocalExperiment(user.id, experimentId, limit, (experiment) => ({
            ...experiment,
            status,
            completedAt:
              status === 'completed' || status === 'dismissed' ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString(),
          }));
          setExperiments((previous) =>
            previous.map((experiment) =>
              experiment.experimentId === experimentId ? updated : experiment
            )
          );
          setSchemaWarning(localExperimentWarning());
          return updated;
        }

        const updates = {
          status,
          completed_at: status === 'completed' || status === 'dismissed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        };
        const { data, error: updateError } = await supabase
          .from('health_experiments')
          .update(updates)
          .eq('experiment_id', experimentId)
          .eq('user_id', user.id)
          .select('*')
          .single();

        if (updateError) {
          if (isMissingHealthRelationError(updateError)) {
            const updated = updateLocalExperiment(user.id, experimentId, limit, (experiment) => ({
              ...experiment,
              status,
              completedAt:
                status === 'completed' || status === 'dismissed' ? new Date().toISOString() : null,
              updatedAt: new Date().toISOString(),
            }));
            setExperiments((previous) =>
              previous.map((experiment) =>
                experiment.experimentId === experimentId ? updated : experiment
              )
            );
            setSchemaWarning(localExperimentWarning());
            return updated;
          }
          throw updateError;
        }

        const updated = rowToExperiment(data as HealthExperimentRow);
        setExperiments((previous) =>
          previous.map((experiment) =>
            experiment.experimentId === experimentId ? updated : experiment
          )
        );
        return updated;
      } catch (err) {
        const nextError = err instanceof Error ? err : new Error('Failed to update health experiment');
        setError(nextError);
        console.error('Error updating health experiment:', err);
        throw nextError;
      } finally {
        setIsSaving(false);
      }
    },
    [limit, user]
  );

  return {
    experiments,
    activeExperiments: experiments.filter((experiment) =>
      ['planned', 'active'].includes(experiment.status)
    ),
    completedExperiments: experiments.filter((experiment) => experiment.status === 'completed'),
    isLoading,
    isSaving,
    error,
    schemaWarning,
    createExperiment,
    completeExperiment,
    updateExperimentStatus,
    refreshExperiments: fetchExperiments,
  };
}

export default useHealthExperiments;
