'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { SupplementBrowseGroup } from '@/lib/catalog/supplement-families';
import { formatPrice } from '@/lib/utils';

export interface SupplementCardProps {
  group: SupplementBrowseGroup;
  index?: number;
}

/**
 * Dense marketplace tile: real product photo first, minimal text —
 * name, price, and option count, like an Amazon search result.
 *
 * A tile is either a single supplement or an ingredient family (one Creatine
 * tile spanning Monohydrate and HCl); family tiles link to the flagship form,
 * where the form switcher exposes the rest.
 */
export function SupplementCard({ group }: SupplementCardProps) {
  const { flagship } = group;

  return (
    <Link href={`/supplement/${flagship.supplement_id}`} className="block h-full">
      <div className="group flex h-full flex-col overflow-hidden rounded border border-gray-200 bg-white transition-all duration-150 hover:border-gray-300 hover:shadow-md">
        <div className="relative aspect-square w-full bg-white">
          {flagship.image_url ? (
            <Image
              src={flagship.image_url}
              alt={group.name}
              fill
              className="object-contain p-3 transition-transform duration-200 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-3xl font-semibold text-gray-300">
                {group.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col border-t border-gray-100 p-3">
          <h3 className="text-sm font-medium leading-5 text-gray-900 line-clamp-2 group-hover:underline">
            {group.name}
          </h3>
          <div className="mt-auto pt-2">
            {typeof group.priceFrom === 'number' && (
              <span className="text-lg font-semibold text-gray-900">
                {(group.productCount ?? 0) > 1 && (
                  <span className="text-xs font-normal text-gray-500">From </span>
                )}
                ${formatPrice(group.priceFrom)}
              </span>
            )}
            <p className="text-xs text-gray-500">
              {typeof group.productCount === 'number' &&
                `${group.productCount} option${group.productCount === 1 ? '' : 's'}`}
              {group.isFamily
                ? ` · ${group.members.length} forms`
                : typeof group.productCount === 'number' && flagship.category
                  ? ` · ${flagship.category}`
                  : flagship.category ?? ''}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default SupplementCard;
