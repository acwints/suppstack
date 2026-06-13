'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import type { Supplement } from '@/types';
import { Badge } from '@/components/ui';
import { formatPrice } from '@/lib/utils';

export interface SupplementCardProps {
  supplement: Supplement;
  index?: number;
}

export function SupplementCard({ supplement, index = 0 }: SupplementCardProps) {
  const evidenceLabel = supplement.evidence_rating
    ? `${supplement.evidence_rating.charAt(0).toUpperCase()}${supplement.evidence_rating.slice(1)} evidence`
    : 'Verified category';

  return (
    <Link href={`/supplement/${supplement.supplement_id}`} className="block h-full">
      <div
        className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-100 bg-white transition-colors duration-150 hover:border-gray-300 animate-fade-in"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="relative flex h-44 items-center justify-center overflow-hidden border-b border-gray-100 bg-gray-50">
          {supplement.image_url ? (
            <Image
              src={supplement.image_url}
              alt={supplement.supplement_name}
              fill
              className="object-cover grayscale-[15%] transition-transform duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white">
              <span className="text-2xl font-semibold text-gray-900">
                {supplement.supplement_name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge variant="primary">{supplement.category || 'Supplement'}</Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-gray-500">
            <FiCheckCircle className="h-3.5 w-3.5 text-green-600" />
            <span>{evidenceLabel}</span>
          </div>

          <h3 className="mb-3 font-serif text-xl text-gray-900 line-clamp-2">
            {supplement.supplement_name}
          </h3>
          <p className="mb-5 text-sm leading-6 text-gray-600 line-clamp-3">
            {supplement.supplement_description}
          </p>

          <div className="mt-auto space-y-4">
            <div className="grid grid-cols-2 gap-3 border-y border-gray-100 py-3 text-xs">
              <div>
                <div className="font-semibold text-gray-900">
                  {supplement.product_count ?? 24}
                </div>
                <div className="text-gray-500">products</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  ${formatPrice(supplement.average_price ?? 24)}
                </div>
                <div className="text-gray-500">avg price</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm font-medium text-gray-900">
              <span>Shop products</span>
              <FiArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default SupplementCard;
