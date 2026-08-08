'use client';

import { FiCheck, FiPackage } from 'react-icons/fi';
import { Card, Inline, ProgressRing } from '@/components/ui';
import { cn } from '@/lib/design-system/utils';
import { LogButton } from './LogButton';
import type { RegimenItem, SupplementLog } from '@/types';

export interface DailyLogCardProps {
  regimen: RegimenItem[];
  todayLogs: SupplementLog[];
  onLog: (productId: string) => Promise<void>;
  onUnlog: (logId: string) => Promise<void>;
  isLoading?: boolean;
}

export function DailyLogCard({
  regimen,
  todayLogs,
  onLog,
  onUnlog,
  isLoading = false,
}: DailyLogCardProps) {
  const regimenProductIds = new Set(regimen.map((item) => item.product_id));
  const loggedProductIds = new Set(todayLogs.map((log) => log.product_id));
  const loggedRegimenProductIds = new Set(
    todayLogs
      .filter((log) => regimenProductIds.has(log.product_id))
      .map((log) => log.product_id)
  );
  const takenCount = loggedRegimenProductIds.size;
  const logsComplete =
    regimen.length > 0 && regimen.every((item) => loggedProductIds.has(item.product_id));
  const progress = regimen.length > 0 ? (takenCount / regimen.length) * 100 : 0;
  const remaining = regimen.length - takenCount;

  const subtitle = logsComplete
    ? 'All done — see you tomorrow.'
    : takenCount === 0
      ? 'Check off each supplement as you take it.'
      : `${remaining} left to take`;

  const getLogForProduct = (productId: string): SupplementLog | undefined => {
    return todayLogs.find((log) => log.product_id === productId);
  };

  const handleUnlog = async (productId: string): Promise<void> => {
    const log = getLogForProduct(productId);
    if (log) {
      await onUnlog(log.log_id);
    }
  };

  if (regimen.length === 0) {
    return (
      <Card variant="modern" className="p-6">
        <div className="py-8 text-center">
          <FiPackage size={32} className="mx-auto mb-4 text-gray-400" aria-hidden="true" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No supplements yet</h3>
          <p className="text-gray-600">Add supplements to your stack to start tracking</p>
        </div>
      </Card>
    );
  }

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
                {takenCount}/{regimen.length}
              </span>
            )}
          </ProgressRing>
        </Inline>
      </div>

      {/* Supplement checklist — one row per product, circular check toggle */}
      <div className="divide-y divide-gray-100">
        {regimen.map((item) => {
          const isLogged = loggedProductIds.has(item.product_id);

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
                productId={item.product_id}
                productName={item.products.product_name}
                isLogged={isLogged}
                isLoading={isLoading}
                onLog={onLog}
                onUnlog={handleUnlog}
                size="lg"
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default DailyLogCard;
