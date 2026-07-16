'use client';

import { FiLayers } from 'react-icons/fi';
import type { IngredientUnitTotal, StackIntake } from '@/lib/ingredients';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/design-system';

export interface StackIngredientBreakdownProps {
  intake: StackIntake;
  className?: string;
}

/** A single per-unit total line (mixed-unit ingredients render one per unit). */
function UnitTotal({ bucket }: { bucket: IngredientUnitTotal }) {
  return (
    <span className="whitespace-nowrap font-serif text-base text-gray-900">
      {formatNumber(bucket.total)}
      <span className="ml-0.5 font-sans text-xs text-gray-500">{bucket.displayUnit}</span>
    </span>
  );
}

function OverlapBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-1.5 py-0.5 text-[11px] font-semibold text-accent-700">
      <FiLayers className="h-2.5 w-2.5 text-accent-600" aria-hidden="true" />
      {count} products
    </span>
  );
}

/**
 * The centerpiece intake view: every ingredient the stack provides, with
 * per-unit totals (mixed-unit ingredients render EACH unit on its own line —
 * never a summed mg+IU number; fully unquantified ingredients show "in stack"
 * with no number) and the contributing product names. Overlap ingredients
 * carry a warm-accent badge. Matches the ingredient-breakdown mockup.
 */
export function StackIngredientBreakdown({ intake, className }: StackIngredientBreakdownProps) {
  if (intake.ingredients.length === 0) return null;

  return (
    <section className={className} data-component-id="stack-ingredient-breakdown">
      <div className="section-header flex items-baseline justify-between">
        <h2>What&rsquo;s in my stack</h2>
        <span className="text-xs font-medium text-gray-500">
          {intake.ingredientCount} {intake.ingredientCount === 1 ? 'ingredient' : 'ingredients'}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Total daily intake per ingredient, summed across every product you take.
      </p>

      <ul className="mt-2">
        {intake.ingredients.map((ingredient) => {
          const names = ingredient.contributors.map((c) => c.productName);
          const distinctProducts = names.length;
          const hasTotals = ingredient.amountsByUnit.length > 0;

          return (
            <li
              key={ingredient.ingredientId}
              className={cn(
                'flex items-start justify-between gap-3 border-b border-gray-100 py-3.5 last:border-0'
              )}
              data-component-id={`ingredient-${ingredient.ingredientId}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-gray-900">
                  {ingredient.ingredientName}
                  {ingredient.isOverlap && <OverlapBadge count={distinctProducts} />}
                </div>
                <div
                  className={cn(
                    'mt-1 truncate text-[13px] text-gray-500',
                    ingredient.isOverlap && 'text-accent-700'
                  )}
                >
                  from {names.join(' · ')}
                </div>
              </div>
              <div className="flex flex-none flex-col items-end gap-1 text-right">
                {hasTotals ? (
                  ingredient.amountsByUnit.map((bucket) => (
                    <UnitTotal key={bucket.canonicalUnit} bucket={bucket} />
                  ))
                ) : (
                  <span className="whitespace-nowrap text-xs text-gray-400">in stack</span>
                )}
                {hasTotals && ingredient.hasUnquantified && (
                  <span className="text-[10px] uppercase tracking-wide text-gray-400">+ unquantified</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default StackIngredientBreakdown;
