'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/design-system';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Icon to display */
  icon?: ReactNode;
  /** Main heading */
  title: string;
  /** Supporting description */
  description?: string;
  /** Call to action button(s) */
  action?: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'card' | 'minimal';
}

const sizeStyles = {
  sm: {
    container: 'py-8',
    icon: 'text-3xl mb-2',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    container: 'py-12',
    icon: 'text-4xl mb-3',
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16',
    icon: 'text-5xl mb-4',
    title: 'text-xl',
    description: 'text-base',
  },
};

const variantStyles = {
  default: 'bg-transparent',
  card: 'bg-gray-50 rounded-2xl',
  minimal: 'bg-transparent',
};

/**
 * EmptyState component for empty lists, search results, etc.
 *
 * @example
 * <EmptyState
 *   icon={<FiLayers />}
 *   title="No stacks yet"
 *   description="Create your first stack to get started"
 *   action={<Button>Create Stack</Button>}
 * />
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      size = 'md',
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const styles = sizeStyles[size];

    return (
      <div
        ref={ref}
        className={cn(
          'text-center',
          styles.container,
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {icon && (
          <div className={styles.icon} aria-hidden="true">
            {icon}
          </div>
        )}
        <h3
          className={cn(
            'font-semibold text-gray-800',
            styles.title
          )}
        >
          {title}
        </h3>
        {description && (
          <p
            className={cn(
              'text-gray-600 mt-1 max-w-sm mx-auto',
              styles.description
            )}
          >
            {description}
          </p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export default EmptyState;
