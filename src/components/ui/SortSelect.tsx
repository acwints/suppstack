'use client';

import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/design-system';

export interface SortOption<T extends string = string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export interface SortSelectProps<T extends string = string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange' | 'size'> {
  /** Available options */
  options: SortOption<T>[];
  /** Current value */
  value: T;
  /** Change handler */
  onChange: (value: T) => void;
  /** Label for accessibility */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Optional icon on the left */
  icon?: ReactNode;
}

const sizeStyles = {
  sm: 'h-8 text-xs pl-3 pr-8',
  md: 'h-10 text-sm pl-4 pr-10',
};

const iconSizeStyles = {
  sm: 'left-2 [&_svg]:w-3.5 [&_svg]:h-3.5',
  md: 'left-3 [&_svg]:w-4 [&_svg]:h-4',
};

const iconPaddingStyles = {
  sm: 'pl-7',
  md: 'pl-9',
};

/**
 * SortSelect component for sorting options
 *
 * @example
 * <SortSelect
 *   options={[
 *     { value: 'newest', label: 'Newest' },
 *     { value: 'popular', label: 'Most Popular' },
 *   ]}
 *   value={sortBy}
 *   onChange={setSortBy}
 * />
 */
function SortSelectInner<T extends string = string>(
  {
    options,
    value,
    onChange,
    label,
    size = 'md',
    icon,
    className,
    ...props
  }: SortSelectProps<T>,
  ref: React.ForwardedRef<HTMLSelectElement>
) {
  return (
    <div className="relative">
      {icon && (
        <span
          className={cn(
            'absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none',
            iconSizeStyles[size]
          )}
        >
          {icon}
        </span>
      )}
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={label || 'Sort by'}
        className={cn(
          'appearance-none bg-white',
          'border border-gray-300 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
          'transition-colors duration-200',
          'cursor-pointer',
          sizeStyles[size],
          icon && iconPaddingStyles[size],
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronIcon
        className={cn(
          'absolute right-3 top-1/2 -translate-y-1/2',
          'text-gray-400 pointer-events-none',
          size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
        )}
      />
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ForwardRef with generics
export const SortSelect = forwardRef(SortSelectInner) as <T extends string = string>(
  props: SortSelectProps<T> & { ref?: React.ForwardedRef<HTMLSelectElement> }
) => React.ReactElement;

export default SortSelect;
