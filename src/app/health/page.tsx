import Image from 'next/image';
import Link from 'next/link';
import { FiActivity, FiArrowRight, FiCpu, FiMoon, FiTrendingUp } from 'react-icons/fi';
import { TbScaleOutline } from 'react-icons/tb';
import { supplementCatalog } from '@/lib/catalog/supplement-catalog';
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

  return (
    <main className="min-h-screen bg-white">
      <section className="container-custom py-6 sm:py-8">
        <div className="section-header">
          <h1 className="font-serif text-3xl text-gray-900">Shop by Goal</h1>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {goals.map((goal) => (
            <Link
              key={goal.id}
              href={healthGoalHref(goal.id)}
              className="group flex flex-col rounded border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded border border-gray-200 bg-white text-gray-700">
                  {goalIcons[goal.id]}
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
                      />
                    )}
                  </span>
                ))}
              </div>

              <p className="mt-auto pt-3 text-sm text-gray-700">
                {goal.productCount} products
                {goal.priceFrom !== null && (
                  <span className="font-semibold text-gray-900">
                    {' '}from ${formatPrice(goal.priceFrom)}
                  </span>
                )}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
