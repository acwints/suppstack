'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/design-system';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Show loading spinner */
  isLoading?: boolean;
  /** Icon before text */
  leftIcon?: ReactNode;
  /** Icon after text */
  rightIcon?: ReactNode;
  /** Full width button */
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-gray-900 text-white',
    'hover:bg-gray-800',
    'active:bg-gray-700',
    'focus-visible:ring-gray-900',
    'disabled:bg-gray-300'
  ),
  secondary: cn(
    'bg-gray-100 text-gray-900',
    'hover:bg-gray-200',
    'active:bg-gray-300',
    'focus-visible:ring-gray-500',
    'disabled:bg-gray-100 disabled:text-gray-400'
  ),
  outline: cn(
    'bg-white text-gray-700 shadow-surface',
    'hover:bg-gray-50 hover:shadow-surface-hover',
    'active:bg-gray-100',
    'focus-visible:ring-gray-500',
    'disabled:text-gray-400 disabled:shadow-surface'
  ),
  ghost: cn(
    'bg-transparent text-gray-700',
    'hover:bg-gray-100',
    'active:bg-gray-200',
    'focus-visible:ring-gray-500',
    'disabled:text-gray-400'
  ),
  danger: cn(
    'bg-error-600 text-white',
    'hover:bg-error-700',
    'active:bg-error-800',
    'focus-visible:ring-error-600',
    'disabled:bg-error-300'
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-11 px-3 text-sm gap-1.5 sm:h-10',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: '[&_svg]:w-3.5 [&_svg]:h-3.5',
  md: '[&_svg]:w-4 [&_svg]:h-4',
  lg: '[&_svg]:w-4 [&_svg]:h-4',
};

/**
 * Button component with multiple variants and sizes
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-medium rounded',
          'transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out',
          'enabled:active:scale-[0.96]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed',
          // Variant & Size
          variantStyles[variant],
          sizeStyles[size],
          iconSizeStyles[size],
          // Modifiers
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size={size} />
            {children && <span className="ml-2">{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

/** Internal loading spinner */
function LoadingSpinner({ size }: { size: ButtonSize }) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
  };

  return (
    <svg
      className={cn('animate-spin', sizeClasses[size])}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default Button;
