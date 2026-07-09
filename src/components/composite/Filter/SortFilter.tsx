'use client';

import { Select } from '@/components/ui';

export type SortFilterValue = 'name' | 'popular';

export interface SortFilterProps {
  value: SortFilterValue;
  onChange: (value: SortFilterValue) => void;
}

const sortOptions = [
  { value: 'name', label: 'Sort by Name' },
  { value: 'popular', label: 'Most Popular' },
];

export function SortFilter({ value, onChange }: SortFilterProps) {
  return (
    <Select
      options={sortOptions}
      value={value}
      onChange={(e) => onChange(e.target.value as SortFilterValue)}
      selectSize="md"
    />
  );
}

export default SortFilter;
