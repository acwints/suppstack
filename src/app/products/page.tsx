import Link from 'next/link';
import { FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { ProductDirectoryClient } from '@/components/composite/Product';
import { buildProductDirectory } from '@/lib/catalog/product-directory';

export default function ProductsPage({
  searchParams,
}: {
  searchParams?: { goal?: string };
}) {
  const directory = buildProductDirectory();

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-gray-200">
        <div className="container-custom py-8 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                <FiShoppingBag />
                Product Directory
              </div>
              <h1 className="font-serif text-4xl leading-tight text-gray-900 lg:text-5xl">
                Browse every commerce-ready product in SuppStack.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">
                The ingredient shop stays simple; this directory opens the full catalog by health
                signal, brand, category, price, and direct-checkout readiness.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <div className="rounded border border-gray-200 p-4">
                <p className="text-2xl font-semibold text-gray-900">{directory.productCount}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Products
                </p>
              </div>
              <div className="rounded border border-gray-200 p-4">
                <p className="text-2xl font-semibold text-gray-900">{directory.brandCount}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Brands
                </p>
              </div>
              <div className="rounded border border-gray-200 p-4">
                <p className="text-2xl font-semibold text-gray-900">{directory.categoryCount}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Categories
                </p>
              </div>
              <div className="rounded border border-gray-200 p-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {directory.directCheckoutCount}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Direct checkout
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {directory.healthGoals.map((goal) => (
              <Link
                key={goal.id}
                href={`/products?goal=${goal.id}`}
                className="inline-flex h-9 items-center gap-2 rounded border border-gray-200 px-3 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
              >
                {goal.title}
                <span className="text-gray-400">{goal.productCount}</span>
              </Link>
            ))}
            <Link
              href="/health/tracker"
              className="inline-flex h-9 items-center gap-2 rounded border border-gray-200 px-3 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
            >
              Health tracker
              <FiArrowRight />
            </Link>
            <Link
              href="/health"
              className="inline-flex h-9 items-center gap-2 rounded border border-gray-900 bg-gray-900 px-3 text-xs font-medium text-white hover:bg-gray-800"
            >
              Health directory
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="container-custom py-8">
        <ProductDirectoryClient
          products={directory.products}
          healthGoals={directory.healthGoals}
          commerceShelves={directory.commerceShelves}
          supplementCoverage={directory.supplementCoverage}
          categoryCoverage={directory.categoryCoverage}
          initialGoalId={searchParams?.goal}
        />
      </section>
    </main>
  );
}
