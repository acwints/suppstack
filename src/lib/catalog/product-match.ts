import type { ProductDirectoryProduct } from './product-directory';
import type { HealthGoalId } from './health-goal-directory';
import {
  DEMO_HEALTH_SNAPSHOT,
  evaluateHealthOpportunities,
  type HealthMetricSnapshot,
  type HealthOpportunityPriority,
} from '@/lib/health/health-intelligence';

export type SignalMatchScenarioId =
  | 'holistic'
  | 'sleep-debt'
  | 'body-trend'
  | 'high-output'
  | 'foundation';

export interface SignalMatchScenario {
  id: SignalMatchScenarioId;
  label: string;
  snapshot: HealthMetricSnapshot;
}

export interface ProductSignalMatch {
  productId: string;
  score: number;
  primaryGoalId: HealthGoalId | null;
  reasons: string[];
}

export const SIGNAL_MATCH_SCENARIOS: SignalMatchScenario[] = [
  {
    id: 'holistic',
    label: 'Holistic',
    snapshot: DEMO_HEALTH_SNAPSHOT,
  },
  {
    id: 'sleep-debt',
    label: 'Sleep debt',
    snapshot: {
      source: 'demo',
      dateRangeDays: 14,
      sleepHoursAvg: 5.9,
      sleepQualityAvg: 2.8,
      sleepDaysTracked: 13,
      sleepDebtHours: 20.8,
      sleepConsistencyScore: 54,
      sleepRemHoursAvg: 0.9,
      sleepDeepHoursAvg: 0.55,
      sleepAwakeHoursAvg: 0.82,
      weightKg: 82.5,
      bodyFatPercent: 20.2,
      activeEnergyBurnedKcalAvg: 420,
      restingEnergyBurnedKcalAvg: 1760,
      stepsAvg: 6800,
      exerciseMinutesAvg: 18,
      restingHeartRateBpmAvg: 76,
      heartRateVariabilityMsAvg: 28,
      vo2MaxMlKgMin: 36,
    },
  },
  {
    id: 'body-trend',
    label: 'Body trend',
    snapshot: {
      source: 'demo',
      dateRangeDays: 14,
      sleepHoursAvg: 7.1,
      sleepQualityAvg: 3.7,
      sleepDaysTracked: 14,
      sleepDebtHours: 5.6,
      sleepConsistencyScore: 74,
      weightKg: 88.1,
      weightTrendKg: 1.1,
      bodyFatPercent: 25.4,
      bodyFatTrendPercent: 0.7,
      activeEnergyBurnedKcalAvg: 460,
      restingEnergyBurnedKcalAvg: 1840,
      stepsAvg: 7200,
      exerciseMinutesAvg: 24,
      restingHeartRateBpmAvg: 68,
      heartRateVariabilityMsAvg: 38,
      vo2MaxMlKgMin: 35,
    },
  },
  {
    id: 'high-output',
    label: 'High output',
    snapshot: {
      source: 'demo',
      dateRangeDays: 14,
      sleepHoursAvg: 7.0,
      sleepQualityAvg: 3.8,
      sleepDaysTracked: 14,
      sleepDebtHours: 7,
      sleepConsistencyScore: 72,
      weightKg: 80.3,
      bodyFatPercent: 17.8,
      activeEnergyBurnedKcalAvg: 890,
      restingEnergyBurnedKcalAvg: 1810,
      stepsAvg: 13200,
      exerciseMinutesAvg: 72,
      restingHeartRateBpmAvg: 58,
      heartRateVariabilityMsAvg: 62,
      vo2MaxMlKgMin: 48,
    },
  },
  {
    id: 'foundation',
    label: 'Foundation',
    snapshot: {
      source: 'demo',
      dateRangeDays: 14,
      sleepHoursAvg: null,
      sleepQualityAvg: null,
      sleepDaysTracked: null,
      sleepDebtHours: null,
      sleepConsistencyScore: null,
      weightKg: null,
      bodyFatPercent: null,
      activeEnergyBurnedKcalAvg: null,
      restingEnergyBurnedKcalAvg: null,
      stepsAvg: null,
      exerciseMinutesAvg: null,
      restingHeartRateBpmAvg: null,
      heartRateVariabilityMsAvg: null,
      vo2MaxMlKgMin: null,
    },
  },
];

function priorityScore(priority: HealthOpportunityPriority) {
  if (priority === 'high') return 52;
  if (priority === 'medium') return 38;
  return 24;
}

function uniqueReasons(reasons: string[]) {
  return Array.from(new Set(reasons)).slice(0, 3);
}

export function buildProductSignalMatches(
  products: ProductDirectoryProduct[],
  snapshot: HealthMetricSnapshot
) {
  const opportunities = evaluateHealthOpportunities(snapshot);

  return new Map(
    products.map((product) => {
      let score = 0;
      let primaryGoalId: HealthGoalId | null = null;
      const reasons: string[] = [];

      for (const opportunity of opportunities) {
        const goalMatch = product.health_goal_ids.includes(opportunity.goalId);
        const supplementMatch = opportunity.supplementNames.some(
          (name) => name.toLowerCase() === product.directory_supplement_name.toLowerCase()
        );

        if (!goalMatch && !supplementMatch) continue;

        const opportunityScore = priorityScore(opportunity.priority);
        score += goalMatch ? opportunityScore : Math.round(opportunityScore * 0.5);
        if (supplementMatch) score += 28;
        primaryGoalId ??= opportunity.goalId;

        if (supplementMatch) reasons.push(product.directory_supplement_name);
        reasons.push(opportunity.title);
      }

      if (product.ucp_enabled) {
        score += 6;
        reasons.push('Direct checkout');
      }

      if (product.subscriptions_available) {
        score += 4;
        reasons.push('Subscription-ready');
      }

      const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));

      return [
        String(product.product_id),
        {
          productId: String(product.product_id),
          score: normalizedScore,
          primaryGoalId,
          reasons: uniqueReasons(reasons),
        },
      ] as const;
    })
  );
}

export function getSignalMatchScenario(id: string | null | undefined) {
  return SIGNAL_MATCH_SCENARIOS.find((scenario) => scenario.id === id) ?? SIGNAL_MATCH_SCENARIOS[0];
}
