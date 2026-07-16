'use client';

import { forwardRef, useId } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import type { InputSize } from '@/types';
import { cn } from '@/lib/design-system/utils';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  selectSize?: InputSize;
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  fullWidth?: boolean;
}

// Right padding reserves room for the custom chevron so labels never
// collide with it (the native arrow is suppressed via appearance-none).
const sizeClasses: Record<InputSize, string> = {
  sm: 'pl-3 pr-8 py-2 text-base sm:text-sm',
  md: 'pl-4 pr-9 py-2.5 text-base sm:text-sm',
  lg: 'pl-5 pr-10 py-3 text-base',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      selectSize = 'md',
      label,
      error,
      helperText,
      placeholder,
      fullWidth = true,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || `select-${generatedId}`;

    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <span className={cn('relative', fullWidth ? 'block' : 'inline-block')}>
          <select
            ref={ref}
            id={selectId}
            className={cn(
              fullWidth && 'w-full',
              sizeClasses[selectSize],
              error
                ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                : 'border-gray-300 focus:ring-gray-200 focus:border-gray-400',
              'appearance-none truncate bg-white border rounded-lg text-gray-900',
              'focus:ring-2 focus:outline-none transition-[border-color,box-shadow] duration-150',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" className="text-gray-500">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-white">
                {option.icon ? `${option.icon} ${option.label}` : option.label}
              </option>
            ))}
          </select>
          <FiChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
        </span>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
