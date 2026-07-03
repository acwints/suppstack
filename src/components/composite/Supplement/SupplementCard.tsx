'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Supplement } from '@/types';
import { formatPrice } from '@/lib/utils';

export interface SupplementCardProps {
  supplement: Supplement;
  index?: number;
}

/**
 * Dense marketplace tile: real product photo first, minimal text —
 * name, price, and option count, like an Amazon search result.
 */
export function SupplementCard({ supplement }: SupplementCardProps) {
  return (
    <Link href={`/supplement/${supplement.supplement_id}`} className="block h-full">
      <div className="group flex h-full flex-col overflow-hidden rounded border border-gray-200 bg-white transition-all duration-150 hover:border-gray-300 hover:shadow-md">
        <div className="relative aspect-square w-full bg-white">
          {supplement.image_url ? (
            <Image
              src={supplement.image_url}
              alt={supplement.supplement_name}
              fill
              className="object-contain p-3 transition-transform duration-200 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-3xl font-semibold text-gray-300">
                {supplement.supplement_name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col border-t border-gray-100 p-3">
          <h3 className="text-sm font-medium leading-5 text-gray-900 line-clamp-2 group-hover:underline">
            {supplement.supplement_name}
          </h3>
          <div className="mt-auto pt-2">
            <span className="text-lg font-semibold text-gray-900">
              ${formatPrice(supplement.average_price ?? 24)}
            </span>
            <p className="text-xs text-gray-500">
              {supplement.product_count ?? 1} option{(supplement.product_count ?? 1) === 1 ? '' : 's'}
              {supplement.category ? ` · ${supplement.category}` : ''}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default SupplementCard;
