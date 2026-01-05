'use client';

import { Select } from '@/components/ui';

export interface SortFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const sortOptions = [
  { value: 'name', label: 'Sort by Name' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
];

export function SortFilter({ value, onChange }: SortFilterProps) {
  return (
    <Select
      options={sortOptions}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      selectSize="md"
      fullWidth={false}
    />
  );
}

export default SortFilter;
