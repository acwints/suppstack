'use client';

import { useState } from 'react';
import { useSupplements } from '@/hooks';
import { SkeletonGrid, SkeletonCard, Stack, Inline, Grid, Card } from '@/components/ui';
import { SearchBar } from '@/components/composite/Search';
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <Stack gap={8} align="center">
            <div className="text-center">
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold mb-6 text-gray-900 leading-tight">
                <span className="inline-block animate-slide-up">Find Your</span>
                <br />
                <span
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 animate-slide-up"
                  style={{ animationDelay: '0.2s' }}
                >
                  Perfect Supplements
                </span>
              </h1>
              <p
                className="text-xl lg:text-2xl max-w-3xl mx-auto text-gray-600 leading-relaxed animate-fade-in"
                style={{ animationDelay: '0.4s' }}
              >
                Discover science-backed supplements recommended by health professionals and trusted
                by thousands.
              </p>
            </div>

            <div
              className="w-full max-w-2xl animate-scale-in"
              style={{ animationDelay: '0.6s' }}
            >
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
            </div>

            {/* Stats */}
            <Grid
              cols={{ sm: 3 }}
              gap={8}
              className="max-w-lg w-full animate-fade-in"
              style={{ animationDelay: '0.8s' }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{supplements.length}+</div>
                <div className="text-sm text-gray-500">Supplements</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">25K+</div>
                <div className="text-sm text-gray-500">Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">4.9</div>
                <div className="text-sm text-gray-500">Rating</div>
              </div>
            </Grid>
          </Stack>
        </div>
      </div>

      {/* Navigation & Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-xl bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Inline justify="between" align="center" wrap gap={4}>
            <CategoryFilter
              supplements={supplements}
              value={selectedCategory}
              onChange={setSelectedCategory}
            />
            <Inline gap={6} align="center">
              <SortFilter value={sortBy} onChange={setSortBy} />
              <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-full">
                {filteredSupplements.length} supplements
              </span>
            </Inline>
          </Inline>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {isLoading ? (
          <SkeletonGrid count={12} CardComponent={SkeletonCard} />
        ) : (
          <Stack gap={16}>
            {/* Featured Stacks */}
            <FeaturedStacks />

            {/* Featured Categories */}
            <FeaturedCategories supplements={supplements} />

            {/* Product Grid */}
            <section>
              <Stack gap={12}>
                <div className="text-center">
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    Premium{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                      Supplements
                    </span>
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Discover high-quality supplements trusted by health professionals and backed by
                    science
                  </p>
                </div>
                <SupplementGrid supplements={filteredSupplements} />
              </Stack>
            </section>
          </Stack>
        )}
      </div>
    </div>
  );
}
