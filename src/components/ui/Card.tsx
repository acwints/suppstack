'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
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
  default: 'bg-white border border-gray-200',
  outlined: 'bg-transparent border-2 border-gray-200',
  elevated: 'bg-white shadow-md border border-gray-100',
  ghost: 'bg-gray-50 border border-transparent',
  // Legacy variants for backward compatibility
  modern: 'bg-white border border-gray-200 shadow-sm',
  feature: 'bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-100',
};

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Card component - flexible container for content
 *
 * @example
 * <Card variant="elevated" padding="md">
 *   <Card.Header>Title</Card.Header>
 *   <Card.Body>Content</Card.Body>
 * </Card>
 *
 * @example
 * <Card hoverable interactive onClick={handleClick}>
 *   Clickable card
 * </Card>
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
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          // Base styles
          'rounded-2xl',
          'transition-all duration-200',
          // Variant & Padding
          variantStyles[variant],
          paddingStyles[padding],
          // Interactive states
          hoverable && 'hover:border-orange-300 hover:shadow-md',
          interactive && 'cursor-pointer',
          interactive && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',
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

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Border at bottom */
  bordered?: boolean;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ bordered = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-6 py-4',
          bordered && 'border-b border-gray-200',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

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

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Border at top */
  bordered?: boolean;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ bordered = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-6 py-4',
          bordered && 'border-t border-gray-200',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Compound component exports
export default Object.assign(Card, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
