'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/app/components/ProductCard';
import { EnhancedSearchBar } from '@/components/composite/Search';
import { EmptyState, Spinner } from '@/components/ui';
import { buildProductDirectory } from '@/lib/catalog/product-directory';
import { HEALTH_GOAL_DEFINITIONS, healthGoalHref } from '@/lib/catalog/health-goal-directory';

function matches(term: string, ...fields: Array<string | undefined | null>): boolean {
  return fields.some((field) => field?.toLowerCase().includes(term));
}

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const [term, setTerm] = useState(query);

  const directory = useMemo(() => buildProductDirectory(), []);

  const normalized = query.toLowerCase();
  const productResults = useMemo(() => {
    if (!normalized) return [];
    return directory.products.filter((product) =>
      matches(
        normalized,
        product.product_name,
        product.product_description,
        product.brands?.brand_name,
        product.supplements?.supplement_name
      )
    );
  }, [directory.products, normalized]);

  const goalResults = useMemo(() => {
    if (!normalized) return [];
    return HEALTH_GOAL_DEFINITIONS.filter((goal) =>
      matches(normalized, goal.title, goal.shortTitle, goal.signalLabel)
    ).slice(0, 4);
  }, [normalized]);

  const submitSearch = (nextTerm: string) => {
    router.replace(`/search?q=${encodeURIComponent(nextTerm)}`);
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      <EnhancedSearchBar value={term} onChange={setTerm} onSubmit={submitSearch} />

      {!query ? (
        <div className="mt-10">
          <EmptyState
            title="Search SuppStack"
            description="Find supplements, products, brands, and health goals."
            size="lg"
          />
        </div>
      ) : (
        <div className="mt-6">
          <div className="section-header">
            <h2>Results for &ldquo;{query}&rdquo;</h2>
          </div>

          {goalResults.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {goalResults.map((goal) => (
                <Link
                  key={goal.id}
                  href={healthGoalHref(goal.id)}
                  className="inline-flex min-h-9 items-center rounded border border-gray-300 bg-white px-3 text-xs font-medium text-gray-900 transition-colors hover:border-gray-400 hover:bg-gray-50"
                >
                  {goal.title}
                </Link>
              ))}
            </div>
          )}

          {productResults.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-gray-500">
                {productResults.length.toLocaleString()} product
                {productResults.length === 1 ? '' : 's'}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {productResults.map((product) => (
                  <ProductCard key={product.product_id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title={`No results for "${query}"`}
              description="Check the spelling or try a broader term — brand, supplement, or goal."
              action={
                <Link
                  href="/products"
                  className="inline-flex min-h-11 items-center justify-center rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Browse all products
                </Link>
              }
              size="lg"
            />
          )}
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60dvh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
