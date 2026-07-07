import type { HealthGoalId } from '@/lib/catalog/health-goal-directory';
import type { ProductDirectoryProduct } from '@/lib/catalog/product-directory';
import { buildProductDirectory } from '@/lib/catalog/product-directory';
import { buildProductSignalMatches, type ProductSignalMatch } from '@/lib/catalog/product-match';
import { buildShopifyCartGroups, type ShopifyCartGroup } from '@/lib/commerce/shopify-ucp';
import {
  buildDailyHealthReadout,
  buildHealthTrackerPlan,
  evaluateHealthOpportunities,
  type HealthMetricSnapshot,
  type HealthOpportunity,
} from '@/lib/health/health-intelligence';

export type HealthStackSlotId = 'night' | 'body' | 'training' | 'meals' | 'daily';

export interface HealthProductMatchItem {
  product: ProductDirectoryProduct;
  match: ProductSignalMatch;
}

export interface HealthStackPlanItem extends HealthProductMatchItem {
  slotId: HealthStackSlotId;
  slotLabel: string;
  goalId: HealthGoalId;
  rationale: string;
  shelfHref: string;
}

export interface HealthRoutineSlot {
  id: HealthStackSlotId;
  label: string;
  timingLabel: string;
  goalId: HealthGoalId;
  headline: string;
  rationale: string;
  measurementLabel: string;
  shelfHref: string;
  productNames: string[];
  items: HealthStackPlanItem[];
  isPrimary: boolean;
}

export interface HealthCommerceExperiment {
  title: string;
  actionLabel: string;
  goalId: HealthGoalId;
  targetDays: number;
  productIds: string[];
  supplementNames: string[];
  notes: string;
}

export interface HealthImpactForecast {
  productId: string;
  productName: string;
  supplementName: string;
  slotLabel: string;
  goalId: HealthGoalId;
  headline: string;
  baselineLabel: string;
  targetLabel: string;
  measurementWindow: string;
  watchMetrics: string[];
  keepSignal: string;
  swapSignal: string;
  stopSignal: string;
  caution: string;
}

export interface HealthCommercePlan {
  headline: string;
  summary: string;
  items: HealthStackPlanItem[];
  routineSlots: HealthRoutineSlot[];
  primaryExperiment: HealthCommerceExperiment | null;
  impactForecasts: HealthImpactForecast[];
  topMatches: HealthProductMatchItem[];
  totalOneTimeCost: number;
  estimatedMonthlyCost: number;
  directCheckoutCount: number;
  cartGroups: ShopifyCartGroup[];
  safetyNote: string;
}

const GOAL_SLOT: Record<
  HealthGoalId,
  { slotId: HealthStackSlotId; slotLabel: string; rationale: string }
> = {
  'sleep-recovery': {
    slotId: 'night',
    slotLabel: 'Night',
    rationale: 'Start with one nighttime support product and compare sleep consistency.',
  },
  'body-composition': {
    slotId: 'body',
    slotLabel: 'Body',
    rationale: 'Use a satiety or lean-mass staple before adding more aggressive products.',
  },
  'training-output': {
    slotId: 'training',
    slotLabel: 'Training',
    rationale: 'Match high-output days with hydration, protein, or recovery support.',
  },
  'metabolic-health': {
    slotId: 'meals',
    slotLabel: 'Meals',
    rationale: 'Keep metabolic support conservative and meal-routine aware.',
  },
  'daily-foundation': {
    slotId: 'daily',
    slotLabel: 'Daily',
    rationale: 'Keep the baseline simple so trend changes are easier to interpret.',
  },
};

const ROUTINE_SLOT_COPY: Record<
  HealthStackSlotId,
  {
    timingLabel: string;
    headline: string;
    measurementLabel: string;
    order: number;
  }
> = {
  night: {
    timingLabel: '30-60 min before bed',
    headline: 'Night recovery slot',
    measurementLabel: 'Sleep duration, REM/deep sleep, awake time, RHR, HRV, next-day readiness',
    order: 0,
  },
  daily: {
    timingLabel: 'Morning baseline',
    headline: 'Daily foundation slot',
    measurementLabel: 'Adherence, energy, digestion, readiness, and any side effects',
    order: 1,
  },
  body: {
    timingLabel: 'Meal or post-training',
    headline: 'Body trend slot',
    measurementLabel: 'Weight trend, body-fat trend, hunger, training consistency, recovery',
    order: 2,
  },
  training: {
    timingLabel: 'Training window',
    headline: 'Output support slot',
    measurementLabel: 'Active calories, exercise minutes, steps, soreness, next-day readiness',
    order: 3,
  },
  meals: {
    timingLabel: 'With meals',
    headline: 'Meal support slot',
    measurementLabel: 'Meal consistency, digestion, sleep consistency, body trend, energy',
    order: 4,
  },
};

function monthlyCost(product: ProductDirectoryProduct) {
  if (product.servings_per_container <= 0 || product.servings_per_day <= 0) return product.product_price;

  return (product.product_price / product.servings_per_container) * product.servings_per_day * 30.437;
}

function hasValue(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function formatNumber(value: number, digits = 1) {
  return value.toLocaleString('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function kgToLbs(kg: number) {
  return kg * 2.2046226218;
}

function baselineParts(parts: Array<string | null>) {
  return parts.filter(Boolean).join(' · ') || 'Baseline needs one more synced snapshot';
}

function buildImpactForecast(item: HealthStackPlanItem, snapshot: HealthMetricSnapshot): HealthImpactForecast {
  const base = {
    productId: item.product.product_id,
    productName: item.product.product_name,
    supplementName: item.product.directory_supplement_name,
    slotLabel: item.slotLabel,
    goalId: item.goalId,
  };

  if (item.goalId === 'sleep-recovery') {
    return {
      ...base,
      headline: 'Prove the night slot with sleep and recovery signals',
      baselineLabel: baselineParts([
        hasValue(snapshot.sleepHoursAvg) ? `${formatNumber(snapshot.sleepHoursAvg)}h sleep` : null,
        hasValue(snapshot.sleepConsistencyScore)
          ? `${formatNumber(snapshot.sleepConsistencyScore, 0)}% consistency`
          : null,
        hasValue(snapshot.sleepDeepHoursAvg) ? `${formatNumber(snapshot.sleepDeepHoursAvg)}h deep` : null,
        hasValue(snapshot.sleepRemHoursAvg) ? `${formatNumber(snapshot.sleepRemHoursAvg)}h REM` : null,
        hasValue(snapshot.sleepAwakeHoursAvg) ? `${formatNumber(snapshot.sleepAwakeHoursAvg)}h awake` : null,
        hasValue(snapshot.restingHeartRateBpmAvg)
          ? `${Math.round(snapshot.restingHeartRateBpmAvg)} bpm RHR`
          : null,
      ]),
      targetLabel: 'Cleaner duration, consistency, stages, wake time, RHR, HRV, and next-day readiness.',
      measurementWindow: '14 nights',
      watchMetrics: ['Sleep duration', 'Consistency', 'REM/deep sleep', 'Awake time', 'RHR/HRV'],
      keepSignal: 'Keep if the target sleep metric or readiness improves without next-day drag.',
      swapSignal: 'Swap if sleep is flat after 14 nights and adherence was consistent.',
      stopSignal: 'Stop if sleep worsens, morning grogginess appears, or side effects show up.',
      caution:
        'Sleep-stage estimates are directional. Be conservative with sedating products, alcohol, medications, pregnancy, and medical conditions.',
    };
  }

  if (item.goalId === 'body-composition') {
    return {
      ...base,
      headline: 'Judge the body slot by trend quality, not a single weigh-in',
      baselineLabel: baselineParts([
        hasValue(snapshot.weightKg) ? `${Math.round(kgToLbs(snapshot.weightKg))} lb` : null,
        hasValue(snapshot.weightTrendKg)
          ? `${snapshot.weightTrendKg >= 0 ? '+' : ''}${formatNumber(kgToLbs(snapshot.weightTrendKg))} lb trend`
          : null,
        hasValue(snapshot.bodyFatPercent) ? `${formatNumber(snapshot.bodyFatPercent)}% body fat` : null,
        hasValue(snapshot.bodyFatTrendPercent)
          ? `${snapshot.bodyFatTrendPercent >= 0 ? '+' : ''}${formatNumber(snapshot.bodyFatTrendPercent)}% body-fat trend`
          : null,
      ]),
      targetLabel: 'Better adherence, steadier hunger, training consistency, and a calmer body trend.',
      measurementWindow: '14-28 days',
      watchMetrics: ['Weight trend', 'Body-fat trend', 'Hunger', 'Training consistency', 'Recovery'],
      keepSignal: 'Keep if adherence improves and the body trend stabilizes without crowding out food quality.',
      swapSignal: 'Swap if the product is hard to use or the trend stays noisy despite adherence.',
      stopSignal: 'Stop if digestion, appetite, sleep, or training quality gets worse.',
      caution:
        'Weight and body-fat tools are noisy. Hydration, cycle phase, travel, and device differences can mask real changes.',
    };
  }

  if (item.goalId === 'training-output') {
    return {
      ...base,
      headline: 'Test the output slot on training days',
      baselineLabel: baselineParts([
        hasValue(snapshot.activeEnergyBurnedKcalAvg)
          ? `${Math.round(snapshot.activeEnergyBurnedKcalAvg)} active kcal`
          : null,
        hasValue(snapshot.exerciseMinutesAvg)
          ? `${Math.round(snapshot.exerciseMinutesAvg)} exercise min`
          : null,
        hasValue(snapshot.stepsAvg) ? `${Math.round(snapshot.stepsAvg).toLocaleString()} steps` : null,
        hasValue(snapshot.vo2MaxMlKgMin) ? `${formatNumber(snapshot.vo2MaxMlKgMin)} VO2 max` : null,
      ]),
      targetLabel: 'Similar or higher output with better next-day recovery and less soreness.',
      measurementWindow: '6-10 training sessions',
      watchMetrics: ['Active calories', 'Exercise minutes', 'Steps', 'Soreness', 'Next-day readiness'],
      keepSignal: 'Keep if output is easier to repeat and recovery does not dip.',
      swapSignal: 'Swap if it adds cost or friction without changing training quality.',
      stopSignal: 'Stop if it raises jitters, sleep disruption, GI issues, or recovery strain.',
      caution:
        'Performance products should support training, hydration, and food intake, not substitute for them.',
    };
  }

  if (item.goalId === 'metabolic-health') {
    return {
      ...base,
      headline: 'Keep meal support tied to sleep and body context',
      baselineLabel: baselineParts([
        hasValue(snapshot.bodyFatPercent) ? `${formatNumber(snapshot.bodyFatPercent)}% body fat` : null,
        hasValue(snapshot.sleepHoursAvg) ? `${formatNumber(snapshot.sleepHoursAvg)}h sleep` : null,
        hasValue(snapshot.activeEnergyBurnedKcalAvg)
          ? `${Math.round(snapshot.activeEnergyBurnedKcalAvg)} active kcal`
          : null,
      ]),
      targetLabel: 'Better meal consistency, digestion, energy, sleep regularity, and body-trend context.',
      measurementWindow: '14 days with meals',
      watchMetrics: ['Meal consistency', 'Digestion', 'Energy', 'Sleep consistency', 'Body trend'],
      keepSignal: 'Keep if the routine is easy to repeat and digestion or energy trends improve.',
      swapSignal: 'Swap if adherence is poor or the product does not fit normal meals.',
      stopSignal: 'Stop if GI distress, sleep disruption, or medication concerns appear.',
      caution:
        'Clinician-aware ingredients can interact with glucose-lowering medications and are not appropriate for everyone.',
    };
  }

  return {
    ...base,
    headline: 'Use the foundation slot as the clean baseline',
    baselineLabel: baselineParts([
      hasValue(snapshot.sleepHoursAvg) ? `${formatNumber(snapshot.sleepHoursAvg)}h sleep` : null,
      hasValue(snapshot.activeEnergyBurnedKcalAvg)
        ? `${Math.round(snapshot.activeEnergyBurnedKcalAvg)} active kcal`
        : null,
      hasValue(snapshot.restingHeartRateBpmAvg)
        ? `${Math.round(snapshot.restingHeartRateBpmAvg)} bpm RHR`
        : null,
    ]),
    targetLabel: 'Steady adherence, neutral digestion, stable sleep, and clearer signal for the next experiment.',
    measurementWindow: '14 days',
    watchMetrics: ['Adherence', 'Energy', 'Digestion', 'Sleep', 'Readiness'],
    keepSignal: 'Keep if adherence is easy and core signals stay stable or improve.',
    swapSignal: 'Swap if the product creates friction or does not clarify the baseline.',
    stopSignal: 'Stop if side effects, sleep disruption, or recurring discomfort appear.',
    caution:
      'A simple foundation is only useful if it makes the rest of the stack easier to interpret.',
  };
}

function opportunityMatchesProduct(
  opportunity: HealthOpportunity,
  product: ProductDirectoryProduct,
  match: ProductSignalMatch
) {
  if (match.primaryGoalId === opportunity.goalId) return true;
  if (!product.health_goal_ids.includes(opportunity.goalId)) return false;

  return opportunity.supplementNames.some(
    (name) => name.toLowerCase() === product.directory_supplement_name.toLowerCase()
  );
}

function sortMatchItems(a: HealthProductMatchItem, b: HealthProductMatchItem) {
  const scoreDelta = b.match.score - a.match.score;
  if (scoreDelta !== 0) return scoreDelta;
  if (a.product.ucp_enabled !== b.product.ucp_enabled) return a.product.ucp_enabled ? -1 : 1;
  return a.product.product_price - b.product.product_price;
}

function buildRoutineSlots(
  items: HealthStackPlanItem[],
  focusGoalId: HealthGoalId
): HealthRoutineSlot[] {
  return [...items]
    .sort((a, b) => {
      const primaryDelta = Number(b.goalId === focusGoalId) - Number(a.goalId === focusGoalId);
      if (primaryDelta !== 0) return primaryDelta;
      return ROUTINE_SLOT_COPY[a.slotId].order - ROUTINE_SLOT_COPY[b.slotId].order;
    })
    .map((item) => {
      const copy = ROUTINE_SLOT_COPY[item.slotId];

      return {
        id: item.slotId,
        label: item.slotLabel,
        timingLabel: copy.timingLabel,
        goalId: item.goalId,
        headline: item.goalId === focusGoalId ? `Start here: ${copy.headline}` : copy.headline,
        rationale: item.rationale,
        measurementLabel: copy.measurementLabel,
        shelfHref: item.shelfHref,
        productNames: [item.product.product_name],
        items: [item],
        isPrimary: item.goalId === focusGoalId,
      };
    });
}

function buildPrimaryExperiment(
  items: HealthStackPlanItem[],
  snapshot: HealthMetricSnapshot,
  focusGoalId: HealthGoalId
): HealthCommerceExperiment | null {
  if (items.length === 0) return null;

  const readout = buildDailyHealthReadout(snapshot);
  const primaryItems = items.filter((item) => item.goalId === focusGoalId);
  const experimentItems = primaryItems.length > 0 ? primaryItems : items.slice(0, 1);
  const supplementNames = Array.from(
    new Set(experimentItems.map((item) => item.product.directory_supplement_name))
  );

  return {
    title: `14-day ${readout.focusShelfLabel.toLowerCase()} stack experiment`,
    actionLabel: `Start ${readout.focusShelfLabel.toLowerCase()}`,
    goalId: focusGoalId,
    targetDays: 14,
    productIds: experimentItems.map((item) => item.product.product_id),
    supplementNames,
    notes: `${readout.title}: ${readout.primaryMetricLabel}. Keep the rest of the routine steady and compare the next health snapshot before adding another product.`,
  };
}

export function buildHealthCommercePlan(
  snapshot: HealthMetricSnapshot,
  products: ProductDirectoryProduct[] = buildProductDirectory().products,
  maxItems = 3
): HealthCommercePlan {
  const tracker = buildHealthTrackerPlan(snapshot);
  const readout = buildDailyHealthReadout(snapshot);
  const opportunities = evaluateHealthOpportunities(snapshot);
  const matches = buildProductSignalMatches(products, snapshot);
  const topMatches = products
    .map((product) => ({
      product,
      match: matches.get(String(product.product_id)),
    }))
    .filter((item): item is HealthProductMatchItem => Boolean(item.match && item.match.score > 0))
    .sort(sortMatchItems);
  const selectedItems: HealthStackPlanItem[] = [];
  const selectedProductIds = new Set<string>();
  const selectedGoalIds = new Set<HealthGoalId>();

  for (const opportunity of opportunities) {
    if (selectedItems.length >= maxItems) break;
    if (selectedGoalIds.has(opportunity.goalId)) continue;

    const selected = topMatches.find(
      (item) =>
        !selectedProductIds.has(String(item.product.product_id)) &&
        opportunityMatchesProduct(opportunity, item.product, item.match)
    );
    if (!selected) continue;

    const slot = GOAL_SLOT[opportunity.goalId];
    selectedItems.push({
      ...selected,
      slotId: slot.slotId,
      slotLabel: slot.slotLabel,
      goalId: opportunity.goalId,
      rationale: slot.rationale,
      shelfHref: `/products?goal=${opportunity.goalId}`,
    });
    selectedProductIds.add(String(selected.product.product_id));
    selectedGoalIds.add(opportunity.goalId);
  }

  if (selectedItems.length < maxItems) {
    for (const item of topMatches) {
      if (selectedItems.length >= maxItems) break;
      if (selectedProductIds.has(String(item.product.product_id))) continue;

      const goalId = item.match.primaryGoalId ?? item.product.health_goal_ids[0] ?? tracker.focusExperiment.goalId;
      if (selectedGoalIds.has(goalId)) continue;

      const slot = GOAL_SLOT[goalId];
      selectedItems.push({
        ...item,
        slotId: slot.slotId,
        slotLabel: slot.slotLabel,
        goalId,
        rationale: slot.rationale,
        shelfHref: `/products?goal=${goalId}`,
      });
      selectedProductIds.add(String(item.product.product_id));
      selectedGoalIds.add(goalId);
    }
  }

  const selectedProducts = selectedItems.map((item) => item.product);
  const totalOneTimeCost = selectedProducts.reduce(
    (total, product) => total + product.product_price,
    0
  );
  const estimatedMonthlyCost = selectedProducts.reduce(
    (total, product) => total + monthlyCost(product),
    0
  );
  const directCheckoutCount = selectedProducts.filter((product) => product.ucp_enabled).length;
  const focusGoalId = readout.focusGoalId ?? tracker.focusExperiment.goalId;
  const routineSlots = buildRoutineSlots(selectedItems, focusGoalId);
  const primaryExperiment = buildPrimaryExperiment(selectedItems, snapshot, focusGoalId);
  const impactForecasts = selectedItems.map((item) => buildImpactForecast(item, snapshot));

  return {
    headline: 'Today\'s signal stack',
    summary:
      selectedItems.length > 0
        ? 'A timed product plan ranked from the current health snapshot. Start with one slot, then compare the next snapshot before adding more.'
        : 'Connect more health data to build a product plan from sleep, body, and activity signals.',
    items: selectedItems,
    routineSlots,
    primaryExperiment,
    impactForecasts,
    topMatches: topMatches.slice(0, 6),
    totalOneTimeCost,
    estimatedMonthlyCost,
    directCheckoutCount,
    cartGroups: buildShopifyCartGroups(selectedProducts),
    safetyNote:
      'This is an educational commerce plan, not medical advice. Review medication interactions, pregnancy, medical conditions, and lab needs with a qualified professional.',
  };
}
