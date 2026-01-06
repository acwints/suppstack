'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiCheck, FiClock, FiSun, FiSunset, FiMoon } from 'react-icons/fi';
import { Card } from '@/components/ui';
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

function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function DailyLogCard({
  regimen,
  todayLogs,
  onLog,
  onUnlog,
  isLoading = false,
}: DailyLogCardProps) {
  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeOfDay | 'all'>('all');

  const currentTime = getCurrentTimeOfDay();
  const loggedProductIds = new Set(todayLogs.map(log => log.product_id));
  const logsComplete = regimen.length > 0 && regimen.every(item => loggedProductIds.has(item.product_id));
  const progress = regimen.length > 0 ? (loggedProductIds.size / regimen.length) * 100 : 0;

  // Filter regimen based on time of day if needed
  const filteredRegimen = regimen;

  // Get log for a product
  const getLogForProduct = (productId: string): SupplementLog | undefined => {
    return todayLogs.find(log => log.product_id === productId);
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
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Supplements Yet</h3>
          <p className="text-gray-600">Add supplements to your stack to start tracking</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="modern" className="overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Today&apos;s Supplements</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <FiClock size={14} />
              {TIME_OF_DAY_OPTIONS.find(t => t.value === currentTime)?.label} - {TIME_OF_DAY_OPTIONS.find(t => t.value === currentTime)?.timeRange}
            </p>
          </div>
          {logsComplete && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
              <FiCheck size={18} />
              <span className="font-medium">All Done!</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">
              {loggedProductIds.size} of {regimen.length} logged
            </span>
            <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                logsComplete ? 'bg-green-500' : 'bg-orange-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Time Filter */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTimeFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeTimeFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {TIME_OF_DAY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setActiveTimeFilter(option.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTimeFilter === option.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {timeOfDayIcons[option.value]}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Supplement List */}
      <div className="divide-y divide-gray-100">
        {filteredRegimen.map((item) => {
          const isLogged = loggedProductIds.has(item.product_id);
          const log = getLogForProduct(item.product_id);

          return (
            <div
              key={item.product_id}
              className={`p-4 flex items-center gap-4 transition-colors ${
                isLogged ? 'bg-green-50/50' : 'hover:bg-gray-50'
              }`}
            >
              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium truncate ${isLogged ? 'text-green-800' : 'text-gray-900'}`}>
                  {item.products.product_name}
                </h4>
                <p className={`text-sm truncate ${isLogged ? 'text-green-600' : 'text-gray-500'}`}>
                  {item.products.supplements.supplement_name} • {item.products.brands.brand_name}
                </p>
                {isLogged && log && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    {timeOfDayIcons[log.time_of_day]}
                    Logged at {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>

              {/* Log Button */}
              <LogButton
                productId={item.product_id}
                productName={item.products.product_name}
                isLogged={isLogged}
                isLoading={isLoading}
                onLog={onLog}
                onUnlog={handleUnlog}
                size="md"
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default DailyLogCard;
