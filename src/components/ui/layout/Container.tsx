import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/design-system';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const sizeMap: Record<ContainerSize, string> = {
  sm: 'max-w-2xl',    // 672px
  md: 'max-w-4xl',    // 896px
  lg: 'max-w-6xl',    // 1152px
  xl: 'max-w-7xl',    // 1280px
  full: 'max-w-full',
};

type PaddingValue = 0 | 4 | 6 | 8;

const paddingMap: Record<PaddingValue, string> = {
  0: 'px-0',
  4: 'px-4',
  6: 'px-6',
  8: 'px-8',
};

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Max width of container */
  size?: ContainerSize;
  /** Horizontal padding */
  padding?: PaddingValue;
  /** Center the container */
  centered?: boolean;
}

/**
 * Container - Page-level container with consistent max-widths
 *
 * @example
 * <Container size="lg" padding={4}>
 *   <PageContent />
 * </Container>
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = 'xl', padding = 4, centered = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          sizeMap[size],
          paddingMap[padding],
          centered && 'mx-auto',
          'w-full',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
