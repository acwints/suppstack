'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiAlertCircle, FiShoppingCart, FiExternalLink, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { supabase } from '@/app/supabase';
import { useAuth } from '@/app/context/AuthContext';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import { cn } from '@/lib/design-system/utils';
import { fetchUserProductLinks } from '@/lib/account/user-products';
import { formatPrice } from '@/lib/utils';
import { DAYS_PER_MONTH } from '@/types';

export interface RestockRemindersProps {
  className?: string;
}

interface RestockItem {
  product_id: string;
  product_name: string;
  brand_name: string;
  product_price: number;
  servings_per_container: number;
  servings_per_day: number;
  amazon_url: string | null;
  product_url: string | null;
  days_supply: number;
  avg_daily_logs: number;
  days_until_restock: number;
  urgency: 'critical' | 'soon' | 'ok';
  start_date: string | null;
}

function calculateDaysSupply(
  servingsPerContainer: number,
  servingsPerDay: number,
  avgDailyLogs: number
): number {
  const effectiveDaily = Math.max(avgDailyLogs, servingsPerDay);
  if (effectiveDaily <= 0) return Infinity;
  return Math.floor(servingsPerContainer / effectiveDaily);
}

function getUrgency(daysRemaining: number): 'critical' | 'soon' | 'ok' {
  if (daysRemaining <= 5) return 'critical';
  if (daysRemaining <= 14) return 'soon';
  return 'ok';
}

export function RestockReminders({ className }: RestockRemindersProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<RestockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRestockData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch user's products with settings
      const [products, logsResult, settingsResult] = await Promise.all([
        fetchUserProductLinks<any>(
          user,
          `
            product_id,
            created_at,
            products (
              product_name, product_price, servings_per_container, servings_per_day,
              amazon_url, product_url,
              brands (brand_name)
            )
          `
        ),
        // Get last 30 days of logs to compute average daily usage
        supabase
          .from('supplement_logs')
          .select('product_id, log_date, servings_taken')
          .eq('user_id', user.id)
          .gte('log_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
        supabase
          .from('user_supplement_settings')
          .select('product_id, servings_per_day, start_date, status')
          .eq('user_id', user.id),
      ]);

      if (logsResult.error) throw logsResult.error;
      if (settingsResult.error) throw settingsResult.error;

      const logs = logsResult.data || [];
      const settings = settingsResult.data || [];

      // Compute average daily logs per product
      const dailyLogMap = new Map<string, { totalServings: number; uniqueDays: Set<string> }>();
      logs.forEach((log: any) => {
        const existing = dailyLogMap.get(log.product_id) || {
          totalServings: 0,
          uniqueDays: new Set<string>(),
        };
        existing.totalServings += log.servings_taken || 1;
        existing.uniqueDays.add(log.log_date);
        dailyLogMap.set(log.product_id, existing);
      });

      // Settings map
      const settingsMap = new Map<string, any>();
      settings.forEach((s: any) => {
        settingsMap.set(s.product_id, s);
      });

      const restockItems: RestockItem[] = products
        .map((item: any) => {
          const p = item.products;
          if (!p) return null;

          const setting = settingsMap.get(item.product_id);

          // Skip stopped supplements
          if (setting?.status === 'stopped') return null;

          // Days-supply math needs a verified container size; skip products
          // whose merchant listing doesn't state one rather than firing
          // false "restock now" alerts.
          if (!(p.servings_per_container > 0)) return null;

          const logData = dailyLogMap.get(item.product_id);
          const avgDailyLogs = logData && logData.uniqueDays.size > 0
            ? logData.totalServings / logData.uniqueDays.size
            : 0;

          const servingsPerDay = setting?.servings_per_day || p.servings_per_day || 1;
          const daysSupply = calculateDaysSupply(
            p.servings_per_container,
            servingsPerDay,
            avgDailyLogs
          );

          // Estimate days since start (from settings or when added)
          const startDate = setting?.start_date || item.created_at;
          const daysSinceStart = startDate
            ? Math.floor((Date.now() - new Date(startDate).getTime()) / (24 * 60 * 60 * 1000))
            : 0;

          const daysRemaining = Math.max(0, daysSupply - daysSinceStart);

          return {
            product_id: item.product_id,
            product_name: p.product_name,
            brand_name: p.brands?.brand_name || '',
            product_price: p.product_price,
            servings_per_container: p.servings_per_container,
            servings_per_day: servingsPerDay,
            amazon_url: p.amazon_url,
            product_url: p.product_url,
            days_supply: daysSupply,
            avg_daily_logs: avgDailyLogs,
            days_until_restock: daysRemaining,
            urgency: getUrgency(daysRemaining),
            start_date: startDate,
          };
        })
        .filter((item: RestockItem | null): item is RestockItem => item !== null)
        .sort((a: RestockItem, b: RestockItem) => a.days_until_restock - b.days_until_restock);

      setItems(restockItems);
    } catch (err) {
      console.error('Error fetching restock data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRestockData();
  }, [fetchRestockData]);

  if (!user) return null;

  const urgentItems = items.filter(i => i.urgency === 'critical' || i.urgency === 'soon');

  return (
    <Card variant="default" padding="md" className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-serif text-gray-900">Restock Reminders</h3>
        {urgentItems.length > 0 && (
          <Badge variant="warning" size="sm">
            {urgentItems.length} need{urgentItems.length === 1 ? 's' : ''} restock
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">No supplements in your stack.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.product_id}
              className={cn(
                'p-3 rounded-lg border transition-colors',
                item.urgency === 'critical'
                  ? 'border-red-200 bg-red-50'
                  : item.urgency === 'soon'
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-gray-100 bg-white'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.product_name}
                    </h4>
                    {item.urgency === 'critical' && (
                      <FiAlertCircle className="text-red-500 shrink-0" size={14} />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{item.brand_name}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs">
                      <FiClock size={11} className="text-gray-400" />
                      <span
                        className={cn(
                          'font-medium',
                          item.urgency === 'critical'
                            ? 'text-red-600'
                            : item.urgency === 'soon'
                            ? 'text-amber-600'
                            : 'text-gray-600'
                        )}
                      >
                        {item.days_until_restock === 0
                          ? 'Out of stock'
                          : `~${item.days_until_restock} days remaining`}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {item.days_supply} day supply
                    </span>
                  </div>

                  {/* Supply bar */}
                  <div className="mt-2 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        item.urgency === 'critical'
                          ? 'bg-red-500'
                          : item.urgency === 'soon'
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                      )}
                      style={{
                        width: `${Math.min(100, (item.days_until_restock / item.days_supply) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  {item.amazon_url && (
                    <a
                      href={item.amazon_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="text-xs">
                        <FiShoppingCart size={12} className="mr-1" />
                        Reorder
                      </Button>
                    </a>
                  )}
                  <span className="text-xs text-gray-500 text-center">
                    ${formatPrice(item.product_price)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default RestockReminders;
