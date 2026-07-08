'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useSupplements } from '@/hooks';
import { brandSlug, buildBrandDiscovery } from '@/lib/catalog/brand-discovery';
import { SkeletonGrid, SkeletonCard, EmptyState, Inline, Stack } from '@/components/ui';
import { EnhancedSearchBar } from '@/components/composite/Search';
import { CategoryFilter, SortFilter } from '@/components/composite/Filter';
import { RecentlyViewedRow } from '@/components/composite/Product/RecentlyViewedRow';
import {
  SupplementGrid,
  FeaturedCategories,
  HealthGoalDirectory,
} from '@/components/composite/Supplement';
import { BrandLogo } from '@/components/composite/Brand';

export default function Home() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const { supplements, browseGroups, isLoading } = useSupplements({
    searchTerm,
    categoryId: selectedCategory,
    sortBy: sortBy as 'name' | 'popular',
  });
  const brandHighlights = useMemo(
    () => buildBrandDiscovery(supplements).slice(0, 6),
    [supplements]
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Search bar — the storefront entry point */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <EnhancedSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onSubmit={(term) => router.push(`/search?q=${encodeURIComponent(term)}`)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="sticky-under-header sticky z-40 border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-2.5">
          <Inline justify="between" align="center" wrap gap={4}>
            <CategoryFilter
              supplements={supplements}
              value={selectedCategory}
              onChange={setSelectedCategory}
            />
            <Inline gap={4} align="center">
              <SortFilter value={sortBy} onChange={setSortBy} />
              <span className="text-sm text-gray-500">
                {browseGroups.length} results
              </span>
            </Inline>
          </Inline>
        </div>
      </div>

      {/* Products first */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {isLoading ? (
          <SkeletonGrid count={15} CardComponent={SkeletonCard} />
        ) : browseGroups.length === 0 ? (
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
          <Stack gap={10}>
            <RecentlyViewedRow />

            <section>
              <Inline justify="between" align="end" className="section-header">
                <div>
                  <h2>Shop by Health Signal</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Sleep, body composition, calories burned, and recovery-aware shelves.
                  </p>
                </div>
                <Link href="/health/tracker" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Connect data
                </Link>
              </Inline>
              <HealthGoalDirectory supplements={supplements} />
            </section>

            <section>
              <Inline justify="between" align="end" className="section-header">
                <div>
                  <h2>All Products</h2>
                  <p className="text-sm text-gray-500">
                    {browseGroups.length} browsable supplement groups
                  </p>
                </div>
                <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  View product directory
                </Link>
              </Inline>
              <SupplementGrid groups={browseGroups} />
            </section>

            <section>
              <div className="section-header">
                <h2>Shop by Goal</h2>
              </div>
              <FeaturedCategories supplements={supplements} />
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
