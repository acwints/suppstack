'use client';

import Link from 'next/link';
import { FiArrowRight, FiPlus } from 'react-icons/fi';
import type { Supplement } from '@/types';
import { cn } from '@/lib/design-system/utils';

export interface PeptideReferenceShelfProps {
  supplements: Supplement[];
  layout?: 'carousel' | 'grid';
}

function isPeptideReference(supplement: Supplement) {
  return supplement.research_only || supplement.category?.toLowerCase() === 'peptides';
}

export function PeptideReferenceShelf({
  supplements,
  layout = 'carousel',
}: PeptideReferenceShelfProps) {
  const peptides = supplements.filter(isPeptideReference);

  if (peptides.length === 0) return null;

  const isGrid = layout === 'grid';

  return (
    <div
      className={cn(
        isGrid
          ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'
          : 'scrollbar-hide -mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2 sm:-mx-6 sm:px-6'
      )}
    >
      {peptides.map((peptide) => (
        <Link
          key={peptide.supplement_id}
          href={`/supplement/${peptide.supplement_id}`}
          className={cn(
            'group flex flex-col rounded border border-amber-200 bg-amber-50/40 p-4 transition-colors hover:border-amber-300 hover:bg-amber-50',
            isGrid ? 'min-h-56' : 'w-[min(82vw,21rem)] shrink-0 snap-start sm:w-80'
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
              Reference
            </span>
            <span className="text-xs font-medium text-amber-800">Not sold</span>
          </div>

          <h3 className="font-serif text-2xl leading-tight text-gray-900">
            {peptide.supplement_name}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
            {peptide.supplement_description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {(peptide.primary_goals ?? []).slice(0, 2).map((goal) => (
              <span
                key={goal}
                className="rounded border border-amber-200 bg-white px-2 py-1 text-xs font-medium text-gray-600"
              >
                {goal}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between pt-5 text-sm font-semibold text-gray-900">
            <span className="inline-flex items-center gap-2">
              <FiPlus className="text-amber-700" />
              Stackable
            </span>
            <FiArrowRight className="text-gray-400 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      ))}
    </div>
  );
}

export default PeptideReferenceShelf;
