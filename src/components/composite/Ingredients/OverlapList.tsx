'use client';

import { FiLayers } from 'react-icons/fi';
import type { IngredientContributor, IngredientIntake, StackIntake } from '@/lib/ingredients';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/design-system';

export interface OverlapListProps {
  intake: StackIntake;
  className?: string;
}

/** Distinct contributors (one row per product) for an overlap ingredient. */
function distinctContributors(ingredient: IngredientIntake): IngredientContributor[] {
  const seen = new Set<string>();
  const result: IngredientContributor[] = [];
  for (const contributor of ingredient.contributors) {
    if (seen.has(contributor.productId)) continue;
    seen.add(contributor.productId);
    result.push(contributor);
  }
  return result;
}

/**
 * Total line: renders one total per unit bucket (mixed-unit ingredients show
 * each unit separately — never a summed mg+IU number). Unquantified-only
 * overlaps show nothing here (the per-product rows still list contributors).
 */
function TotalCell({ ingredient }: { ingredient: IngredientIntake }) {
  if (ingredient.amountsByUnit.length === 0) return null;
  return (
    <div className="flex-none text-right">
      {ingredient.amountsByUnit.map((bucket) => (
        <div key={bucket.canonicalUnit}>
          <span className="font-serif text-xl text-gray-900">{formatNumber(bucket.total)}</span>
          <span className="ml-0.5 text-xs text-gray-500">{bucket.displayUnit}</span>
        </div>
      ))}
      <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-gray-400">Total / day</span>
    </div>
  );
}

/**
 * Overlaps-only focused view: each ingredient supplied by two or more products
 * in the stack, with the contributing products and per-product amounts, plus
 * the summed total per unit. Neutral/informative tone; warm accent used only
 * as the overlap signal. Matches the stack-overlaps-list mockup.
 */
export function OverlapList({ intake, className }: OverlapListProps) {
  const overlaps = intake.overlaps;
  if (overlaps.length === 0) return null;

  return (
    <section className={cn('', className)} data-component-id="stack-overlaps">
      <div className="section-header flex items-baseline justify-between">
        <h2>Overlaps</h2>
        <span className="text-xs font-medium text-gray-500">
          {overlaps.length} {overlaps.length === 1 ? 'ingredient' : 'ingredients'}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        <span className="font-semibold text-gray-700">
          {overlaps.length} {overlaps.length === 1 ? 'ingredient comes' : 'ingredients come'}
        </span>{' '}
        from more than one product in your stack. Here&rsquo;s where each one adds up.
      </p>

      <div className="mt-4 space-y-3.5">
        {overlaps.map((ingredient) => {
          const contributors = distinctContributors(ingredient);
          return (
            <article
              key={ingredient.ingredientId}
              className="overflow-hidden rounded-md bg-white shadow-surface"
              data-component-id={`overlap-${ingredient.ingredientId}`}
            >
              <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3.5">
                <div className="min-w-0">
                  <div className="font-serif text-lg text-gray-900">{ingredient.ingredientName}</div>
                  <div className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-700">
                    <FiLayers className="h-3 w-3 text-accent-600" aria-hidden="true" />
                    From {contributors.length} products
                  </div>
                </div>
                <TotalCell ingredient={ingredient} />
              </div>
              {contributors.map((contributor) => (
                <div
                  key={contributor.productId}
                  className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 last:border-0"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="h-1.5 w-1.5 flex-none rounded-full bg-accent-600" aria-hidden="true" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-gray-900">
                        {contributor.productName}
                      </div>
                      {contributor.brandName && (
                        <div className="text-xs text-gray-500">{contributor.brandName}</div>
                      )}
                    </div>
                  </div>
                  {contributor.amountPerServing != null && (
                    <span className="whitespace-nowrap font-serif text-sm text-gray-700">
                      {formatNumber(contributor.amountPerServing)}
                      {contributor.unit && (
                        <span className="ml-0.5 font-sans text-[11px] text-gray-500">{contributor.unit}</span>
                      )}
                    </span>
                  )}
                </div>
              ))}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default OverlapList;
