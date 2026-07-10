'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiArrowRight, FiHash, FiTag } from 'react-icons/fi';
import ProductCard from '@/app/components/ProductCard';
import { EnhancedSearchBar } from '@/components/composite/Search';
import { EmptyState, Spinner } from '@/components/ui';
import { buildProductDirectory } from '@/lib/catalog/product-directory';
import { HEALTH_GOAL_DEFINITIONS, healthGoalHref } from '@/lib/catalog/health-goal-directory';
import { brandSlug, buildCatalogBrandDiscovery } from '@/lib/catalog/brand-discovery';
import { supplementCatalog } from '@/lib/catalog/supplement-catalog';
import { BrandLogo } from '@/components/composite/Brand';

function matches(term: string, ...fields: Array<string | undefined | null>): boolean {
  return fields.some((field) => field?.toLowerCase().includes(term));
}

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const [term, setTerm] = useState(query);

  const directory = useMemo(() => buildProductDirectory(), []);
  const brands = useMemo(() => buildCatalogBrandDiscovery({ includeCatalogFallback: true }), []);

  const normalized = query.toLowerCase();
  const brandResults = useMemo(() => {
    if (!normalized) return [];
    return brands.filter((brand) =>
      matches(normalized, brand.brandName, ...brand.categories, ...brand.storeDomains) ||
      brand.products.some((product) => matches(normalized, product.product_name))
    ).slice(0, 6);
  }, [brands, normalized]);

  const supplementResults = useMemo(() => {
    if (!normalized) return [];
    return supplementCatalog.filter((supplement) =>
      matches(
        normalized,
        supplement.supplement_name,
        supplement.supplement_description,
        supplement.category,
        ...(supplement.aliases ?? [])
      )
    ).slice(0, 8);
  }, [normalized]);

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

  const hasResults = brandResults.length > 0 || supplementResults.length > 0 || productResults.length > 0;

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
                  href={healthGoalHref(goal.id)}
                  className="inline-flex min-h-9 items-center rounded border border-gray-300 bg-white px-3 text-xs font-medium text-gray-900 transition-colors hover:border-gray-400 hover:bg-gray-50"
                >
                  {goal.title}
                </Link>
              ))}
            </div>
          )}

          {brandResults.length > 0 && (
            <section className="mb-8">
              <p className="mb-3 text-sm font-medium text-gray-500">Brands</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {brandResults.map((brand) => (
                  <Link
                    key={brand.brandName}
                    href={`/brands/${brandSlug(brand.brandName)}`}
                    className="flex items-center gap-3 rounded border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    <BrandLogo
                      domain={brand.storeDomains[0]}
                      brandName={brand.brandName}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{brand.brandName}</p>
                      <p className="text-xs text-gray-500">
                        {brand.productCount} product{brand.productCount === 1 ? '' : 's'}
                      </p>
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
                {supplementResults.map((supplement) => (
                  <Link
                    key={supplement.supplement_id}
                    href={`/supplement/${supplement.supplement_id}`}
                    className="flex min-h-20 items-center gap-3 rounded border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    <FiHash className="shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {supplement.supplement_name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {supplement.research_only ? 'Research profile' : supplement.category}
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
