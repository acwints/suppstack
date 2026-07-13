'use client';

import { useState } from 'react';
import { FiCheck, FiClock, FiPackage, FiSun, FiSunset, FiMoon } from 'react-icons/fi';
import { Card, Stack, Inline } from '@/components/ui';
import { cn } from '@/lib/design-system/utils';
import { getCurrentTimeOfDay } from '@/lib/utils';
import { LogButton } from './LogButton';
import type { RegimenItem, SupplementLog, TimeOfDay } from '@/types';
import { TIME_OF_DAY_OPTIONS } from '@/types';

export interface DailyLogCardProps {
  regimen: RegimenItem[];
  todayLogs: SupplementLog[];
  onLog: (productId: string, timeOfDay?: TimeOfDay) => Promise<void>;
  onUnlog: (logId: string) => Promise<void>;
  isLoading?: boolean;
}

const timeOfDayIcons: Record<TimeOfDay, React.ReactNode> = {
  morning: <FiSun className="text-yellow-500" />,
  afternoon: <FiSun className="text-orange-500" />,
  evening: <FiSunset className="text-purple-500" />,
  night: <FiMoon className="text-blue-500" />,
};

export function DailyLogCard({
  regimen,
  todayLogs,
  onLog,
  onUnlog,
  isLoading = false,
}: DailyLogCardProps) {
  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeOfDay | 'all'>('all');

  const currentTime = getCurrentTimeOfDay();
  const regimenProductIds = new Set(regimen.map((item) => item.product_id));
  const loggedProductIds = new Set(todayLogs.map((log) => log.product_id));
  const loggedRegimenProductIds = new Set(
    todayLogs
      .filter((log) => regimenProductIds.has(log.product_id))
      .map((log) => log.product_id)
  );
  const logsComplete =
    regimen.length > 0 && regimen.every((item) => loggedProductIds.has(item.product_id));
  const progress = regimen.length > 0 ? (loggedRegimenProductIds.size / regimen.length) * 100 : 0;

  // Filter regimen by time of day based on when supplements were logged
  const filteredRegimen = activeTimeFilter === 'all'
    ? regimen
    : regimen.filter((item) => {
        const log = todayLogs.find((l) => l.product_id === item.product_id);
        // Show items logged at the selected time, plus unlogged items
        return !log || log.time_of_day === activeTimeFilter;
      });

  const getLogForProduct = (productId: string): SupplementLog | undefined => {
    return todayLogs.find((log) => log.product_id === productId);
  };

  const handleUnlog = async (productId: string) => {
    const log = getLogForProduct(productId);
    if (log) {
      await onUnlog(log.log_id);
    }
  };

  if (regimen.length === 0) {
    return (
      <Card variant="modern" className="p-6">
        <div className="text-center py-8">
          <FiPackage size={32} className="mx-auto mb-4 text-gray-400" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Supplements Yet</h3>
          <p className="text-gray-600">Add supplements to your stack to start tracking</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="modern" className="overflow-hidden">
      {/* Header - Mobile optimized */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <Stack gap={4}>
          {/* Title Row */}
          <Inline justify="between" align="start" wrap gap={2}>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Today&apos;s Supplements
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <FiClock size={12} className="shrink-0" />
                <span className="truncate">
                  {TIME_OF_DAY_OPTIONS.find((t) => t.value === currentTime)?.label}
                </span>
              </p>
            </div>
            {logsComplete && (
              <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-sm shrink-0">
                <FiCheck size={16} />
                <span className="font-medium hidden xs:inline">All Done!</span>
              </div>
            )}
          </Inline>

          {/* Progress Bar */}
          <div>
            <Inline justify="between" className="text-xs sm:text-sm mb-1.5">
              <span className="text-gray-600">
                {loggedRegimenProductIds.size}/{regimen.length} logged
              </span>
              <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
            </Inline>
            <div className="h-2.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  logsComplete ? 'bg-green-500' : 'bg-orange-500',
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Time Filter - Horizontal scroll with fade */}
          <div className="relative -mx-4 sm:-mx-6 px-4 sm:px-6">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
              <button
                onClick={() => setActiveTimeFilter('all')}
                className={cn(
                  'px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap snap-start shrink-0',
                  activeTimeFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200',
                )}
              >
                All
              </button>
              {TIME_OF_DAY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setActiveTimeFilter(option.value)}
                  className={cn(
                    'px-3 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap snap-start shrink-0',
                    activeTimeFilter === option.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 active:bg-gray-200',
                  )}
                >
                  {timeOfDayIcons[option.value]}
                  <span className="hidden xs:inline">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </Stack>
      </div>

      {/* Supplement List - Touch-optimized */}
      <div className="divide-y divide-gray-100">
        {filteredRegimen.map((item) => {
          const isLogged = loggedProductIds.has(item.product_id);
          const log = getLogForProduct(item.product_id);

          return (
            <div
              key={item.product_id}
              className={cn(
                'p-4 flex items-center gap-3 sm:gap-4 transition-colors active:bg-gray-50',
                isLogged && 'bg-green-50/50',
              )}
            >
              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4
                  className={cn(
                    'font-medium text-sm sm:text-base truncate',
                    isLogged ? 'text-green-800' : 'text-gray-900',
                  )}
                >
                  {item.products.product_name}
                </h4>
                <p
                  className={cn(
                    'text-xs sm:text-sm truncate',
                    isLogged ? 'text-green-600' : 'text-gray-500',
                  )}
                >
                  {item.products.supplements.supplement_name}
                </p>
                {isLogged && log && (
                  <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                    {timeOfDayIcons[log.time_of_day]}
                    <span>
                      {new Date(log.logged_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </p>
                )}
              </div>

              {/* Log Button - Larger touch target on mobile */}
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
