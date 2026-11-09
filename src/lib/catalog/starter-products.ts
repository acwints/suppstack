import type { Product, Supplement } from '@/types';
import {
  buildHealthGoalDirectory,
  type HealthGoalId,
} from '@/lib/catalog/health-goal-directory';

/**
 * Goals already used on the catalog. Metabolic health stays off this list
 * because its directory copy talks about glucose and clinician-aware picks.
 */
const STARTER_GOAL_IDS: readonly HealthGoalId[] = [
  'daily-foundation',
  'sleep-recovery',
  'body-composition',
  'training-output',
];

function isStarterSupplement(supplement: Supplement): boolean {
  if (supplement.research_only) return false;
  const category = supplement.category?.toLowerCase() ?? '';
  const name = supplement.supplement_name.toLowerCase();
  if (category === 'peptides') return false;
  if (name.includes('peptide') || name.includes('glp')) return false;
  return true;
}

/**
 * One purchasable catalog product per starter goal. These are existing
 * catalog rows, not a new recommendation or a medical protocol.
 */
export function starterStackProducts(limit = STARTER_GOAL_IDS.length): Product[] {
  const directory = buildHealthGoalDirectory();
  const products: Product[] = [];
  const seen = new Set<string>();

  for (const goalId of STARTER_GOAL_IDS) {
    if (products.length >= limit) break;
    const goal = directory.find((item) => item.id === goalId);
    if (!goal) continue;

    for (const supplement of goal.supplements) {
      if (!isStarterSupplement(supplement)) continue;
      const product = goal.products.find(
        (candidate) => candidate.supplement_id === supplement.supplement_id
      );
      if (!product || seen.has(String(product.product_id))) continue;
      seen.add(String(product.product_id));
      products.push(product);
      break;
    }
  }

  return products;
}
