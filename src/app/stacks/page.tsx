'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiGrid, FiList } from 'react-icons/fi';
import { useAuth } from '@/app/context/AuthContext';
import { useStacks } from '@/hooks';
import type { StackSortBy, StackFilter } from '@/hooks/useStacks';
import {
  Button,
  Tabs,
  SortSelect,
  EmptyState,
  Inline,
  Stack,
  Grid,
} from '@/components/ui';
import { StackCard } from '@/components/composite/Stack';
import { SkeletonStackCard } from '@/components/ui/Skeleton';

const sortOptions = [
  { value: 'popular' as const, label: 'Most Viewed' },
  { value: 'most_liked' as const, label: 'Most Liked' },
  { value: 'most_copied' as const, label: 'Most Copied' },
  { value: 'newest' as const, label: 'Newest' },
];

const filterOptions: { value: StackFilter; label: string }[] = [
  { value: 'all', label: 'All Stacks' },
  { value: 'featured', label: 'Featured' },
  { value: 'verified', label: 'Verified Creators' },
];

export default function StacksPage() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<StackSortBy>('popular');
  const [filter, setFilter] = useState<StackFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { stacks, isLoading, hasMore, loadMore } = useStacks({ sortBy, filter });

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <Inline justify="between" align="start" className="mb-8" wrap>
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Stacks</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Explore supplement routines from experts and the community
          </p>
        </div>
        {user && (
          <Link href="/stacks/create">
            <Button variant="primary" leftIcon={<FiPlus />}>
              Create Stack
            </Button>
          </Link>
        )}
      </Inline>

      {/* Filters & Sort */}
      <Inline justify="between" align="center" wrap gap={4} className="mb-8">
        {/* Filter Tabs */}
        <Tabs.List variant="pills">
          {filterOptions.map((option) => (
            <Tabs.Tab
              key={option.value}
              isActive={filter === option.value}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {/* Sort & View */}
        <Inline gap={3}>
          <SortSelect
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            label="Sort stacks"
          />

          {/* View Toggle */}
          <Inline gap={0} className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
              aria-label="Grid view"
            >
              <FiGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
              aria-label="List view"
            >
              <FiList size={18} />
            </button>
          </Inline>
        </Inline>
      </Inline>

      {/* Stacks Grid/List */}
      {isLoading && stacks.length === 0 ? (
        <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={6}>
          {[...Array(6)].map((_, i) => (
            <SkeletonStackCard key={i} />
          ))}
        </Grid>
      ) : stacks.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No stacks found"
          description={
            filter === 'all'
              ? "Be the first to create a stack!"
              : "Try adjusting your filters"
          }
          action={
            user && (
              <Link href="/stacks/create">
                <Button variant="primary" leftIcon={<FiPlus />}>
                  Create Your First Stack
                </Button>
              </Link>
            )
          }
          variant="card"
          size="lg"
        />
      ) : (
        <Stack gap={6}>
          {viewMode === 'grid' ? (
            <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={6}>
              {stacks.map((stack, index) => (
                <StackCard
                  key={stack.stack_id}
                  stack={stack}
                  index={index}
                  compact={false}
                />
              ))}
            </Grid>
          ) : (
            <Stack gap={4}>
              {stacks.map((stack, index) => (
                <StackCard
                  key={stack.stack_id}
                  stack={stack}
                  index={index}
                  compact
                />
              ))}
            </Stack>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-6">
              <Button variant="outline" onClick={loadMore} isLoading={isLoading}>
                Load More Stacks
              </Button>
            </div>
          )}
        </Stack>
      )}

      {/* CTA for non-logged in users */}
      {!user && stacks.length > 0 && (
        <div className="mt-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Create Your Own Stack</h3>
          <p className="text-orange-100 mb-6 max-w-xl mx-auto">
            Sign in to create and share your supplement routine with the community
          </p>
          <Link href="/login">
            <Button variant="secondary" className="bg-white text-orange-600 hover:bg-orange-50">
              Get Started
            </Button>
          </Link>
        </div>
      )}
    </main>
  );
}
