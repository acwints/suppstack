import type { Supplement } from '@/types';
import { getSupplementKnowledge } from './supplement-knowledge';

export interface PeptideFilters {
  query?: string;
  area?: string;
  status?: string;
  evidence?: string;
  route?: string;
}

export function filterPeptideReferences(supplements: Supplement[], filters: PeptideFilters) {
  const query = filters.query?.trim().toLowerCase() ?? '';
  return supplements.filter((supplement) => {
    if (!supplement.research_only && supplement.category?.toLowerCase() !== 'peptides') return false;
    const knowledge = getSupplementKnowledge(supplement.supplement_name, supplement.aliases);
    const research = knowledge?.peptide;
    const terms = [supplement.supplement_name, ...(supplement.aliases ?? []), knowledge?.overview];
    return (!query || terms.some((term) => term?.toLowerCase().includes(query)))
      && (!filters.area || Boolean(research?.areas.includes(filters.area)))
      && (!filters.status || research?.regulatoryStatus === filters.status)
      && (!filters.evidence || research?.humanEvidence === filters.evidence)
      && (!filters.route || Boolean(research?.routes.includes(filters.route)));
  });
}
