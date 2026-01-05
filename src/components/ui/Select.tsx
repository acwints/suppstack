'use client';

import { forwardRef } from 'react';
import type { InputSize } from '@/types';

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

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
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
    const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            ${fullWidth ? 'w-full' : ''}
            ${sizeClasses[selectSize]}
            ${error ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-300 focus:ring-gray-200 focus:border-gray-400'}
            bg-white border rounded-lg text-gray-900
            focus:ring-2 focus:outline-none transition-all duration-300
            ${className}
          `}
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
