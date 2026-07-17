'use client';

import { FiChevronRight, FiLayers } from 'react-icons/fi';
import type { StackIntake } from '@/lib/ingredients';
import { Card } from '@/components/ui';
import { cn } from '@/lib/design-system';

export interface StackIntakeSummaryProps {
  intake: StackIntake;
  /** Optional count of products contributing to the intake. */
  productCount?: number;
  /** Handlers for the tappable chips (e.g. scroll to a section). */
  onSelectIngredients?: () => void;
  onSelectOverlaps?: () => void;
  onSelectProducts?: () => void;
  className?: string;
}

interface ChipProps {
  value: number;
  label: string;
  overlap?: boolean;
  onClick?: () => void;
}

function StatChip({ value, label, overlap, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-[72px] flex-col justify-center rounded-md border border-gray-200 bg-white px-2.5 py-3 text-left transition active:scale-[0.97] hover:shadow-surface',
        overlap && 'border-accent-100 bg-accent-50'
      )}
    >
      <span className="flex items-center gap-1.5">
        {overlap && <FiLayers className="h-3 w-3 text-accent-600" aria-hidden="true" />}
        <span
          className={cn(
            'font-serif text-[28px] leading-none text-gray-900',
            overlap && 'text-accent-700'
          )}
        >
          {value}
        </span>
      </span>
      <span className={cn('mt-1.5 text-xs text-gray-500', overlap && 'text-accent-700')}>{label}</span>
    </button>
  );
}

/**
 * Compact "stack at a glance" summary. Shows products, ingredients, and
 * overlaps as tappable stat chips; the overlap chip uses the warm accent as
 * the only overlap signal. Matches the summary-widget-chips mockup.
 */
export function StackIntakeSummary({
  intake,
  productCount,
  onSelectIngredients,
  onSelectOverlaps,
  onSelectProducts,
  className,
}: StackIntakeSummaryProps) {
  const hasProductCount = typeof productCount === 'number';

  return (
    <Card variant="elevated" padding="md" className={className} data-component-id="stack-summary-widget">
      <div className="mb-3.5 flex items-baseline justify-between">
        <span className="font-serif text-[19px] text-gray-900">Your stack at a glance</span>
        {onSelectIngredients && (
          <button
            type="button"
            onClick={onSelectIngredients}
            className="inline-flex items-center gap-0.5 text-[13px] font-semibold text-gray-600 hover:text-gray-900"
          >
            View breakdown
            <FiChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
      <div className={cn('grid gap-2', hasProductCount ? 'grid-cols-3' : 'grid-cols-2')}>
        {hasProductCount && (
          <StatChip value={productCount!} label="products" onClick={onSelectProducts} />
        )}
        <StatChip
          value={intake.ingredientCount}
          label="ingredients"
          onClick={onSelectIngredients}
        />
        <StatChip
          value={intake.overlapCount}
          label="overlaps"
          overlap
          onClick={onSelectOverlaps}
        />
      </div>
    </Card>
  );
}

export default StackIntakeSummary;
