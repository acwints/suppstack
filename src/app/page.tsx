'use client';

import { useState } from 'react';
import { useSupplements } from '@/hooks';
import { SkeletonGrid, SkeletonCard, Stack, Inline, Grid } from '@/components/ui';
import { EnhancedSearchBar } from '@/components/composite/Search';
import { CategoryFilter, SortFilter } from '@/components/composite/Filter';
import { SupplementGrid, FeaturedCategories } from '@/components/composite/Supplement';
import FeaturedStacks from './components/FeaturedStacks';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const { supplements, filteredSupplements, isLoading, categories } = useSupplements({
    searchTerm,
    categoryId: selectedCategory,
    sortBy: sortBy as 'name' | 'popular',
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24">
          <Stack gap={8} align="center">
            <div className="text-center max-w-3xl">
              <h1 className="text-4xl lg:text-6xl font-serif text-gray-900 mb-6 tracking-tight">
                The Supplement
                <br />
                <span className="italic">Discovery Platform</span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                Compare supplements, shop verified products, and build repeatable stacks with
                pricing, dosage, and merchant context in one place.
              </p>
            </div>

            <div className="w-full max-w-xl">
              <EnhancedSearchBar value={searchTerm} onChange={setSearchTerm} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 text-center pt-4">
              <div>
                <p className="text-2xl font-serif text-gray-900">{supplements.length}+</p>
                <p className="text-sm text-gray-500">Supplements</p>
              </div>
              <div>
                <p className="text-2xl font-serif text-gray-900">Shopify</p>
                <p className="text-sm text-gray-500">Checkout</p>
              </div>
              <div>
                <p className="text-2xl font-serif text-gray-900">3</p>
                <p className="text-sm text-gray-500">Price tiers</p>
              </div>
            </div>
          </Stack>
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
                <h2>Browse by Category</h2>
              </div>
              <FeaturedCategories supplements={supplements} />
            </section>

            {/* Product Grid */}
            <section>
              <div className="section-header">
                <h2>All Supplements</h2>
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
                The supplement discovery platform
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
