'use client';

import { forwardRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/design-system';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'ghost' | 'modern' | 'feature';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: CardVariant;
  /** Padding preset */
  padding?: CardPadding;
  /** Enable hover effect */
  hoverable?: boolean;
  /** Make card clickable (adds cursor and focus styles) */
  interactive?: boolean;
  /** As a link wrapper */
  asChild?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white shadow-surface',
  outlined: 'bg-transparent border border-gray-200',
  elevated: 'bg-white shadow-md',
  ghost: 'bg-gray-50',
  modern: 'bg-white shadow-surface',
  feature: 'bg-gray-50 shadow-surface',
};

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Card component - flexible container for content
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'none',
      hoverable = false,
      interactive = false,
      className,
      children,
      onClick,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || !interactive || !onClick) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.currentTarget.click();
      }
    };

    return (
      <div
        ref={ref}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={cn(
          // Base styles
          'rounded-lg',
          'transition-[box-shadow,transform] duration-150 ease-out',
          // Variant & Padding
          variantStyles[variant],
          paddingStyles[padding],
          // Interactive states
          hoverable && 'hover:shadow-surface-hover',
          interactive && 'active:scale-[0.96]',
          interactive && 'cursor-pointer',
          interactive && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2',
          onClick && 'cursor-pointer',
          className
        )}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// =============================================================================
// Card Sub-components
// =============================================================================

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';
