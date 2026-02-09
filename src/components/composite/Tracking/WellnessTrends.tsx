'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import { Card, Spinner } from '@/components/ui';
import { cn } from '@/lib/design-system/utils';

export interface WellnessTrendsProps {
  className?: string;
}

interface DayData {
  date: string;
  mood: number | null;
  energy: number | null;
  sleep_quality: number | null;
  sleep_hours: number | null;
  completion: number;
  supplements_taken: number;
}

type MetricKey = 'mood' | 'energy' | 'sleep_quality' | 'sleep_hours';
type TimeRange = '7d' | '14d' | '30d';

const METRICS: { key: MetricKey; label: string; color: string; max: number; unit: string }[] = [
  { key: 'mood', label: 'Mood', color: 'bg-purple-500', max: 5, unit: '/5' },
  { key: 'energy', label: 'Energy', color: 'bg-amber-500', max: 5, unit: '/5' },
  { key: 'sleep_quality', label: 'Sleep Quality', color: 'bg-blue-500', max: 5, unit: '/5' },
  { key: 'sleep_hours', label: 'Sleep Hours', color: 'bg-teal-500', max: 10, unit: 'hrs' },
];

const TIME_RANGES: { value: TimeRange; label: string; days: number }[] = [
  { value: '7d', label: '7 Days', days: 7 },
  { value: '14d', label: '14 Days', days: 14 },
  { value: '30d', label: '30 Days', days: 30 },
];

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getTrendDirection(data: (number | null)[]): 'up' | 'down' | 'flat' {
  const valid = data.filter((d): d is number => d !== null);
  if (valid.length < 3) return 'flat';
  const firstHalf = valid.slice(0, Math.floor(valid.length / 2));
  const secondHalf = valid.slice(Math.floor(valid.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const diff = secondAvg - firstAvg;
  if (Math.abs(diff) < 0.2) return 'flat';
  return diff > 0 ? 'up' : 'down';
}

function getAverage(data: (number | null)[]): number | null {
  const valid = data.filter((d): d is number => d !== null);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export function WellnessTrends({ className }: WellnessTrendsProps) {
  const { user } = useAuth();
  const [data, setData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('14d');
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('mood');

  const fetchData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const days = TIME_RANGES.find(t => t.value === timeRange)?.days || 14;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startStr = startDate.toISOString().split('T')[0];

      const { data: summaries, error } = await supabase
        .from('daily_tracking_summary')
        .select('*')
        .eq('user_id', user.id)
        .gte('summary_date', startStr)
        .order('summary_date', { ascending: true });

      if (error) throw error;

      // Build day-by-day data including days with no entry
      const dayMap = new Map<string, DayData>();
      const today = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dayMap.set(dateStr, {
          date: dateStr,
          mood: null,
          energy: null,
          sleep_quality: null,
          sleep_hours: null,
          completion: 0,
          supplements_taken: 0,
        });
      }

      (summaries || []).forEach((s: any) => {
        const existing = dayMap.get(s.summary_date);
        if (existing) {
          existing.mood = s.overall_mood;
          existing.energy = s.overall_energy;
          existing.sleep_quality = s.sleep_quality;
          existing.sleep_hours = s.sleep_hours;
          existing.completion = s.completion_percentage || 0;
          existing.supplements_taken = s.supplements_taken || 0;
        }
      });

      setData(Array.from(dayMap.values()));
    } catch (err) {
      console.error('Error fetching wellness data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const metricConfig = METRICS.find(m => m.key === selectedMetric)!;
  const metricValues = data.map(d => d[selectedMetric] as number | null);
  const trend = getTrendDirection(metricValues);
  const average = getAverage(metricValues);
  const daysWithData = metricValues.filter(v => v !== null).length;

  if (!user) return null;

  return (
    <Card variant="default" padding="md" className={className}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-serif text-gray-900">Wellness Trends</h3>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                timeRange === range.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {METRICS.map((metric) => {
          const avg = getAverage(data.map(d => d[metric.key] as number | null));
          return (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors border',
                selectedMetric === metric.key
                  ? 'border-gray-900 bg-gray-50 text-gray-900'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              )}
            >
              <div className={cn('w-2 h-2 rounded-full', metric.color)} />
              <span>{metric.label}</span>
              {avg !== null && (
                <span className="font-medium">{avg.toFixed(1)}</span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="md" />
        </div>
      ) : daysWithData === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">No wellness data recorded yet.</p>
          <p className="text-gray-400 text-xs mt-1">
            Log your mood, energy, and sleep to see trends here.
          </p>
        </div>
      ) : (
        <>
          {/* Trend Summary */}
          <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {trend === 'up' && <FiTrendingUp className="text-green-600" size={18} />}
              {trend === 'down' && <FiTrendingDown className="text-red-500" size={18} />}
              {trend === 'flat' && <FiMinus className="text-gray-400" size={18} />}
              <span className="text-sm font-medium text-gray-700">
                {metricConfig.label}:{' '}
                <span className={cn(
                  trend === 'up' && 'text-green-600',
                  trend === 'down' && 'text-red-500',
                  trend === 'flat' && 'text-gray-500',
                )}>
                  {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
                </span>
              </span>
            </div>
            {average !== null && (
              <span className="text-sm text-gray-500">
                Avg: {average.toFixed(1)}{metricConfig.unit}
              </span>
            )}
            <span className="text-sm text-gray-400">
              {daysWithData} day{daysWithData !== 1 ? 's' : ''} logged
            </span>
          </div>

          {/* Bar Chart */}
          <div className="relative">
            <div className="flex items-end gap-px h-40">
              {data.map((day) => {
                const value = day[selectedMetric] as number | null;
                const heightPct = value !== null
                  ? (value / metricConfig.max) * 100
                  : 0;

                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap">
                        <p className="font-medium">{formatShortDate(day.date)}</p>
                        <p>
                          {value !== null
                            ? `${value}${metricConfig.unit}`
                            : 'No data'}
                        </p>
                        {day.completion > 0 && (
                          <p className="text-gray-400">{Math.round(day.completion)}% supplements</p>
                        )}
                      </div>
                    </div>

                    {/* Bar */}
                    <div className="w-full flex items-end h-32">
                      <div
                        className={cn(
                          'w-full rounded-t-sm transition-all duration-300',
                          value !== null ? metricConfig.color : 'bg-gray-100',
                          value !== null ? 'opacity-80 hover:opacity-100' : 'opacity-40',
                          'min-h-[2px]'
                        )}
                        style={{ height: value !== null ? `${Math.max(heightPct, 5)}%` : '4px' }}
                      />
                    </div>

                    {/* Date label - show for first, last, and every nth */}
                    {(data.length <= 14 || data.indexOf(day) % Math.ceil(data.length / 7) === 0) && (
                      <span className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">
                        {formatShortDate(day.date)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completion correlation */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Supplement Adherence
            </h4>
            <div className="flex items-end gap-px h-12">
              {data.map((day) => {
                const heightPct = Math.min(day.completion, 100);
                return (
                  <div key={day.date} className="flex-1 group relative">
                    <div className="absolute bottom-full mb-1 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap">
                        {Math.round(day.completion)}%
                      </div>
                    </div>
                    <div
                      className={cn(
                        'w-full rounded-t-sm transition-all',
                        day.completion >= 100
                          ? 'bg-green-400'
                          : day.completion >= 50
                          ? 'bg-green-300'
                          : day.completion > 0
                          ? 'bg-green-200'
                          : 'bg-gray-100',
                        'min-h-[2px]'
                      )}
                      style={{ height: `${Math.max(heightPct * 0.48, 2)}px` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

export default WellnessTrends;
