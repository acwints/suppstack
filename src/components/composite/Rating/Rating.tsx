'use client';

import { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { getStarFill } from '@/lib/utils/rating';

export interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  precision?: 'full' | 'half';
  readonly?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const gapClasses = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1',
};

export function Rating({
  value,
  max = 5,
  size = 'md',
  showValue = false,
  showCount = false,
  count,
  precision = 'half',
  readonly = true,
  onChange,
  className = '',
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue ?? value;

  const handleMouseEnter = (starIndex: number) => {
    if (!readonly && onChange) {
      setHoverValue(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly && onChange) {
      setHoverValue(null);
    }
  };

  const handleClick = (starIndex: number) => {
    if (!readonly && onChange) {
      onChange(starIndex);
    }
  };

  return (
    <div className={`flex items-center ${gapClasses[size]} ${className}`}>
      <div className={`flex items-center ${gapClasses[size]}`}>
        {Array.from({ length: max }, (_, i) => {
          const starIndex = i + 1;
          const fill = getStarFill(starIndex, displayValue, precision);

          const StarIcon = fill === 'full'
            ? FaStar
            : fill === 'half'
              ? FaStarHalfAlt
              : FaRegStar;

          return (
            <button
              key={i}
              type="button"
              className={`
                ${sizeClasses[size]}
                ${fill === 'empty' ? 'text-gray-200' : 'text-gray-900'}
                ${!readonly ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
              `}
              onMouseEnter={() => handleMouseEnter(starIndex)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(starIndex)}
              disabled={readonly}
              aria-label={`${starIndex} stars`}
            >
              <StarIcon className="w-full h-full" />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm text-gray-600 font-medium ml-1">
          {value.toFixed(1)}
        </span>
      )}

      {showCount && count !== undefined && (
        <span className="text-sm text-gray-500 ml-1">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}

export default Rating;
