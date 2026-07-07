import type { Product, Supplement } from '@/types';
import {
  createCatalogProductsForSupplement,
  findCatalogSupplementByName,
} from '@/lib/catalog/supplement-catalog';
import type { HealthGoalId } from '@/lib/catalog/health-goal-directory';

export type HealthDataSource = 'apple_health' | 'manual' | 'demo';
export type HealthOpportunityPriority = 'high' | 'medium' | 'low';

export interface HealthMetricSnapshot {
  source: HealthDataSource;
  dateRangeDays: number;
  lastSyncedAt?: string;
  sleepHoursAvg?: number | null;
  sleepQualityAvg?: number | null;
  sleepDaysTracked?: number | null;
  sleepDebtHours?: number | null;
  sleepConsistencyScore?: number | null;
  sleepRemHoursAvg?: number | null;
  sleepDeepHoursAvg?: number | null;
  sleepAwakeHoursAvg?: number | null;
  weightKg?: number | null;
  weightTrendKg?: number | null;
  bodyFatPercent?: number | null;
  bodyFatTrendPercent?: number | null;
  activeEnergyBurnedKcalAvg?: number | null;
  restingEnergyBurnedKcalAvg?: number | null;
  stepsAvg?: number | null;
  exerciseMinutesAvg?: number | null;
  restingHeartRateBpmAvg?: number | null;
  heartRateVariabilityMsAvg?: number | null;
  vo2MaxMlKgMin?: number | null;
}

export interface HealthOpportunity {
  id: string;
  goalId: HealthGoalId;
  priority: HealthOpportunityPriority;
  title: string;
  bodySignal: string;
  rationale: string;
  metricLabel: string;
  supplementNames: string[];
  supplements: Supplement[];
  products: Product[];
  actionLabel: string;
  caution: string;
}

export interface HealthCoachPlan {
  headline: string;
  summary: string;
  confidenceLabel: string;
  opportunities: HealthOpportunity[];
  nextBestActions: string[];
  disclaimer: string;
}

export interface AiHealthCoachStackProduct {
  productId: string;
  productName: string;
  supplementName: string;
  price: number;
  matchScore: number;
  href: string;
}

export interface AiHealthCoachRoutineSlot {
  label: string;
  timingLabel: string;
  goalId: HealthGoalId;
  headline: string;
  measurementLabel: string;
  productNames: string[];
  isPrimary: boolean;
}

export interface AiHealthCoachImpactForecast {
  productId: string;
  productName: string;
  supplementName: string;
  slotLabel: string;
  measurementWindow: string;
  baselineLabel: string;
  targetLabel: string;
  keepSignal: string;
  swapSignal: string;
  stopSignal: string;
}

export interface AiHealthCoachStackPlan {
  headline: string;
  summary: string;
  experimentTitle: string;
  actionLabel: string;
  goalId: HealthGoalId;
  shelfHref: string;
  totalOneTimeCost: number;
  estimatedMonthlyCost: number;
  products: AiHealthCoachStackProduct[];
  routineSlots: AiHealthCoachRoutineSlot[];
  impactForecasts: AiHealthCoachImpactForecast[];
}

export interface AiHealthCoachResponse {
  source: 'openai' | 'local';
  headline: string;
  summary: string;
  nextBestActions: string[];
  safetyNote: string;
  stackPlan?: AiHealthCoachStackPlan | null;
}

export interface HealthTrendSummary {
  snapshotCount: number;
  readinessDelta: number | null;
  sleepDeltaHours: number | null;
  weightDeltaKg: number | null;
  bodyFatDeltaPercent: number | null;
  activeEnergyDeltaKcal: number | null;
  label: string;
}

export type HealthProgressDecisionStatus = 'need_baseline' | 'hold' | 'keep' | 'adjust';
export type HealthProgressMetricStatus = 'positive' | 'neutral' | 'watch';

export interface HealthProgressMetric {
  id: 'readiness' | 'sleep' | 'weight' | 'bodyFat' | 'activeEnergy';
  label: string;
  deltaLabel: string;
  interpretation: string;
  status: HealthProgressMetricStatus;
}

export interface HealthProgressLoop {
  status: HealthProgressDecisionStatus;
  statusLabel: string;
  title: string;
  summary: string;
  snapshotCount: number;
  trend: HealthTrendSummary | null;
  metrics: HealthProgressMetric[];
  decision: string;
  nextActions: string[];
}

export type HealthSignalReadinessStatus = 'ready' | 'partial' | 'missing';

export interface HealthSignalReadinessMetric {
  id: string;
  label: string;
  connected: boolean;
  valueLabel: string;
  commerceImpact: string;
}

export interface HealthSignalReadinessDomain {
  id: 'sleep' | 'body' | 'energy' | 'recovery' | 'cardio';
  label: string;
  connectedCount: number;
  totalCount: number;
  status: HealthSignalReadinessStatus;
  shelfLabel: string;
  headline: string;
  commerceImpact: string;
  metrics: HealthSignalReadinessMetric[];
}

export interface HealthSignalReadiness {
  connectedCount: number;
  totalCount: number;
  coveragePercent: number;
  confidenceLabel: string;
  summary: string;
  domains: HealthSignalReadinessDomain[];
  missingPriority: HealthSignalReadinessMetric[];
}

export interface HealthTrackerScore {
  id: 'sleep' | 'recovery' | 'body' | 'output';
  label: string;
  value: number;
  status: 'strong' | 'watch' | 'needs_attention';
  metricLabel: string;
  goalId: HealthGoalId;
}

export interface HealthTrackerPlan {
  readinessScore: number;
  readinessLabel: string;
  sleepDebtHours: number | null;
  totalEnergyBurnedKcalAvg: number | null;
  scores: HealthTrackerScore[];
  focusExperiment: {
    title: string;
    rationale: string;
    goalId: HealthGoalId;
    actionLabel: string;
  };
}

export type HealthSignalStatus = 'strong' | 'watch' | 'opportunity';
export type SleepProtocolStatus = 'ready' | 'watch' | 'priority';

export interface HealthSignalMapItem {
  id: 'sleep' | 'body' | 'activity' | 'metabolic' | 'foundation';
  label: string;
  status: HealthSignalStatus;
  goalId: HealthGoalId;
  valueLabel: string;
  targetLabel: string;
  shelfLabel: string;
  headline: string;
  reason: string;
  supplementNames: string[];
}

export interface SleepProtocolMetric {
  id: 'duration' | 'consistency' | 'stages' | 'debt' | 'vitals';
  label: string;
  valueLabel: string;
  targetLabel: string;
  status: SleepProtocolStatus;
}

export interface SleepProtocolStackSlot {
  id: 'base' | 'calm' | 'stage' | 'timing';
  label: string;
  supplementNames: string[];
  rationale: string;
  testLabel: string;
}

export interface SleepCommerceProtocol {
  status: SleepProtocolStatus;
  score: number;
  title: string;
  summary: string;
  focusMetricLabel: string;
  experimentTitle: string;
  productGoalId: Extract<HealthGoalId, 'sleep-recovery'>;
  metrics: SleepProtocolMetric[];
  stackSlots: SleepProtocolStackSlot[];
  measurementPlan: string[];
  safetyNote: string;
}

export interface HealthDailyReadoutSignal {
  id: HealthSignalMapItem['id'];
  label: string;
  status: HealthSignalStatus;
  valueLabel: string;
  shelfLabel: string;
}

export interface HealthDailyReadout {
  status: SleepProtocolStatus;
  statusLabel: string;
  title: string;
  summary: string;
  readinessScore: number;
  readinessLabel: string;
  focusGoalId: HealthGoalId;
  focusShelfLabel: string;
  primaryMetricLabel: string;
  commerceActionLabel: string;
  commerceHref: string;
  experimentTitle: string;
  signals: HealthDailyReadoutSignal[];
  morningActions: string[];
  tonightProtocol: string[];
  guardrails: string[];
}

const kgToLbs = (kg: number) => kg * 2.2046226218;

function formatNumber(value: number, digits = 1) {
  return value.toLocaleString('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function hasValue(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function supplementsAndProducts(names: string[]) {
  const supplements = names
    .map((name) => findCatalogSupplementByName(name))
    .filter((supplement): supplement is Supplement => Boolean(supplement));

  const products = supplements.flatMap(createCatalogProductsForSupplement);
  return { supplements, products };
}

function priorityRank(priority: HealthOpportunityPriority) {
  switch (priority) {
    case 'high':
      return 0;
    case 'medium':
      return 1;
    case 'low':
    default:
      return 2;
  }
}

function opportunity(
  input: Omit<HealthOpportunity, 'supplements' | 'products'>
): HealthOpportunity {
  const { supplements, products } = supplementsAndProducts(input.supplementNames);
  return { ...input, supplements, products };
}

export const DEMO_HEALTH_SNAPSHOT: HealthMetricSnapshot = {
  source: 'demo',
  dateRangeDays: 14,
  lastSyncedAt: new Date().toISOString(),
  sleepHoursAvg: 6.4,
  sleepQualityAvg: 3.1,
  sleepDaysTracked: 12,
  sleepDebtHours: 13.2,
  sleepConsistencyScore: 68,
  sleepRemHoursAvg: 1.35,
  sleepDeepHoursAvg: 0.72,
  sleepAwakeHoursAvg: 0.48,
  weightKg: 84.8,
  weightTrendKg: 0.7,
  bodyFatPercent: 22.4,
  bodyFatTrendPercent: 0.4,
  activeEnergyBurnedKcalAvg: 640,
  restingEnergyBurnedKcalAvg: 1790,
  stepsAvg: 9100,
  exerciseMinutesAvg: 42,
  restingHeartRateBpmAvg: 62,
  heartRateVariabilityMsAvg: 48,
  vo2MaxMlKgMin: 42,
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function scoreStatus(value: number): HealthTrackerScore['status'] {
  if (value >= 80) return 'strong';
  if (value >= 60) return 'watch';
  return 'needs_attention';
}

function valueOrDefault(value: number | null | undefined, fallback: number) {
  return hasValue(value) ? value : fallback;
}

function signedNumber(value: number, digits = 1) {
  return `${value > 0 ? '+' : ''}${formatNumber(value, digits)}`;
}

function compactMetricParts(parts: Array<string | null>) {
  return parts.filter(Boolean).join(' · ') || 'No data yet';
}

function sleepStageFlags(snapshot: HealthMetricSnapshot) {
  const lowDeepSleep = hasValue(snapshot.sleepDeepHoursAvg) && snapshot.sleepDeepHoursAvg < 0.8;
  const lowRemSleep = hasValue(snapshot.sleepRemHoursAvg) && snapshot.sleepRemHoursAvg < 1.2;
  const elevatedAwakeTime = hasValue(snapshot.sleepAwakeHoursAvg) && snapshot.sleepAwakeHoursAvg > 0.55;
  const watchDeepSleep = hasValue(snapshot.sleepDeepHoursAvg) && snapshot.sleepDeepHoursAvg < 1;
  const watchRemSleep = hasValue(snapshot.sleepRemHoursAvg) && snapshot.sleepRemHoursAvg < 1.4;
  const watchAwakeTime = hasValue(snapshot.sleepAwakeHoursAvg) && snapshot.sleepAwakeHoursAvg > 0.35;
  const needsAttention = lowDeepSleep || lowRemSleep || elevatedAwakeTime;

  return {
    hasStages:
      hasValue(snapshot.sleepDeepHoursAvg) ||
      hasValue(snapshot.sleepRemHoursAvg) ||
      hasValue(snapshot.sleepAwakeHoursAvg),
    lowDeepSleep,
    lowRemSleep,
    elevatedAwakeTime,
    needsAttention,
    watch: needsAttention || watchDeepSleep || watchRemSleep || watchAwakeTime,
  };
}

export function describeMetricSnapshot(snapshot: HealthMetricSnapshot) {
  const parts = [
    hasValue(snapshot.sleepHoursAvg) ? `${formatNumber(snapshot.sleepHoursAvg)}h sleep` : null,
    hasValue(snapshot.weightKg) ? `${Math.round(kgToLbs(snapshot.weightKg))} lb` : null,
    hasValue(snapshot.bodyFatPercent) ? `${formatNumber(snapshot.bodyFatPercent)}% body fat` : null,
    hasValue(snapshot.activeEnergyBurnedKcalAvg)
      ? `${Math.round(snapshot.activeEnergyBurnedKcalAvg)} active kcal`
      : null,
    hasValue(snapshot.restingHeartRateBpmAvg)
      ? `${Math.round(snapshot.restingHeartRateBpmAvg)} bpm RHR`
      : null,
  ].filter(Boolean);

  return parts.length ? parts.join(' · ') : 'No health metrics connected yet';
}

function readinessStatus(
  connectedCount: number,
  totalCount: number
): HealthSignalReadinessStatus {
  if (connectedCount >= totalCount) return 'ready';
  if (connectedCount > 0) return 'partial';
  return 'missing';
}

function connectedMetric(
  id: string,
  label: string,
  value: number | null | undefined,
  valueLabel: string,
  commerceImpact: string
): HealthSignalReadinessMetric {
  return {
    id,
    label,
    connected: hasValue(value),
    valueLabel: hasValue(value) ? valueLabel : 'Missing',
    commerceImpact,
  };
}

function buildReadinessDomain(input: {
  id: HealthSignalReadinessDomain['id'];
  label: string;
  shelfLabel: string;
  headline: string;
  commerceImpact: string;
  metrics: HealthSignalReadinessMetric[];
}): HealthSignalReadinessDomain {
  const connectedCount = input.metrics.filter((metric) => metric.connected).length;

  return {
    ...input,
    connectedCount,
    totalCount: input.metrics.length,
    status: readinessStatus(connectedCount, input.metrics.length),
  };
}

export function buildHealthSignalReadiness(
  snapshot: HealthMetricSnapshot
): HealthSignalReadiness {
  const domains: HealthSignalReadinessDomain[] = [
    buildReadinessDomain({
      id: 'sleep',
      label: 'Sleep',
      shelfLabel: 'Night shelf',
      headline: 'Sleep duration, quality, consistency, and stages',
      commerceImpact:
        'Ranks magnesium, glycine, theanine, apigenin, and timing support against the actual sleep bottleneck.',
      metrics: [
        connectedMetric(
          'sleepHoursAvg',
          'Sleep duration',
          snapshot.sleepHoursAvg,
          `${formatNumber(snapshot.sleepHoursAvg ?? 0)}h`,
          'Sets the night-stack priority.'
        ),
        connectedMetric(
          'sleepQualityAvg',
          'Sleep quality',
          snapshot.sleepQualityAvg,
          `${formatNumber(snapshot.sleepQualityAvg ?? 0)}/5`,
          'Separates calm support from simple duration support.'
        ),
        connectedMetric(
          'sleepConsistencyScore',
          'Consistency',
          snapshot.sleepConsistencyScore,
          `${formatNumber(snapshot.sleepConsistencyScore ?? 0, 0)}%`,
          'Controls whether timing tools enter the experiment.'
        ),
        connectedMetric(
          'sleepRemHoursAvg',
          'REM sleep',
          snapshot.sleepRemHoursAvg,
          `${formatNumber(snapshot.sleepRemHoursAvg ?? 0)}h`,
          'Makes the sleep shelf stage-aware.'
        ),
        connectedMetric(
          'sleepDeepHoursAvg',
          'Deep sleep',
          snapshot.sleepDeepHoursAvg,
          `${formatNumber(snapshot.sleepDeepHoursAvg ?? 0)}h`,
          'Moves recovery-support products up or down.'
        ),
        connectedMetric(
          'sleepAwakeHoursAvg',
          'Awake time',
          snapshot.sleepAwakeHoursAvg,
          `${formatNumber(snapshot.sleepAwakeHoursAvg ?? 0)}h`,
          'Flags wake-time support instead of broad sleep aids.'
        ),
      ],
    }),
    buildReadinessDomain({
      id: 'body',
      label: 'Body',
      shelfLabel: 'Body shelf',
      headline: 'Weight, body-fat, and direction of change',
      commerceImpact:
        'Routes shoppers toward protein, creatine, fiber, and satiety support without making fat-loss promises.',
      metrics: [
        connectedMetric(
          'weightKg',
          'Weight',
          snapshot.weightKg,
          `${Math.round(kgToLbs(snapshot.weightKg ?? 0))} lb`,
          'Provides the body-composition baseline.'
        ),
        connectedMetric(
          'weightTrendKg',
          'Weight trend',
          snapshot.weightTrendKg,
          `${signedNumber(kgToLbs(snapshot.weightTrendKg ?? 0))} lb`,
          'Detects whether the body shelf should move up.'
        ),
        connectedMetric(
          'bodyFatPercent',
          'Body fat',
          snapshot.bodyFatPercent,
          `${formatNumber(snapshot.bodyFatPercent ?? 0)}%`,
          'Adds context to protein, fiber, and metabolic shelves.'
        ),
        connectedMetric(
          'bodyFatTrendPercent',
          'Body-fat trend',
          snapshot.bodyFatTrendPercent,
          `${signedNumber(snapshot.bodyFatTrendPercent ?? 0)}%`,
          'Keeps product experiments trend-based instead of single-value based.'
        ),
      ],
    }),
    buildReadinessDomain({
      id: 'energy',
      label: 'Energy',
      shelfLabel: 'Training shelf',
      headline: 'Burn, steps, and training load',
      commerceImpact:
        'Separates daily staples from training-day hydration, protein, creatine, and recovery products.',
      metrics: [
        connectedMetric(
          'activeEnergyBurnedKcalAvg',
          'Active calories',
          snapshot.activeEnergyBurnedKcalAvg,
          `${Math.round(snapshot.activeEnergyBurnedKcalAvg ?? 0)} kcal`,
          'Identifies high-output days.'
        ),
        connectedMetric(
          'restingEnergyBurnedKcalAvg',
          'Resting calories',
          snapshot.restingEnergyBurnedKcalAvg,
          `${Math.round(snapshot.restingEnergyBurnedKcalAvg ?? 0)} kcal`,
          'Helps frame total burn without overreacting to workouts.'
        ),
        connectedMetric(
          'stepsAvg',
          'Steps',
          snapshot.stepsAvg,
          `${Math.round(snapshot.stepsAvg ?? 0).toLocaleString()}`,
          'Adds low-intensity movement context.'
        ),
        connectedMetric(
          'exerciseMinutesAvg',
          'Exercise minutes',
          snapshot.exerciseMinutesAvg,
          `${Math.round(snapshot.exerciseMinutesAvg ?? 0)} min`,
          'Clarifies whether output support is training-led.'
        ),
      ],
    }),
    buildReadinessDomain({
      id: 'recovery',
      label: 'Recovery',
      shelfLabel: 'Recovery shelf',
      headline: 'Resting heart rate and HRV',
      commerceImpact:
        'Keeps the app conservative when recovery vitals suggest sleep, hydration, and calm support should come before stimulants.',
      metrics: [
        connectedMetric(
          'restingHeartRateBpmAvg',
          'Resting HR',
          snapshot.restingHeartRateBpmAvg,
          `${Math.round(snapshot.restingHeartRateBpmAvg ?? 0)} bpm`,
          'Flags recovery strain when elevated.'
        ),
        connectedMetric(
          'heartRateVariabilityMsAvg',
          'HRV',
          snapshot.heartRateVariabilityMsAvg,
          `${Math.round(snapshot.heartRateVariabilityMsAvg ?? 0)} ms`,
          'Adds nervous-system recovery context.'
        ),
      ],
    }),
    buildReadinessDomain({
      id: 'cardio',
      label: 'Cardio',
      shelfLabel: 'Output shelf',
      headline: 'VO2 max trend context',
      commerceImpact:
        'Keeps performance recommendations proportional to conditioning instead of only active calories.',
      metrics: [
        connectedMetric(
          'vo2MaxMlKgMin',
          'VO2 max',
          snapshot.vo2MaxMlKgMin,
          `${formatNumber(snapshot.vo2MaxMlKgMin ?? 0)} ml/kg/min`,
          'Adds cardiorespiratory fitness context.'
        ),
      ],
    }),
  ];
  const connectedCount = domains.reduce((total, domain) => total + domain.connectedCount, 0);
  const totalCount = domains.reduce((total, domain) => total + domain.totalCount, 0);
  const coveragePercent = Math.round((connectedCount / Math.max(1, totalCount)) * 100);
  const missingPriority = domains
    .flatMap((domain) => domain.metrics)
    .filter((metric) => !metric.connected)
    .slice(0, 6);
  const confidenceLabel =
    coveragePercent >= 82
      ? 'High confidence'
      : coveragePercent >= 60
        ? 'Strong signal mix'
        : coveragePercent >= 35
          ? 'Partial signal mix'
          : 'Needs more data';
  const summary =
    missingPriority.length === 0
      ? 'All core Apple Health domains are connected, so product ranking can use sleep, body, burn, recovery, and cardio context together.'
      : `${connectedCount}/${totalCount} core signals connected. Add ${missingPriority
          .slice(0, 3)
          .map((metric) => metric.label.toLowerCase())
          .join(', ')} to make supplement ranking more precise.`;

  return {
    connectedCount,
    totalCount,
    coveragePercent,
    confidenceLabel,
    summary,
    domains,
    missingPriority,
  };
}

export function evaluateHealthOpportunities(snapshot: HealthMetricSnapshot): HealthOpportunity[] {
  const opportunities: HealthOpportunity[] = [];
  const sleepStages = sleepStageFlags(snapshot);

  if (
    (hasValue(snapshot.sleepHoursAvg) && snapshot.sleepHoursAvg < 7) ||
    (hasValue(snapshot.sleepQualityAvg) && snapshot.sleepQualityAvg < 3.5) ||
    sleepStages.needsAttention
  ) {
    const metricBits = [
      hasValue(snapshot.sleepHoursAvg) ? `${formatNumber(snapshot.sleepHoursAvg)}h average sleep` : null,
      hasValue(snapshot.sleepQualityAvg) ? `${formatNumber(snapshot.sleepQualityAvg)}/5 sleep quality` : null,
      hasValue(snapshot.sleepDeepHoursAvg) ? `${formatNumber(snapshot.sleepDeepHoursAvg)}h deep` : null,
      hasValue(snapshot.sleepRemHoursAvg) ? `${formatNumber(snapshot.sleepRemHoursAvg)}h REM` : null,
      hasValue(snapshot.sleepAwakeHoursAvg) ? `${formatNumber(snapshot.sleepAwakeHoursAvg)}h awake` : null,
    ].filter(Boolean);
    const sleepSupplementNames = Array.from(
      new Set([
        'Magnesium Glycinate',
        'Glycine',
        'L-Theanine',
        'Apigenin',
        sleepStages.elevatedAwakeTime ? 'Lemon Balm' : null,
        sleepStages.lowDeepSleep ? 'Valerian Root' : null,
      ].filter((name): name is string => Boolean(name)))
    );

    opportunities.push(
      opportunity({
        id: 'sleep-recovery-gap',
        goalId: 'sleep-recovery',
        priority:
          (hasValue(snapshot.sleepHoursAvg) && snapshot.sleepHoursAvg < 6.5) ||
          (sleepStages.elevatedAwakeTime && sleepStages.lowDeepSleep)
            ? 'high'
            : 'medium',
        title: sleepStages.hasStages
          ? 'Tune the sleep-stage recovery stack'
          : 'Tighten the nighttime recovery stack',
        bodySignal: sleepStages.needsAttention
          ? 'Sleep-stage detail is the clearest recovery bottleneck in this snapshot.'
          : 'Sleep is the clearest performance bottleneck in this snapshot.',
        rationale:
          sleepStages.hasStages
            ? 'Use REM, deep, and awake time to keep the sleep shelf practical: calm support, glycine, magnesium, and theanine before chasing broader performance products.'
            : 'Prioritize low-friction sleep support before chasing more performance products. Magnesium glycinate, glycine, and theanine are catalog staples for relaxation-focused routines.',
        metricLabel: metricBits.join(' · '),
        supplementNames: sleepSupplementNames,
        actionLabel: 'Shop sleep support',
        caution:
          'Sleep-stage estimates vary by device and are best used as directional signals. Melatonin can be useful for timing, but it is not a default nightly recommendation.',
      })
    );
  }

  if (
    (hasValue(snapshot.weightTrendKg) && snapshot.weightTrendKg > 0.25) ||
    (hasValue(snapshot.bodyFatTrendPercent) && snapshot.bodyFatTrendPercent > 0.2)
  ) {
    const metricBits = [
      hasValue(snapshot.weightTrendKg)
        ? `${snapshot.weightTrendKg > 0 ? '+' : ''}${formatNumber(kgToLbs(snapshot.weightTrendKg))} lb trend`
        : null,
      hasValue(snapshot.bodyFatTrendPercent)
        ? `${snapshot.bodyFatTrendPercent > 0 ? '+' : ''}${formatNumber(snapshot.bodyFatTrendPercent)}% body-fat trend`
        : null,
    ].filter(Boolean);

    opportunities.push(
      opportunity({
        id: 'body-composition-support',
        goalId: 'body-composition',
        priority: 'high',
        title: 'Support body composition with protein and fiber',
        bodySignal: 'Body trend is moving up, so the best commerce path is satiety and lean-mass support.',
        rationale:
          'Protein products, creatine, and soluble fiber are practical first-line shopping lanes for body composition routines because they support training, fullness, and consistency.',
        metricLabel: metricBits.join(' · '),
        supplementNames: ['Whey Protein', 'Plant Protein', 'Creatine Monohydrate', 'Psyllium Husk'],
        actionLabel: 'Shop body composition',
        caution:
          'Weight and body-fat trends can reflect hydration, cycle phase, device differences, and timing. Use the trend as a shopping cue, not a diagnosis.',
      })
    );
  }

  if (
    (hasValue(snapshot.activeEnergyBurnedKcalAvg) && snapshot.activeEnergyBurnedKcalAvg >= 550) ||
    (hasValue(snapshot.stepsAvg) && snapshot.stepsAvg >= 8500) ||
    (hasValue(snapshot.exerciseMinutesAvg) && snapshot.exerciseMinutesAvg >= 35)
  ) {
    const metricBits = [
      hasValue(snapshot.activeEnergyBurnedKcalAvg)
        ? `${Math.round(snapshot.activeEnergyBurnedKcalAvg)} active kcal/day`
        : null,
      hasValue(snapshot.stepsAvg) ? `${Math.round(snapshot.stepsAvg).toLocaleString()} steps/day` : null,
      hasValue(snapshot.exerciseMinutesAvg)
        ? `${Math.round(snapshot.exerciseMinutesAvg)} exercise min/day`
        : null,
    ].filter(Boolean);

    opportunities.push(
      opportunity({
        id: 'training-output-replenishment',
        goalId: 'training-output',
        priority: 'medium',
        title: 'Match higher output with replenishment',
        bodySignal: 'Activity load is high enough that hydration and recovery products can matter.',
        rationale:
          'Electrolytes, protein, creatine, omega-3s, and pump/endurance support can be organized around training days instead of taken randomly.',
        metricLabel: metricBits.join(' · '),
        supplementNames: ['Electrolytes', 'Whey Protein', 'Creatine Monohydrate', 'Omega-3 Fish Oil'],
        actionLabel: 'Shop recovery products',
        caution:
          'High activity is usually good news. Supplement opportunities should support fueling, hydration, and recovery rather than replacing food or rest.',
      })
    );
  }

  if (
    (hasValue(snapshot.restingHeartRateBpmAvg) && snapshot.restingHeartRateBpmAvg >= 72) ||
    (hasValue(snapshot.heartRateVariabilityMsAvg) && snapshot.heartRateVariabilityMsAvg < 35)
  ) {
    const metricBits = [
      hasValue(snapshot.restingHeartRateBpmAvg)
        ? `${Math.round(snapshot.restingHeartRateBpmAvg)} bpm resting HR`
        : null,
      hasValue(snapshot.heartRateVariabilityMsAvg)
        ? `${Math.round(snapshot.heartRateVariabilityMsAvg)} ms HRV`
        : null,
    ].filter(Boolean);

    opportunities.push(
      opportunity({
        id: 'recovery-vitals-support',
        goalId: 'sleep-recovery',
        priority:
          hasValue(snapshot.restingHeartRateBpmAvg) && snapshot.restingHeartRateBpmAvg >= 78
            ? 'high'
            : 'medium',
        title: 'Support recovery readiness before adding intensity',
        bodySignal:
          'Resting heart rate and HRV suggest the recovery system should stay ahead of performance shopping.',
        rationale:
          'Use recovery vitals as a conservative cue for sleep consistency, hydration, calm support, and omega-3 or magnesium staples rather than stimulants.',
        metricLabel: metricBits.join(' · '),
        supplementNames: ['Magnesium Glycinate', 'L-Theanine', 'Electrolytes', 'Omega-3 Fish Oil'],
        actionLabel: 'Shop recovery support',
        caution:
          'Heart-rate and HRV signals are directional and can be affected by stress, illness, alcohol, medication, and device fit. Use persistent concerns as a reason to speak with a clinician.',
      })
    );
  }

  if (
    hasValue(snapshot.bodyFatPercent) &&
    snapshot.bodyFatPercent >= 20 &&
    hasValue(snapshot.sleepHoursAvg) &&
    snapshot.sleepHoursAvg < 7.25
  ) {
    opportunities.push(
      opportunity({
        id: 'metabolic-sleep-bridge',
        goalId: 'metabolic-health',
        priority: 'medium',
        title: 'Bridge metabolic support with sleep consistency',
        bodySignal: 'Sleep and body-composition signals point to a combined metabolic routine.',
        rationale:
          'A conservative metabolic shelf should emphasize fiber, meal support, and sleep consistency first, with stronger ingredients like berberine treated as clinician-aware options.',
        metricLabel: `${formatNumber(snapshot.bodyFatPercent)}% body fat · ${formatNumber(snapshot.sleepHoursAvg)}h sleep`,
        supplementNames: ['Psyllium Husk', 'Prebiotic Fiber', 'Magnesium Glycinate', 'Berberine'],
        actionLabel: 'Shop metabolic support',
        caution:
          'Berberine can interact with glucose-lowering medications and is not appropriate for everyone. This is an education cue, not medical advice.',
      })
    );
  }

  opportunities.push(
    opportunity({
      id: 'daily-foundation-check',
      goalId: 'daily-foundation',
      priority: opportunities.length ? 'low' : 'medium',
      title: 'Keep the foundation simple',
      bodySignal: 'A baseline routine makes the rest of the stack easier to interpret.',
      rationale:
        'Before adding niche products, anchor the stack around common diet gaps and essentials that are easier to track over time.',
      metricLabel: describeMetricSnapshot(snapshot),
      supplementNames: ['Multivitamin', 'Vitamin D3', 'Magnesium Glycinate', 'Omega-3 Fish Oil'],
      actionLabel: 'Shop daily essentials',
      caution:
        'More products are not automatically better. Add one change at a time and track sleep, energy, mood, and adherence.',
    })
  );

  return opportunities.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
}

export function buildHealthSignalMap(snapshot: HealthMetricSnapshot): HealthSignalMapItem[] {
  const sleepHours = snapshot.sleepHoursAvg;
  const sleepQuality = snapshot.sleepQualityAvg;
  const sleepConsistency = snapshot.sleepConsistencyScore;
  const sleepStages = sleepStageFlags(snapshot);
  const weightTrendKg = snapshot.weightTrendKg;
  const bodyFatTrendPercent = snapshot.bodyFatTrendPercent;
  const activeBurn = snapshot.activeEnergyBurnedKcalAvg;
  const steps = snapshot.stepsAvg;
  const exerciseMinutes = snapshot.exerciseMinutesAvg;
  const restingHeartRate = snapshot.restingHeartRateBpmAvg;
  const hrv = snapshot.heartRateVariabilityMsAvg;
  const vo2Max = snapshot.vo2MaxMlKgMin;
  const bodyFat = snapshot.bodyFatPercent;
  const recoveryVitalsOpportunity =
    (hasValue(restingHeartRate) && restingHeartRate >= 74) ||
    (hasValue(hrv) && hrv < 32);
  const recoveryVitalsWatch =
    recoveryVitalsOpportunity ||
    (hasValue(restingHeartRate) && restingHeartRate >= 68) ||
    (hasValue(hrv) && hrv < 45);

  const sleepNeedsAttention =
    (hasValue(sleepHours) && sleepHours < 6.75) ||
    (hasValue(sleepQuality) && sleepQuality < 3.4) ||
    (hasValue(sleepConsistency) && sleepConsistency < 70) ||
    sleepStages.needsAttention ||
    recoveryVitalsOpportunity;
  const sleepWatch =
    sleepNeedsAttention ||
    (hasValue(sleepHours) && sleepHours < 7.5) ||
    (hasValue(sleepQuality) && sleepQuality < 4) ||
    (hasValue(sleepConsistency) && sleepConsistency < 80) ||
    sleepStages.watch ||
    recoveryVitalsWatch;

  const bodyTrendUp =
    (hasValue(weightTrendKg) && weightTrendKg > 0.25) ||
    (hasValue(bodyFatTrendPercent) && bodyFatTrendPercent > 0.2);
  const bodyWatch =
    bodyTrendUp ||
    (hasValue(weightTrendKg) && Math.abs(weightTrendKg) > 0.1) ||
    (hasValue(bodyFatTrendPercent) && Math.abs(bodyFatTrendPercent) > 0.1);

  const highOutput =
    (hasValue(activeBurn) && activeBurn >= 550) ||
    (hasValue(steps) && steps >= 8500) ||
    (hasValue(exerciseMinutes) && exerciseMinutes >= 35);
  const veryHighOutput =
    (hasValue(activeBurn) && activeBurn >= 750) ||
    (hasValue(steps) && steps >= 11000) ||
    (hasValue(exerciseMinutes) && exerciseMinutes >= 55);
  const metabolicBridge =
    sleepWatch &&
    (bodyTrendUp || (hasValue(bodyFat) && bodyFat >= 20));
  const signalCount = [
    sleepHours,
    sleepQuality,
    sleepConsistency,
    snapshot.sleepRemHoursAvg,
    snapshot.sleepDeepHoursAvg,
    snapshot.sleepAwakeHoursAvg,
    snapshot.weightKg,
    weightTrendKg,
    bodyFat,
    bodyFatTrendPercent,
    activeBurn,
    snapshot.restingEnergyBurnedKcalAvg,
    steps,
    exerciseMinutes,
    restingHeartRate,
    hrv,
    vo2Max,
  ].filter(hasValue).length;

  const signals: HealthSignalMapItem[] = [
    {
      id: 'sleep',
      label: 'Sleep recovery',
      status: sleepNeedsAttention ? 'opportunity' : sleepWatch ? 'watch' : 'strong',
      goalId: 'sleep-recovery',
      valueLabel: compactMetricParts([
        hasValue(sleepHours) ? `${formatNumber(sleepHours)}h avg` : null,
        hasValue(sleepQuality) ? `${formatNumber(sleepQuality)}/5 quality` : null,
        hasValue(sleepConsistency) ? `${formatNumber(sleepConsistency, 0)}% consistency` : null,
        hasValue(snapshot.sleepDeepHoursAvg) ? `${formatNumber(snapshot.sleepDeepHoursAvg)}h deep` : null,
        hasValue(snapshot.sleepRemHoursAvg) ? `${formatNumber(snapshot.sleepRemHoursAvg)}h REM` : null,
        hasValue(restingHeartRate) ? `${Math.round(restingHeartRate)} bpm RHR` : null,
        hasValue(hrv) ? `${Math.round(hrv)} ms HRV` : null,
      ]),
      targetLabel: sleepStages.hasStages
        ? 'Aim for steady timing, lower wake time, enough REM/deep sleep, and calmer recovery vitals'
        : 'Aim for 7.5h+, steady timing, and better next-day energy',
      shelfLabel: 'Night shelf',
      headline: recoveryVitalsOpportunity
        ? 'Recovery vitals move the night stack up'
        : sleepStages.needsAttention
        ? 'Use stages to tune the night stack'
        : sleepNeedsAttention ? 'Prioritize the night stack first' : 'Keep sleep support simple',
      reason:
        'Sleep hours, quality, consistency, REM, deep, awake time, resting HR, and HRV decide whether calm, magnesium, glycine, and theanine move up the commerce shelf.',
      supplementNames: ['Magnesium Glycinate', 'Glycine', 'L-Theanine', 'Apigenin', 'Lemon Balm'],
    },
    {
      id: 'body',
      label: 'Body trend',
      status: bodyTrendUp ? 'opportunity' : bodyWatch ? 'watch' : 'strong',
      goalId: 'body-composition',
      valueLabel: compactMetricParts([
        hasValue(snapshot.weightKg) ? `${Math.round(kgToLbs(snapshot.weightKg))} lb` : null,
        hasValue(weightTrendKg)
          ? `${weightTrendKg >= 0 ? '+' : ''}${formatNumber(kgToLbs(weightTrendKg))} lb trend`
          : null,
        hasValue(bodyFat) ? `${formatNumber(bodyFat)}% body fat` : null,
      ]),
      targetLabel: 'Look for a steadier trend before adding complexity',
      shelfLabel: 'Body shelf',
      headline: bodyTrendUp ? 'Anchor satiety and lean-mass support' : 'Maintain a clear body baseline',
      reason:
        'Weight and body-fat trends route shoppers toward protein, creatine, and fiber rather than broad fat-loss promises.',
      supplementNames: ['Whey Protein', 'Plant Protein', 'Creatine Monohydrate', 'Psyllium Husk'],
    },
    {
      id: 'activity',
      label: 'Activity load',
      status: veryHighOutput ? 'opportunity' : highOutput ? 'watch' : 'strong',
      goalId: 'training-output',
      valueLabel: compactMetricParts([
        hasValue(activeBurn) ? `${Math.round(activeBurn)} active kcal` : null,
        hasValue(steps) ? `${Math.round(steps).toLocaleString()} steps` : null,
        hasValue(exerciseMinutes) ? `${Math.round(exerciseMinutes)} exercise min` : null,
        hasValue(vo2Max) ? `${formatNumber(vo2Max)} VO2 max` : null,
      ]),
      targetLabel: 'Match higher-output days with fuel, hydration, and recovery',
      shelfLabel: 'Training shelf',
      headline: veryHighOutput
        ? 'Replenish around sustained output'
        : highOutput
          ? 'Replenish around high-output days'
          : 'Keep activity support proportional',
      reason:
        'Active calories, exercise minutes, steps, and VO2 max separate daily staples from workout-day hydration, protein, creatine, and recovery products.',
      supplementNames: ['Electrolytes', 'Whey Protein', 'Creatine Monohydrate', 'Omega-3 Fish Oil'],
    },
    {
      id: 'metabolic',
      label: 'Metabolic bridge',
      status: metabolicBridge ? 'opportunity' : sleepWatch || bodyWatch ? 'watch' : 'strong',
      goalId: 'metabolic-health',
      valueLabel: compactMetricParts([
        hasValue(bodyFat) ? `${formatNumber(bodyFat)}% body fat` : null,
        hasValue(sleepHours) ? `${formatNumber(sleepHours)}h sleep` : null,
        hasValue(activeBurn) ? `${Math.round(activeBurn)} active kcal` : null,
      ]),
      targetLabel: 'Use meal support as a cautious experiment, not a diagnosis',
      shelfLabel: 'Metabolic shelf',
      headline: metabolicBridge ? 'Pair meal support with sleep consistency' : 'Watch overlapping signals',
      reason:
        'When sleep and body trend signals overlap, the shelf should emphasize fiber and routine support before stronger clinician-aware ingredients.',
      supplementNames: ['Psyllium Husk', 'Prebiotic Fiber', 'Chromium', 'Berberine'],
    },
    {
      id: 'foundation',
      label: 'Data foundation',
      status: signalCount >= 9 ? 'strong' : signalCount >= 5 ? 'watch' : 'opportunity',
      goalId: 'daily-foundation',
      valueLabel: `${signalCount}/17 signals connected`,
      targetLabel: 'Connect sleep, body, burn, and steps for better ranking',
      shelfLabel: 'Daily shelf',
      headline: signalCount >= 9 ? 'Enough signal to personalize shelves' : 'Connect more signals',
      reason:
        'The more complete the Apple Health snapshot, the more confidently SuppStack can rank a simple baseline before niche products.',
      supplementNames: ['Multivitamin', 'Vitamin D3', 'Magnesium Glycinate', 'Omega-3 Fish Oil'],
    },
  ];

  return signals.sort((a, b) => {
    const rank: Record<HealthSignalStatus, number> = {
      opportunity: 0,
      watch: 1,
      strong: 2,
    };
    const statusDelta = rank[a.status] - rank[b.status];
    if (statusDelta !== 0) return statusDelta;
    return a.label.localeCompare(b.label);
  });
}

export function buildHealthTrackerPlan(snapshot: HealthMetricSnapshot): HealthTrackerPlan {
  const sleepHours = valueOrDefault(snapshot.sleepHoursAvg, 7.25);
  const sleepQuality = valueOrDefault(snapshot.sleepQualityAvg, 3.5);
  const sleepConsistency = valueOrDefault(snapshot.sleepConsistencyScore, 70);
  const sleepStages = sleepStageFlags(snapshot);
  const sleepDebt =
    hasValue(snapshot.sleepDebtHours) && snapshot.sleepDebtHours > 0
      ? snapshot.sleepDebtHours
      : null;
  const sleepStageScore = sleepStages.hasStages
    ? clamp(
        (valueOrDefault(snapshot.sleepDeepHoursAvg, 0) / 1.2) * 42 +
          (valueOrDefault(snapshot.sleepRemHoursAvg, 0) / 1.7) * 38 +
          Math.max(0, 20 - valueOrDefault(snapshot.sleepAwakeHoursAvg, 0) * 18)
      )
    : 75;

  const sleepScore = Math.round(
    clamp(
      (sleepHours / 8) * 42 +
        (sleepQuality / 5) * 20 +
        (sleepConsistency / 100) * 20 +
        sleepStageScore * 0.18
    )
  );

  const activeBurn = snapshot.activeEnergyBurnedKcalAvg;
  const restingBurn = snapshot.restingEnergyBurnedKcalAvg;
  const totalEnergyBurnedKcalAvg =
    hasValue(activeBurn) && hasValue(restingBurn)
      ? Math.round(activeBurn + restingBurn)
      : null;
  const outputScore = Math.round(
    clamp(
      (valueOrDefault(activeBurn, 450) / 700) * 55 +
        (valueOrDefault(snapshot.stepsAvg, 7500) / 10000) * 28 +
        (valueOrDefault(snapshot.exerciseMinutesAvg, 28) / 45) * 17
    )
  );
  const cardioScore = Math.round(
    clamp(
      (valueOrDefault(snapshot.vo2MaxMlKgMin, 38) / 50) * 62 +
        (valueOrDefault(snapshot.exerciseMinutesAvg, 28) / 45) * 38
    )
  );

  const bodyTrendPenalty =
    Math.max(0, valueOrDefault(snapshot.weightTrendKg, 0)) * 10 +
    Math.max(0, valueOrDefault(snapshot.bodyFatTrendPercent, 0)) * 8;
  const bodyScore = Math.round(
    clamp(
      82 -
        bodyTrendPenalty -
        Math.max(0, valueOrDefault(snapshot.bodyFatPercent, 20) - 20) * 1.2,
      35,
      95
    )
  );

  const rhrPenalty = Math.max(0, valueOrDefault(snapshot.restingHeartRateBpmAvg, 62) - 62) * 0.7;
  const hrvBonus = hasValue(snapshot.heartRateVariabilityMsAvg)
    ? clamp((snapshot.heartRateVariabilityMsAvg - 30) * 0.25, -7, 7)
    : 0;
  const recoveryScore = Math.round(
    clamp(
      sleepScore * 0.54 +
        bodyScore * 0.16 +
        outputScore * 0.18 +
        cardioScore * 0.12 -
        (sleepDebt ? 6 : 0) -
        rhrPenalty +
        hrvBonus
    )
  );

  const scores: HealthTrackerScore[] = [
    {
      id: 'sleep',
      label: 'Sleep',
      value: sleepScore,
      status: scoreStatus(sleepScore),
      metricLabel: `${formatNumber(sleepHours)}h avg${
        sleepDebt ? ` · ${formatNumber(sleepDebt)}h debt` : ''
      }${
        sleepStages.hasStages && hasValue(snapshot.sleepDeepHoursAvg)
          ? ` · ${formatNumber(snapshot.sleepDeepHoursAvg)}h deep`
          : ''
      }`,
      goalId: 'sleep-recovery',
    },
    {
      id: 'recovery',
      label: 'Recovery',
      value: recoveryScore,
      status: scoreStatus(recoveryScore),
      metricLabel: compactMetricParts([
        `${sleepConsistency.toFixed(0)}% consistency`,
        hasValue(snapshot.restingHeartRateBpmAvg)
          ? `${Math.round(snapshot.restingHeartRateBpmAvg)} bpm RHR`
          : null,
        hasValue(snapshot.heartRateVariabilityMsAvg)
          ? `${Math.round(snapshot.heartRateVariabilityMsAvg)} ms HRV`
          : null,
      ]),
      goalId: 'sleep-recovery',
    },
    {
      id: 'body',
      label: 'Body',
      value: bodyScore,
      status: scoreStatus(bodyScore),
      metricLabel: hasValue(snapshot.bodyFatPercent)
        ? `${formatNumber(snapshot.bodyFatPercent)}% body fat`
        : 'Trend baseline',
      goalId: 'body-composition',
    },
    {
      id: 'output',
      label: 'Output',
      value: outputScore,
      status: scoreStatus(outputScore),
      metricLabel: hasValue(activeBurn)
        ? `${Math.round(activeBurn)} active kcal/day${
            hasValue(snapshot.exerciseMinutesAvg)
              ? ` · ${Math.round(snapshot.exerciseMinutesAvg)} min`
              : ''
          }`
        : 'Activity baseline',
      goalId: 'training-output',
    },
  ];

  const weakest = [...scores].sort((a, b) => a.value - b.value)[0];
  const topOpportunity = evaluateHealthOpportunities(snapshot)[0];
  const experimentGoalId = topOpportunity?.goalId ?? weakest.goalId;
  const experimentByGoal: Record<HealthGoalId, HealthTrackerPlan['focusExperiment']> = {
    'sleep-recovery': {
      title: 'Run a 14-night recovery experiment',
      rationale:
        'Keep bedtime support simple, track sleep consistency, and compare next-day energy before adding more products.',
      goalId: 'sleep-recovery',
      actionLabel: 'Open sleep shelf',
    },
    'body-composition': {
      title: 'Run a protein and fiber consistency block',
      rationale:
        'Use body trend as a cue for satiety and lean-mass support rather than a quick-fix shopping path.',
      goalId: 'body-composition',
      actionLabel: 'Open body shelf',
    },
    'training-output': {
      title: 'Match output with replenishment',
      rationale:
        'Use active calories and steps to separate daily staples from training-day hydration and recovery products.',
      goalId: 'training-output',
      actionLabel: 'Open training shelf',
    },
    'metabolic-health': {
      title: 'Pair meal support with sleep consistency',
      rationale:
        'Start with fiber and routine timing, then treat stronger metabolic ingredients as clinician-aware options.',
      goalId: 'metabolic-health',
      actionLabel: 'Open metabolic shelf',
    },
    'daily-foundation': {
      title: 'Simplify the baseline stack',
      rationale:
        'Use a low-complexity daily foundation so sleep, energy, and body trends are easier to interpret.',
      goalId: 'daily-foundation',
      actionLabel: 'Open daily shelf',
    },
  };

  return {
    readinessScore: recoveryScore,
    readinessLabel:
      recoveryScore >= 80
        ? 'Ready to optimize'
        : recoveryScore >= 60
          ? 'Good signal, one clear gap'
          : 'Recovery needs attention',
    sleepDebtHours: sleepDebt,
    totalEnergyBurnedKcalAvg,
    scores,
    focusExperiment: experimentByGoal[experimentGoalId],
  };
}

function protocolStatusFromScore(value: number): SleepProtocolStatus {
  if (value >= 80) return 'ready';
  if (value >= 62) return 'watch';
  return 'priority';
}

function stricterProtocolStatus(
  current: SleepProtocolStatus,
  candidate: SleepProtocolStatus
): SleepProtocolStatus {
  const rank: Record<SleepProtocolStatus, number> = { priority: 0, watch: 1, ready: 2 };
  return rank[candidate] < rank[current] ? candidate : current;
}

function sleepProtocolMetricStatus(input: {
  value?: number | null;
  readyAt?: number;
  watchAt?: number;
  inverse?: boolean;
  fallback?: SleepProtocolStatus;
}) {
  if (!hasValue(input.value)) return input.fallback ?? 'watch';

  if (input.inverse) {
    if (input.readyAt !== undefined && input.value <= input.readyAt) return 'ready';
    if (input.watchAt !== undefined && input.value <= input.watchAt) return 'watch';
    return 'priority';
  }

  if (input.readyAt !== undefined && input.value >= input.readyAt) return 'ready';
  if (input.watchAt !== undefined && input.value >= input.watchAt) return 'watch';
  return 'priority';
}

export function buildSleepCommerceProtocol(
  snapshot: HealthMetricSnapshot
): SleepCommerceProtocol {
  const tracker = buildHealthTrackerPlan(snapshot);
  const sleepScore = tracker.scores.find((score) => score.id === 'sleep')?.value ?? 70;
  const stages = sleepStageFlags(snapshot);
  const sleepDebt = hasValue(snapshot.sleepDebtHours) ? snapshot.sleepDebtHours : null;
  const consistency = snapshot.sleepConsistencyScore;
  const recoveryVitalsNeedAttention =
    (hasValue(snapshot.restingHeartRateBpmAvg) && snapshot.restingHeartRateBpmAvg >= 74) ||
    (hasValue(snapshot.heartRateVariabilityMsAvg) && snapshot.heartRateVariabilityMsAvg < 32);
  const recoveryVitalsWatch =
    recoveryVitalsNeedAttention ||
    (hasValue(snapshot.restingHeartRateBpmAvg) && snapshot.restingHeartRateBpmAvg >= 68) ||
    (hasValue(snapshot.heartRateVariabilityMsAvg) && snapshot.heartRateVariabilityMsAvg < 45);
  const sleepStatusFromSignals =
    stages.needsAttention || recoveryVitalsNeedAttention || (sleepDebt !== null && sleepDebt >= 10)
      ? 'priority'
      : stages.watch || recoveryVitalsWatch || (hasValue(consistency) && consistency < 80)
        ? 'watch'
        : 'ready';
  const status = stricterProtocolStatus(
    protocolStatusFromScore(sleepScore),
    sleepStatusFromSignals
  );
  const stageBits = [
    hasValue(snapshot.sleepDeepHoursAvg) ? `${formatNumber(snapshot.sleepDeepHoursAvg)}h deep` : null,
    hasValue(snapshot.sleepRemHoursAvg) ? `${formatNumber(snapshot.sleepRemHoursAvg)}h REM` : null,
    hasValue(snapshot.sleepAwakeHoursAvg) ? `${formatNumber(snapshot.sleepAwakeHoursAvg)}h awake` : null,
  ].filter(Boolean);
  const vitalsBits = [
    hasValue(snapshot.restingHeartRateBpmAvg)
      ? `${Math.round(snapshot.restingHeartRateBpmAvg)} bpm RHR`
      : null,
    hasValue(snapshot.heartRateVariabilityMsAvg)
      ? `${Math.round(snapshot.heartRateVariabilityMsAvg)} ms HRV`
      : null,
  ].filter(Boolean);
  const focusMetricLabel = stages.needsAttention
    ? 'Sleep stages'
    : recoveryVitalsNeedAttention
      ? 'Recovery vitals'
      : sleepDebt !== null && sleepDebt >= 6
      ? 'Sleep debt'
      : hasValue(consistency) && consistency < 80
        ? 'Timing consistency'
        : 'Sleep duration';
  const timingSupplements =
    hasValue(consistency) && consistency < 75 ? ['Melatonin'] : [];
  const awakeSupport = stages.elevatedAwakeTime ? ['Lemon Balm'] : [];
  const deepSupport = stages.lowDeepSleep ? ['Valerian Root'] : [];
  const stageSupport = Array.from(
    new Set([
      'Glycine',
      'Magnesium Glycinate',
      stages.lowRemSleep ? 'Apigenin' : null,
      ...awakeSupport,
      ...deepSupport,
    ].filter((name): name is string => Boolean(name)))
  );

  return {
    status,
    score: sleepScore,
    title:
      status === 'priority'
        ? 'Night protocol needs attention'
        : status === 'watch'
          ? 'Night protocol is tunable'
          : 'Night protocol is stable',
    summary:
      status === 'priority'
        ? 'Treat sleep as the first commerce experiment before adding broader performance products. Start with one night-support slot, measure for 14 nights, then decide whether to keep, swap, or stop.'
        : status === 'watch'
          ? 'The sleep signal is usable but still has a clear tuning lane. Keep the stack small and compare duration, consistency, and stages before adding another product.'
          : 'Sleep is strong enough to keep the night stack simple. Maintain the baseline and route new products toward the next weakest signal.',
    focusMetricLabel,
    experimentTitle:
      status === 'priority'
        ? `14-night ${focusMetricLabel.toLowerCase()} reset`
        : `14-night ${focusMetricLabel.toLowerCase()} tune-up`,
    productGoalId: 'sleep-recovery',
    metrics: [
      {
        id: 'duration',
        label: 'Duration',
        valueLabel: hasValue(snapshot.sleepHoursAvg)
          ? `${formatNumber(snapshot.sleepHoursAvg)}h avg`
          : 'No data',
        targetLabel: '7.5h+ average',
        status: sleepProtocolMetricStatus({
          value: snapshot.sleepHoursAvg,
          readyAt: 7.5,
          watchAt: 6.75,
        }),
      },
      {
        id: 'consistency',
        label: 'Consistency',
        valueLabel: hasValue(consistency) ? `${formatNumber(consistency, 0)}%` : 'No data',
        targetLabel: '80%+ timing consistency',
        status: sleepProtocolMetricStatus({
          value: consistency,
          readyAt: 80,
          watchAt: 68,
        }),
      },
      {
        id: 'stages',
        label: 'Stages',
        valueLabel: stageBits.length ? stageBits.join(' · ') : 'No stage data',
        targetLabel: stages.hasStages
          ? 'Lower wake time, protect REM/deep'
          : 'Connect Apple Health sleep stages',
        status: stages.needsAttention ? 'priority' : stages.watch ? 'watch' : stages.hasStages ? 'ready' : 'watch',
      },
      {
        id: 'debt',
        label: 'Debt',
        valueLabel: sleepDebt !== null ? `${formatNumber(sleepDebt)}h` : 'No debt',
        targetLabel: '<6h rolling sleep debt',
        status: sleepProtocolMetricStatus({
          value: sleepDebt,
          readyAt: 4,
          watchAt: 10,
          inverse: true,
          fallback: 'ready',
        }),
      },
      {
        id: 'vitals',
        label: 'Vitals',
        valueLabel: vitalsBits.length ? vitalsBits.join(' · ') : 'No vitals',
        targetLabel: 'Watch for calmer RHR and steadier HRV',
        status: recoveryVitalsNeedAttention ? 'priority' : recoveryVitalsWatch ? 'watch' : vitalsBits.length ? 'ready' : 'watch',
      },
    ],
    stackSlots: [
      {
        id: 'base',
        label: 'Base',
        supplementNames: ['Magnesium Glycinate', 'Glycine'],
        rationale: 'Use the simplest mineral and amino-acid support lane before stronger sleep aids.',
        testLabel: 'Best first 14-night test',
      },
      {
        id: 'calm',
        label: 'Calm',
        supplementNames: Array.from(new Set(['L-Theanine', 'Apigenin', ...awakeSupport])),
        rationale: 'Calm-support products move up when quality is low or awake time is elevated.',
        testLabel: 'Use when wake time or stress is the bottleneck',
      },
      {
        id: 'stage',
        label: 'Stage',
        supplementNames: stageSupport,
        rationale: 'Stage-aware support is ranked from REM, deep, and awake-time signals.',
        testLabel: 'Use only if stage data is available or sleep quality trails',
      },
      {
        id: 'timing',
        label: 'Timing',
        supplementNames: timingSupplements.length ? timingSupplements : ['L-Theanine'],
        rationale:
          'Timing tools are for schedule alignment. Melatonin stays a timing-specific option, not the default base.',
        testLabel: 'Use when schedule consistency is the issue',
      },
    ],
    measurementPlan: [
      'Hold the rest of the stack steady and test one night-support slot for 14 nights.',
      'Compare sleep duration, timing consistency, REM, deep sleep, awake time, resting HR, HRV, and next-day readiness.',
      'Keep the product only if the next snapshot improves the target metric without new side effects.',
    ],
    safetyNote:
      'Sleep products can cause next-day drowsiness and may interact with medications, alcohol, pregnancy, and medical conditions. Use this as educational planning, not medical advice.',
  };
}

function readoutStatusFromSignals(input: {
  readinessScore: number;
  sleepStatus: SleepProtocolStatus;
  primarySignalStatus: HealthSignalStatus;
}): SleepProtocolStatus {
  if (
    input.readinessScore < 62 ||
    input.sleepStatus === 'priority' ||
    input.primarySignalStatus === 'opportunity'
  ) {
    return 'priority';
  }

  if (
    input.readinessScore < 78 ||
    input.sleepStatus === 'watch' ||
    input.primarySignalStatus === 'watch'
  ) {
    return 'watch';
  }

  return 'ready';
}

function readoutStatusLabel(status: SleepProtocolStatus) {
  if (status === 'ready') return 'Green';
  if (status === 'watch') return 'Yellow';
  return 'Red';
}

function readoutTitleForGoal(goalId: HealthGoalId, status: SleepProtocolStatus) {
  if (status === 'ready') return 'Keep the stack simple today';

  const titles: Record<HealthGoalId, string> = {
    'sleep-recovery': 'Make tonight the recovery experiment',
    'body-composition': 'Stabilize the body trend before adding complexity',
    'training-output': 'Replenish before chasing output',
    'metabolic-health': 'Pair meal support with sleep consistency',
    'daily-foundation': 'Tighten the daily baseline first',
  };

  return titles[goalId];
}

function readoutCommerceLabel(goalId: HealthGoalId) {
  const labels: Record<HealthGoalId, string> = {
    'sleep-recovery': 'Open night shelf',
    'body-composition': 'Open body shelf',
    'training-output': 'Open training shelf',
    'metabolic-health': 'Open metabolic shelf',
    'daily-foundation': 'Open daily shelf',
  };

  return labels[goalId];
}

export function buildDailyHealthReadout(snapshot: HealthMetricSnapshot): HealthDailyReadout {
  const tracker = buildHealthTrackerPlan(snapshot);
  const sleepProtocol = buildSleepCommerceProtocol(snapshot);
  const signals = buildHealthSignalMap(snapshot);
  const signalReadiness = buildHealthSignalReadiness(snapshot);
  const opportunities = evaluateHealthOpportunities(snapshot);
  const primarySignal = signals[0];
  const topOpportunity = opportunities[0];
  const sleepIsPriority = sleepProtocol.status === 'priority' || sleepProtocol.status === 'watch';
  const focusGoalId = sleepIsPriority
    ? sleepProtocol.productGoalId
    : topOpportunity?.goalId ?? primarySignal?.goalId ?? tracker.focusExperiment.goalId;
  const status = readoutStatusFromSignals({
    readinessScore: tracker.readinessScore,
    sleepStatus: sleepProtocol.status,
    primarySignalStatus: primarySignal?.status ?? 'watch',
  });
  const focusSignal =
    signals.find((signal) => signal.goalId === focusGoalId) ?? primarySignal ?? signals[0];
  const needsMoreData = signalReadiness.coveragePercent < 60;
  const primaryMetricLabel =
    focusGoalId === sleepProtocol.productGoalId
      ? sleepProtocol.focusMetricLabel
      : topOpportunity?.metricLabel || focusSignal?.valueLabel || describeMetricSnapshot(snapshot);
  const statusLabel = readoutStatusLabel(status);
  const focusShelfLabel = focusSignal?.shelfLabel ?? 'Daily shelf';
  const experimentTitle =
    focusGoalId === sleepProtocol.productGoalId
      ? sleepProtocol.experimentTitle
      : tracker.focusExperiment.title;
  const title = needsMoreData
    ? 'Connect the missing health signals'
    : readoutTitleForGoal(focusGoalId, status);
  const summary = needsMoreData
    ? `${tracker.readinessScore} readiness with ${signalReadiness.connectedCount}/${signalReadiness.totalCount} core signals connected. ${signalReadiness.summary}`
    : `${tracker.readinessScore} readiness, ${tracker.readinessLabel.toLowerCase()}. ${focusSignal?.headline ?? tracker.focusExperiment.rationale}`;

  return {
    status,
    statusLabel,
    title,
    summary,
    readinessScore: tracker.readinessScore,
    readinessLabel: tracker.readinessLabel,
    focusGoalId,
    focusShelfLabel,
    primaryMetricLabel,
    commerceActionLabel: readoutCommerceLabel(focusGoalId),
    commerceHref: `/products?goal=${focusGoalId}`,
    experimentTitle,
    signals: signals.slice(0, 4).map((signal) => ({
      id: signal.id,
      label: signal.label,
      status: signal.status,
      valueLabel: signal.valueLabel,
      shelfLabel: signal.shelfLabel,
    })),
    morningActions: [
      needsMoreData
        ? `Sync Apple Health after wake-up and prioritize ${signalReadiness.missingPriority
            .slice(0, 3)
            .map((metric) => metric.label.toLowerCase())
            .join(', ') || 'the missing signals'}.`
        : `Review ${focusShelfLabel.toLowerCase()} before adding anything new.`,
      `Run one 14-day experiment: ${experimentTitle}.`,
      'Log the stack change so the next snapshot can compare sleep, readiness, body trend, and output together.',
    ],
    tonightProtocol:
      focusGoalId === sleepProtocol.productGoalId
        ? [
            `Focus on ${sleepProtocol.focusMetricLabel.toLowerCase()} and keep the rest of the stack steady.`,
            sleepProtocol.stackSlots[0]
              ? `Test one ${sleepProtocol.stackSlots[0].label.toLowerCase()} slot: ${sleepProtocol.stackSlots[0].supplementNames.slice(0, 2).join(' + ')}.`
              : 'Use one night-support slot only.',
            'Compare duration, REM, deep sleep, awake time, resting HR, HRV, and next-day readiness tomorrow.',
          ]
        : [
            'Keep the night routine steady so non-sleep product experiments have a clean baseline.',
            `Use ${focusShelfLabel.toLowerCase()} as the commerce lane, not a full-stack overhaul.`,
            'Re-check sleep and readiness before increasing intensity or adding another product.',
          ],
    guardrails: [
      'Add one product or routine change at a time.',
      'Treat clinician-aware ingredients and persistent symptoms as a conversation with a professional.',
    ],
  };
}

export function buildHealthTrendSummary(
  snapshots: HealthMetricSnapshot[]
): HealthTrendSummary | null {
  if (snapshots.length < 2) return null;

  const ordered = [...snapshots].sort((a, b) => {
    const aTime = a.lastSyncedAt ? new Date(a.lastSyncedAt).getTime() : 0;
    const bTime = b.lastSyncedAt ? new Date(b.lastSyncedAt).getTime() : 0;
    return aTime - bTime;
  });
  const oldest = ordered[0];
  const newest = ordered[ordered.length - 1];

  const oldestTracker = buildHealthTrackerPlan(oldest);
  const newestTracker = buildHealthTrackerPlan(newest);
  const readinessDelta = newestTracker.readinessScore - oldestTracker.readinessScore;
  const sleepDeltaHours =
    hasValue(newest.sleepHoursAvg) && hasValue(oldest.sleepHoursAvg)
      ? newest.sleepHoursAvg - oldest.sleepHoursAvg
      : null;
  const weightDeltaKg =
    hasValue(newest.weightKg) && hasValue(oldest.weightKg)
      ? newest.weightKg - oldest.weightKg
      : null;
  const bodyFatDeltaPercent =
    hasValue(newest.bodyFatPercent) && hasValue(oldest.bodyFatPercent)
      ? newest.bodyFatPercent - oldest.bodyFatPercent
      : null;
  const activeEnergyDeltaKcal =
    hasValue(newest.activeEnergyBurnedKcalAvg) && hasValue(oldest.activeEnergyBurnedKcalAvg)
      ? newest.activeEnergyBurnedKcalAvg - oldest.activeEnergyBurnedKcalAvg
      : null;

  const trendParts = [
    `${signedNumber(readinessDelta, 0)} readiness`,
    sleepDeltaHours !== null ? `${signedNumber(sleepDeltaHours)}h sleep` : null,
    weightDeltaKg !== null ? `${signedNumber(kgToLbs(weightDeltaKg))} lb` : null,
    bodyFatDeltaPercent !== null ? `${signedNumber(bodyFatDeltaPercent)}% body fat` : null,
    activeEnergyDeltaKcal !== null
      ? `${signedNumber(activeEnergyDeltaKcal, 0)} active kcal`
      : null,
  ].filter(Boolean);

  return {
    snapshotCount: snapshots.length,
    readinessDelta,
    sleepDeltaHours,
    weightDeltaKg,
    bodyFatDeltaPercent,
    activeEnergyDeltaKcal,
    label: trendParts.join(' · '),
  };
}

function progressMetricStatus(
  value: number | null,
  positiveThreshold: number,
  watchThreshold: number,
  higherIsBetter = true
): HealthProgressMetricStatus {
  if (value === null) return 'neutral';
  const adjusted = higherIsBetter ? value : -value;
  if (adjusted >= positiveThreshold) return 'positive';
  if (adjusted <= -watchThreshold) return 'watch';
  return 'neutral';
}

function progressDeltaLabel(value: number | null, suffix = '', digits = 1) {
  if (value === null) return 'No baseline';
  return `${signedNumber(value, digits)}${suffix}`;
}

export function buildHealthProgressLoop(
  snapshots: HealthMetricSnapshot[]
): HealthProgressLoop {
  const trend = buildHealthTrendSummary(snapshots);

  if (!trend) {
    return {
      status: 'need_baseline',
      statusLabel: 'Need baseline',
      title: 'Save one more snapshot',
      summary:
        'SuppStack needs at least two saved health snapshots before it can judge whether a product or routine experiment is helping.',
      snapshotCount: snapshots.length,
      trend: null,
      metrics: [
        {
          id: 'readiness',
          label: 'Readiness',
          deltaLabel: 'No baseline',
          interpretation: 'Save today, then compare after the next Apple Health or manual snapshot.',
          status: 'neutral',
        },
        {
          id: 'sleep',
          label: 'Sleep',
          deltaLabel: 'No baseline',
          interpretation: 'Use duration, quality, REM, deep sleep, awake time, HRV, and resting HR together.',
          status: 'neutral',
        },
      ],
      decision: 'Hold off on adding more products until there is a second measurement point.',
      nextActions: [
        'Save another health snapshot after tonight or tomorrow morning.',
        'Keep the current routine steady so the comparison is clean.',
        'Start one product experiment only after the baseline is captured.',
      ],
    };
  }

  const readinessStatus = progressMetricStatus(trend.readinessDelta, 3, 5);
  const sleepStatus = progressMetricStatus(trend.sleepDeltaHours, 0.25, 0.35);
  const bodyFatStatus = progressMetricStatus(trend.bodyFatDeltaPercent, 0.2, 0.4, false);
  const energyStatus = progressMetricStatus(trend.activeEnergyDeltaKcal, 75, 150);
  const weightStatus: HealthProgressMetricStatus =
    trend.weightDeltaKg !== null && Math.abs(kgToLbs(trend.weightDeltaKg)) >= 2 ? 'watch' : 'neutral';

  const metrics: HealthProgressMetric[] = [
    {
      id: 'readiness',
      label: 'Readiness',
      deltaLabel: progressDeltaLabel(trend.readinessDelta, '', 0),
      interpretation:
        readinessStatus === 'positive'
          ? 'Recovery and performance capacity are moving in the right direction.'
          : readinessStatus === 'watch'
            ? 'Recovery capacity is down enough to pause before adding more variables.'
            : 'Readiness is mostly stable; keep collecting signal before changing the stack.',
      status: readinessStatus,
    },
    {
      id: 'sleep',
      label: 'Sleep',
      deltaLabel: progressDeltaLabel(trend.sleepDeltaHours, 'h'),
      interpretation:
        sleepStatus === 'positive'
          ? 'Sleep duration is improving, which makes the current night protocol worth holding steady.'
          : sleepStatus === 'watch'
            ? 'Sleep duration moved down; review timing, stimulants, late meals, and evening products.'
            : 'Sleep duration is steady; look at stages and wake time before changing products.',
      status: sleepStatus,
    },
    {
      id: 'weight',
      label: 'Weight',
      deltaLabel:
        trend.weightDeltaKg !== null ? `${signedNumber(kgToLbs(trend.weightDeltaKg))} lb` : 'No baseline',
      interpretation:
        weightStatus === 'watch'
          ? 'Weight moved enough to interpret alongside body fat, calories burned, and training load.'
          : 'Weight is not the main decision signal without body composition context.',
      status: weightStatus,
    },
    {
      id: 'bodyFat',
      label: 'Body fat',
      deltaLabel: progressDeltaLabel(trend.bodyFatDeltaPercent, '%'),
      interpretation:
        bodyFatStatus === 'positive'
          ? 'Body composition is trending favorably; keep nutrition and training variables consistent.'
          : bodyFatStatus === 'watch'
            ? 'Body fat moved up; avoid blaming one supplement and review energy balance first.'
            : 'Body composition is stable or missing; treat it as supporting context.',
      status: bodyFatStatus,
    },
    {
      id: 'activeEnergy',
      label: 'Active kcal',
      deltaLabel: progressDeltaLabel(trend.activeEnergyDeltaKcal, '', 0),
      interpretation:
        energyStatus === 'positive'
          ? 'Output is higher, so performance-support experiments have a clearer read.'
          : energyStatus === 'watch'
            ? 'Output is down; compare training load and recovery before changing the stack.'
            : 'Activity output is stable; keep watching readiness and sleep quality.',
      status: energyStatus,
    },
  ];

  const watchCount = metrics.filter((metric) => metric.status === 'watch').length;
  const positiveCount = metrics.filter((metric) => metric.status === 'positive').length;
  const status: HealthProgressDecisionStatus =
    watchCount >= 2 || readinessStatus === 'watch' || sleepStatus === 'watch'
      ? 'adjust'
      : positiveCount >= 1
        ? 'keep'
        : 'hold';

  if (status === 'adjust') {
    return {
      status,
      statusLabel: 'Adjust',
      title: 'Pause new additions',
      summary: `Recent health movement needs a cleaner read before expanding the stack: ${trend.label}.`,
      snapshotCount: trend.snapshotCount,
      trend,
      metrics,
      decision:
        'Keep the experiment small, check timing and dose assumptions, and avoid adding another product until the next snapshot stabilizes.',
      nextActions: [
        'Hold new supplement additions for the next snapshot.',
        'Review sleep timing, stimulant timing, and training load.',
        'Use the matched shelf only after the watch signals settle.',
      ],
    };
  }

  if (status === 'keep') {
    return {
      status,
      statusLabel: 'Keep',
      title: 'Keep the experiment steady',
      summary: `The current direction is promising enough to keep measuring without adding noise: ${trend.label}.`,
      snapshotCount: trend.snapshotCount,
      trend,
      metrics,
      decision:
        'Continue the current product or routine experiment through its target window before adding another variable.',
      nextActions: [
        'Keep product timing and dose steady until the experiment ends.',
        'Complete the active experiment with the current snapshot when its target days are done.',
        'Use matched products as the next shelf, not a same-day add-on.',
      ],
    };
  }

  return {
    status,
    statusLabel: 'Hold',
    title: 'Keep collecting signal',
    summary: `Health signals are mostly steady, so the best move is a cleaner baseline: ${trend.label}.`,
    snapshotCount: trend.snapshotCount,
    trend,
    metrics,
    decision:
      'Hold the current routine and collect another snapshot before deciding whether to buy, swap, or stop.',
    nextActions: [
      'Save the next Apple Health or manual snapshot before changing the stack.',
      'Keep one experiment active at a time.',
      'Prioritize the shelf tied to the weakest signal if the next snapshot confirms it.',
    ],
  };
}

export function buildLocalHealthCoachPlan(snapshot: HealthMetricSnapshot): HealthCoachPlan {
  const opportunities = evaluateHealthOpportunities(snapshot);
  const top = opportunities[0];
  const sleepProtocol = buildSleepCommerceProtocol(snapshot);
  const signalReadiness = buildHealthSignalReadiness(snapshot);

  return {
    headline: top ? top.title : 'Connect health data to unlock a smarter stack',
    summary: top
      ? `${top.bodySignal} ${top.rationale}`
      : 'SuppStack can combine Apple Health trends with your supplement stack to rank the most practical next experiments.',
    confidenceLabel: signalReadiness.confidenceLabel,
    opportunities,
    nextBestActions: [
      sleepProtocol.status !== 'ready' ? sleepProtocol.experimentTitle : top ? top.actionLabel : 'Connect Apple Health',
      'Track one supplement change for 14 days',
      'Review sleep, energy, and body trend together before adding another product',
    ],
    disclaimer:
      'SuppStack ranks wellness experiments for education and commerce discovery. It does not diagnose, treat, or replace medical advice.',
  };
}

export function buildLocalAiCoachResponse(
  snapshot: HealthMetricSnapshot,
  history: HealthMetricSnapshot[] = []
): AiHealthCoachResponse {
  const plan = buildLocalHealthCoachPlan(snapshot);
  const readout = buildDailyHealthReadout(snapshot);
  const trend = buildHealthTrendSummary(history);
  const progressLoop = buildHealthProgressLoop(history.length ? history : [snapshot]);
  const summary = `${readout.title}: ${readout.summary}${
    /[.!?]$/.test(readout.summary) ? '' : '.'
  }`;
  const readoutActions = readout.morningActions.slice(0, 2);
  const nextBestActions = [
    ...readoutActions,
    ...plan.nextBestActions.filter(
      (action) => !readoutActions.some((readoutAction) => readoutAction.includes(action))
    ),
  ];

  return {
    source: 'local',
    headline: plan.headline,
    summary: trend ? `${summary} ${progressLoop.decision}` : summary,
    nextBestActions: Array.from(new Set([...progressLoop.nextActions.slice(0, 2), ...nextBestActions])).slice(0, 4),
    safetyNote: plan.disclaimer,
  };
}
