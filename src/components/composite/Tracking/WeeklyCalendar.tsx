'use client';

import { useState, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Card } from '@/components/ui';
import { cn } from '@/lib/design-system';
import type { SupplementLog, DailyTrackingSummary } from '@/types';

export interface WeeklyCalendarProps {
  logs: SupplementLog[];
  summaries?: DailyTrackingSummary[];
  plannedCount: number;
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
  className?: string;
}

interface DayData {
  date: string;
  dayOfWeek: string;
  dayOfMonth: number;
  isToday: boolean;
  isFuture: boolean;
  logsCount: number;
  completionPercentage: number;
  status: 'perfect' | 'partial' | 'missed' | 'future';
}

function getWeekDates(weekOffset: number = 0): Date[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  startOfWeek.setDate(diff + weekOffset * 7);

  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(date);
  }
  return dates;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const shortDayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function WeeklyCalendar({
  logs,
  summaries = [],
  plannedCount,
  onDateSelect,
  selectedDate,
  className = '',
}: WeeklyCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const today = formatDateKey(new Date());

  const weekData = useMemo((): DayData[] => {
    const dates = getWeekDates(weekOffset);

    return dates.map((date, index) => {
      const dateKey = formatDateKey(date);
      const dayLogs = logs.filter(log => log.log_date === dateKey);
      const uniqueProducts = new Set(dayLogs.map(log => log.product_id));
      const logsCount = uniqueProducts.size;

      const summary = summaries.find(s => s.summary_date === dateKey);
      const completionPercentage = summary?.completion_percentage ||
        (plannedCount > 0 ? (logsCount / plannedCount) * 100 : 0);

      const isToday = dateKey === today;
      const isFuture = date > new Date();

      let status: DayData['status'] = 'missed';
      if (isFuture) {
        status = 'future';
      } else if (completionPercentage >= 100) {
        status = 'perfect';
      } else if (logsCount > 0) {
        status = 'partial';
      }

      return {
        date: dateKey,
        dayOfWeek: dayNames[index],
        dayOfMonth: date.getDate(),
        isToday,
        isFuture,
        logsCount,
        completionPercentage: Math.min(100, completionPercentage),
        status,
      };
    });
  }, [logs, summaries, plannedCount, weekOffset, today]);

  // Get week label
  const getWeekLabel = (): string => {
    if (weekOffset === 0) return 'This Week';
    if (weekOffset === -1) return 'Last Week';
    const dates = getWeekDates(weekOffset);
    const start = dates[0];
    const end = dates[6];
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Monochrome day states: filled = complete, outlined = partial, faint =
  // nothing logged. No traffic-light coding.
  const statusColors = {
    perfect: 'bg-gray-900 text-white',
    partial: 'border-2 border-gray-900 bg-white text-gray-900',
    missed: 'bg-gray-100 text-gray-400',
    future: 'bg-gray-50 text-gray-300',
  };

  const statusLabels = {
    perfect: 'complete',
    partial: 'partially logged',
    missed: 'not logged',
    future: 'upcoming',
  };

  return (
    <Card variant="modern" className={`p-4 sm:p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Weekly Overview</h3>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-2.5 sm:p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
            aria-label="Previous week"
          >
            <FiChevronLeft size={20} />
          </button>
          <span className="text-xs sm:text-sm font-medium text-gray-600 min-w-[80px] sm:min-w-[120px] text-center">
            {getWeekLabel()}
          </span>
          <button
            onClick={() => setWeekOffset(prev => Math.min(0, prev + 1))}
            disabled={weekOffset >= 0}
            className={`p-2.5 sm:p-2 rounded-lg transition-colors touch-manipulation ${
              weekOffset >= 0 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 active:bg-gray-200'
            }`}
            aria-label="Next week"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekData.map((day, index) => (
          <button
            key={day.date}
            onClick={() => onDateSelect?.(day.date)}
            disabled={day.isFuture}
            aria-label={`${day.dayOfWeek} ${day.dayOfMonth}: ${day.logsCount} of ${plannedCount} logged, ${statusLabels[day.status]}`}
            className={cn(
              'flex min-h-11 flex-col items-center rounded-lg p-1.5 transition-[background-color,box-shadow,opacity,transform] duration-150 ease-out touch-manipulation active:scale-[0.96] sm:rounded-xl sm:p-3',
              selectedDate === day.date && 'bg-accent-50',
              day.isFuture ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 active:bg-gray-100'
            )}
          >
            <span
              className={cn(
                'mb-1 text-xs sm:mb-1.5',
                day.isToday ? 'font-semibold text-accent-700' : 'font-medium text-gray-500'
              )}
            >
              <span className="sm:hidden">{shortDayNames[index]}</span>
              <span className="hidden sm:inline">{day.dayOfWeek}</span>
            </span>
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold sm:h-10 sm:w-10 sm:text-sm',
                statusColors[day.status],
                day.isToday && 'ring-2 ring-accent-500 ring-offset-1 sm:ring-offset-2'
              )}
            >
              {day.dayOfMonth}
            </div>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-900" />
          <span className="text-xs text-gray-600">Complete</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-gray-900 bg-white" />
          <span className="text-xs text-gray-600">Partial</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-100" />
          <span className="text-xs text-gray-600">Not logged</span>
        </div>
      </div>
    </Card>
  );
}

export default WeeklyCalendar;
