'use client';

import Link from 'next/link';
import { FiCheck } from 'react-icons/fi';
import type { ProductContainingIngredient } from '@/types';
import { Spinner } from '@/components/ui';
import { BrandLogo } from '@/components/composite/Brand';
import { ProductPriceLine } from '@/components/composite/Product';
import { useProductsWithIngredient } from '@/hooks';
import { useStackIngredientsContext } from '@/app/context/StackIngredientsContext';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/design-system';

export interface ProductsWithIngredientProps {
  ingredientName: string;
  className?: string;
}

/** Normalize a product_url into the same stable key `useStackIngredients` uses. */
function normalizeProductUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  const cleaned = url.trim().toLowerCase();
  return cleaned === '' ? null : cleaned;
}

/** Per-serving amount, right-aligned. Unquantified edges render nothing. */
function AmountCell({ amount, unit }: { amount: number | null; unit: string | null }) {
  if (amount == null) return null;
  return (
    <div className="text-right">
      <div className="whitespace-nowrap font-serif text-[17px] text-gray-900">
        {formatNumber(amount)}
        {unit && <span className="ml-0.5 font-sans text-xs text-gray-500">{unit}</span>}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">per serving</div>
    </div>
  );
}

function InStackChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-semibold text-accent-700">
      <FiCheck className="h-2.5 w-2.5 text-accent-600" aria-hidden="true" />
      In your stack
    </span>
  );
}

function MultiChip({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
      {count} ingredients
    </span>
  );
}

/**
 * Reverse-map section for the ingredient detail page: every product that
 * contains this ingredient, with the per-serving amount each one provides.
 * Products already in the user's stack carry a warm-accent "in your stack"
 * marker (the only accent usage here). Renders a mobile list and a desktop
 * grid to match the mobile/desktop mockups.
 */
export function ProductsWithIngredient({
  ingredientName,
  className,
}: ProductsWithIngredientProps) {
  const { products, isLoading, error } = useProductsWithIngredient(ingredientName);
  const { stackProductUrls } = useStackIngredientsContext();

  // "In your stack" is keyed on the product's stable `product_url`, robust to
  // the catalog-id vs DB-id namespace split.
  const isInStack = (product: ProductContainingIngredient['product']) => {
    const url = normalizeProductUrl(product.product_url);
    return url != null && stackProductUrls.has(url);
  };

  if (isLoading) {
    return (
      <section className={cn('pt-2', className)}>
        <div className="flex justify-center py-8">
          <Spinner size="md" color="secondary" />
        </div>
      </section>
    );
  }

  // Silent when there's nothing to show — this is a supplementary section.
  if (error || products.length === 0) return null;

  const inStackCount = products.filter((p) => isInStack(p.product)).length;

  const renderMeta = (entry: ProductContainingIngredient, inStack: boolean) => {
    const ingredientCount = entry.product.ingredients?.length ?? 0;
    return (
      <>
        {ingredientCount > 1 && <MultiChip count={ingredientCount} />}
        {inStack && <InStackChip />}
      </>
    );
  };

  return (
    <section className={className} data-component-id="products-with-ingredient">
      <div className="section-header flex items-baseline justify-between">
        <h2>Products with this ingredient</h2>
        <span className="text-xs font-medium text-gray-500">
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </span>
      </div>

      {inStackCount > 0 && (
        <div className="mt-3.5 flex items-center gap-2 rounded border border-accent-100 bg-accent-50 px-3 py-2.5 text-sm text-accent-700">
          <FiCheck className="h-4 w-4 flex-none text-accent-600" aria-hidden="true" />
          <span>
            <b className="font-semibold">
              {inStackCount} {inStackCount === 1 ? 'product' : 'products'} in your stack
            </b>{' '}
            provide{inStackCount === 1 ? 's' : ''} this ingredient
          </span>
        </div>
      )}

      {/* Mobile: list rows */}
      <ul className="mt-2 md:hidden">
        {products.map((entry) => {
          const product = entry.product;
          const inStack = isInStack(product);
          return (
            <li key={product.product_id}>
              <Link
                href={`/product/${product.product_id}`}
                className={cn(
                  'flex items-center gap-3 border-b border-gray-100 py-3.5 transition-colors last:border-0 hover:bg-gray-50'
                )}
              >
                <span
                  className={cn(
                    'flex h-12 w-12 flex-none items-center justify-center rounded bg-gray-50 text-lg font-bold text-gray-300 shadow-surface',
                    inStack && 'ring-1 ring-accent-100'
                  )}
                >
                  {product.product_name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <BrandLogo
                      domain={product.shopify_store_domain}
                      brandName={product.brands?.brand_name || 'Brand'}
                      size="sm"
                    />
                    <span className="truncate">
                      {product.brands?.brand_name || product.shopify_store_domain || ''}
                    </span>
                  </span>
                  <div className="mt-0.5 text-[15px] font-medium leading-snug text-gray-900 line-clamp-2">
                    {product.product_name}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <ProductPriceLine product={product} />
                    {renderMeta(entry, inStack)}
                  </div>
                </div>
                <AmountCell amount={entry.amount} unit={entry.unit} />
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Desktop: card grid */}
      <div className="mt-5 hidden grid-cols-2 gap-5 md:grid lg:grid-cols-4">
        {products.map((entry) => {
          const product = entry.product;
          const inStack = isInStack(product);
          return (
            <Link
              key={product.product_id}
              href={`/product/${product.product_id}`}
              className={cn(
                'flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-colors hover:border-gray-300',
                inStack && 'border-accent-100'
              )}
            >
              <div className="flex aspect-square items-center justify-center border-b border-gray-100 text-3xl font-bold text-gray-300">
                {product.product_name.charAt(0)}
              </div>
              <div className="flex flex-1 flex-col p-3">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <BrandLogo
                    domain={product.shopify_store_domain}
                    brandName={product.brands?.brand_name || 'Brand'}
                    size="sm"
                  />
                  <span className="truncate">
                    {product.brands?.brand_name || product.shopify_store_domain || ''}
                  </span>
                </span>
                <div className="mt-1.5 text-sm font-medium leading-snug text-gray-900 line-clamp-2">
                  {product.product_name}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">{renderMeta(entry, inStack)}</div>
                <div className="mt-auto flex items-end justify-between pt-3">
                  <ProductPriceLine product={product} />
                  <AmountCell amount={entry.amount} unit={entry.unit} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default ProductsWithIngredient;
