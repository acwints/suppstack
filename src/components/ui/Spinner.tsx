'use client';

import { cn } from '@/lib/design-system/utils';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
};

const colorClasses = {
  primary: 'border-orange-500 border-t-transparent',
  secondary: 'border-gray-600 border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-300 border-t-gray-100',
};

export function Spinner({
  size = 'md',
  color = 'primary',
  className = '',
}: SpinnerProps) {
  return (
    <div
      className={cn(
        sizeClasses[size],
        colorClasses[color],
        'rounded-full animate-spin',
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export default Spinner;
