'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSupplements } from '@/hooks';
import { brandSlug, buildBrandDiscovery } from '@/lib/catalog/brand-discovery';
import { SkeletonGrid, SkeletonCard, Inline, Stack } from '@/components/ui';
import { EnhancedSearchBar } from '@/components/composite/Search';
import { CategoryFilter, SortFilter } from '@/components/composite/Filter';
import { SupplementGrid, FeaturedCategories } from '@/components/composite/Supplement';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const { supplements, filteredSupplements, isLoading } = useSupplements({
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
          <EnhancedSearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[65px] z-40 border-b border-gray-100 bg-white">
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
                {filteredSupplements.length} results
              </span>
            </Inline>
          </Inline>
        </div>
      </div>

      {/* Products first */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {isLoading ? (
          <SkeletonGrid count={15} CardComponent={SkeletonCard} />
        ) : (
          <Stack gap={10}>
            <section>
              <SupplementGrid supplements={filteredSupplements} />
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
                    className="rounded border border-gray-200 p-3 text-center transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    <p className="truncate text-sm font-medium text-gray-900">{brand.brandName}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{brand.productCount} products</p>
                  </Link>
                ))}
              </div>
            </section>
          </Stack>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-10 border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <p className="text-sm text-gray-500">SuppStack — supplement marketplace</p>
            <div className="flex gap-8 text-sm text-gray-500">
              <a href="/terms" className="transition-colors hover:text-gray-900">
                Terms
              </a>
              <a href="/privacy" className="transition-colors hover:text-gray-900">
                Privacy
              </a>
              <a href="/contact" className="transition-colors hover:text-gray-900">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
