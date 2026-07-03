'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Supplement } from '@/types';
import { formatPrice } from '@/lib/utils';

export interface FeaturedCategoriesProps {
  supplements: Supplement[];
}

/**
 * Amazon-style category shelves: each goal is a 2x2 grid of real product
 * photos that link straight into supplement pages.
 */
export function FeaturedCategories({ supplements }: FeaturedCategoriesProps) {
  const featuredCategories = [
    {
      name: 'Protein & Mass',
      supplements: supplements.filter((s) => ['Protein'].includes(s.category || '')).slice(0, 4),
    },
    {
      name: 'Strength & Performance',
      supplements: supplements
        .filter((s) => ['Performance', 'Amino Acids'].includes(s.category || ''))
        .slice(0, 4),
    },
    {
      name: 'Recovery & Hydration',
      supplements: supplements
        .filter((s) => ['Minerals', 'Omega & Fish Oil', 'Sleep & Relaxation'].includes(s.category || ''))
        .slice(0, 4),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {featuredCategories.map((category) => (
        <div key={category.name} className="rounded border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-base font-semibold text-gray-900">{category.name}</h3>
          <div className="grid grid-cols-2 gap-2">
            {category.supplements.map((supplement) => (
              <Link
                key={supplement.supplement_id}
                href={`/supplement/${supplement.supplement_id}`}
                className="group block"
              >
                <div className="relative aspect-square overflow-hidden rounded border border-gray-100 bg-white">
                  {supplement.image_url ? (
                    <Image
                      src={supplement.image_url}
                      alt={supplement.supplement_name}
                      fill
                      className="object-contain p-2 transition-transform duration-200 group-hover:scale-[1.05]"
                      sizes="(max-width: 768px) 40vw, 15vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl font-semibold text-gray-300">
                      {supplement.supplement_name.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="mt-1 truncate text-xs text-gray-700 group-hover:underline">
                  {supplement.supplement_name}
                </p>
                <p className="text-xs font-semibold text-gray-900">
                  ${formatPrice(supplement.average_price ?? 24)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default FeaturedCategories;
