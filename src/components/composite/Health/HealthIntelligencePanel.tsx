'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { FaApple } from 'react-icons/fa';
import {
  FiActivity,
  FiAlertCircle,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiEdit3,
  FiExternalLink,
  FiHeart,
  FiMoon,
  FiRefreshCw,
  FiSave,
  FiShoppingBag,
  FiShoppingCart,
  FiTarget,
  FiTrendingUp,
  FiXCircle,
  FiZap,
} from 'react-icons/fi';
import { TbScaleOutline } from 'react-icons/tb';
import { Badge, Button, Card, Input, Spinner } from '@/components/ui';
import { useHealthExperiments, useHealthSnapshots, type HealthExperiment } from '@/hooks';
import {
  DEMO_HEALTH_SNAPSHOT,
	  buildDailyHealthReadout,
	  buildHealthProgressLoop,
	  buildHealthSignalMap,
  buildHealthSignalReadiness,
  buildSleepCommerceProtocol,
  buildHealthTrackerPlan,
  buildLocalHealthCoachPlan,
  describeMetricSnapshot,
  type AiHealthCoachResponse,
	  type HealthMetricSnapshot,
	  type HealthOpportunity,
	  type HealthProgressDecisionStatus,
	  type HealthProgressMetricStatus,
	  type HealthSignalReadinessStatus,
  type HealthSignalStatus,
  type SleepProtocolStatus,
} from '@/lib/health/health-intelligence';
import {
  getAppleHealthAvailability,
  requestAppleHealthSnapshot,
  type AppleHealthAvailability,
} from '@/lib/native/apple-health';
import {
  findHealthGoalDirectoryItem,
  healthGoalHref,
  type HealthGoalId,
} from '@/lib/catalog/health-goal-directory';
import { buildHealthCommercePlan } from '@/lib/health/health-commerce';
import { formatPrice } from '@/lib/utils';
import { getProductImageSrc, isRemoteImageSrc } from '@/lib/catalog/product-image';

export interface HealthIntelligencePanelProps {
  className?: string;
}

interface ManualHealthFormState {
  sleepHoursAvg: string;
  sleepQualityAvg: string;
  sleepConsistencyScore: string;
  weightLb: string;
  bodyFatPercent: string;
  activeEnergyBurnedKcalAvg: string;
  restingEnergyBurnedKcalAvg: string;
  stepsAvg: string;
  exerciseMinutesAvg: string;
  restingHeartRateBpmAvg: string;
  heartRateVariabilityMsAvg: string;
  vo2MaxMlKgMin: string;
}

const DEFAULT_MANUAL_FORM: ManualHealthFormState = {
  sleepHoursAvg: '7.0',
  sleepQualityAvg: '3.5',
  sleepConsistencyScore: '75',
  weightLb: '',
  bodyFatPercent: '',
  activeEnergyBurnedKcalAvg: '',
  restingEnergyBurnedKcalAvg: '',
  stepsAvg: '',
  exerciseMinutesAvg: '',
  restingHeartRateBpmAvg: '',
  heartRateVariabilityMsAvg: '',
  vo2MaxMlKgMin: '',
};

const MANUAL_HEALTH_FIELDS: Array<{
  key: keyof ManualHealthFormState;
  label: string;
  min?: number;
  max?: number;
  step?: string;
}> = [
  { key: 'sleepHoursAvg', label: 'Sleep hours', min: 0, max: 16, step: '0.1' },
  { key: 'sleepQualityAvg', label: 'Sleep quality', min: 1, max: 5, step: '0.1' },
  { key: 'sleepConsistencyScore', label: 'Consistency', min: 0, max: 100, step: '1' },
  { key: 'weightLb', label: 'Weight', min: 0, step: '0.1' },
  { key: 'bodyFatPercent', label: 'Body fat', min: 0, max: 80, step: '0.1' },
  { key: 'activeEnergyBurnedKcalAvg', label: 'Active kcal', min: 0, step: '1' },
  { key: 'restingEnergyBurnedKcalAvg', label: 'Resting kcal', min: 0, step: '1' },
  { key: 'stepsAvg', label: 'Steps', min: 0, step: '1' },
  { key: 'exerciseMinutesAvg', label: 'Exercise min', min: 0, step: '1' },
  { key: 'restingHeartRateBpmAvg', label: 'Resting HR', min: 0, step: '1' },
  { key: 'heartRateVariabilityMsAvg', label: 'HRV', min: 0, step: '1' },
  { key: 'vo2MaxMlKgMin', label: 'VO2 max', min: 0, step: '0.1' },
];

function metricValue(value: number | null | undefined, suffix = '', digits = 1) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'No data';
  return `${value.toLocaleString('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })}${suffix}`;
}

function signedMetricValue(value: number | null | undefined, suffix = '', digits = 1) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'No data';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toLocaleString('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })}${suffix}`;
}

function sourceLabel(snapshot: HealthMetricSnapshot) {
  if (snapshot.source === 'apple_health') return 'Apple Health';
  if (snapshot.source === 'manual') return 'Manual logs';
  return 'Sample preview';
}

function priorityVariant(priority: HealthOpportunity['priority']) {
  if (priority === 'high') return 'error';
  if (priority === 'medium') return 'warning';
  return 'secondary';
}

function trackerVariant(status: 'strong' | 'watch' | 'needs_attention') {
  if (status === 'strong') return 'success';
  if (status === 'watch') return 'warning';
  return 'error';
}

function signalVariant(status: HealthSignalStatus) {
  if (status === 'strong') return 'success';
  if (status === 'watch') return 'warning';
  return 'error';
}

function sleepProtocolVariant(status: SleepProtocolStatus) {
  if (status === 'ready') return 'success';
  if (status === 'watch') return 'warning';
  return 'error';
}

function readinessVariant(status: HealthSignalReadinessStatus) {
  if (status === 'ready') return 'success';
  if (status === 'partial') return 'warning';
  return 'secondary';
}

function outcomeVariant(value: number | null | undefined) {
  if (typeof value !== 'number') return 'secondary';
  if (value > 0) return 'success';
  if (value < 0) return 'error';
  return 'secondary';
}

function progressLoopVariant(status: HealthProgressDecisionStatus) {
  if (status === 'keep') return 'success';
  if (status === 'adjust') return 'warning';
  if (status === 'hold') return 'info';
  return 'secondary';
}

function progressMetricVariant(status: HealthProgressMetricStatus) {
  if (status === 'positive') return 'success';
  if (status === 'watch') return 'warning';
  return 'secondary';
}

function parseManualNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatSnapshotDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function goalTitle(goalId: HealthGoalId) {
  return findHealthGoalDirectoryItem(goalId)?.shortTitle ?? goalId;
}

function sleepStageSummary(snapshot: HealthMetricSnapshot) {
  const stageBits = [
    typeof snapshot.sleepRemHoursAvg === 'number'
      ? `${metricValue(snapshot.sleepRemHoursAvg, 'h')} REM`
      : null,
    typeof snapshot.sleepDeepHoursAvg === 'number'
      ? `${metricValue(snapshot.sleepDeepHoursAvg, 'h')} deep`
      : null,
    typeof snapshot.sleepAwakeHoursAvg === 'number'
      ? `${metricValue(snapshot.sleepAwakeHoursAvg, 'h')} awake`
      : null,
  ].filter(Boolean);

  if (stageBits.length > 0) return stageBits.join(' · ');

  return activeQualityLabel(snapshot);
}

function activeQualityLabel(snapshot: HealthMetricSnapshot) {
  return snapshot.sleepQualityAvg
    ? `${metricValue(snapshot.sleepQualityAvg, '/5')} quality`
    : '14-day average';
}

function snapshotIdOf(snapshot: HealthMetricSnapshot) {
  const maybeSnapshot = snapshot as HealthMetricSnapshot & { snapshotId?: unknown };
  return typeof maybeSnapshot.snapshotId === 'string' ? maybeSnapshot.snapshotId : null;
}

function experimentDay(experiment: HealthExperiment) {
  if (!experiment.startDate) return 1;
  const startTime = new Date(`${experiment.startDate}T00:00:00`).getTime();
  const elapsedDays = Math.floor((Date.now() - startTime) / 86_400_000) + 1;
  return Math.min(experiment.targetDays, Math.max(1, elapsedDays));
}

function buildManualSnapshot(form: ManualHealthFormState): HealthMetricSnapshot {
  const dateRangeDays = 14;
  const sleepHoursAvg = parseManualNumber(form.sleepHoursAvg);
  const weightLb = parseManualNumber(form.weightLb);

  return {
    source: 'manual',
    dateRangeDays,
    lastSyncedAt: new Date().toISOString(),
    sleepHoursAvg,
    sleepQualityAvg: parseManualNumber(form.sleepQualityAvg),
    sleepDaysTracked: sleepHoursAvg !== null ? dateRangeDays : null,
    sleepDebtHours:
      sleepHoursAvg !== null ? Math.round(Math.max(0, 7.5 - sleepHoursAvg) * dateRangeDays * 10) / 10 : null,
    sleepConsistencyScore: parseManualNumber(form.sleepConsistencyScore),
    weightKg: weightLb !== null ? weightLb / 2.2046226218 : null,
    weightTrendKg: null,
    bodyFatPercent: parseManualNumber(form.bodyFatPercent),
    bodyFatTrendPercent: null,
    activeEnergyBurnedKcalAvg: parseManualNumber(form.activeEnergyBurnedKcalAvg),
    restingEnergyBurnedKcalAvg: parseManualNumber(form.restingEnergyBurnedKcalAvg),
    stepsAvg: parseManualNumber(form.stepsAvg),
    exerciseMinutesAvg: parseManualNumber(form.exerciseMinutesAvg),
    restingHeartRateBpmAvg: parseManualNumber(form.restingHeartRateBpmAvg),
    heartRateVariabilityMsAvg: parseManualNumber(form.heartRateVariabilityMsAvg),
    vo2MaxMlKgMin: parseManualNumber(form.vo2MaxMlKgMin),
  };
}

export function HealthIntelligencePanel({ className }: HealthIntelligencePanelProps) {
  const [availability, setAvailability] = useState<AppleHealthAvailability | null>(null);
  const [snapshot, setSnapshot] = useState<HealthMetricSnapshot | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [aiCoach, setAiCoach] = useState<AiHealthCoachResponse | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [manualForm, setManualForm] = useState<ManualHealthFormState>(DEFAULT_MANUAL_FORM);
  const {
    snapshots,
    latestSnapshot,
    isLoading: isLoadingHistory,
    isSaving: isSavingSnapshot,
    error: historyError,
    schemaWarning: historySchemaWarning,
    saveSnapshot,
  } = useHealthSnapshots({ limit: 8 });
  const {
    activeExperiments,
    completedExperiments,
    isLoading: isLoadingExperiments,
    isSaving: isSavingExperiment,
    error: experimentError,
    schemaWarning: experimentSchemaWarning,
    createExperiment,
    completeExperiment,
    updateExperimentStatus,
  } = useHealthExperiments({ limit: 8 });

  useEffect(() => {
    getAppleHealthAvailability()
      .then(setAvailability)
      .catch(() => setAvailability({ available: false, platform: 'unknown' }));
  }, []);

  const activeSnapshot = snapshot ?? latestSnapshot ?? DEMO_HEALTH_SNAPSHOT;
  const plan = useMemo(() => buildLocalHealthCoachPlan(activeSnapshot), [activeSnapshot]);
  const tracker = useMemo(() => buildHealthTrackerPlan(activeSnapshot), [activeSnapshot]);
  const sleepProtocol = useMemo(() => buildSleepCommerceProtocol(activeSnapshot), [activeSnapshot]);
  const dailyReadout = useMemo(() => buildDailyHealthReadout(activeSnapshot), [activeSnapshot]);
  const signalMap = useMemo(() => buildHealthSignalMap(activeSnapshot), [activeSnapshot]);
  const signalReadiness = useMemo(
    () => buildHealthSignalReadiness(activeSnapshot),
    [activeSnapshot]
  );
  const commercePlan = useMemo(() => buildHealthCommercePlan(activeSnapshot), [activeSnapshot]);
  const progressSnapshots = useMemo(() => {
    const seen = new Set<string>();

    return [activeSnapshot, ...snapshots].filter((item) => {
      const key = [
        snapshotIdOf(item),
        item.lastSyncedAt,
        item.source,
        item.sleepHoursAvg,
        item.weightKg,
        item.bodyFatPercent,
        item.activeEnergyBurnedKcalAvg,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join('|');

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [activeSnapshot, snapshots]);
  const progressLoop = useMemo(
    () => buildHealthProgressLoop(progressSnapshots),
    [progressSnapshots]
  );
  const productMatches = commercePlan.topMatches.slice(0, 4);
  const sleepProducts = commercePlan.topMatches
    .filter(
      ({ product, match }) =>
        match.primaryGoalId === sleepProtocol.productGoalId ||
        product.health_goal_ids.includes(sleepProtocol.productGoalId)
    )
    .slice(0, 3);
  const topMatchedGoalId =
    commercePlan.items[0]?.goalId ?? productMatches[0]?.match.primaryGoalId ?? tracker.focusExperiment.goalId;
  const topOpportunity = plan.opportunities[0] ?? null;
  const activeGoalExperiment = activeExperiments.find(
    (experiment) => experiment.goalId === tracker.focusExperiment.goalId
  );
  const activeSleepExperiment = activeExperiments.find(
    (experiment) => experiment.goalId === sleepProtocol.productGoalId
  );
  const activeStackExperiment = commercePlan.primaryExperiment
    ? activeExperiments.find(
        (experiment) => experiment.title === commercePlan.primaryExperiment?.title
      )
    : undefined;
  const historyItems = useMemo(
    () =>
      snapshots.slice(0, 5).map((savedSnapshot) => ({
        snapshot: savedSnapshot,
        tracker: buildHealthTrackerPlan(savedSnapshot),
      })),
    [snapshots]
  );
  const isPreview = activeSnapshot.source === 'demo';
  const isAppleHealthAvailable = availability?.available === true;
  const schemaWarning = historySchemaWarning || experimentSchemaWarning;

  const syncHealth = async () => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncNotice(null);
    setAiCoach(null);

    try {
      if (isAppleHealthAvailable) {
        const nextSnapshot = await requestAppleHealthSnapshot({ days: 14 });
        setSnapshot(nextSnapshot);
        try {
          await saveSnapshot(nextSnapshot);
          setSyncNotice('Apple Health snapshot saved');
        } catch (saveError) {
          setSyncError(
            saveError instanceof Error
              ? `Health data loaded, but history was not saved. ${saveError.message}`
              : 'Health data loaded, but history was not saved.'
          );
        }
      } else {
        setSnapshot({ ...DEMO_HEALTH_SNAPSHOT, lastSyncedAt: new Date().toISOString() });
      }
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Unable to read Apple Health data.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSyncError(null);
    setSyncNotice(null);
    setAiCoach(null);

    const nextSnapshot = buildManualSnapshot(manualForm);
    setSnapshot(nextSnapshot);

    try {
      await saveSnapshot(nextSnapshot);
      setSyncNotice('Manual health snapshot saved');
      setIsManualEntryOpen(false);
    } catch (error) {
      setSyncError(
        error instanceof Error
          ? `Manual snapshot is active, but history was not saved. ${error.message}`
          : 'Manual snapshot is active, but history was not saved.'
      );
    }
  };

  const updateManualField = (field: keyof ManualHealthFormState, value: string) => {
    setManualForm((current) => ({ ...current, [field]: value }));
  };

  const startSuggestedExperiment = async () => {
    setSyncError(null);
    setSyncNotice(null);
    setAiCoach(null);

    try {
      if (activeGoalExperiment) {
        setSyncNotice('Experiment already active');
        return;
      }

      await createExperiment({
        snapshotId: snapshotIdOf(activeSnapshot) ?? latestSnapshot?.snapshotId ?? null,
        goalId: tracker.focusExperiment.goalId,
        title: tracker.focusExperiment.title,
        targetDays: 14,
        productIds: topOpportunity?.products.slice(0, 4).map((product) => product.product_id) ?? [],
        supplementNames: topOpportunity?.supplementNames ?? [],
        baselineReadinessScore: tracker.readinessScore,
        baselineSleepHoursAvg: activeSnapshot.sleepHoursAvg ?? null,
      });
      setSyncNotice('Experiment started');
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Unable to start experiment.');
    }
  };

  const startSleepProtocolExperiment = async () => {
    setSyncError(null);
    setSyncNotice(null);
    setAiCoach(null);

    try {
      if (activeSleepExperiment) {
        setSyncNotice('Sleep experiment already active');
        return;
      }

      const supplementNames = Array.from(
        new Set(sleepProtocol.stackSlots.flatMap((slot) => slot.supplementNames))
      ).slice(0, 6);

      await createExperiment({
        snapshotId: snapshotIdOf(activeSnapshot) ?? latestSnapshot?.snapshotId ?? null,
        goalId: sleepProtocol.productGoalId,
        title: sleepProtocol.experimentTitle,
        targetDays: 14,
        productIds: sleepProducts.map(({ product }) => product.product_id),
        supplementNames,
        baselineReadinessScore: tracker.readinessScore,
        baselineSleepHoursAvg: activeSnapshot.sleepHoursAvg ?? null,
      });
      setSyncNotice('Sleep experiment started');
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Unable to start sleep experiment.');
    }
  };

  const startStackProtocolExperiment = async () => {
    setSyncError(null);
    setSyncNotice(null);
    setAiCoach(null);

    if (!commercePlan.primaryExperiment) {
      setSyncNotice('Connect more health data to build a stack experiment');
      return;
    }

    try {
      if (activeStackExperiment) {
        setSyncNotice('Signal stack experiment already active');
        return;
      }

      await createExperiment({
        snapshotId: snapshotIdOf(activeSnapshot) ?? latestSnapshot?.snapshotId ?? null,
        goalId: commercePlan.primaryExperiment.goalId,
        title: commercePlan.primaryExperiment.title,
        targetDays: commercePlan.primaryExperiment.targetDays,
        productIds: commercePlan.primaryExperiment.productIds,
        supplementNames: commercePlan.primaryExperiment.supplementNames,
        baselineReadinessScore: tracker.readinessScore,
        baselineSleepHoursAvg: activeSnapshot.sleepHoursAvg ?? null,
        notes: commercePlan.primaryExperiment.notes,
      });
      setSyncNotice('Signal stack experiment started');
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Unable to start stack experiment.');
    }
  };

  const completeWithCurrentSnapshot = async (experiment: HealthExperiment) => {
    setSyncError(null);
    setSyncNotice(null);
    setAiCoach(null);

    try {
      const readinessDelta =
        typeof experiment.baselineReadinessScore === 'number'
          ? tracker.readinessScore - experiment.baselineReadinessScore
          : null;
      const sleepDelta =
        typeof experiment.baselineSleepHoursAvg === 'number' &&
        typeof activeSnapshot.sleepHoursAvg === 'number'
          ? activeSnapshot.sleepHoursAvg - experiment.baselineSleepHoursAvg
          : null;
      const outcomeSummaryBits = [
        readinessDelta !== null
          ? `${readinessDelta >= 0 ? '+' : ''}${readinessDelta} readiness`
          : null,
        sleepDelta !== null ? `${sleepDelta >= 0 ? '+' : ''}${sleepDelta.toFixed(1)}h sleep` : null,
        typeof activeSnapshot.bodyFatPercent === 'number'
          ? `${activeSnapshot.bodyFatPercent.toFixed(1)}% body fat`
          : null,
        typeof activeSnapshot.activeEnergyBurnedKcalAvg === 'number'
          ? `${Math.round(activeSnapshot.activeEnergyBurnedKcalAvg)} active kcal`
          : null,
      ].filter(Boolean);

      await completeExperiment(experiment.experimentId, {
        outcomeSnapshotId: snapshotIdOf(activeSnapshot) ?? latestSnapshot?.snapshotId ?? null,
        outcomeReadinessScore: tracker.readinessScore,
        outcomeSleepHoursAvg: activeSnapshot.sleepHoursAvg ?? null,
        outcomeWeightKg: activeSnapshot.weightKg ?? null,
        outcomeBodyFatPercent: activeSnapshot.bodyFatPercent ?? null,
        outcomeActiveEnergyBurnedKcalAvg: activeSnapshot.activeEnergyBurnedKcalAvg ?? null,
        outcomeReadinessDelta: readinessDelta,
        outcomeSleepDeltaHours: sleepDelta,
        outcomeSummary: outcomeSummaryBits.length ? outcomeSummaryBits.join(' · ') : null,
      });
      setSyncNotice('Experiment outcome saved');
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Unable to complete experiment.');
    }
  };

  const generateAiCoach = async () => {
    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const response = await fetch('/api/health/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshot: activeSnapshot,
          history: [activeSnapshot, ...snapshots].slice(0, 6),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to generate coach summary.');
      }

      setAiCoach(payload);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Unable to generate coach summary.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const metrics = [
    {
      label: 'Sleep',
      value: metricValue(activeSnapshot.sleepHoursAvg, 'h'),
      sublabel: sleepStageSummary(activeSnapshot),
      icon: <FiMoon />,
    },
    {
      label: 'Weight',
      value:
        typeof activeSnapshot.weightKg === 'number'
          ? `${Math.round(activeSnapshot.weightKg * 2.2046226218)} lb`
          : 'No data',
      sublabel:
        typeof activeSnapshot.weightTrendKg === 'number'
          ? `${activeSnapshot.weightTrendKg >= 0 ? '+' : ''}${(activeSnapshot.weightTrendKg * 2.2046226218).toFixed(1)} lb trend`
          : 'Latest value',
      icon: <TbScaleOutline />,
    },
    {
      label: 'Body fat',
      value: metricValue(activeSnapshot.bodyFatPercent, '%'),
      sublabel:
        typeof activeSnapshot.bodyFatTrendPercent === 'number'
          ? `${activeSnapshot.bodyFatTrendPercent >= 0 ? '+' : ''}${activeSnapshot.bodyFatTrendPercent.toFixed(1)}% trend`
          : 'Latest value',
      icon: <FiTrendingUp />,
    },
    {
      label: 'Burn',
      value:
        typeof activeSnapshot.activeEnergyBurnedKcalAvg === 'number'
          ? `${Math.round(activeSnapshot.activeEnergyBurnedKcalAvg)} kcal`
          : 'No data',
      sublabel:
        typeof activeSnapshot.stepsAvg === 'number'
          ? `${Math.round(activeSnapshot.stepsAvg).toLocaleString()} steps`
          : 'Active average',
      icon: <FiActivity />,
    },
    {
      label: 'Recovery',
      value:
        typeof activeSnapshot.restingHeartRateBpmAvg === 'number'
          ? `${Math.round(activeSnapshot.restingHeartRateBpmAvg)} bpm`
          : 'No data',
      sublabel:
        typeof activeSnapshot.heartRateVariabilityMsAvg === 'number'
          ? `${Math.round(activeSnapshot.heartRateVariabilityMsAvg)} ms HRV`
          : 'Resting HR / HRV',
      icon: <FiHeart />,
    },
    {
      label: 'Cardio',
      value:
        typeof activeSnapshot.exerciseMinutesAvg === 'number'
          ? `${Math.round(activeSnapshot.exerciseMinutesAvg)} min`
          : 'No data',
      sublabel:
        typeof activeSnapshot.vo2MaxMlKgMin === 'number'
          ? `${activeSnapshot.vo2MaxMlKgMin.toFixed(1)} VO2 max`
          : 'Exercise / VO2',
      icon: <FiTrendingUp />,
    },
  ];

  return (
    <Card variant="default" padding="md" className={className}>
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant={isPreview ? 'secondary' : 'success'} size="sm">
              {sourceLabel(activeSnapshot)}
            </Badge>
            <Badge variant="info" size="sm">{plan.confidenceLabel}</Badge>
            {latestSnapshot && (
              <Badge variant="secondary" size="sm">
                {snapshots.length} saved
              </Badge>
            )}
          </div>
          <h3 className="text-xl font-serif text-gray-900">Health Intelligence</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            {describeMetricSnapshot(activeSnapshot)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={isAppleHealthAvailable ? 'primary' : 'outline'}
            onClick={syncHealth}
            isLoading={isSyncing || (isAppleHealthAvailable && isSavingSnapshot)}
            leftIcon={isAppleHealthAvailable ? <FaApple /> : <FiRefreshCw />}
          >
            {isAppleHealthAvailable ? 'Connect Apple Health' : 'Preview sample'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsManualEntryOpen((current) => !current)}
            leftIcon={<FiEdit3 />}
          >
            Manual entry
          </Button>
          <Button
            variant="secondary"
            onClick={generateAiCoach}
            isLoading={isGeneratingAi}
            leftIcon={<FiCpu />}
          >
            AI summary
          </Button>
        </div>
      </div>

      {(syncError || aiError || historyError || experimentError) && (
        <div className="mt-4 flex items-start gap-2 rounded border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 shrink-0" />
          <span>{syncError || aiError || historyError?.message || experimentError?.message}</span>
        </div>
      )}

      {syncNotice && (
        <div className="mt-4 rounded border border-green-100 bg-green-50 p-3 text-sm text-green-700">
          {syncNotice}
        </div>
      )}

      {schemaWarning && (
        <div className="mt-4 flex items-start gap-2 rounded border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
          <FiAlertCircle className="mt-0.5 shrink-0" />
          <span>{schemaWarning}</span>
        </div>
      )}

      {isManualEntryOpen && (
        <form
          onSubmit={handleManualSubmit}
          className="mt-4 rounded border border-gray-100 bg-gray-50 p-4"
        >
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {MANUAL_HEALTH_FIELDS.map((field) => (
              <Input
                key={field.key}
                type="number"
                inputMode="decimal"
                inputSize="sm"
                label={field.label}
                min={field.min}
                max={field.max}
                step={field.step}
                value={manualForm[field.key]}
                onChange={(event) => updateManualField(field.key, event.target.value)}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="submit" size="sm" isLoading={isSavingSnapshot} leftIcon={<FiSave />}>
              Save snapshot
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setIsManualEntryOpen(false)}
            >
              Close
            </Button>
          </div>
        </form>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded border border-gray-100 bg-gray-50 p-3">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-white text-gray-600">
              {metric.icon}
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{metric.label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{metric.value}</p>
            <p className="mt-0.5 text-xs text-gray-500">{metric.sublabel}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded border border-gray-100 bg-gray-50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              <FiTarget />
              Signal Coverage
            </div>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
              {signalReadiness.summary}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Badge variant="info" size="sm">
              {signalReadiness.coveragePercent}%
            </Badge>
            <Badge
              variant={signalReadiness.coveragePercent >= 60 ? 'success' : 'warning'}
              size="sm"
            >
              {signalReadiness.confidenceLabel}
            </Badge>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {signalReadiness.domains.map((domain) => (
            <div key={domain.id} className="rounded border border-gray-200 bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{domain.label}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                    {domain.shelfLabel}
                  </p>
                </div>
                <Badge variant={readinessVariant(domain.status)} size="sm">
                  {domain.connectedCount}/{domain.totalCount}
                </Badge>
              </div>
              <p className="mt-3 text-xs font-medium leading-5 text-gray-900">
                {domain.headline}
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-500">{domain.commerceImpact}</p>
            </div>
          ))}
        </div>

        {signalReadiness.missingPriority.length > 0 && (
          <div className="mt-4 rounded border border-gray-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Next signals to connect
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {signalReadiness.missingPriority.map((metric) => (
                <span
                  key={metric.id}
                  className="rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600"
                  title={metric.commerceImpact}
                >
                  {metric.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 rounded border border-gray-100 bg-gray-50 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={sleepProtocolVariant(dailyReadout.status)} size="sm">
                {dailyReadout.statusLabel}
              </Badge>
              <Badge variant="secondary" size="sm">
                {dailyReadout.readinessScore} readiness
              </Badge>
              <Badge variant="info" size="sm">
                {dailyReadout.focusShelfLabel}
              </Badge>
            </div>
            <h4 className="mt-2 font-medium text-gray-900">{dailyReadout.title}</h4>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
              {dailyReadout.summary}
            </p>
          </div>

          <Link
            href={dailyReadout.commerceHref}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {dailyReadout.commerceActionLabel}
            <FiArrowRight />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_0.9fr]">
          <div className="rounded border border-gray-200 bg-white p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <FiActivity />
              Signals
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {dailyReadout.signals.map((signal) => (
                <div key={signal.id} className="rounded border border-gray-100 bg-gray-50 p-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-gray-900">{signal.label}</p>
                    <Badge variant={signalVariant(signal.status)} size="sm">
                      {signal.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-gray-500">{signal.valueLabel}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-white p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <FiCheckCircle />
              Morning
            </div>
            <div className="space-y-2">
              {dailyReadout.morningActions.map((action) => (
                <div key={action} className="flex items-start gap-2 text-xs leading-5 text-gray-500">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-white p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <FiMoon />
              Tonight
            </div>
            <div className="space-y-2">
              {dailyReadout.tonightProtocol.map((step) => (
                <div key={step} className="flex items-start gap-2 text-xs leading-5 text-gray-500">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 border-t border-gray-100 pt-3 text-xs leading-5 text-gray-400">
              {dailyReadout.guardrails.join(' ')}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded border border-gray-100 bg-gray-50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              <FiMoon />
              Sleep Protocol
            </div>
            <h4 className="mt-1 font-medium text-gray-900">{sleepProtocol.title}</h4>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
              {sleepProtocol.summary}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Badge variant={sleepProtocolVariant(sleepProtocol.status)} size="sm">
              {sleepProtocol.status}
            </Badge>
            <Badge variant="info" size="sm">
              {sleepProtocol.score}
            </Badge>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {sleepProtocol.metrics.map((metric) => (
            <div key={metric.id} className="rounded border border-gray-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {metric.label}
                </p>
                <Badge variant={sleepProtocolVariant(metric.status)} size="sm">
                  {metric.status}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-gray-900">{metric.valueLabel}</p>
              <p className="mt-1 text-xs leading-5 text-gray-500">{metric.targetLabel}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded border border-gray-200 bg-white p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Night Stack Slots
                </p>
                <p className="mt-1 text-sm text-gray-500">{sleepProtocol.focusMetricLabel}</p>
              </div>
              <Link
                href={`/products?goal=${sleepProtocol.productGoalId}`}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Shop sleep
                <FiArrowRight />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {sleepProtocol.stackSlots.map((slot) => (
                <div key={slot.id} className="rounded border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{slot.label}</p>
                      <p className="mt-1 text-xs leading-5 text-gray-500">{slot.testLabel}</p>
                    </div>
                    <FiTarget className="mt-0.5 shrink-0 text-gray-300" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {slot.supplementNames.slice(0, 4).map((name) => (
                      <span
                        key={name}
                        className="rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-600"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-gray-500">{slot.rationale}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                14-night measurement plan
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-3">
                {sleepProtocol.measurementPlan.map((step) => (
                  <div key={step} className="flex items-start gap-2 text-xs leading-5 text-gray-500">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-white p-3">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Night Shelf Picks
                </p>
                <h5 className="mt-1 text-sm font-medium text-gray-900">
                  {sleepProtocol.experimentTitle}
                </h5>
              </div>
              <Button
                size="sm"
                onClick={startSleepProtocolExperiment}
                disabled={Boolean(activeSleepExperiment)}
                isLoading={isSavingExperiment}
                leftIcon={<FiClock />}
              >
                {activeSleepExperiment ? 'Active' : 'Start'}
              </Button>
            </div>

            {sleepProducts.length > 0 ? (
              <div className="space-y-2">
                {sleepProducts.map(({ product, match }) => (
                  <Link
                    key={product.product_id}
                    href={`/product/${product.product_id}`}
                    className="group flex items-center gap-3 rounded border border-gray-100 bg-gray-50 p-2 hover:border-gray-200 hover:bg-white"
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-gray-100 bg-white">
                      <Image
                        src={getProductImageSrc(product.product_image)}
                        alt={product.product_name}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                        unoptimized={isRemoteImageSrc(getProductImageSrc(product.product_image))}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <Badge variant="success" size="sm">
                          {match.score}
                        </Badge>
                        {product.ucp_enabled && (
                          <Badge variant="secondary" size="sm">
                            Checkout
                          </Badge>
                        )}
                      </span>
                      <span className="mt-1 block truncate text-sm font-medium text-gray-900 group-hover:underline">
                        {product.product_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {product.directory_supplement_name} · ${formatPrice(product.product_price)}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded border border-gray-100 bg-gray-50 p-3 text-sm text-gray-500">
                Connect sleep data to rank night shelf products.
              </p>
            )}

            <p className="mt-3 border-t border-gray-100 pt-3 text-xs leading-5 text-gray-400">
              {sleepProtocol.safetyNote}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded border border-gray-100 bg-gray-50 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Signal Map
            </p>
            <h4 className="mt-1 font-medium text-gray-900">
              Health signals routed to commerce shelves
            </h4>
          </div>
          <Link
            href={`/products?goal=${signalMap[0]?.goalId ?? tracker.focusExperiment.goalId}`}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Open top shelf
            <FiArrowRight />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-5">
          {signalMap.map((signal) => (
            <Link
              key={signal.id}
              href={`/products?goal=${signal.goalId}`}
              className="group flex min-h-56 flex-col rounded border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-gray-900">
                    {signal.label}
                  </span>
                  <span className="mt-1 block text-xs font-medium uppercase tracking-wide text-gray-400">
                    {signal.shelfLabel}
                  </span>
                </span>
                <Badge variant={signalVariant(signal.status)} size="sm">
                  {signal.status}
                </Badge>
              </span>

              <span className="mt-3 block rounded border border-gray-100 bg-gray-50 p-2">
                <span className="block text-xs font-medium text-gray-500">Current</span>
                <span className="mt-1 block text-sm font-semibold text-gray-900">
                  {signal.valueLabel}
                </span>
              </span>

              <span className="mt-3 block text-sm font-medium leading-5 text-gray-900">
                {signal.headline}
              </span>
              <span className="mt-1 block flex-1 text-xs leading-5 text-gray-500">
                {signal.reason}
              </span>

              <span className="mt-3 flex flex-wrap gap-1.5">
                {signal.supplementNames.slice(0, 3).map((name) => (
                  <span
                    key={name}
                    className="rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-600"
                  >
                    {name}
                  </span>
                ))}
              </span>

              <span className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
                <span className="line-clamp-1">{signal.targetLabel}</span>
                <FiArrowRight className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded border border-gray-100 bg-gray-50 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <div className="rounded border border-gray-200 bg-white p-4 lg:w-56">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Readiness
              </p>
              <FiZap className="text-gray-400" />
            </div>
            <p className="mt-3 text-4xl font-semibold text-gray-900">
              {tracker.readinessScore}
            </p>
            <p className="mt-1 text-sm text-gray-500">{tracker.readinessLabel}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="rounded border border-gray-100 p-2">
                <span className="block font-medium text-gray-900">
                  {tracker.sleepDebtHours !== null
                    ? `${metricValue(tracker.sleepDebtHours, 'h')}`
                    : 'No debt'}
                </span>
                Sleep debt
              </div>
              <div className="rounded border border-gray-100 p-2">
                <span className="block font-medium text-gray-900">
                  {tracker.totalEnergyBurnedKcalAvg
                    ? `${tracker.totalEnergyBurnedKcalAvg.toLocaleString()}`
                    : 'No data'}
                </span>
                Total burn
              </div>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
            {tracker.scores.map((score) => (
              <Link
                key={score.id}
                href={`/products?goal=${score.goalId}`}
                className="rounded border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900">{score.label}</span>
                  <Badge variant={trackerVariant(score.status)} size="sm">
                    {score.value}
                  </Badge>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gray-900"
                    style={{ width: `${score.value}%` }}
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-gray-500">{score.metricLabel}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Suggested experiment
            </p>
            <h4 className="mt-1 font-medium text-gray-900">{tracker.focusExperiment.title}</h4>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              {tracker.focusExperiment.rationale}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              size="sm"
              onClick={startSuggestedExperiment}
              disabled={Boolean(activeGoalExperiment)}
              isLoading={isSavingExperiment}
              leftIcon={<FiClock />}
            >
              {activeGoalExperiment ? 'Experiment active' : 'Start experiment'}
            </Button>
            <Link
              href={`/products?goal=${tracker.focusExperiment.goalId}`}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              {tracker.focusExperiment.actionLabel}
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>

      {commercePlan.items.length > 0 && (
        <div className="mt-5 rounded border border-gray-100 bg-gray-50 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                <FiShoppingCart />
                {commercePlan.headline}
              </div>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
                {commercePlan.summary}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2">
              <div className="grid min-w-0 grid-cols-3 gap-2 text-xs text-gray-500 sm:min-w-[360px]">
                <div className="rounded border border-gray-100 bg-white p-2">
                  <span className="block font-medium text-gray-900">
                    ${formatPrice(commercePlan.totalOneTimeCost)}
                  </span>
                  One-time
                </div>
                <div className="rounded border border-gray-100 bg-white p-2">
                  <span className="block font-medium text-gray-900">
                    ~${formatPrice(commercePlan.estimatedMonthlyCost)}
                  </span>
                  Monthly
                </div>
                <div className="rounded border border-gray-100 bg-white p-2">
                  <span className="block font-medium text-gray-900">
                    {commercePlan.directCheckoutCount}
                  </span>
                  Checkout
                </div>
              </div>
              {commercePlan.primaryExperiment && (
                <Button
                  size="sm"
                  onClick={startStackProtocolExperiment}
                  disabled={Boolean(activeStackExperiment)}
                  isLoading={isSavingExperiment}
                  leftIcon={<FiClock />}
                >
                  {activeStackExperiment
                    ? 'Stack active'
                    : commercePlan.primaryExperiment.actionLabel}
                </Button>
              )}
            </div>
          </div>

          {commercePlan.routineSlots.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
              {commercePlan.routineSlots.map((slot) => (
                <div
                  key={`${slot.id}-${slot.goalId}`}
                  className="rounded border border-gray-200 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={slot.isPrimary ? 'success' : 'secondary'} size="sm">
                          {slot.label}
                        </Badge>
                        <Badge variant="info" size="sm">
                          {slot.timingLabel}
                        </Badge>
                      </div>
                      <h5 className="mt-2 text-sm font-medium text-gray-900">{slot.headline}</h5>
                    </div>
                    <Link
                      href={slot.shelfHref}
                      className="inline-flex h-8 shrink-0 items-center justify-center rounded border border-gray-200 px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Shelf
                    </Link>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-gray-500">{slot.rationale}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {slot.productNames.map((name) => (
                      <span
                        key={name}
                        className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-600"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 border-t border-gray-100 pt-3 text-xs leading-5 text-gray-400">
                    Measure: {slot.measurementLabel}
                  </p>
                </div>
              ))}
            </div>
          )}

          {commercePlan.impactForecasts.length > 0 && (
            <div className="mt-4 rounded border border-gray-200 bg-white p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <FiTarget />
                    Impact Forecast
                  </div>
                  <p className="mt-1 max-w-3xl text-xs leading-5 text-gray-500">
                    Baseline, target signal, and decision rule for the current stack.
                  </p>
                </div>
                <Badge variant="info" size="sm">
                  {commercePlan.impactForecasts.length} tests
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
                {commercePlan.impactForecasts.map((forecast) => (
                  <div
                    key={`${forecast.productId}-${forecast.goalId}`}
                    className="rounded border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="secondary" size="sm">
                            {forecast.slotLabel}
                          </Badge>
                          <Badge variant="info" size="sm">
                            {forecast.measurementWindow}
                          </Badge>
                        </div>
                        <h5 className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-gray-900">
                          {forecast.productName}
                        </h5>
                        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                          {forecast.supplementName}
                        </p>
                      </div>
                      <FiActivity className="mt-1 shrink-0 text-gray-300" />
                    </div>

                    <p className="mt-3 text-xs font-medium leading-5 text-gray-900">
                      {forecast.headline}
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-500">
                      <div className="rounded border border-gray-100 bg-white p-2">
                        <span className="block font-medium text-gray-900">Baseline</span>
                        <span className="mt-1 block leading-5">{forecast.baselineLabel}</span>
                      </div>
                      <div className="rounded border border-gray-100 bg-white p-2">
                        <span className="block font-medium text-gray-900">Target signal</span>
                        <span className="mt-1 block leading-5">{forecast.targetLabel}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {forecast.watchMetrics.slice(0, 5).map((metric) => (
                        <span
                          key={metric}
                          className="rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-600"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 space-y-2 border-t border-gray-100 pt-3 text-xs leading-5 text-gray-500">
                      <p>
                        <span className="font-medium text-green-700">Keep:</span> {forecast.keepSignal}
                      </p>
                      <p>
                        <span className="font-medium text-amber-700">Swap:</span> {forecast.swapSignal}
                      </p>
                      <p>
                        <span className="font-medium text-red-700">Stop:</span> {forecast.stopSignal}
                      </p>
                    </div>
                    <p className="mt-3 text-[11px] leading-5 text-gray-400">{forecast.caution}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
            {commercePlan.items.map((item) => (
              <div key={item.product.product_id} className="rounded border border-gray-200 bg-white p-3">
                <div className="flex items-start gap-3">
                  <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-100 bg-white">
                    <Image
                      src={getProductImageSrc(item.product.product_image)}
                      alt={item.product.product_name}
                      fill
                      className="object-contain p-1.5"
                      sizes="64px"
                      unoptimized={isRemoteImageSrc(getProductImageSrc(item.product.product_image))}
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="info" size="sm">
                        {item.slotLabel}
                      </Badge>
                      <Badge variant="success" size="sm">
                        {item.match.score}
                      </Badge>
                    </div>
                    <h5 className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-gray-900">
                      {item.product.product_name}
                    </h5>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                      {item.product.directory_supplement_name}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-gray-500">{item.rationale}</p>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-400">
                  {item.match.reasons.join(' · ')}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    ${formatPrice(item.product.product_price)}
                  </span>
                  <span className="flex flex-wrap gap-2">
                    <Link
                      href={`/product/${item.product.product_id}`}
                      className="inline-flex h-8 items-center justify-center rounded border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Product
                    </Link>
                    <Link
                      href={item.shelfHref}
                      className="inline-flex h-8 items-center justify-center rounded bg-gray-900 px-3 text-xs font-medium text-white hover:bg-gray-800"
                    >
                      Shelf
                    </Link>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {commercePlan.cartGroups.length > 0 && (
            <div className="mt-4 rounded border border-gray-200 bg-white p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Merchant carts
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {commercePlan.cartGroups.map((group) => (
                  <a
                    key={group.storeDomain}
                    href={group.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-center justify-between gap-3 rounded border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:border-gray-200 hover:bg-white"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-gray-900">
                        {group.brandNames.join(', ') || group.storeDomain}
                      </span>
                      <span className="text-xs text-gray-500">
                        {group.products.length} item{group.products.length !== 1 ? 's' : ''} in one cart
                      </span>
                    </span>
                    <FiExternalLink className="shrink-0 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <p className="mt-3 text-xs leading-5 text-gray-400">{commercePlan.safetyNote}</p>
        </div>
      )}

      {productMatches.length > 0 && (
        <div className="mt-5 rounded border border-gray-100 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                <FiShoppingBag />
                Matched Products
              </div>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                These products are ranked from the same sleep, body, activity, and recovery
                signals driving the tracker score.
              </p>
            </div>
            <Link
              href={`/products?goal=${topMatchedGoalId}`}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Open matched shelf
              <FiArrowRight />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {productMatches.map(({ product, match }) => (
              <Link
                key={product.product_id}
                href={`/product/${product.product_id}`}
                className="group flex min-h-44 flex-col rounded border border-gray-100 bg-gray-50 p-3 transition-colors hover:border-gray-200 hover:bg-white"
              >
                <div className="flex items-start gap-3">
                  <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-100 bg-white">
                    <Image
                      src={getProductImageSrc(product.product_image)}
                      alt={product.product_name}
                      fill
                      className="object-contain p-1.5"
                      sizes="64px"
                      unoptimized={isRemoteImageSrc(getProductImageSrc(product.product_image))}
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <Badge variant="success" size="sm">
                        {match?.score ?? 0}
                      </Badge>
                      {product.ucp_enabled && (
                        <Badge variant="secondary" size="sm">
                          Checkout
                        </Badge>
                      )}
                    </span>
                    <span className="mt-2 block line-clamp-2 text-sm font-medium leading-5 text-gray-900 group-hover:underline">
                      {product.product_name}
                    </span>
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    {product.directory_supplement_name}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    ${formatPrice(product.product_price)}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
                    {match?.reasons.join(' · ') || 'Signal match'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(activeExperiments.length > 0 || isLoadingExperiments) && (
        <div className="mt-5 rounded border border-gray-100 p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Active Experiments
            </h4>
            {isLoadingExperiments && <Spinner size="sm" />}
          </div>

          {activeExperiments.length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {activeExperiments.slice(0, 4).map((experiment) => (
                <div key={experiment.experimentId} className="rounded border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant={experiment.status === 'active' ? 'success' : 'secondary'} size="sm">
                        {experiment.status}
                      </Badge>
                      <h5 className="mt-2 font-medium text-gray-900">{experiment.title}</h5>
                      <p className="mt-1 text-sm text-gray-500">
                        {goalTitle(experiment.goalId)} · Day {experimentDay(experiment)}/{experiment.targetDays}
                      </p>
                    </div>
                    <Badge variant="info" size="sm">
                      {experiment.baselineReadinessScore ?? '--'}
                    </Badge>
                  </div>

                  {experiment.supplementNames.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {experiment.supplementNames.slice(0, 4).map((name) => (
                        <span
                          key={name}
                          className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div className="rounded border border-gray-100 bg-white p-2">
                      <span className="block font-medium text-gray-900">
                        {experiment.baselineReadinessScore ?? 'No data'}
                      </span>
                      Baseline readiness
                    </div>
                    <div className="rounded border border-gray-100 bg-white p-2">
                      <span className="block font-medium text-gray-900">
                        {metricValue(experiment.baselineSleepHoursAvg, 'h')}
                      </span>
                      Baseline sleep
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/products?goal=${experiment.goalId}`}
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded bg-gray-900 px-3 text-xs font-medium text-white hover:bg-gray-800"
                    >
                      Open shelf
                      <FiArrowRight />
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isSavingExperiment}
                      leftIcon={<FiCheckCircle />}
                      onClick={() => completeWithCurrentSnapshot(experiment)}
                    >
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isSavingExperiment}
                      leftIcon={<FiXCircle />}
                      onClick={() => updateExperimentStatus(experiment.experimentId, 'dismissed')}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {completedExperiments.length > 0 && (
        <div className="mt-5 rounded border border-gray-100 p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Recent Outcomes
            </h4>
            <Badge variant="success" size="sm">
              {completedExperiments.length} complete
            </Badge>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
            {completedExperiments.slice(0, 3).map((experiment) => (
              <div key={experiment.experimentId} className="rounded border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="success" size="sm" icon={<FiCheckCircle />}>
                      completed
                    </Badge>
                    <h5 className="mt-2 font-medium text-gray-900">{experiment.title}</h5>
                    <p className="mt-1 text-sm text-gray-500">{goalTitle(experiment.goalId)}</p>
                  </div>
                  <Badge variant={outcomeVariant(experiment.outcomeReadinessDelta)} size="sm">
                    {signedMetricValue(experiment.outcomeReadinessDelta, '', 0)}
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div className="rounded border border-gray-100 bg-white p-2">
                    <span className="block font-medium text-gray-900">
                      {signedMetricValue(experiment.outcomeReadinessDelta, '', 0)}
                    </span>
                    Readiness
                  </div>
                  <div className="rounded border border-gray-100 bg-white p-2">
                    <span className="block font-medium text-gray-900">
                      {signedMetricValue(experiment.outcomeSleepDeltaHours, 'h')}
                    </span>
                    Sleep
                  </div>
                  <div className="rounded border border-gray-100 bg-white p-2">
                    <span className="block font-medium text-gray-900">
                      {experiment.outcomeReadinessScore ?? 'No data'}
                    </span>
                    Final readiness
                  </div>
                  <div className="rounded border border-gray-100 bg-white p-2">
                    <span className="block font-medium text-gray-900">
                      {metricValue(experiment.outcomeSleepHoursAvg, 'h')}
                    </span>
                    Final sleep
                  </div>
                </div>

                {experiment.outcomeSummary && (
                  <p className="mt-3 text-xs leading-5 text-gray-500">{experiment.outcomeSummary}</p>
                )}

                <Link
                  href={`/products?goal=${experiment.goalId}`}
                  className="mt-3 inline-flex h-8 items-center justify-center gap-1.5 rounded border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Open shelf
                  <FiArrowRight />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 rounded border border-gray-100 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              <FiRefreshCw />
              Progress Loop
            </div>
            <h4 className="mt-2 text-lg font-semibold tracking-normal text-gray-900">
              {progressLoop.title}
            </h4>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
              {progressLoop.summary}
            </p>
          </div>
          <Badge variant={progressLoopVariant(progressLoop.status)} size="sm">
            {progressLoop.statusLabel}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
          {progressLoop.metrics.map((metric) => (
            <div key={metric.id} className="rounded border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {metric.label}
                </span>
                <Badge variant={progressMetricVariant(metric.status)} size="sm">
                  {metric.deltaLabel}
                </Badge>
              </div>
              <p className="mt-3 text-xs leading-5 text-gray-500">{metric.interpretation}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded border border-gray-100 bg-white p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <FiTarget />
              Decision
            </div>
            <p className="mt-2 text-sm leading-6 text-gray-600">{progressLoop.decision}</p>
          </div>
          <div className="rounded border border-gray-100 bg-white p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <FiCheckCircle />
              Next Actions
            </div>
            <div className="mt-2 space-y-1.5">
              {progressLoop.nextActions.slice(0, 3).map((action) => (
                <p key={action} className="text-sm leading-6 text-gray-600">
                  {action}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded border border-gray-100 p-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Health Timeline
          </h4>
          {isLoadingHistory && <Spinner size="sm" />}
        </div>

        {historyItems.length > 0 ? (
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-5">
            {historyItems.map(({ snapshot: savedSnapshot, tracker: savedTracker }) => (
              <button
                key={savedSnapshot.snapshotId}
                type="button"
                onClick={() => {
                  setSnapshot(savedSnapshot);
                  setAiCoach(null);
                }}
                className="rounded border border-gray-100 bg-gray-50 p-3 text-left transition-colors hover:border-gray-200 hover:bg-white"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-gray-500">
                    {formatSnapshotDate(savedSnapshot.capturedAt)}
                  </span>
                  <Badge variant={trackerVariant(savedTracker.scores[1].status)} size="sm">
                    {savedTracker.readinessScore}
                  </Badge>
                </span>
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  {sourceLabel(savedSnapshot)}
                </span>
                <span className="mt-1 block text-xs leading-5 text-gray-500">
                  {metricValue(savedSnapshot.sleepHoursAvg, 'h')} sleep
                </span>
              </button>
            ))}
          </div>
        ) : (
          !isLoadingHistory && (
            <p className="mt-3 text-sm text-gray-500">No saved health snapshots yet.</p>
          )
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Ranked Opportunities
          </h4>
          <div className="mt-3 space-y-3">
            {plan.opportunities.slice(0, 3).map((opportunity) => {
              const shopHref = healthGoalHref(opportunity.goalId);

              return (
                <div key={opportunity.id} className="rounded border border-gray-100 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap gap-2">
                        <Badge variant={priorityVariant(opportunity.priority)} size="sm">
                          {opportunity.priority} priority
                        </Badge>
                        <span className="text-xs font-medium text-gray-400">
                          {opportunity.metricLabel}
                        </span>
                      </div>
                      <h5 className="font-medium text-gray-900">{opportunity.title}</h5>
                      <p className="mt-1 text-sm leading-6 text-gray-500">{opportunity.rationale}</p>
                    </div>
                    <Link
                      href={shopHref}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded bg-gray-900 px-3 text-xs font-medium text-white hover:bg-gray-800"
                    >
                      {opportunity.actionLabel}
                      <FiArrowRight />
                    </Link>
                  </div>

                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {opportunity.products.slice(0, 4).map((product) => (
                      <Link
                        key={product.product_id}
                        href={`/product/${product.product_id}`}
                        className="flex w-36 shrink-0 items-center gap-2 rounded border border-gray-100 p-2 hover:border-gray-200"
                      >
                        <span className="relative h-10 w-10 shrink-0">
                          <Image
                            src={getProductImageSrc(product.product_image)}
                            alt={product.product_name}
                            fill
                            className="object-contain"
                            sizes="40px"
                            unoptimized={isRemoteImageSrc(getProductImageSrc(product.product_image))}
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-medium text-gray-800">
                            {product.product_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ${formatPrice(product.product_price)}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>

                  <p className="mt-3 text-xs leading-5 text-gray-400">{opportunity.caution}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Coach Summary
            </h4>
            {isGeneratingAi && <Spinner size="sm" />}
          </div>
          <h5 className="mt-3 text-lg font-serif text-gray-900">
            {(aiCoach ?? plan).headline}
          </h5>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            {(aiCoach ?? plan).summary}
          </p>
          <div className="mt-4 space-y-2">
            {(aiCoach?.nextBestActions ?? plan.nextBestActions).slice(0, 3).map((action) => (
              <div key={action} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                <span>{action}</span>
              </div>
            ))}
          </div>
          {aiCoach?.stackPlan && (
            <div className="mt-4 rounded border border-gray-200 bg-white p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="info" size="sm">
                      AI stack
                    </Badge>
                    <Badge variant="secondary" size="sm">
                      ~${formatPrice(aiCoach.stackPlan.estimatedMonthlyCost)}/mo
                    </Badge>
                  </div>
                  <h6 className="mt-2 text-sm font-medium text-gray-900">
                    {aiCoach.stackPlan.experimentTitle}
                  </h6>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {aiCoach.stackPlan.summary}
                  </p>
                </div>
                <Link
                  href={aiCoach.stackPlan.shelfHref}
                  className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded bg-gray-900 px-3 text-xs font-medium text-white hover:bg-gray-800"
                >
                  {aiCoach.stackPlan.actionLabel}
                  <FiArrowRight />
                </Link>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {aiCoach.stackPlan.products.slice(0, 4).map((product) => (
                  <Link
                    key={product.productId}
                    href={product.href}
                    className="rounded border border-gray-100 bg-gray-50 p-2 hover:border-gray-200 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium text-gray-900">
                          {product.productName}
                        </span>
                        <span className="mt-1 block text-[11px] uppercase tracking-wide text-gray-400">
                          {product.supplementName}
                        </span>
                      </span>
                      <Badge variant="success" size="sm">
                        {product.matchScore}
                      </Badge>
                    </div>
                    <span className="mt-2 block text-xs font-semibold text-gray-900">
                      ${formatPrice(product.price)}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2">
                {aiCoach.stackPlan.routineSlots.slice(0, 3).map((slot) => (
                  <div
                    key={`${slot.label}-${slot.goalId}`}
                    className="rounded border border-gray-100 bg-gray-50 p-2"
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={slot.isPrimary ? 'success' : 'secondary'} size="sm">
                        {slot.label}
                      </Badge>
                      <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                        {slot.timingLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-medium text-gray-900">{slot.headline}</p>
                    <p className="mt-1 text-[11px] leading-5 text-gray-500">
                      Measure: {slot.measurementLabel}
                    </p>
                  </div>
                ))}
              </div>

              {aiCoach.stackPlan.impactForecasts.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                  {aiCoach.stackPlan.impactForecasts.slice(0, 2).map((forecast) => (
                    <div
                      key={`${forecast.productId}-${forecast.slotLabel}`}
                      className="rounded border border-gray-100 bg-gray-50 p-2"
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="info" size="sm">
                          {forecast.slotLabel}
                        </Badge>
                        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                          {forecast.measurementWindow}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-medium text-gray-900">
                        {forecast.productName}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-gray-500">
                        Target: {forecast.targetLabel}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-gray-500">
                        Keep: {forecast.keepSignal}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <p className="mt-4 border-t border-gray-200 pt-3 text-xs leading-5 text-gray-400">
            {aiCoach?.safetyNote ?? plan.disclaimer}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default HealthIntelligencePanel;
