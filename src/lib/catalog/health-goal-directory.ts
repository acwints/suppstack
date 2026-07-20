import type { Product, Supplement } from '@/types';
import {
  createCatalogProductsForSupplement,
  findCatalogSupplementByName,
  supplementCatalog,
} from './supplement-catalog';

export type HealthGoalId =
  | 'sleep-recovery'
  | 'body-composition'
  | 'training-output'
  | 'metabolic-health'
  | 'daily-foundation';

export interface HealthGoalDefinition {
  id: HealthGoalId;
  title: string;
  shortTitle: string;
  description: string;
  signalLabel: string;
  commerceAngle: string;
  aiUseCase: string;
  signalMetrics: string[];
  routineIdeas: string[];
  supplementNames: string[];
}

export interface HealthGoalDirectoryItem extends HealthGoalDefinition {
  supplements: Supplement[];
  products: Product[];
  productCount: number;
  priceFrom: number | null;
}

export const HEALTH_GOAL_DEFINITIONS: HealthGoalDefinition[] = [
  {
    id: 'sleep-recovery',
    title: 'Sleep & Recovery',
    shortTitle: 'Sleep',
    description: 'Sleep routines for sleep duration, sleep quality, calm, and next-day recovery.',
    signalLabel: 'Sleep hours, sleep quality, consistency',
    commerceAngle:
      'Start with calm, mineral status, and simple sleep support before adding stronger sleep aids.',
    aiUseCase:
      'When sleep duration or quality trails the rest of the profile, AI ranks gentle recovery products ahead of performance add-ons.',
    signalMetrics: ['Sleep duration', 'Sleep quality', 'Sleep consistency', 'Next-day recovery'],
    routineIdeas: [
      'Anchor one sleep-support ingredient for 14 nights.',
      'Compare bedtime consistency against next-day energy.',
      'Treat melatonin as short-term sleep-onset support, not the default base.',
    ],
    supplementNames: [
      'Magnesium Glycinate',
      'Glycine',
      'L-Theanine',
      'Melatonin',
      'Apigenin',
      'Valerian Root',
      'Lemon Balm',
    ],
  },
  {
    id: 'body-composition',
    title: 'Body Composition',
    shortTitle: 'Body',
    description: 'Protein, strength, and satiety support for weight and body-fat trend goals.',
    signalLabel: 'Weight, body fat, protein gaps',
    commerceAngle:
      'Prioritize protein, fiber, hydration, and strength staples that make body-composition routines easier to repeat.',
    aiUseCase:
      'When weight or body-fat trend rises, AI points shoppers toward satiety and lean-mass support instead of broad fat-loss claims.',
    signalMetrics: ['Weight trend', 'Body-fat trend', 'Protein consistency', 'Satiety'],
    routineIdeas: [
      'Use protein products to close daily intake gaps.',
      'Pair creatine with resistance training days.',
      'Add fiber slowly and track digestion before increasing dose.',
    ],
    supplementNames: [
      'Whey Protein',
      'Plant Protein',
      'Creatine Monohydrate',
      'Collagen Peptides',
      'Prebiotic Fiber',
      'Psyllium Husk',
      'Electrolytes',
    ],
  },
  {
    id: 'training-output',
    title: 'Training Output',
    shortTitle: 'Training',
    description: 'Hydration, power, pump, and recovery support for high active-calorie days.',
    signalLabel: 'Calories burned, steps, training load',
    commerceAngle:
      'Match higher active-calorie days with replenishment, performance staples, and recovery products.',
    aiUseCase:
      'When activity load is high, AI moves hydration, protein, creatine, and endurance support up the shelf.',
    signalMetrics: ['Active calories', 'Steps', 'Training frequency', 'Recovery load'],
    routineIdeas: [
      'Separate daily staples from workout-day products.',
      'Use electrolytes around heat, sweat, or long sessions.',
      'Track whether recovery support improves next-day readiness.',
    ],
    supplementNames: [
      'Electrolytes',
      'Creatine Monohydrate',
      'Whey Protein',
      'Beta-Alanine',
      'Citrulline Malate',
      'Beetroot',
      'Omega-3 Fish Oil',
    ],
  },
  {
    id: 'metabolic-health',
    title: 'Metabolic Health',
    shortTitle: 'Metabolic',
    description: 'Evidence-aware picks for glucose, lipids, appetite, and post-meal routines.',
    signalLabel: 'Body trend, calories, meal pattern',
    commerceAngle:
      'Build a conservative metabolic shelf around fiber, meal routines, and clinician-aware stronger ingredients.',
    aiUseCase:
      'When sleep, body trend, and calorie signals converge, AI frames metabolic support as an experiment to discuss with a professional.',
    signalMetrics: ['Body trend', 'Meal pattern', 'Calorie balance', 'Sleep overlap'],
    routineIdeas: [
      'Try fiber or meal-support products before stronger botanicals.',
      'Watch sleep and late meals together, not in isolation.',
      'Review medications and glucose concerns before berberine.',
    ],
    supplementNames: [
      'Berberine',
      'Chromium',
      'Cinnamon Extract',
      'Myo-Inositol',
      'Psyllium Husk',
      'Prebiotic Fiber',
      'Green Tea Extract',
    ],
  },
  {
    id: 'daily-foundation',
    title: 'Daily Foundation',
    shortTitle: 'Daily',
    description: 'Core micronutrient and essential-fat coverage for everyday consistency.',
    signalLabel: 'Routine gaps, diet coverage, adherence',
    commerceAngle:
      'Keep the base stack simple so new products can be tested one at a time against clear health signals.',
    aiUseCase:
      'When health data is sparse or mixed, AI falls back to low-complexity essentials and adherence tracking.',
    signalMetrics: ['Routine consistency', 'Diet coverage', 'Adherence', 'Baseline energy'],
    routineIdeas: [
      'Use this shelf as the baseline before niche products.',
      'Add one daily product at a time and watch adherence.',
      'Review labs or clinician guidance for minerals and fat-soluble vitamins.',
    ],
    supplementNames: [
      'Multivitamin',
      'Vitamin D3',
      'Magnesium Glycinate',
      'Omega-3 Fish Oil',
      'Vitamin K2',
      'Zinc',
      'Electrolytes',
    ],
  },
];

function uniqueById<T extends { supplement_id?: number; product_id?: string }>(
  items: T[],
  getId: (item: T) => string
) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = getId(item);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function supplementsForGoal(goal: HealthGoalDefinition, supplements: Supplement[]) {
  const exact = goal.supplementNames
    .map((name) => supplements.find((supplement) => supplement.supplement_name === name))
    .filter((supplement): supplement is Supplement => Boolean(supplement));

  const fallbacks = goal.supplementNames
    .map((name) => findCatalogSupplementByName(name))
    .filter((supplement): supplement is Supplement => Boolean(supplement));

  return uniqueById([...exact, ...fallbacks], (item) => String(item.supplement_id));
}

export function buildHealthGoalDirectory(
  supplements: Supplement[] = supplementCatalog
): HealthGoalDirectoryItem[] {
  return HEALTH_GOAL_DEFINITIONS.map((goal) => {
    const goalSupplements = supplementsForGoal(goal, supplements);
    const products = goalSupplements.flatMap(createCatalogProductsForSupplement);
    const prices = products
      .map((product) => product.product_price)
      .filter((price) => Number.isFinite(price) && price > 0);

    return {
      ...goal,
      supplements: goalSupplements,
      products,
      productCount: products.length,
      priceFrom: prices.length ? Math.min(...prices) : null,
    };
  });
}

export function findHealthGoal(id: HealthGoalId) {
  return HEALTH_GOAL_DEFINITIONS.find((goal) => goal.id === id) ?? null;
}

export function healthGoalHref(id: HealthGoalId) {
  return `/health/${id}`;
}

export function findHealthGoalDirectoryItem(
  id: string,
  supplements: Supplement[] = supplementCatalog
) {
  const item = buildHealthGoalDirectory(supplements).find((goal) => goal.id === id);
  return item ?? null;
}
