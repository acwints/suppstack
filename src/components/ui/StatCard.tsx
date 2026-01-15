'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/design-system';

export type StatCardVariant = 'default' | 'orange' | 'green' | 'blue' | 'purple' | 'pink';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Icon or emoji */
  icon?: ReactNode;
  /** Stat label */
  label: string;
  /** Main value */
  value: string | number;
  /** Optional suffix (e.g., "days", "%") */
  suffix?: string;
  /** Color variant */
  variant?: StatCardVariant;
  /** Trend indicator */
  trend?: { value: number; label?: string };
  /** Loading state */
  isLoading?: boolean;
}

const iconBgStyles: Record<StatCardVariant, string> = {
  default: 'bg-gray-100',
  orange: 'bg-gray-100',
  green: 'bg-gray-100',
  blue: 'bg-gray-100',
  purple: 'bg-gray-100',
  pink: 'bg-gray-100',
};

const iconTextStyles: Record<StatCardVariant, string> = {
  default: 'text-gray-600',
  orange: 'text-gray-600',
  green: 'text-gray-600',
  blue: 'text-gray-600',
  purple: 'text-gray-600',
  pink: 'text-gray-600',
};

/**
 * StatCard component for displaying key metrics
 */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      icon,
      label,
      value,
      suffix,
      variant = 'default',
      trend,
      isLoading = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-lg border border-gray-100 p-4',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className={cn(
                'p-2 rounded shrink-0',
                iconBgStyles[variant]
              )}
            >
              <span className={cn('text-lg', iconTextStyles[variant])}>
                {icon}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-500 truncate">{label}</p>
            {isLoading ? (
              <div className="h-7 w-16 bg-gray-100 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-xl font-serif text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
                {suffix && (
                  <span className="text-sm font-sans font-normal text-gray-500 ml-1">
                    {suffix}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {trend && !isLoading && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <span
              className={cn(
                'text-xs font-medium',
                trend.value >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.value >= 0 ? '+' : ''}
              {trend.value}%
            </span>
            {trend.label && (
              <span className="text-xs text-gray-500 ml-1">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';

export default StatCard;
