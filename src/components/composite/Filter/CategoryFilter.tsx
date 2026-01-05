'use client';

import { FaFilter } from 'react-icons/fa';
import { Select } from '@/components/ui';
import type { Supplement } from '@/types';

export interface CategoryFilterProps {
  supplements: Supplement[];
  value: string;
  onChange: (value: string) => void;
}

export function CategoryFilter({ supplements, value, onChange }: CategoryFilterProps) {
  const categories = [
    {
      id: 'all',
      name: 'All Supplements',
      count: supplements.length,
      icon: '🌟'
    },
    {
      id: 'vitamins',
      name: 'Vitamins',
      count: supplements.filter(s => s.supplement_name.toLowerCase().includes('vitamin')).length,
      icon: '💊'
    },
    {
      id: 'minerals',
      name: 'Minerals',
      count: supplements.filter(s =>
        ['magnesium', 'zinc', 'calcium', 'iron'].some(m =>
          s.supplement_name.toLowerCase().includes(m)
        )
      ).length,
      icon: '⚡'
    },
    {
      id: 'protein',
      name: 'Protein',
      count: supplements.filter(s => s.supplement_name.toLowerCase().includes('protein')).length,
      icon: '💪'
    },
    {
      id: 'herbs',
      name: 'Herbs',
      count: supplements.filter(s =>
        ['ashwagandha', 'turmeric'].some(h =>
          s.supplement_name.toLowerCase().includes(h)
        )
      ).length,
      icon: '🌿'
    },
  ];

  const options = categories.map(cat => ({
    value: cat.id,
    label: `${cat.icon} ${cat.name} (${cat.count})`,
  }));

  return (
    <div className="flex items-center gap-3">
      <FaFilter className="text-gray-400" />
      <Select
        options={options}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        selectSize="md"
        fullWidth={false}
      />
    </div>
  );
}

export default CategoryFilter;
