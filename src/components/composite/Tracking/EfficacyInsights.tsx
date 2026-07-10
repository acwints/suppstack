'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiInfo } from 'react-icons/fi';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import { Card, Spinner, Badge } from '@/components/ui';
import { cn } from '@/lib/design-system/utils';
import { fetchUserProductLinks } from '@/lib/account/user-products';

export interface EfficacyInsightsProps {
  className?: string;
}

interface SupplementCorrelation {
  product_id: string;
  product_name: string;
  supplement_name: string;
  days_taken: number;
  days_skipped: number;
  avg_mood_on: number | null;
  avg_mood_off: number | null;
  avg_energy_on: number | null;
  avg_energy_off: number | null;
  avg_sleep_on: number | null;
  avg_sleep_off: number | null;
  mood_impact: number;
  energy_impact: number;
  sleep_impact: number;
}

function computeImpactLabel(impact: number): { label: 'Positive' | 'Neutral' | 'Negative'; color: string } {
  if (impact > 0.2) return { label: 'Positive', color: 'text-green-600' };
  if (impact < -0.2) return { label: 'Negative', color: 'text-red-600' };
  return { label: 'Neutral', color: 'text-gray-500' };
}

export function EfficacyInsights({ className }: EfficacyInsightsProps) {
  const { user } = useAuth();
  const [insights, setInsights] = useState<SupplementCorrelation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasEnoughData, setHasEnoughData] = useState(true);
  const [hasEnoughContrast, setHasEnoughContrast] = useState(true);

  const fetchInsights = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get last 30 days of logs and wellness data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];

      const [logsResult, summariesResult, products] = await Promise.all([
        supabase
          .from('supplement_logs')
          .select('product_id, log_date')
          .eq('user_id', user.id)
          .gte('log_date', startDate),
        supabase
          .from('daily_tracking_summary')
          .select('summary_date, overall_mood, overall_energy, sleep_quality')
          .eq('user_id', user.id)
          .gte('summary_date', startDate),
        fetchUserProductLinks<any>(
          user,
          'product_id, products(product_name, supplements(supplement_name))'
        ),
      ]);

      if (logsResult.error) throw logsResult.error;
      if (summariesResult.error) throw summariesResult.error;

      const logs = logsResult.data || [];
      const summaries = summariesResult.data || [];

      if (summaries.length < 14) {
        setHasEnoughData(false);
        setHasEnoughContrast(true);
        setInsights([]);
        setIsLoading(false);
        return;
      }

      setHasEnoughData(true);
      setHasEnoughContrast(true);

      if (products.length === 0) {
        setInsights([]);
        setIsLoading(false);
        return;
      }

      // Build a map of dates to wellness metrics
      const wellnessMap = new Map<string, { mood: number | null; energy: number | null; sleep: number | null }>();
      summaries.forEach((s: any) => {
        wellnessMap.set(s.summary_date, {
          mood: s.overall_mood,
          energy: s.overall_energy,
          sleep: s.sleep_quality,
        });
      });

      // Build a map of which products were taken on which dates
      const productDates = new Map<string, Set<string>>();
      logs.forEach((log: any) => {
        const dates = productDates.get(log.product_id) || new Set<string>();
        dates.add(log.log_date);
        productDates.set(log.product_id, dates);
      });

      // Compute correlation for each product
      const correlations: SupplementCorrelation[] = products.map((p: any) => {
        const takenDates = productDates.get(p.product_id) || new Set<string>();
        const daysTaken = takenDates.size;

        const moodOn: number[] = [];
        const moodOff: number[] = [];
        const energyOn: number[] = [];
        const energyOff: number[] = [];
        const sleepOn: number[] = [];
        const sleepOff: number[] = [];

        wellnessMap.forEach((wellness, date) => {
          const taken = takenDates.has(date);
          if (wellness.mood !== null) {
            if (taken) moodOn.push(wellness.mood);
            else moodOff.push(wellness.mood);
          }
          if (wellness.energy !== null) {
            if (taken) energyOn.push(wellness.energy);
            else energyOff.push(wellness.energy);
          }
          if (wellness.sleep !== null) {
            if (taken) sleepOn.push(wellness.sleep);
            else sleepOff.push(wellness.sleep);
          }
        });

        const avg = (arr: number[]): number | null =>
          arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

        const avgMoodOn = avg(moodOn);
        const avgMoodOff = avg(moodOff);
        const avgEnergyOn = avg(energyOn);
        const avgEnergyOff = avg(energyOff);
        const avgSleepOn = avg(sleepOn);
        const avgSleepOff = avg(sleepOff);

        return {
          product_id: p.product_id,
          product_name: p.products?.product_name || 'Unknown',
          supplement_name: p.products?.supplements?.supplement_name || '',
          days_taken: daysTaken,
          days_skipped: summaries.length - daysTaken,
          avg_mood_on: avgMoodOn,
          avg_mood_off: avgMoodOff,
          avg_energy_on: avgEnergyOn,
          avg_energy_off: avgEnergyOff,
          avg_sleep_on: avgSleepOn,
          avg_sleep_off: avgSleepOff,
          mood_impact:
            avgMoodOn !== null && avgMoodOff !== null ? avgMoodOn - avgMoodOff : 0,
          energy_impact:
            avgEnergyOn !== null && avgEnergyOff !== null ? avgEnergyOn - avgEnergyOff : 0,
          sleep_impact:
            avgSleepOn !== null && avgSleepOff !== null ? avgSleepOn - avgSleepOff : 0,
        };
      });

      const qualifiedCorrelations = correlations.filter(
        (correlation) => correlation.days_taken >= 3 && correlation.days_skipped >= 3
      );

      if (qualifiedCorrelations.length === 0) {
        setHasEnoughContrast(false);
        setInsights([]);
        setIsLoading(false);
        return;
      }

      // Sort by strongest directional correlation.
      qualifiedCorrelations.sort(
        (a, b) =>
          Math.abs(b.mood_impact) + Math.abs(b.energy_impact) + Math.abs(b.sleep_impact) -
          (Math.abs(a.mood_impact) + Math.abs(a.energy_impact) + Math.abs(a.sleep_impact))
      );

      setInsights(qualifiedCorrelations);
    } catch (err) {
      console.error('Error computing efficacy insights:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (!user) return null;

  return (
    <Card variant="default" padding="md" className={className}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-serif text-gray-900">Supplement Insights</h3>
        <div className="group relative">
          <FiInfo className="text-gray-400 cursor-help" size={16} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 hidden group-hover:block z-10">
            Correlates wellness entries with taken and skipped days. This does not imply causation.
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="md" />
        </div>
      ) : !hasEnoughData ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            Need at least 14 days of wellness data to generate insights.
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Keep logging your mood, energy, and sleep daily.
          </p>
        </div>
      ) : !hasEnoughContrast ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            Not enough taken and skipped days to show product correlations yet.
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Each product needs at least 3 taken days and 3 skipped days.
          </p>
        </div>
      ) : insights.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No supplements in your stack yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => {
            const moodImpact = computeImpactLabel(insight.mood_impact);
            const energyImpact = computeImpactLabel(insight.energy_impact);
            const sleepImpact = computeImpactLabel(insight.sleep_impact);

            return (
              <div
                key={insight.product_id}
                className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {insight.product_name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {insight.supplement_name}
                    </p>
                  </div>
                  <Badge variant="secondary" size="sm">
                    {insight.days_taken} taken / {insight.days_skipped} skipped
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Mood Impact */}
                  <div className="text-center p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {insight.mood_impact > 0.2 ? (
                        <FiTrendingUp className="text-green-500" size={12} />
                      ) : insight.mood_impact < -0.2 ? (
                        <FiTrendingDown className="text-red-500" size={12} />
                      ) : (
                        <FiMinus className="text-gray-400" size={12} />
                      )}
                      <span className="text-xs font-medium text-gray-600">Mood</span>
                    </div>
                    <p className={cn('text-xs font-medium', moodImpact.color)}>
                      {moodImpact.label}
                    </p>
                  </div>

                  {/* Energy Impact */}
                  <div className="text-center p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {insight.energy_impact > 0.2 ? (
                        <FiTrendingUp className="text-green-500" size={12} />
                      ) : insight.energy_impact < -0.2 ? (
                        <FiTrendingDown className="text-red-500" size={12} />
                      ) : (
                        <FiMinus className="text-gray-400" size={12} />
                      )}
                      <span className="text-xs font-medium text-gray-600">Energy</span>
                    </div>
                    <p className={cn('text-xs font-medium', energyImpact.color)}>
                      {energyImpact.label}
                    </p>
                  </div>

                  {/* Sleep Impact */}
                  <div className="text-center p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {insight.sleep_impact > 0.2 ? (
                        <FiTrendingUp className="text-green-500" size={12} />
                      ) : insight.sleep_impact < -0.2 ? (
                        <FiTrendingDown className="text-red-500" size={12} />
                      ) : (
                        <FiMinus className="text-gray-400" size={12} />
                      )}
                      <span className="text-xs font-medium text-gray-600">Sleep</span>
                    </div>
                    <p className={cn('text-xs font-medium', sleepImpact.color)}>
                      {sleepImpact.label}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <p className="text-xs text-gray-400 text-center pt-2">
            Correlations are based on your last 30 days of data and do not imply causation.
          </p>
        </div>
      )}
    </Card>
  );
}

export default EfficacyInsights;
