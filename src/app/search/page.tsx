'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiArrowRight, FiHash, FiTag } from 'react-icons/fi';
import ProductCard from '@/app/components/ProductCard';
import { EnhancedSearchBar } from '@/components/composite/Search';
import { EmptyState, Spinner } from '@/components/ui';
import { buildProductDirectory } from '@/lib/catalog/product-directory';
import { buildCatalogSearchIndex, searchCatalog } from '@/lib/catalog/catalog-search';
import { BrandLogo } from '@/components/composite/Brand';

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const [term, setTerm] = useState(query);

  const directory = useMemo(() => buildProductDirectory(), []);
  const searchIndex = useMemo(() => buildCatalogSearchIndex(directory), [directory]);

  const results = useMemo(
    () =>
      query
        ? searchCatalog(query, searchIndex, {
            goalLimit: 4,
            supplementLimit: 8,
            brandLimit: 6,
            productLimit: 240,
          })
        : [],
    [query, searchIndex]
  );
  const goalResults = results.filter((result) => result.type === 'goal');
  const brandResults = results.filter((result) => result.type === 'brand');
  const supplementResults = results.filter(
    (result) => result.type === 'supplement' || result.type === 'peptide'
  );
  const productResults = results
    .filter((result) => result.type === 'product')
    .map((result) => result.product)
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  const submitSearch = (nextTerm: string) => {
    router.replace(`/search?q=${encodeURIComponent(nextTerm)}`);
  };

  const hasResults = results.length > 0;

  return (
    <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
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
                  href={goal.href}
                  className="inline-flex min-h-9 items-center rounded border border-gray-300 bg-white px-3 text-xs font-medium text-gray-900 transition-colors hover:border-gray-400 hover:bg-gray-50"
                >
                  {goal.name}
                </Link>
              ))}
            </div>
          )}

          {brandResults.length > 0 && (
            <section className="mb-8">
              <p className="mb-3 text-sm font-medium text-gray-500">Brands</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {brandResults.map((result) => (
                  <Link
                    key={result.id}
                    href={result.href}
                    className="flex items-center gap-3 rounded border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    <BrandLogo
                      domain={result.brand?.storeDomains[0]}
                      brandName={result.name}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{result.name}</p>
                      <p className="text-xs text-gray-500">{result.subtitle}</p>
                    </div>
                    <FiTag className="shrink-0 text-gray-400" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {supplementResults.length > 0 && (
            <section className="mb-8">
              <p className="mb-3 text-sm font-medium text-gray-500">Supplements</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {supplementResults.map((result) => (
                  <Link
                    key={result.id}
                    href={result.href}
                    className="flex min-h-20 items-center gap-3 rounded border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    <FiHash className="shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {result.name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {result.subtitle}
                      </p>
                    </div>
                    <FiArrowRight className="shrink-0 text-gray-300" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {productResults.length > 0 && (
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
          )}

          {!hasResults && (
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
