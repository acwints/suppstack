import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { AppleHealthCard } from '@/components/composite/Health';
import { HEALTH_GOAL_DEFINITIONS, healthGoalHref } from '@/lib/catalog/health-goal-directory';
import { HEALTH_GOAL_ICONS } from '@/lib/catalog/health-goal-icons';

export const metadata = {
  title: 'Apple Health | SuppStack AI',
  description: 'Connect Apple Health to see sleep, weight, and activity next to your stack.',
};

export default function AppleHealthPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="container-custom max-w-3xl py-6 sm:py-8">
        <div className="section-header">
          <h1 className="font-serif text-3xl text-gray-900">Apple Health</h1>
        </div>
        <p className="mb-6 text-sm text-gray-500">
          Your sleep, weight, and activity next to your stack.
        </p>

        <AppleHealthCard />

        <div className="mt-8">
          <div className="section-header">
            <h2>Shop by goal</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {HEALTH_GOAL_DEFINITIONS.map((goal) => {
              const GoalIcon = HEALTH_GOAL_ICONS[goal.id];
              return (
                <Link
                  key={goal.id}
                  href={healthGoalHref(goal.id)}
                  className="group flex items-center justify-between gap-3 rounded border border-gray-200 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded border border-gray-200 text-gray-700">
                      <GoalIcon />
                    </span>
                    <span className="font-medium text-gray-900">{goal.title}</span>
                  </span>
                  <FiArrowRight className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
