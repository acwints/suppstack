'use client';

import type { Supplement } from '@/types';
import { SupplementCard } from './SupplementCard';

export interface SupplementGridProps {
  supplements: Supplement[];
}

export function SupplementGrid({ supplements }: SupplementGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
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
