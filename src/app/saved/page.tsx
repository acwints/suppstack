'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiTrash2 } from 'react-icons/fi';
import { useSavedProducts } from '@/app/context/SavedProductsContext';
import { EmptyState } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { isRemoteImageSrc } from '@/lib/catalog/product-image';

export default function SavedPage() {
  const { savedProducts, removeSaved } = useSavedProducts();

  return (
    <main className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-6 sm:py-8">
      <div className="section-header">
        <h2>Saved</h2>
      </div>

      {savedProducts.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          description="Tap the bookmark on any product to keep it here for later."
          action={
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
            >
              Browse products
            </Link>
          }
          size="lg"
        />
      ) : (
        <ul className="divide-y divide-gray-100">
          {savedProducts.map((item) => (
            <li key={item.product_id} className="flex items-center gap-4 py-3">
              <Link
                href={`/product/${item.product_id}`}
                className="flex min-w-0 flex-1 items-center gap-4"
              >
                <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded border border-gray-100 bg-white">
                  {item.image_src ? (
                    <Image
                      src={item.image_src}
                      alt=""
                      fill
                      className="object-contain p-1.5"
                      sizes="64px"
                      unoptimized={isRemoteImageSrc(item.image_src)}
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-lg font-semibold text-gray-300">
                      {item.product_name.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  {item.brand_name && (
                    <span className="block truncate text-xs text-gray-500">{item.brand_name}</span>
                  )}
                  <span className="block truncate text-sm font-medium text-gray-900">
                    {item.product_name}
                  </span>
                  <span className="block text-sm font-semibold text-gray-900">
                    ${formatPrice(item.product_price)}
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => removeSaved(item.product_id)}
                aria-label={`Remove ${item.product_name} from saved`}
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-50 hover:text-error-600 active:bg-gray-100"
              >
                <FiTrash2 size={18} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
