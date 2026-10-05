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
  /** What the goal is about, shown as the search-result subtitle. */
  focus: string;
  commerceAngle: string;
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
    focus: 'Sleep hours, sleep quality, consistency',
    commerceAngle:
      'Start with calm, mineral status, and simple sleep support before adding stronger sleep aids.',
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
    focus: 'Weight, body fat, protein gaps',
    commerceAngle:
      'Prioritize protein, fiber, hydration, and strength staples that make body-composition routines easier to repeat.',
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
    focus: 'Calories burned, steps, training load',
    commerceAngle:
      'Match higher active-calorie days with replenishment, performance staples, and recovery products.',
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
    focus: 'Body trend, calories, meal pattern',
    commerceAngle:
      'Build a conservative metabolic shelf around fiber, meal routines, and clinician-aware stronger ingredients.',
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
    focus: 'Routine gaps, diet coverage, adherence',
    commerceAngle:
      'Keep the base stack simple so new products can be added one at a time.',
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
