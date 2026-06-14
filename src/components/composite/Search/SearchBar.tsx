'use client';

import { FaSearch } from 'react-icons/fa';
import { Input } from '@/components/ui';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search whey, creatine, pre-workout...',
}: SearchBarProps) {
  return (
    <Input
      variant="search"
      inputSize="lg"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      leftIcon={<FaSearch className="h-5 w-5" />}
    />
  );
}

export default SearchBar;
