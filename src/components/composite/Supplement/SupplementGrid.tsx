'use client';

import type { Supplement } from '@/types';
import { SupplementCard } from './SupplementCard';

export interface SupplementGridProps {
  supplements: Supplement[];
}

export function SupplementGrid({ supplements }: SupplementGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {supplements.map((supplement, index) => (
        <SupplementCard
          key={supplement.supplement_id}
          supplement={supplement}
          index={index}
        />
      ))}
    </div>
  );
}

export default SupplementGrid;
