'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FiCheck, FiPlus } from 'react-icons/fi';
import { CatalogImage } from '@/components/ui/CatalogImage';
import { Spinner, useToast } from '@/components/ui';
import { cn } from '@/lib/design-system';
import { starterStackProducts } from '@/lib/catalog/starter-products';
import { requestPostIntentInvite } from '@/lib/growth/post-intent-invite';
import { useProductInStack } from '@/hooks';
import type { Product } from '@/types';

/**
 * Empty personal stack. The same add action as a product page, on the
 * screen signed-in people already land on, so the first save does not
 * require a catalog detour.
 */
export function EmptyStackStarter({ onAdded }: { onAdded: () => void }) {
  const products = useMemo(() => starterStackProducts(), []);

  return (
    <section aria-labelledby="empty-stack-heading">
      <h2 id="empty-stack-heading" className="font-serif text-2xl text-gray-900">
        Add the first thing you take
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Daily check-off starts once a product is in your stack.
      </p>
      <ul className="mt-4 divide-y divide-gray-100 border-y border-gray-100">
        {products.map((product) => (
          <StarterRow key={String(product.product_id)} product={product} onAdded={onAdded} />
        ))}
      </ul>
      <Link
        href="/products"
        className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-gray-600 underline underline-offset-4 hover:text-gray-900"
      >
        Browse the catalog
      </Link>
    </section>
  );
}

function StarterRow({ product, onAdded }: { product: Product; onAdded: () => void }) {
  const toast = useToast();
  const { isInStack, isUpdating, addToStack } = useProductInStack(product);
  const [saved, setSaved] = useState(false);
  const label = product.supplements?.supplement_name ?? product.product_name;
  const added = saved || isInStack;

  const handleAdd = async () => {
    if (added || isUpdating) return;
    try {
      await addToStack();
      setSaved(true);
      requestPostIntentInvite();
      onAdded();
    } catch {
      toast.error('Failed to add product to stack. Please try again.');
    }
  };

  return (
    <li className="flex items-center gap-3 py-3">
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-white">
        {product.product_image ? (
          <CatalogImage
            src={product.product_image}
            alt=""
            fill
            sizes="48px"
            className="object-contain p-1"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-base font-semibold text-gray-300">
            {label.charAt(0)}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-gray-900">{label}</span>
        <span className="block truncate text-sm text-gray-500">
          {product.brands?.brand_name ? `${product.brands.brand_name} · ` : ''}
          {product.product_name}
        </span>
      </span>
      <button
        type="button"
        onClick={handleAdd}
        disabled={isUpdating || added}
        aria-label={added ? `${product.product_name} added` : `Add ${product.product_name}`}
        className={cn(
          'inline-flex min-h-11 min-w-[76px] shrink-0 items-center justify-center gap-1 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900',
          added
            ? 'border-gray-900 bg-gray-900 text-white'
            : 'border-gray-300 text-gray-900 hover:border-gray-400'
        )}
      >
        {isUpdating ? (
          <Spinner size="sm" color={added ? 'white' : 'secondary'} />
        ) : added ? (
          <>
            <FiCheck size={15} aria-hidden="true" /> Added
          </>
        ) : (
          <>
            <FiPlus size={15} aria-hidden="true" /> Add
          </>
        )}
      </button>
    </li>
  );
}
