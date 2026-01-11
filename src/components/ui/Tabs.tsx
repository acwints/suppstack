'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/design-system';

// =============================================================================
// TabList - Container for tabs
// =============================================================================

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style variant */
  variant?: 'default' | 'pills' | 'underline';
  /** Size preset */
  size?: 'sm' | 'md';
  /** Full width tabs */
  fullWidth?: boolean;
}

const listVariantStyles = {
  default: 'gap-2',
  pills: 'gap-2',
  underline: 'gap-0 border-b border-gray-200',
};

export const TabList = forwardRef<HTMLDivElement, TabListProps>(
  ({ variant = 'pills', size = 'md', fullWidth = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="tablist"
        className={cn(
          'flex overflow-x-auto',
          listVariantStyles[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabList.displayName = 'TabList';

// =============================================================================
// Tab - Individual tab button
// =============================================================================

export interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  /** Whether this tab is active */
  isActive?: boolean;
  /** Visual style variant (should match TabList) */
  variant?: 'default' | 'pills' | 'underline';
  /** Size preset */
  size?: 'sm' | 'md';
  /** Optional icon */
  icon?: ReactNode;
  /** Disabled state */
  disabled?: boolean;
}

const tabBaseStyles = cn(
  'inline-flex items-center gap-2',
  'font-medium whitespace-nowrap',
  'transition-colors duration-200',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2'
);

const tabVariantStyles = {
  pills: {
    base: 'rounded-full',
    active: 'bg-gray-900 text-white',
    inactive: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
  },
  default: {
    base: 'rounded-lg',
    active: 'bg-orange-100 text-orange-700',
    inactive: 'text-gray-600 hover:bg-gray-100',
  },
  underline: {
    base: 'border-b-2 -mb-px',
    active: 'border-orange-500 text-orange-600',
    inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
  },
};

const tabSizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export const Tab = forwardRef<HTMLButtonElement, TabProps>(
  (
    {
      isActive = false,
      variant = 'pills',
      size = 'md',
      icon,
      disabled = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyle = tabVariantStyles[variant];

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        disabled={disabled}
        className={cn(
          tabBaseStyles,
          variantStyle.base,
          tabSizeStyles[size],
          isActive ? variantStyle.active : variantStyle.inactive,
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {icon && <span className="shrink-0 [&_svg]:w-4 [&_svg]:h-4">{icon}</span>}
        {children}
      </button>
    );
  }
);

Tab.displayName = 'Tab';

// =============================================================================
// Compound Export
// =============================================================================

export const Tabs = {
  List: TabList,
  Tab: Tab,
};

export default Tabs;
