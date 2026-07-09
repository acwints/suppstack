'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useSupplements } from '@/hooks';
import { brandSlug, buildBrandDiscovery } from '@/lib/catalog/brand-discovery';
import { SkeletonGrid, SkeletonCard, EmptyState, Inline, Stack } from '@/components/ui';
import { EnhancedSearchBar } from '@/components/composite/Search';
import { CategoryFilter, SortFilter, type SortFilterValue } from '@/components/composite/Filter';
import { RecentlyViewedRow } from '@/components/composite/Product/RecentlyViewedRow';
import { SupplementGrid, HealthGoalDirectory } from '@/components/composite/Supplement';
import { BrandLogo } from '@/components/composite/Brand';

export default function Home() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortFilterValue>('name');

  const { supplements: catalogSupplements, isLoading } = useSupplements();
  const { browseGroups: productBrowseGroups } = useSupplements({
    searchTerm,
    categoryId: selectedCategory,
    sortBy,
  });
  const brandHighlights = useMemo(
    () => buildBrandDiscovery(catalogSupplements).slice(0, 6),
    [catalogSupplements]
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Search bar — the storefront entry point */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4">
          <EnhancedSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onSubmit={(term) => router.push(`/search?q=${encodeURIComponent(term)}`)}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-6">
        {isLoading ? (
          <SkeletonGrid count={15} CardComponent={SkeletonCard} />
        ) : (
          <Stack gap={10}>
            <RecentlyViewedRow />

            <section>
              <Inline justify="between" align="end" className="section-header">
                <h2>Shop by Goal</h2>
                <Link href="/health" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  View all
                </Link>
              </Inline>
              <HealthGoalDirectory supplements={catalogSupplements} />
            </section>

            <section>
              <Inline justify="between" align="end" className="section-header">
                <h2>All Products</h2>
                <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  View all
                </Link>
              </Inline>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="min-w-0 flex-[1_1_210px] sm:max-w-xs">
                  <CategoryFilter
                    supplements={catalogSupplements}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                  />
                </div>
                <div className="min-w-0 flex-[1_1_150px] sm:max-w-44">
                  <SortFilter value={sortBy} onChange={setSortBy} />
                </div>
                <p className="text-sm text-gray-500">
                  {productBrowseGroups.length} result{productBrowseGroups.length === 1 ? '' : 's'}
                </p>
              </div>

              {productBrowseGroups.length === 0 ? (
                <EmptyState
                  title="No products match"
                  description="Try a different search term or category."
                  action={
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                      className="inline-flex min-h-11 items-center justify-center rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      Clear filters
                    </button>
                  }
                  size="lg"
                />
              ) : (
                <SupplementGrid groups={productBrowseGroups} />
              )}
            </section>

            <section>
              <Inline justify="between" align="end" className="section-header">
                <h2>Shop Brands</h2>
                <Link href="/brands" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  View all
                </Link>
              </Inline>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {brandHighlights.map((brand) => (
                  <Link
                    key={brand.brandName}
                    href={`/brands/${brandSlug(brand.brandName)}`}
                    className="flex flex-col items-center rounded border border-gray-200 p-3 text-center transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    <BrandLogo
                      domain={brand.storeDomains[0]}
                      brandName={brand.brandName}
                      size="lg"
                      className="mb-2"
                    />
                    <p className="w-full truncate text-sm font-medium text-gray-900">{brand.brandName}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{brand.productCount} products</p>
                  </Link>
                ))}
              </div>
            </section>
          </Stack>
        )}
      </div>

    </div>
  );
}
