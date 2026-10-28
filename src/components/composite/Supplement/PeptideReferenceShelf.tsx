'use client';

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import type { Supplement } from '@/types';
import { getSupplementKnowledge } from '@/lib/catalog/supplement-knowledge';
import { cn } from '@/lib/design-system';

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
      {peptides.map((peptide) => {
        const knowledge = getSupplementKnowledge(peptide.supplement_name, peptide.aliases);
        const research = knowledge?.peptide;
        return (
          <Link
            key={peptide.supplement_id}
            href={`/supplement/${peptide.supplement_id}`}
            className={cn(
              'group flex flex-col rounded border border-warning-200 bg-warning-50/40 p-4 transition-colors hover:border-warning-300 hover:bg-warning-50',
              isGrid ? 'min-h-56' : 'w-[min(82vw,21rem)] shrink-0 snap-start sm:w-80'
            )}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="rounded-full border border-warning-300 bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-warning-800">
                Reference
              </span>
              <span className="text-xs font-medium text-warning-800">Not sold</span>
            </div>

            <h3 className="font-serif text-2xl leading-tight text-gray-900">
              {peptide.supplement_name}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
              {knowledge?.overview ?? peptide.supplement_description}
            </p>

            {research && (
              <dl className="mt-4 space-y-2 text-sm leading-5">
                <div><dt className="text-gray-600">Regulatory status</dt><dd className="font-medium text-gray-900">{research.regulatoryStatus}</dd></div>
                <div><dt className="text-gray-600">Human evidence</dt><dd className="font-medium text-gray-900">{research.humanEvidence}</dd></div>
              </dl>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {(research?.areas ?? peptide.primary_goals ?? []).slice(0, 2).map((goal) => (
                <span
                  key={goal}
                  className="rounded border border-warning-200 bg-white px-2 py-1 text-xs font-medium text-gray-600"
                >
                  {goal}
                </span>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between pt-5 text-sm font-semibold text-gray-900">
              <span className="inline-flex items-center gap-2">
                View research
              </span>
              <FiArrowRight className="text-gray-400 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
