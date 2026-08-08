'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/design-system';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size preset */
  size?: BadgeSize;
  /** Icon to display */
  icon?: ReactNode;
  /** Dot indicator instead of icon */
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-accent-100 text-accent-700',
  secondary: 'bg-gray-100 text-gray-600',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  error: 'bg-error-100 text-error-700',
  info: 'bg-info-100 text-info-700',
};

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-500',
  primary: 'bg-accent-500',
  secondary: 'bg-gray-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-info-500',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

const iconSizeStyles: Record<BadgeSize, string> = {
  sm: '[&_svg]:w-3 [&_svg]:h-3',
  md: '[&_svg]:w-3.5 [&_svg]:h-3.5',
};

/**
 * Badge component for status, labels, and tags
 *
 * @example
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning" dot>Pending</Badge>
 * <Badge variant="info" icon={<FiStar />}>Featured</Badge>
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', icon, dot, className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center gap-1.5',
          'font-medium rounded-full',
          'whitespace-nowrap',
          // Variant & Size
          variantStyles[variant],
          sizeStyles[size],
          iconSizeStyles[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotStyles[variant])}
            aria-hidden="true"
          />
        )}
        {icon && !dot && <span className="shrink-0">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
