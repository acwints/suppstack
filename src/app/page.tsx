"use client";

import { useState } from 'react';
import type { Supplement, Product } from '@/types';
import { useSupplements } from '@/hooks';
import { SkeletonGrid, SkeletonCard } from '@/components/ui';
import { SearchBar } from '@/components/composite/Search';
import { CategoryFilter, SortFilter } from '@/components/composite/Filter';
import { SupplementGrid, FeaturedCategories } from '@/components/composite/Supplement';
import FeaturedStacks from './components/FeaturedStacks';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const {
    supplements,
    filteredSupplements,
    isLoading,
    categories,
  } = useSupplements({
    searchTerm,
    categoryId: selectedCategory,
    sortBy: sortBy as 'name' | 'popular',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold mb-6 text-gray-900 leading-tight">
              <span className="inline-block animate-slide-up">Find Your</span>
              <br />
              <span className="inline-block text-gradient animate-slide-up" style={{ animationDelay: '0.2s' }}>
                Perfect Supplements
              </span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto text-gray-600 leading-relaxed animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Discover science-backed supplements recommended by health professionals and trusted by thousands.
            </p>
            <div className="max-w-2xl mx-auto animate-scale-in" style={{ animationDelay: '0.6s' }}>
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{supplements.length}+</div>
                <div className="text-sm text-gray-500">Supplements</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">25K+</div>
                <div className="text-sm text-gray-500">Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">4.9★</div>
                <div className="text-sm text-gray-500">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-xl bg-white/95">
        <div className="container-custom py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <CategoryFilter
                supplements={supplements}
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>
            <div className="flex items-center gap-6">
              <SortFilter value={sortBy} onChange={setSortBy} />
              <div className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-full">
                {filteredSupplements.length} supplements found
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-12">
        {isLoading ? (
          <SkeletonGrid count={12} CardComponent={SkeletonCard} />
        ) : (
          <>
            {/* Featured Stacks */}
            <FeaturedStacks />

            {/* Featured Categories */}
            <FeaturedCategories supplements={supplements} />

            {/* Product Grid */}
            <div className="mt-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Premium <span className="text-gradient">Supplements</span>
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Discover high-quality supplements trusted by health professionals and backed by science
                </p>
              </div>
              <SupplementGrid supplements={filteredSupplements} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
