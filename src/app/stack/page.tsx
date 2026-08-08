'use client';

import { useCallback, useMemo } from 'react';
import { FiZap } from 'react-icons/fi';
import { useSupplementLogs } from '@/hooks/useSupplementLogs';
import { computeLogStreak, getLocalDateKey } from '@/lib/utils';
import { useRegimen } from '@/hooks/useRegimen';
import { EmptyState, Spinner, Stack, useToast } from '@/components/ui';
import {
  DailyLogCard,
  RestockReminders,
  WeeklyCalendar,
} from '@/components/composite/Tracking';
import { MyStackSection } from '@/components/composite/Stack/MyStackSection';
import {
  OverlapList,
  StackIngredientBreakdown,
  StackIntakeSummary,
} from '@/components/composite/Ingredients';
import { useStackIngredientsContext } from '@/app/context/StackIngredientsContext';

/**
 * The stack screen: check off today's supplements, see the week, and manage
 * the stack those check-offs come from.
 */
export default function StackPage() {
  const toast = useToast();
  const { regimen, activeRegimen, isLoading: isRegimenLoading } = useRegimen();
  const {
    intake,
    isLoading: isIntakeLoading,
    error: intakeError,
  } = useStackIngredientsContext();

  const {
    logs,
    todayLogs,
    isLoading: isLogsLoading,
    logSupplement,
    unlogSupplement,
  } = useSupplementLogs();

  const handleLog = useCallback(
    async (productId: string) => {
      try {
        await logSupplement({ product_id: productId });
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

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const streak = useMemo(
    () =>
      computeLogStreak(
        logs.map((log) => log.log_date),
        getLocalDateKey()
      ),
    [logs]
  );

  if (isRegimenLoading && regimen.length === 0) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Spinner size="lg" color="secondary" />
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-6 sm:py-8">
      {/* Today hero — the daily ritual leads; stack management follows below. */}
      <header className="mb-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl lg:text-4xl">Today</h1>
          <p className="mt-1 text-sm text-gray-500">{todayLabel}</p>
        </div>
        {streak >= 2 && (
          <p className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent-50 px-2.5 py-1.5 text-sm font-medium text-accent-800">
            <FiZap size={15} className="text-accent-600" aria-hidden="true" />
            {streak >= 30 ? '30+' : streak}-day streak
          </p>
        )}
      </header>

      <Stack gap={8}>
        {activeRegimen.length > 0 ? (
          <>
            <DailyLogCard
              regimen={activeRegimen}
              todayLogs={todayLogs}
              onLog={handleLog}
              onUnlog={handleUnlog}
              isLoading={isLogsLoading}
            />
            <WeeklyCalendar logs={logs} plannedCount={activeRegimen.length} />
          </>
        ) : regimen.length > 0 ? (
          <EmptyState
            title="No active supplements today"
            description="Paused products stay in your stack, but they don't count toward today's completion."
            variant="card"
          />
        ) : null}
        {regimen.length > 0 && (
          <RestockReminders />
        )}
        <MyStackSection regimen={regimen} />

        {/* Ingredient intake rollup — only when the user has an active stack,
            mirroring how the tracking cards gate on the regimen. */}
        {regimen.length > 0 && (
          <>
            {isIntakeLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" color="secondary" />
              </div>
            ) : intakeError ? null : intake.ingredientCount > 0 ? (
              <>
                <StackIntakeSummary intake={intake} />
                <StackIngredientBreakdown intake={intake} />
                <OverlapList intake={intake} />
              </>
            ) : (
              <EmptyState
                title="No ingredient breakdown yet"
                description="Once your stacked products have ingredient details, you'll see a per-ingredient breakdown and overlaps here."
                variant="card"
              />
            )}
          </>
        )}
      </Stack>
    </main>
  );
}
