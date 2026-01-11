import { forwardRef, type HTMLAttributes, type ElementType } from 'react';
import { cn } from '@/lib/design-system';

type SpacingValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

const gapMap: Record<SpacingValue, string> = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
};

export interface InlineProps extends HTMLAttributes<HTMLElement> {
  /** Horizontal spacing between children */
  gap?: SpacingValue;
  /** Vertical alignment */
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  /** Horizontal distribution */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Whether to wrap items */
  wrap?: boolean;
  /** Whether container should take full width */
  fullWidth?: boolean;
  /** HTML element to render */
  as?: ElementType;
}

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
};

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

/**
 * Inline - Horizontal flex container with consistent spacing
 *
 * @example
 * <Inline gap={2} align="center">
 *   <Icon />
 *   <span>Label</span>
 * </Inline>
 *
 * @example
 * <Inline justify="between" fullWidth>
 *   <Logo />
 *   <Nav />
 * </Inline>
 */
export const Inline = forwardRef<HTMLDivElement, InlineProps>(
  (
    {
      gap = 2,
      align = 'center',
      justify = 'start',
      wrap = false,
      fullWidth = false,
      as: Component = 'div',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'flex',
          gapMap[gap],
          alignMap[align],
          justifyMap[justify],
          wrap && 'flex-wrap',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Inline.displayName = 'Inline';
