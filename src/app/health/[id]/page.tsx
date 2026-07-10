import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import ProductCard from '@/app/components/ProductCard';
import {
  HEALTH_GOAL_DEFINITIONS,
  findHealthGoalDirectoryItem,
} from '@/lib/catalog/health-goal-directory';
import { isRemoteImageSrc } from '@/lib/catalog/product-image';
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
      <section className="container-custom py-6 sm:py-8">
        <Link
          href="/health"
          className="mb-4 hidden min-h-10 items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 md:inline-flex"
        >
          <FiArrowLeft />
          <span>All goals</span>
        </Link>

        <div className="section-header">
          <h1 className="font-serif text-3xl text-gray-900">{goal.title}</h1>
        </div>
        <p className="mb-8 max-w-3xl text-sm text-gray-500">{goal.description}</p>

        <div className="space-y-10">
          <section>
            <div className="section-header">
              <h2>Ingredients</h2>
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
                        unoptimized={isRemoteImageSrc(supplement.image_url)}
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
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-2">
              <div className="section-header !mb-0">
                <h2>Products</h2>
              </div>
              <Link
                href={`/products?goal=${goal.id}`}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                View all {goal.productCount}
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
            treat, or replace medical advice.
          </p>
        </div>
      </section>
    </main>
  );
}
