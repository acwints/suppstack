'use client';

import { useCallback, useMemo } from 'react';
import { FiZap } from 'react-icons/fi';
import { computeLogStreak, getLocalDateKey } from '@/lib/utils';
import { EmptyState, Spinner, VStack, useToast } from '@/components/ui';
import {
  DailyLogCard,
  RestockReminders,
  WeeklyCalendar,
} from '@/components/composite/Tracking';
import { PremiumGate } from '@/components/composite/Billing';
import { MyStackSection } from '@/components/composite/Stack';
import {
  OverlapList,
  StackIngredientBreakdown,
  StackIntakeSummary,
} from '@/components/composite/Ingredients';
import { isScheduledOn, isoWeekday, useMyStack, useSupplementLogs, useStackIngredients } from '@/hooks';
import type { UserSupplementSettingsInput } from '@/types';

/**
 * The stack screen: check off today's supplements, see the week, and manage
 * the stack those check-offs come from.
 */
export default function StackPage() {
  const toast = useToast();
  const {
    stack,
    activeItems,
    todayItems,
    isLoading: isStackLoading,
    saveItemSettings,
    removeItem,
  } = useMyStack();
  const {
    intake,
    isLoading: isIntakeLoading,
    error: intakeError,
    refetch: refetchIntake,
  } = useStackIngredients();

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
    [logSupplement, toast]
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
    [unlogSupplement, toast]
  );

  // Settings and removals change the intake rollup (active status, servings)
  // and the app-wide "in your stack" markers, so refresh the shared context too.
  const handleSaveSettings = useCallback(
    async (input: UserSupplementSettingsInput) => {
      try {
        await saveItemSettings(input);
      } catch (error) {
        toast.error('Could not save those settings. Try again.');
        throw error;
      }
      void refetchIntake();
    },
    [saveItemSettings, refetchIntake, toast]
  );

  const handleRemove = useCallback(
    async (productId: string) => {
      try {
        await removeItem(productId);
      } catch (error) {
        console.error('Failed to remove product from stack:', error);
        toast.error('Could not remove that product. Try again.');
        return;
      }
      void refetchIntake();
    },
    [removeItem, refetchIntake, toast]
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
        getLocalDateKey(),
        (date) => activeItems.some((item) => isScheduledOn(item, isoWeekday(date)))
      ),
    [logs, activeItems]
  );

  const restockKey = stack
    .map((item) => `${item.product_id}:${item.settings.status}:${item.settings.servings_per_day}`)
    .join(',');

  if (isStackLoading && stack.length === 0) {
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

      <VStack gap={8}>
        {todayItems.length > 0 ? (
          <>
            <DailyLogCard
              items={todayItems}
              todayLogs={todayLogs}
              onLog={handleLog}
              onUnlog={handleUnlog}
              isLoading={isLogsLoading}
            />
            <WeeklyCalendar
              logs={logs}
              plannedCount={(weekday) =>
                activeItems.filter((item) => isScheduledOn(item, weekday)).length
              }
            />
          </>
        ) : activeItems.length > 0 ? (
          <EmptyState
            title="Nothing scheduled today"
            description="Your active supplements are scheduled for other days this week."
            variant="card"
          />
        ) : stack.length > 0 ? (
          <EmptyState
            title="No active supplements today"
            description="Paused products stay in your stack, but they don't count toward today's completion."
            variant="card"
          />
        ) : null}
        {stack.length > 0 && (
          <PremiumGate feature="restock">
            {/* Keyed on the stack so it refetches after settings or removals. */}
            <RestockReminders key={restockKey} />
          </PremiumGate>
        )}
        <MyStackSection
          items={stack}
          onSaveSettings={handleSaveSettings}
          onRemove={handleRemove}
        />

        {/* Ingredient intake rollup — only when the user has a stack,
            mirroring how the tracking cards gate on it. */}
        {stack.length > 0 && (
          <>
            {isIntakeLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" color="secondary" />
              </div>
            ) : intakeError ? null : intake.ingredientCount > 0 ? (
              <>
                <StackIntakeSummary intake={intake} />
                <PremiumGate
                  feature="ingredients"
                  teaser={`${intake.ingredientCount} ingredients across your stack, with every dose.`}
                >
                  <StackIngredientBreakdown intake={intake} />
                </PremiumGate>
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
      </VStack>
    </main>
  );
}
