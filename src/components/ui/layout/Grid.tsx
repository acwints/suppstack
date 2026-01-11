import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/design-system';

type SpacingValue = 0 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
type ColumnsValue = 1 | 2 | 3 | 4 | 5 | 6 | 12;

const gapMap: Record<SpacingValue, string> = {
  0: 'gap-0',
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

const colsMap: Record<ColumnsValue, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of columns */
  cols?: ColumnsValue | { sm?: ColumnsValue; md?: ColumnsValue; lg?: ColumnsValue; xl?: ColumnsValue };
  /** Gap between items */
  gap?: SpacingValue;
}

/**
 * Grid - CSS Grid container with responsive columns
 *
 * @example
 * // Fixed columns
 * <Grid cols={3} gap={4}>
 *   <Card />
 *   <Card />
 *   <Card />
 * </Grid>
 *
 * @example
 * // Responsive columns
 * <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={6}>
 *   <Card />
 *   <Card />
 *   <Card />
 * </Grid>
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ cols = 1, gap = 4, className, children, ...props }, ref) => {
    let colClasses: string;

    if (typeof cols === 'number') {
      colClasses = colsMap[cols];
    } else {
      const { sm = 1, md, lg, xl } = cols;
      colClasses = cn(
        colsMap[sm],
        md && `md:${colsMap[md]}`,
        lg && `lg:${colsMap[lg]}`,
        xl && `xl:${colsMap[xl]}`
      );
    }

    return (
      <div
        ref={ref}
        className={cn('grid', colClasses, gapMap[gap], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';
