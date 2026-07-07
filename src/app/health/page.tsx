import Image from 'next/image';
import Link from 'next/link';
import { FiActivity, FiArrowRight, FiCpu, FiMoon, FiTrendingUp } from 'react-icons/fi';
import { TbScaleOutline } from 'react-icons/tb';
import { getCuratedCatalogProducts, supplementCatalog } from '@/lib/catalog/supplement-catalog';
import {
  buildHealthGoalDirectory,
  healthGoalHref,
  type HealthGoalId,
} from '@/lib/catalog/health-goal-directory';
import { formatPrice } from '@/lib/utils';

const goalIcons: Record<HealthGoalId, JSX.Element> = {
  'sleep-recovery': <FiMoon size={18} />,
  'body-composition': <TbScaleOutline size={19} />,
  'training-output': <FiActivity size={18} />,
  'metabolic-health': <FiTrendingUp size={18} />,
  'daily-foundation': <FiCpu size={18} />,
};

export default function HealthDirectoryPage() {
  const goals = buildHealthGoalDirectory(supplementCatalog);
  const products = getCuratedCatalogProducts();
  const purchasableGoals = goals.filter((goal) => goal.productCount > 0).length;

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-gray-200">
        <div className="container-custom py-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Health Signal Directory
              </p>
              <h1 className="font-serif text-4xl leading-tight text-gray-900 lg:text-5xl">
                Shop supplements by the health signals they are meant to support.
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600">
                Sleep, body composition, active calories, recovery, and daily adherence become
                browsable shelves instead of isolated product searches.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded border border-gray-200 p-4">
                <p className="text-2xl font-semibold text-gray-900">{purchasableGoals}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Health shelves
                </p>
              </div>
              <div className="rounded border border-gray-200 p-4">
                <p className="text-2xl font-semibold text-gray-900">{supplementCatalog.length}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Supplement groups
                </p>
              </div>
              <div className="rounded border border-gray-200 p-4">
                <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Curated products
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-custom py-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {goals.map((goal) => (
            <Link
              key={goal.id}
              href={healthGoalHref(goal.id)}
              className="group flex min-h-[320px] flex-col rounded border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded border border-gray-200 bg-white text-gray-700">
                  {goalIcons[goal.id]}
                </span>
                <FiArrowRight className="mt-1 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-gray-900">{goal.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">{goal.description}</p>

              <div className="mt-4 grid grid-cols-4 gap-1.5">
                {goal.supplements.slice(0, 4).map((supplement) => (
                  <span
                    key={supplement.supplement_id}
                    className="relative aspect-square overflow-hidden rounded border border-gray-100 bg-white"
                  >
                    {supplement.image_url && (
                      <Image
                        src={supplement.image_url}
                        alt={supplement.supplement_name}
                        fill
                        className="object-contain p-1.5"
                        sizes="80px"
                      />
                    )}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {goal.signalLabel}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {goal.productCount} products
                  {goal.priceFrom !== null && (
                    <span className="font-semibold text-gray-900">
                      {' '}from ${formatPrice(goal.priceFrom)}
                    </span>
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="container-custom grid gap-8 py-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              AI + Apple Health
            </p>
            <h2 className="mt-3 font-serif text-3xl text-gray-900">
              The directory becomes personal when health data is connected.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              'Sleep and recovery gaps move calm, magnesium, glycine, and routine support up the shelf.',
              'Weight and body-fat trends emphasize protein, fiber, hydration, and lean-mass staples.',
              'Active calories and steps shift the shopping path toward electrolytes, creatine, and recovery.',
              'Sparse or mixed data keeps the AI conservative: simple daily essentials, one experiment at a time.',
            ].map((item) => (
              <div key={item} className="rounded border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-600">
                {item}
              </div>
            ))}
          </div>
          <div className="lg:col-start-2">
            <Link
              href="/health/tracker"
              className="inline-flex h-11 items-center justify-center gap-2 rounded bg-gray-900 px-5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Connect health data
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
