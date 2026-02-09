'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiStar } from 'react-icons/fi';
import { supabase } from '@/app/supabase';
import { Button, Card } from '@/components/ui';
import { cn } from '@/lib/design-system/utils';
import type { ProductFilters, ProductSortBy } from '@/types';

export interface ProductFilterPanelProps {
  supplementId?: number;
  filters: ProductFilters;
  sortBy: ProductSortBy;
  onFiltersChange: (filters: ProductFilters) => void;
  onSortChange: (sortBy: ProductSortBy) => void;
  totalResults: number;
  className?: string;
}

interface BrandOption {
  brand_id: string;
  brand_name: string;
  count: number;
}

const PRICE_RANGES = [
  { label: 'Under $15', min: 0, max: 15 },
  { label: '$15 - $30', min: 15, max: 30 },
  { label: '$30 - $50', min: 30, max: 50 },
  { label: '$50 - $75', min: 50, max: 75 },
  { label: '$75+', min: 75, max: undefined },
];

const SORT_OPTIONS: { value: ProductSortBy; label: string }[] = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];

const RATING_OPTIONS = [
  { label: '4+', value: 4 },
  { label: '3+', value: 3 },
  { label: '2+', value: 2 },
];

export function ProductFilterPanel({
  supplementId,
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  totalResults,
  className,
}: ProductFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Fetch available brands
  useEffect(() => {
    async function fetchBrands() {
      let query = supabase
        .from('products')
        .select('brand_id, brands(brand_name)');

      if (supplementId) {
        query = query.eq('supplement_id', supplementId);
      }

      const { data } = await query;

      if (data) {
        const brandCounts = new Map<string, { name: string; count: number }>();
        data.forEach((p: any) => {
          if (p.brand_id && p.brands?.brand_name) {
            const existing = brandCounts.get(p.brand_id);
            if (existing) {
              existing.count++;
            } else {
              brandCounts.set(p.brand_id, { name: p.brands.brand_name, count: 1 });
            }
          }
        });

        const brandOptions: BrandOption[] = Array.from(brandCounts.entries())
          .map(([id, info]) => ({
            brand_id: id,
            brand_name: info.name,
            count: info.count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setBrands(brandOptions);
      }
    }

    fetchBrands();
  }, [supplementId]);

  const activeFilterCount = [
    filters.brandId,
    filters.minPrice !== undefined || filters.maxPrice !== undefined,
    filters.minRating,
  ].filter(Boolean).length;

  const handlePriceRange = (index: number) => {
    if (selectedPriceRange === index) {
      setSelectedPriceRange(null);
      onFiltersChange({ ...filters, minPrice: undefined, maxPrice: undefined });
    } else {
      setSelectedPriceRange(index);
      const range = PRICE_RANGES[index];
      onFiltersChange({ ...filters, minPrice: range.min, maxPrice: range.max });
    }
  };

  const handleRating = (rating: number) => {
    if (selectedRating === rating) {
      setSelectedRating(null);
      onFiltersChange({ ...filters, minRating: undefined });
    } else {
      setSelectedRating(rating);
      onFiltersChange({ ...filters, minRating: rating });
    }
  };

  const handleBrand = (brandId: string) => {
    if (filters.brandId === brandId) {
      onFiltersChange({ ...filters, brandId: undefined });
    } else {
      onFiltersChange({ ...filters, brandId });
    }
  };

  const handleClearAll = () => {
    setSelectedPriceRange(null);
    setSelectedRating(null);
    onFiltersChange({
      supplementId: filters.supplementId,
      searchTerm: filters.searchTerm,
    });
  };

  return (
    <div className={className}>
      {/* Filter Toggle Bar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiFilter size={16} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-900 text-white rounded">
              {activeFilterCount}
            </span>
          )}
          {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </button>

        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as ProductSortBy)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            {totalResults} {totalResults === 1 ? 'product' : 'products'}
          </span>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <Card variant="outlined" padding="md" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price Range */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
              <div className="space-y-1.5">
                {PRICE_RANGES.map((range, i) => (
                  <button
                    key={range.label}
                    onClick={() => handlePriceRange(i)}
                    className={cn(
                      'block w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                      selectedPriceRange === i
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Minimum Rating</h4>
              <div className="space-y-1.5">
                {RATING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleRating(opt.value)}
                    className={cn(
                      'flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                      selectedRating === opt.value
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <FiStar
                      size={14}
                      className={selectedRating === opt.value ? 'text-white' : 'text-amber-400'}
                    />
                    {opt.label} stars
                  </button>
                ))}
              </div>
            </div>

            {/* Brand */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Brand</h4>
              {brands.length === 0 ? (
                <p className="text-sm text-gray-400">No brands available</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {brands.map((brand) => (
                    <button
                      key={brand.brand_id}
                      onClick={() => handleBrand(brand.brand_id)}
                      className={cn(
                        'flex items-center justify-between w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                        filters.brandId === brand.brand_id
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <span className="truncate">{brand.brand_name}</span>
                      <span
                        className={cn(
                          'text-xs ml-2',
                          filters.brandId === brand.brand_id ? 'text-gray-300' : 'text-gray-400'
                        )}
                      >
                        {brand.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiX size={14} />
                Clear all filters
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default ProductFilterPanel;
