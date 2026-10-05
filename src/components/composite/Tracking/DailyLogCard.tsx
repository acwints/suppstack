'use client';

import { FiCheck } from 'react-icons/fi';
import { Card, Inline, ProgressRing } from '@/components/ui';
import { cn } from '@/lib/design-system';
import { LogButton } from './LogButton';
import type { MyStackItem, SupplementLog } from '@/types';

export interface DailyLogCardProps {
  /** Today's scheduled stack items (non-empty). */
  items: MyStackItem[];
  todayLogs: SupplementLog[];
  onLog: (productId: string) => Promise<void>;
  onUnlog: (logId: string) => Promise<void>;
  isLoading?: boolean;
}

export function DailyLogCard({
  items,
  todayLogs,
  onLog,
  onUnlog,
  isLoading = false,
}: DailyLogCardProps) {
  const logsByProductId = new Map(todayLogs.map((log) => [log.product_id, log]));
  const takenCount = items.filter((item) => logsByProductId.has(item.product_id)).length;
  const logsComplete = items.length > 0 && takenCount === items.length;
  const progress = items.length > 0 ? (takenCount / items.length) * 100 : 0;
  const remaining = items.length - takenCount;

  const subtitle = logsComplete
    ? 'All done — see you tomorrow.'
    : takenCount === 0
      ? 'Check off each supplement as you take it.'
      : `${remaining} left to take`;

  return (
    <Card variant="modern" className="overflow-hidden">
      <div className="border-b border-gray-100 p-4 sm:p-6">
        <Inline justify="between" align="center" gap={4}>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Today&apos;s Supplements
            </h2>
            <p
              className={cn(
                'mt-1 text-sm',
                logsComplete ? 'font-medium text-accent-800' : 'text-gray-500'
              )}
            >
              {subtitle}
            </p>
          </div>
          <ProgressRing value={progress} size="md" tone="accent">
            {logsComplete ? (
              <FiCheck size={20} strokeWidth={2.5} className="text-accent-600" aria-hidden="true" />
            ) : (
              <span className="text-xs font-semibold tabular-nums text-gray-900">
                {takenCount}/{items.length}
              </span>
            )}
          </ProgressRing>
        </Inline>
      </div>

      {/* Supplement checklist — one row per product, circular check toggle */}
      <div className="divide-y divide-gray-100">
        {items.map((item) => {
          const log = logsByProductId.get(item.product_id);
          const isLogged = log !== undefined;

          return (
            <div
              key={item.product_id}
              className={cn(
                'flex items-center gap-3 p-4 transition-colors sm:gap-4',
                isLogged && 'bg-gray-50'
              )}
            >
              <div className="min-w-0 flex-1">
                <h4
                  className={cn(
                    'truncate font-sans text-sm font-medium sm:text-base leading-5',
                    isLogged ? 'text-gray-500' : 'text-gray-900'
                  )}
                >
                  {item.products.product_name}
                </h4>
                <p
                  className={cn(
                    'truncate text-xs sm:text-sm',
                    isLogged ? 'text-gray-400' : 'text-gray-500'
                  )}
                >
                  {item.products.supplements.supplement_name}
                </p>
              </div>

              <LogButton
                productName={item.products.product_name}
                isLogged={isLogged}
                isLoading={isLoading}
                onLog={() => onLog(item.product_id)}
                onUnlog={async () => {
                  if (log) await onUnlog(log.log_id);
                }}
                size="lg"
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
