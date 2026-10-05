import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { supplementCatalog } from '@/lib/catalog/supplement-catalog';
import { buildHealthGoalDirectory, healthGoalHref } from '@/lib/catalog/health-goal-directory';
import { HEALTH_GOAL_ICONS } from '@/lib/catalog/health-goal-icons';
import { isRemoteImageSrc } from '@/lib/catalog/product-image';
import { formatCurrency } from '@/lib/utils';

export default function HealthPage() {
  const goals = buildHealthGoalDirectory(supplementCatalog);

  return (
    <main className="min-h-screen bg-white">
      <section className="container-custom py-6 sm:py-8">
        <div className="section-header">
          <h1 className="font-serif text-3xl text-gray-900">Shop by Goal</h1>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {goals.map((goal) => {
            const GoalIcon = HEALTH_GOAL_ICONS[goal.id];
            return (
              <Link
                key={goal.id}
                href={healthGoalHref(goal.id)}
                className="group flex flex-col rounded border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded border border-gray-200 bg-white text-gray-700">
                    <GoalIcon size={18} />
                  </span>
                  <FiArrowRight className="mt-1 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-gray-900">{goal.title}</h2>

                <div className="mt-3 grid grid-cols-4 gap-1.5">
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
                          unoptimized={isRemoteImageSrc(supplement.image_url)}
                        />
                      )}
                    </span>
                  ))}
                </div>

                <p className="mt-auto pt-3 text-sm text-gray-700">
                  {goal.productCount} products
                  {goal.priceFrom !== null && (
                    <span className="font-semibold text-gray-900">
                      {' '}from {formatCurrency(goal.priceFrom)}
                    </span>
                  )}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
