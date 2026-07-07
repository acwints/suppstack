import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiCpu } from 'react-icons/fi';
import ProductCard from '@/app/components/ProductCard';
import { Badge } from '@/components/ui';
import {
  HEALTH_GOAL_DEFINITIONS,
  findHealthGoalDirectoryItem,
} from '@/lib/catalog/health-goal-directory';
import { formatPrice } from '@/lib/utils';

export function generateStaticParams() {
  return HEALTH_GOAL_DEFINITIONS.map((goal) => ({ id: goal.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const goal = findHealthGoalDirectoryItem(params.id);
  if (!goal) return {};

  return {
    title: `${goal.title} Supplements | SuppStack AI`,
    description: goal.description,
  };
}

export default function HealthGoalPage({ params }: { params: { id: string } }) {
  const goal = findHealthGoalDirectoryItem(params.id);
  if (!goal) notFound();

  const featuredProducts = [...goal.products].sort((a, b) => {
    if (a.ucp_enabled !== b.ucp_enabled) return a.ucp_enabled ? -1 : 1;
    return a.product_price - b.product_price;
  });

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-gray-200">
        <div className="container-custom py-8 lg:py-12">
          <Link
            href="/health"
            className="mb-6 inline-flex min-h-10 items-center gap-2 rounded border border-gray-200 px-3 text-sm text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
          >
            <FiArrowLeft />
            <span>Health directory</span>
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="info">Health signal shelf</Badge>
                <Badge variant="secondary">{goal.signalLabel}</Badge>
              </div>
              <h1 className="font-serif text-4xl leading-tight text-gray-900 lg:text-5xl">
                {goal.title}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">
                {goal.description}
              </p>
              <p className="mt-4 max-w-3xl text-base leading-7 text-gray-500">
                {goal.commerceAngle}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded border border-gray-200 p-4">
                <p className="text-2xl font-semibold text-gray-900">{goal.supplements.length}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Ingredients
                </p>
              </div>
              <div className="rounded border border-gray-200 p-4">
                <p className="text-2xl font-semibold text-gray-900">{goal.productCount}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Products
                </p>
              </div>
              <div className="rounded border border-gray-200 p-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {goal.priceFrom !== null ? `$${formatPrice(goal.priceFrom)}` : '-'}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  From
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-custom grid gap-8 py-10 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="space-y-4">
          <div className="rounded border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              <FiCpu />
              AI routing logic
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-600">{goal.aiUseCase}</p>
          </div>

          <div className="rounded border border-gray-200 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Health signals
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {goal.signalMetrics.map((metric) => (
                <span
                  key={metric}
                  className="rounded border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600"
                >
                  {metric}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded border border-gray-200 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Routine experiments
            </h2>
            <div className="mt-3 space-y-3">
              {goal.routineIdeas.map((idea) => (
                <div key={idea} className="flex items-start gap-2 text-sm leading-6 text-gray-600">
                  <FiCheckCircle className="mt-1 shrink-0 text-green-600" />
                  <span>{idea}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/health/tracker"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
          >
            Connect Apple Health
            <FiArrowRight />
          </Link>
        </aside>

        <div className="space-y-10">
          <section>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-serif text-3xl text-gray-900">Ingredient map</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Start with the ingredient category, then compare products inside it.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {goal.supplements.map((supplement) => (
                <Link
                  key={supplement.supplement_id}
                  href={`/supplement/${supplement.supplement_id}`}
                  className="group flex gap-3 rounded border border-gray-200 p-3 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-gray-100 bg-white">
                    {supplement.image_url && (
                      <Image
                        src={supplement.image_url}
                        alt={supplement.supplement_name}
                        fill
                        className="object-contain p-1.5"
                        sizes="64px"
                      />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-gray-900 group-hover:underline">
                      {supplement.supplement_name}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-gray-500">
                      {supplement.product_count ?? 0} products
                      {typeof supplement.lowest_price === 'number' &&
                        ` from $${formatPrice(supplement.lowest_price)}`}
                    </span>
                    {supplement.evidence_rating && (
                      <span className="mt-1 block text-xs capitalize text-gray-400">
                        {supplement.evidence_rating} evidence
                      </span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-serif text-3xl text-gray-900">Product shelf</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Commerce-ready picks sorted toward direct checkout and lower entry price.
                </p>
              </div>
              <Link
                href={`/products?goal=${goal.id}`}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                View all {goal.productCount} products
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featuredProducts.slice(0, 12).map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          </section>

          <p className="rounded border border-gray-200 bg-gray-50 p-4 text-xs leading-5 text-gray-500">
            SuppStack shelves are for education and commerce discovery. They do not diagnose,
            treat, or replace medical advice. Review medications, pregnancy, medical conditions,
            and lab needs with a qualified professional.
          </p>
        </div>
      </section>
    </main>
  );
}
