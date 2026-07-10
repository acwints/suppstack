'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FiSearch, FiX } from 'react-icons/fi';
import ProductCard from '@/app/components/ProductCard';
import { Button } from '@/components/ui';
import type {
  ProductDirectoryGoalFilter,
  ProductDirectoryProduct,
  ProductDirectoryShelf,
} from '@/lib/catalog/product-directory';
import type { HealthGoalId } from '@/lib/catalog/health-goal-directory';
import { formatPrice } from '@/lib/utils';
import { productMatchesCatalogQuery } from '@/lib/catalog/catalog-search';

export interface ProductDirectoryClientProps {
  products: ProductDirectoryProduct[];
  healthGoals: ProductDirectoryGoalFilter[];
  commerceShelves: ProductDirectoryShelf[];
  initialGoalId?: string;
  initialSearchTerm?: string;
  initialCategory?: string;
  initialBrand?: string;
  initialSortBy?: string;
}

type ProductSort = 'featured' | 'price_asc' | 'price_desc' | 'name';

function optionLabel(value: string) {
  return value || 'Unknown';
}

export function ProductDirectoryClient({
  products,
  healthGoals,
  commerceShelves,
  initialGoalId,
  initialSearchTerm,
  initialCategory,
  initialBrand,
  initialSortBy,
}: ProductDirectoryClientProps) {
  const pathname = usePathname();
  const initialGoal =
    initialGoalId && healthGoals.some((goal) => goal.id === initialGoalId) ? initialGoalId : 'all';
  const initialSort: ProductSort = ['featured', 'price_asc', 'price_desc', 'name'].includes(
    initialSortBy ?? ''
  )
    ? (initialSortBy as ProductSort)
    : 'featured';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm ?? '');
  const [goalId, setGoalId] = useState(initialGoal);
  const [category, setCategory] = useState(initialCategory ?? 'all');
  const [brand, setBrand] = useState(initialBrand ?? 'all');
  const [sortBy, setSortBy] = useState<ProductSort>(initialSort);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.directory_category))).sort(),
    [products]
  );

  const brands = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((product) => product.brands?.brand_name ?? product.shopify_store_domain)
            .filter((name): name is string => Boolean(name))
        )
      ).sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim();

    const result = products.filter((product) => {
      const brandName = product.brands?.brand_name ?? product.shopify_store_domain ?? '';

      if (term && !productMatchesCatalogQuery(product, term)) return false;
      if (goalId !== 'all' && !product.health_goal_ids.includes(goalId as HealthGoalId)) {
        return false;
      }
      if (category !== 'all' && product.directory_category !== category) return false;
      if (brand !== 'all' && brandName !== brand) return false;

      return true;
    });

    return result.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.product_price - b.product_price;
        case 'price_desc':
          return b.product_price - a.product_price;
        case 'name':
          return a.product_name.localeCompare(b.product_name);
        case 'featured':
        default:
          if (a.ucp_enabled !== b.ucp_enabled) return a.ucp_enabled ? -1 : 1;
          if (a.subscriptions_available !== b.subscriptions_available) {
            return a.subscriptions_available ? -1 : 1;
          }
          return a.product_price - b.product_price;
      }
    });
  }, [brand, category, goalId, products, searchTerm, sortBy]);

  const activeFilterCount = [
    searchTerm.trim(),
    goalId !== 'all',
    category !== 'all',
    brand !== 'all',
  ].filter(Boolean).length;

  const replaceDirectoryUrl = (next: {
    searchTerm?: string;
    goalId?: string;
    category?: string;
    brand?: string;
    sortBy?: ProductSort;
  }) => {
    const values = {
      searchTerm,
      goalId,
      category,
      brand,
      sortBy,
      ...next,
    };
    const params = new URLSearchParams();
    if (values.searchTerm.trim()) params.set('q', values.searchTerm.trim());
    if (values.goalId !== 'all') params.set('goal', values.goalId);
    if (values.category !== 'all') params.set('category', values.category);
    if (values.brand !== 'all') params.set('brand', values.brand);
    if (values.sortBy !== 'featured') params.set('sort', values.sortBy);

    const queryString = params.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
    window.history.replaceState(null, '', nextUrl);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setGoalId('all');
    setCategory('all');
    setBrand('all');
    setSortBy('featured');
    replaceDirectoryUrl({
      searchTerm: '',
      goalId: 'all',
      category: 'all',
      brand: 'all',
      sortBy: 'featured',
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    replaceDirectoryUrl({ searchTerm: value });
  };

  const handleGoalChange = (value: string) => {
    setGoalId(value);
    replaceDirectoryUrl({ goalId: value });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    replaceDirectoryUrl({ category: value });
  };

  const handleBrandChange = (value: string) => {
    setBrand(value);
    replaceDirectoryUrl({ brand: value });
  };

  const handleSortChange = (value: ProductSort) => {
    setSortBy(value);
    replaceDirectoryUrl({ sortBy: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {commerceShelves.map((shelf) => {
          const isActive = goalId === shelf.id;

          return (
            <button
              key={shelf.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleGoalChange(isActive ? 'all' : shelf.id)}
              className={[
                'rounded border p-4 text-left transition-colors',
                isActive
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 text-base font-semibold leading-6">{shelf.title}</p>
                <span
                  className={[
                    'shrink-0 rounded px-2 py-1 text-xs font-semibold',
                    isActive ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-700',
                  ].join(' ')}
                >
                  {shelf.productCount}
                </span>
              </div>
              {shelf.priceFrom != null && (
                <p className={isActive ? 'mt-2 text-xs text-gray-300' : 'mt-2 text-xs text-gray-500'}>
                  from ${formatPrice(shelf.priceFrom)}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.8fr]">
        <label className="block">
          <span className="sr-only">Search products</span>
          <span className="relative block">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={`Search ${products.length} products...`}
              className="h-11 w-full rounded border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
            />
          </span>
        </label>

        <label className="block">
          <span className="sr-only">Goal</span>
          <select
            value={goalId}
            onChange={(event) => handleGoalChange(event.target.value)}
            className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
          >
            <option value="all">All goals</option>
            {healthGoals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title} ({goal.productCount})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Category</span>
          <select
            value={category}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {optionLabel(item)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Brand</span>
          <select
            value={brand}
            onChange={(event) => handleBrandChange(event.target.value)}
            className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
          >
            <option value="all">All brands</option>
            {brands.map((item) => (
              <option key={item} value={item}>
                {optionLabel(item)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Sort products</span>
          <select
            value={sortBy}
            aria-label="Sort products"
            onChange={(event) => handleSortChange(event.target.value as ProductSort)}
            className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
          >
            <option value="featured">Featured</option>
            <option value="price_asc">Price low to high</option>
            <option value="price_desc">Price high to low</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-gray-900">
          {filteredProducts.length.toLocaleString()} products
        </p>
        {activeFilterCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearFilters} leftIcon={<FiX />}>
            Clear filters
          </Button>
        )}
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Active filters">
          {searchTerm.trim() && (
            <FilterChip label={`"${searchTerm.trim()}"`} onRemove={() => handleSearchChange('')} />
          )}
          {goalId !== 'all' && (
            <FilterChip
              label={healthGoals.find((goal) => goal.id === goalId)?.title ?? goalId}
              onRemove={() => handleGoalChange('all')}
            />
          )}
          {category !== 'all' && (
            <FilterChip label={category} onRemove={() => handleCategoryChange('all')} />
          )}
          {brand !== 'all' && <FilterChip label={brand} onRemove={() => handleBrandChange('all')} />}
        </div>
      )}

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded border border-gray-200 bg-gray-50 p-10 text-center">
          <p className="text-base font-medium text-gray-900">No products match those filters.</p>
          <p className="mt-2 text-sm text-gray-500">
            Try another goal, brand, category, or product search.
          </p>
          <Button variant="primary" className="mt-5" onClick={clearFilters}>
            Reset directory
          </Button>
        </div>
      )}
    </div>
  );
}

/** Removable chip for a single applied filter (editorial style). */
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove filter ${label}`}
      className="inline-flex min-h-9 items-center gap-1.5 rounded border border-gray-300 bg-white px-3 text-xs font-medium text-gray-900 transition-colors hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
    >
      {label}
      <FiX size={14} aria-hidden="true" />
    </button>
  );
}

export default ProductDirectoryClient;
