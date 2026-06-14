'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FiArrowRight, FiBarChart2, FiLayers, FiShoppingBag } from 'react-icons/fi';
import { useSupplements } from '@/hooks';
import { brandSlug, buildBrandDiscovery } from '@/lib/catalog/brand-discovery';
import { formatCurrency } from '@/lib/utils';
import { SkeletonGrid, SkeletonCard, Stack, Inline } from '@/components/ui';
import { EnhancedSearchBar } from '@/components/composite/Search';
import { CategoryFilter, SortFilter } from '@/components/composite/Filter';
import { SupplementGrid, FeaturedCategories } from '@/components/composite/Supplement';
import FeaturedStacks from './components/FeaturedStacks';

const heroBackgroundStyle = {
  backgroundImage:
    'linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.84) 45%, rgba(255,255,255,0.18) 100%), url(https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=1600&h=900&fit=crop)',
};

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
    () => buildBrandDiscovery(supplements).slice(0, 4),
    [supplements]
  );
  const averageMonthlySpend = supplements.length
    ? supplements.reduce((sum, supplement) => sum + (supplement.average_price ?? 0), 0) /
      supplements.length
    : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="border-b border-gray-200">
        <div
          className="bg-cover bg-center"
          style={heroBackgroundStyle}
        >
          <div className="max-w-6xl mx-auto px-4 py-14 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
                Protein, creatine, pre-workout, recovery
              </p>
              <h1 className="text-4xl lg:text-6xl font-serif text-gray-900 mb-6">
                SuppStack
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                Build a gym stack you can actually maintain. Compare whey, creatine, pre-workout,
                recovery, and refill-ready products, then move into Shopify purchase paths when
                it is time to restock.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded bg-gray-900 px-6 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Build your stack
                  <FiArrowRight />
                </Link>
                <Link
                  href="/brands"
                  className="inline-flex h-11 items-center justify-center rounded border border-gray-200 bg-white px-6 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                >
                  Shop brands
                </Link>
              </div>

              <div className="w-full max-w-xl mt-8">
                <EnhancedSearchBar value={searchTerm} onChange={setSearchTerm} />
              </div>

              <div className="grid grid-cols-3 gap-5 pt-8">
                <div>
                  <p className="text-2xl font-serif text-gray-900">{supplements.length}+</p>
                  <p className="text-sm text-gray-500">Gym products</p>
                </div>
                <div>
                  <p className="text-2xl font-serif text-gray-900">{brandHighlights.length * 3}+</p>
                  <p className="text-sm text-gray-500">Brand lanes</p>
                </div>
                <div>
                  <p className="text-2xl font-serif text-gray-900">
                    {formatCurrency(averageMonthlySpend)}
                  </p>
                  <p className="text-sm text-gray-500">Avg. restock</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Filters */}
      <div className="border-b border-gray-100 sticky top-[65px] z-40 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3">
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {isLoading ? (
          <SkeletonGrid count={12} CardComponent={SkeletonCard} />
        ) : (
          <Stack gap={16}>
            <section>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded p-5">
                  <FiLayers className="text-gray-500 mb-4" />
                  <h2 className="text-xl font-serif text-gray-900">Build gym stacks</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Save protein, creatine, pump, recovery, and hydration products in one repeatable plan.
                  </p>
                </div>
                <div className="border border-gray-200 rounded p-5">
                  <FiBarChart2 className="text-gray-500 mb-4" />
                  <h2 className="text-xl font-serif text-gray-900">Know the monthly burn</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Compare serving cost, monthly restock spend, and subscription-friendly picks.
                  </p>
                </div>
                <div className="border border-gray-200 rounded p-5">
                  <FiShoppingBag className="text-gray-500 mb-4" />
                  <h2 className="text-xl font-serif text-gray-900">Restock without friction</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Jump from product research to Shopify discovery, brand stores, and refill paths.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <Inline justify="between" align="end" className="section-header">
                <h2>Shop Gym Brands</h2>
                <Link href="/brands" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  View all
                </Link>
              </Inline>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {brandHighlights.map((brand) => (
                  <Link
                    key={brand.brandName}
                    href={`/brands/${brandSlug(brand.brandName)}`}
                    className="border border-gray-200 rounded p-4 hover:border-gray-300 transition-colors"
                  >
                    <p className="font-medium text-gray-900">{brand.brandName}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {brand.productCount} listings from {formatCurrency(brand.averagePrice)}
                    </p>
                    <p className="text-xs text-gray-500 mt-3 line-clamp-1">
                      {brand.categories.slice(0, 3).join(' / ')}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Featured Stacks */}
            <section>
              <div className="section-header">
                <h2>Featured Stacks</h2>
              </div>
              <FeaturedStacks />
            </section>

            {/* Featured Categories */}
            <section>
              <div className="section-header">
                <h2>Shop by Training Goal</h2>
              </div>
              <FeaturedCategories supplements={supplements} />
            </section>

            {/* Product Grid */}
            <section>
              <div className="section-header">
                <h2>All Gym Supplements</h2>
              </div>
              <SupplementGrid supplements={filteredSupplements} />
            </section>
          </Stack>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-xl font-serif text-gray-900">SuppStack</p>
              <p className="text-sm text-gray-500 mt-1">
                Gym stacks, refill math, and Shopify-ready supplement discovery.
              </p>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <a href="/terms" className="hover:text-gray-900 transition-colors">
                Terms
              </a>
              <a href="/privacy" className="hover:text-gray-900 transition-colors">
                Privacy
              </a>
              <a href="/contact" className="hover:text-gray-900 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
