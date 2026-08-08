'use client';

import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

export interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  size?: 'md' | 'lg';
}

const sizeClasses = {
  md: { star: 'w-8 h-8', gap: 'gap-1' },
  lg: { star: 'w-10 h-10', gap: 'gap-2' },
};

const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export function RatingInput({
  value,
  onChange,
  label,
  helperText,
  error,
  required = false,
  size = 'lg',
}: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;
  const currentLabel = displayValue > 0 ? ratingLabels[displayValue - 1] : '';

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      <div className="flex items-center gap-4">
        <div className={`flex items-center ${sizeClasses[size].gap}`}>
          {[1, 2, 3, 4, 5].map((starValue) => (
            <button
              key={starValue}
              type="button"
              className={`
                ${sizeClasses[size].star}
                ${starValue <= displayValue ? 'text-gray-900' : 'text-gray-200'}
                transition-[color,transform] duration-150 ease-out hover:scale-110 hover:text-gray-900 active:scale-[0.96]
              `}
              onMouseEnter={() => setHoverValue(starValue)}
              onMouseLeave={() => setHoverValue(null)}
              onClick={() => onChange(starValue)}
              aria-label={`Rate ${starValue} stars`}
            >
              <FaStar className="w-full h-full" />
            </button>
          ))}
        </div>

        {currentLabel && (
          <span className="text-sm font-medium text-gray-600 min-w-[80px]">
            {currentLabel}
          </span>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-error-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

export default RatingInput;
