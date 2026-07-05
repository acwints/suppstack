'use client';

import type { SupplementBrowseGroup } from '@/lib/catalog/supplement-families';
import { SupplementCard } from './SupplementCard';

export interface SupplementGridProps {
  groups: SupplementBrowseGroup[];
}

export function SupplementGrid({ groups }: SupplementGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
      {groups.map((group, index) => (
        <SupplementCard key={group.key} group={group} index={index} />
      ))}
    </div>
  );
}

export default SupplementGrid;
