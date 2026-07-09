'use client';

import { useCallback } from 'react';
import { useSupplementLogs } from '@/hooks/useSupplementLogs';
import { useRegimen } from '@/hooks/useRegimen';
import { Spinner, Stack, useToast } from '@/components/ui';
import { DailyLogCard, DailyWellnessCard, WeeklyCalendar } from '@/components/composite/Tracking';
import { MyStackSection } from '@/components/composite/Stack/MyStackSection';
import type { DailyWellnessInput, TimeOfDay } from '@/types';

/**
 * The daily habit screen: log today's supplements, see the week, check in
 * on wellness — and manage the stack those logs come from.
 */
export default function LogPage() {
  const toast = useToast();
  const { regimen, isLoading: isRegimenLoading } = useRegimen();

  const {
    logs,
    todayLogs,
    dailySummary,
    isLoading: isLogsLoading,
    logSupplement,
    unlogSupplement,
    saveWellnessData,
  } = useSupplementLogs();

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
        <Spinner size="lg" color="secondary" />
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="section-header">
        <h2>Daily Log</h2>
      </div>
      <p className="mb-6 text-sm text-gray-500">{todayLabel}</p>

      <Stack gap={8}>
        {regimen.length > 0 && (
          <>
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
          </>
        )}
        <MyStackSection regimen={regimen} />
      </Stack>
    </main>
  );
}
