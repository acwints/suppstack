'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useSupplementLogs } from '@/hooks/useSupplementLogs';
import { fetchUserProductLinks } from '@/lib/account/user-products';
import { EmptyState, Spinner, Stack, useToast } from '@/components/ui';
import { DailyLogCard, DailyWellnessCard, WeeklyCalendar } from '@/components/composite/Tracking';
import type { DailyWellnessInput, RegimenItem, TimeOfDay } from '@/types';

const REGIMEN_SELECT = `
  product_id,
  products (
    product_name, product_description, product_price,
    servings_per_container, servings_per_day,
    brands (brand_name),
    supplements (supplement_name)
  )
`;

export default function LogPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [regimen, setRegimen] = useState<RegimenItem[]>([]);
  const [isRegimenLoading, setIsRegimenLoading] = useState(true);

  const {
    logs,
    todayLogs,
    dailySummary,
    isLoading: isLogsLoading,
    logSupplement,
    unlogSupplement,
    saveWellnessData,
  } = useSupplementLogs();

  const fetchRegimen = useCallback(async () => {
    if (!user) return;
    setIsRegimenLoading(true);
    try {
      const data = await fetchUserProductLinks<any>(user, REGIMEN_SELECT);
      const mapped: RegimenItem[] = (data || []).map((item: any) => ({
        product_id: item.product_id,
        products: {
          product_name: item.products?.product_name || '',
          product_description: item.products?.product_description || '',
          product_price: item.products?.product_price || 0,
          servings_per_container: item.products?.servings_per_container || 0,
          servings_per_day: item.products?.servings_per_day || 0,
          brands: { brand_name: item.products?.brands?.brand_name || '' },
          supplements: { supplement_name: item.products?.supplements?.supplement_name || '' },
        },
      }));
      setRegimen(mapped);
    } catch (error) {
      console.error('Error fetching regimen:', error);
      toast.error('Could not load your stack. Pull down or retry in a moment.');
    } finally {
      setIsRegimenLoading(false);
    }
    // `toast` is intentionally omitted: useToast() returns a new object per
    // render, and depending on it would refetch (and re-toast) in a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    fetchRegimen();
  }, [fetchRegimen]);

  const handleLog = useCallback(
    async (productId: string, timeOfDay?: TimeOfDay) => {
      try {
        await logSupplement({ product_id: productId, time_of_day: timeOfDay });
      } catch (error) {
        console.error('Failed to log supplement:', error);
        toast.error('Could not save that log. Try again.');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logSupplement]
  );

  const handleUnlog = useCallback(
    async (logId: string) => {
      try {
        await unlogSupplement(logId);
      } catch (error) {
        console.error('Failed to remove log:', error);
        toast.error('Could not remove that log. Try again.');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unlogSupplement]
  );

  const handleSaveWellness = useCallback(
    async (data: DailyWellnessInput) => {
      try {
        await saveWellnessData(data);
        toast.success('Check-in saved');
      } catch (error) {
        console.error('Failed to save wellness data:', error);
        toast.error('Could not save your check-in. Try again.');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [saveWellnessData]
  );

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (isRegimenLoading && regimen.length === 0) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="section-header">
        <h2>Daily Log</h2>
      </div>
      <p className="mb-6 text-sm text-gray-500">{todayLabel}</p>

      {regimen.length === 0 ? (
        <EmptyState
          title="Nothing to log yet"
          description="Add supplements to your stack and they'll show up here for one-tap daily logging."
          action={
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
            >
              Browse supplements
            </Link>
          }
          size="lg"
        />
      ) : (
        <Stack gap={6}>
          <DailyLogCard
            regimen={regimen}
            todayLogs={todayLogs}
            onLog={handleLog}
            onUnlog={handleUnlog}
            isLoading={isLogsLoading}
          />
          <WeeklyCalendar logs={logs} plannedCount={regimen.length} />
          <DailyWellnessCard
            dailySummary={dailySummary}
            onSave={handleSaveWellness}
            isLoading={isLogsLoading}
          />
        </Stack>
      )}
    </main>
  );
}
