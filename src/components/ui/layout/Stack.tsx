import { forwardRef, type HTMLAttributes, type ElementType } from 'react';
import { cn } from '@/lib/design-system';

type SpacingValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

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
  16: 'gap-16',
};

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** Vertical spacing between children */
  gap?: SpacingValue;
  /** Horizontal alignment */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Whether children should take full width */
  fullWidth?: boolean;
  /** HTML element to render */
  as?: ElementType;
}

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

/**
 * Stack - Vertical flex container with consistent spacing
 *
 * @example
 * <Stack gap={4}>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 * </Stack>
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ gap = 4, align = 'stretch', fullWidth = true, as: Component = 'div', className, children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'flex flex-col',
          gapMap[gap],
          alignMap[align],
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

Stack.displayName = 'Stack';
