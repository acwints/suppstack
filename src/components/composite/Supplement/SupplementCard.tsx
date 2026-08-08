'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { SupplementBrowseGroup } from '@/lib/catalog/supplement-families';
import { formatPrice } from '@/lib/utils';
import { isRemoteImageSrc } from '@/lib/catalog/product-image';

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
export function SupplementCard({ group, index }: SupplementCardProps) {
  const { flagship } = group;
  const isResearch = flagship.research_only ?? false;
  const hasMultipleOptions =
    !isResearch && typeof group.productCount === 'number' && group.productCount > 1;
  const displayName = hasMultipleOptions ? `${group.name} (${group.productCount})` : group.name;
  const metaText = group.isFamily ? `${group.members.length} forms` : flagship.category ?? '';

  return (
    <Link href={`/supplement/${flagship.supplement_id}`} className="block h-full">
      <div className="group flex h-full flex-col overflow-hidden rounded bg-white shadow-surface transition-[box-shadow,transform] duration-150 ease-out hover:shadow-surface-hover active:scale-[0.96]">
        <div className="relative aspect-square w-full bg-white">
          {isResearch && (
            <span className="absolute left-2 top-2 z-10 rounded-full border border-warning-300 bg-warning-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-warning-900">
              Research
            </span>
          )}
          {flagship.image_url ? (
            <Image
              src={flagship.image_url}
              alt={group.name}
              fill
              priority={typeof index === 'number' && index < 2}
              className="object-contain p-3 transition-transform duration-200 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              unoptimized={isRemoteImageSrc(flagship.image_url)}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-50">
              <span className="text-3xl font-semibold text-gray-300">
                {group.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col border-t border-gray-100 p-3">
          <h3 className="text-sm font-medium leading-5 text-gray-900 line-clamp-2 group-hover:underline">
            {displayName}
          </h3>
          <div className="mt-auto pt-2">
            {isResearch ? (
              <>
                <span className="text-sm font-semibold text-gray-900">Research profile</span>
                <p className="text-xs text-gray-500">Reference only · {flagship.category}</p>
              </>
            ) : (
              <>
                {typeof group.priceFrom === 'number' && (
                  <span className="text-sm font-semibold leading-5 text-gray-900">
                    {(group.productCount ?? 0) > 1 && (
                      <span className="text-xs font-normal text-gray-500">From </span>
                    )}
                    ${formatPrice(group.priceFrom)}
                  </span>
                )}
                {metaText && <p className="text-xs text-gray-500">{metaText}</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default SupplementCard;
