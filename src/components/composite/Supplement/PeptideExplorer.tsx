'use client';

import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import type { Supplement } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { filterPeptideReferences, type PeptideFilters } from '@/lib/catalog/peptide-filters';
import { getSupplementKnowledge } from '@/lib/catalog/supplement-knowledge';
import { PeptideReferenceShelf } from './PeptideReferenceShelf';

const facets = [
  { key: 'area', label: 'Area of study', field: 'areas' },
  { key: 'status', label: 'Regulatory status', field: 'regulatoryStatus' },
  { key: 'evidence', label: 'Human evidence', field: 'humanEvidence' },
  { key: 'route', label: 'Route', field: 'routes' },
] as const;

export function PeptideExplorer({ supplements }: { supplements: Supplement[] }) {
  const [filters, setFilters] = useState<PeptideFilters>({});
  const results = filterPeptideReferences(supplements, filters);
  const active = Object.values(filters).some((value) => value?.trim());

  return (
    <div className="space-y-6">
      <form role="search" aria-label="Peptide references" onSubmit={(event) => event.preventDefault()} className="space-y-4">
        <Input
          type="search"
          label="Search peptides"
          placeholder="Name or alias, e.g. BPC-157 or Wegovy"
          leftIcon={<FiSearch aria-hidden="true" />}
          value={filters.query ?? ''}
          onChange={(event) => setFilters({ ...filters, query: event.target.value })}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {facets.map(({ key, label, field }) => {
            const values = supplements.flatMap((supplement) => {
              const research = getSupplementKnowledge(supplement.supplement_name, supplement.aliases)?.peptide;
              return research ? research[field] : [];
            });
            return (
              <Select
                key={key}
                label={label}
                className="min-h-11"
                value={filters[key] ?? ''}
                options={[
                  { value: '', label: 'All' },
                  ...Array.from(new Set(values)).sort().map((value) => ({ value, label: value })),
                ]}
                onChange={(event) => setFilters({ ...filters, [key]: event.target.value })}
              />
            );
          })}
        </div>
        <p className="text-sm leading-6 text-gray-600">
          Areas and routes describe the research, not recommended uses. Human evidence applies to the use and formulation described in each profile.
        </p>
        <div className="flex min-h-11 items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <p role="status" className="text-sm text-gray-600">
            {results.length} of {supplements.length} profiles
          </p>
          {active && <Button type="button" variant="ghost" onClick={() => setFilters({})}>Clear filters</Button>}
        </div>
      </form>
      {results.length > 0 ? (
        <PeptideReferenceShelf supplements={results} layout="grid" />
      ) : (
        <div className="py-10 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No matching profiles</h2>
          <p className="mt-2 text-sm text-gray-600">Try another name or clear your filters to see all eight profiles.</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => setFilters({})}>Clear filters</Button>
        </div>
      )}
    </div>
  );
}
