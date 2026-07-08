'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { formatPrice } from '@/lib/utils';
import { isRemoteImageSrc } from '@/lib/catalog/product-image';

/**
 * Horizontal snap-scroll strip of recently viewed products. Renders nothing
 * until the visitor has viewed at least one product.
 */
export function RecentlyViewedRow() {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  if (recentlyViewed.length === 0) return null;

  return (
    <section aria-label="Recently viewed">
      <div className="section-header flex items-end justify-between">
        <h2>Recently Viewed</h2>
        <button
          type="button"
          onClick={clearRecentlyViewed}
          className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
        >
          Clear
        </button>
      </div>
      <ul className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
        {recentlyViewed.map((item) => (
          <li key={item.product_id} className="w-32 shrink-0 snap-start sm:w-36">
            <Link
              href={`/product/${item.product_id}`}
              className="group block rounded border border-gray-200 bg-white transition-colors hover:border-gray-300"
            >
              <span className="relative block aspect-square overflow-hidden rounded-t bg-white">
                {item.image_src ? (
                  <Image
                    src={item.image_src}
                    alt=""
                    fill
                    className="object-contain p-2"
                    sizes="144px"
                    unoptimized={isRemoteImageSrc(item.image_src)}
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-2xl font-semibold text-gray-300">
                    {item.product_name.charAt(0)}
                  </span>
                )}
              </span>
              <span className="block border-t border-gray-100 p-2">
                <span className="block truncate text-xs text-gray-500">{item.brand_name}</span>
                <span className="block truncate text-sm font-medium text-gray-900 group-hover:underline">
                  {item.product_name}
                </span>
                <span className="block text-sm font-semibold text-gray-900">
                  ${formatPrice(item.product_price)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
