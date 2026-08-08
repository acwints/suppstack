'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/design-system';

export type ProgressRingSize = 'sm' | 'md' | 'lg';
export type ProgressRingTone = 'accent' | 'success' | 'neutral';

export interface ProgressRingProps extends HTMLAttributes<HTMLDivElement> {
  /** Completion percentage, 0–100 */
  value: number;
  /** Ring diameter preset */
  size?: ProgressRingSize;
  /** Progress stroke color */
  tone?: ProgressRingTone;
}

const sizeStyles: Record<ProgressRingSize, { box: string; stroke: number }> = {
  sm: { box: 'h-10 w-10', stroke: 3.5 },
  md: { box: 'h-14 w-14', stroke: 4 },
  lg: { box: 'h-20 w-20', stroke: 4.5 },
};

const toneStyles: Record<ProgressRingTone, string> = {
  accent: 'text-accent-500',
  success: 'text-success-600',
  neutral: 'text-gray-400',
};

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Circular completion indicator. Children render centered inside the ring
 * (e.g. a `3/5` fraction or a check icon).
 */
export const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(
  ({ value, size = 'md', tone = 'accent', className, children, ...props }, ref) => {
    const clamped = Math.max(0, Math.min(100, value));
    const offset = CIRCUMFERENCE * (1 - clamped / 100);
    const { box, stroke } = sizeStyles[size];

    return (
      <div
        ref={ref}
        role="img"
        aria-label={`${Math.round(clamped)}% complete`}
        className={cn('relative inline-flex shrink-0 items-center justify-center', box, className)}
        {...props}
      >
        <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90">
          <circle
            cx="24"
            cy="24"
            r={RADIUS}
            fill="none"
            strokeWidth={stroke}
            className="stroke-current text-gray-100"
          />
          <circle
            cx="24"
            cy="24"
            r={RADIUS}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className={cn(
              'stroke-current transition-[stroke-dashoffset,color] duration-500 ease-out',
              toneStyles[tone]
            )}
          />
        </svg>
        {children && (
          <span className="absolute inset-0 flex items-center justify-center">{children}</span>
        )}
      </div>
    );
  }
);

ProgressRing.displayName = 'ProgressRing';

export default ProgressRing;
