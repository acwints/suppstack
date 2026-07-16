'use client';

import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';
import type { Product, ProductIngredient } from '@/types';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/design-system';

export interface ProductIngredientListProps {
  product: Product;
  className?: string;
}

/** Sort composition edges by their authored order, falling back to name. */
function sortedIngredients(ingredients: ProductIngredient[]): ProductIngredient[] {
  return [...ingredients].sort((a, b) => {
    const orderA = a.order_index ?? 0;
    const orderB = b.order_index ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return a.supplement_name.localeCompare(b.supplement_name);
  });
}

/**
 * "What's inside" panel for a product detail page. Renders the product's
 * tracked ingredient composition — each row links to that ingredient's
 * supplement page and shows its per-serving amount (unquantified rows show
 * the name with no number). Renders nothing when the product has no
 * composition. Matches the supplement-facts / single-ingredient mockups.
 */
export function ProductIngredientList({ product, className }: ProductIngredientListProps) {
  const composition = product.ingredients ?? [];
  if (composition.length === 0) return null;

  const ingredients = sortedIngredients(composition);
  const count = ingredients.length;

  const servingsPerDay = product.servings_per_day;
  const servingsPerContainer = product.servings_per_container;
  const showServingStrip = servingsPerDay > 0 || servingsPerContainer > 0;

  return (
    <section className={cn('pt-6 border-t border-gray-200', className)} data-component-id="product-ingredient-list">
      <div className="section-header flex items-baseline justify-between">
        <h2>What&rsquo;s inside</h2>
        <span className="text-xs font-medium text-gray-500">
          {count} {count === 1 ? 'ingredient' : 'ingredients'}
        </span>
      </div>

      {showServingStrip && (
        <div className="mt-4 flex gap-2.5">
          {servingsPerDay > 0 && (
            <div className="flex-1 rounded border border-gray-200 px-3 py-2.5">
              <div className="text-xs uppercase tracking-wide text-gray-500">Servings per day</div>
              <div className="mt-1 font-serif text-lg leading-none text-gray-900">
                {formatNumber(servingsPerDay)}
              </div>
            </div>
          )}
          {servingsPerContainer > 0 && (
            <div className="flex-1 rounded border border-gray-200 px-3 py-2.5">
              <div className="text-xs uppercase tracking-wide text-gray-500">Per container</div>
              <div className="mt-1 font-serif text-lg leading-none text-gray-900">
                {formatNumber(servingsPerContainer)}{' '}
                <span className="font-sans text-xs text-gray-500">servings</span>
              </div>
            </div>
          )}
        </div>
      )}

      <ul className="mt-2">
        {ingredients.map((ingredient) => (
          <li key={ingredient.supplement_id}>
            <Link
              href={`/supplement/${ingredient.supplement_id}`}
              className="flex items-center justify-between gap-3 border-b border-gray-100 py-3.5 transition-colors last:border-0 hover:bg-gray-50"
              data-component-id={`ingredient-${ingredient.supplement_id}`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900">{ingredient.supplement_name}</div>
                {ingredient.notes && (
                  <div className="mt-0.5 text-xs text-gray-500">{ingredient.notes}</div>
                )}
              </div>
              <div className="flex flex-none items-center gap-2.5">
                {ingredient.amount != null && (
                  <span className="whitespace-nowrap font-serif text-base text-gray-900">
                    {formatNumber(ingredient.amount)}
                    {ingredient.unit && (
                      <span className="ml-0.5 font-sans text-xs text-gray-500">{ingredient.unit}</span>
                    )}
                  </span>
                )}
                <FiChevronRight className="h-4 w-4 text-gray-300" aria-hidden="true" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ProductIngredientList;
