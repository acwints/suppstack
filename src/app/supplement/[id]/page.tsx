'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { supabase } from '../../supabase';
import ProductCard from '../../components/ProductCard';
import type { Supplement, Product, ProductFilters, ProductSortBy } from '@/types';
import { Spinner, Button, EmptyState, Stack, Inline, Grid } from '@/components/ui';
import { ProductFilterPanel } from '@/components/composite/Filter';
import { CompareProducts } from '@/components/composite/Supplement';
import {
  createCatalogProductsForSupplement,
  findCatalogSupplementById,
} from '@/lib/catalog/supplement-catalog';

export default function SupplementPage({ params }: { params: { id: string } }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [supplement, setSupplement] = useState<Supplement | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sortBy, setSortBy] = useState<ProductSortBy>('name');
  const productsPerPage = 15;

  const supplementId = parseInt(params.id);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const catalogSupplement = findCatalogSupplementById(supplementId);

      if (catalogSupplement) {
        setSupplement(catalogSupplement);
        setProducts(createCatalogProductsForSupplement(catalogSupplement));
        setIsLoading(false);
        return;
      }

      const [supplementResult, productsResult] = await Promise.all([
        supabase.from('supplements').select('*').eq('supplement_id', supplementId).single(),
        supabase
          .from('products')
          .select('*, brands(brand_name), supplements(supplement_name)')
          .eq('supplement_id', supplementId)
          .order('product_name', { ascending: true }),
      ]);

      if (supplementResult.error) {
        console.error('Error fetching supplement:', supplementResult.error);
      } else {
        setSupplement(supplementResult.data);
      }

      if (productsResult.error) {
        console.error('Error fetching products:', productsResult.error);
      } else {
        const databaseProducts = productsResult.data || [];
        if (databaseProducts.length > 0) {
          setProducts(databaseProducts);
        } else if (!supplementResult.error && supplementResult.data) {
          setProducts(createCatalogProductsForSupplement(supplementResult.data));
        }
      }

      setIsLoading(false);
    }

    fetchData();
  }, [supplementId]);

  // Apply client-side filtering and sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filters.brandId) {
      result = result.filter(p => p.brand_id === filters.brandId);
    }
    if (filters.minPrice !== undefined) {
      result = result.filter(p => p.product_price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter(p => p.product_price <= filters.maxPrice!);
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(
        p =>
          p.product_name.toLowerCase().includes(term) ||
          p.product_description?.toLowerCase().includes(term)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.product_price - b.product_price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.product_price - a.product_price);
        break;
      case 'name':
      default:
        result.sort((a, b) => a.product_name.localeCompare(b.product_name));
    }

    return result;
  }, [products, filters, sortBy]);

  const displayedProducts = filteredProducts.slice(0, currentPage * productsPerPage);
  const hasMore = filteredProducts.length > displayedProducts.length;

  const loadMoreProducts = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!supplement) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <EmptyState
          icon="404"
          title="Supplement not found"
          description="This supplement category doesn't exist or has been removed."
          action={
            <Link href="/">
              <Button variant="primary">Back to Home</Button>
            </Link>
          }
          size="lg"
        />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Navigation */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <FiArrowLeft />
        <span>Back to Stack Shop</span>
      </Link>

      {/* Header */}
      <Stack gap={2} className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          {supplement.category && (
            <span className="rounded border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600">
              {supplement.category}
            </span>
          )}
          {supplement.evidence_rating && (
            <span className="rounded border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600">
              {supplement.evidence_rating.charAt(0).toUpperCase() + supplement.evidence_rating.slice(1)} evidence
            </span>
          )}
        </div>
        <h1 className="text-4xl font-serif text-gray-900">
          {supplement.supplement_name}
        </h1>
        <p className="text-xl text-gray-600">{supplement.supplement_description}</p>
        {(supplement.common_dosage || !!supplement.primary_goals?.length) && (
          <div className="grid grid-cols-1 gap-3 border-y border-gray-100 py-4 text-sm md:grid-cols-2">
            {supplement.common_dosage && (
              <div>
                <div className="font-semibold text-gray-900">Typical dose</div>
                <div className="text-gray-600">{supplement.common_dosage}</div>
              </div>
            )}
            {!!supplement.primary_goals?.length && (
              <div>
                <div className="font-semibold text-gray-900">Training goals</div>
                <div className="text-gray-600">{supplement.primary_goals.slice(0, 3).join(', ')}</div>
              </div>
            )}
          </div>
        )}
      </Stack>

      {/* Products Section */}
      <Stack gap={6}>
        <h2 className="text-2xl font-semibold text-gray-900">Shop Stack Picks</h2>

        {/* Filter Panel */}
        <ProductFilterPanel
          supplementId={supplementId}
          filters={filters}
          sortBy={sortBy}
          onFiltersChange={setFilters}
          onSortChange={setSortBy}
          totalResults={filteredProducts.length}
        />

        {filteredProducts.length === 0 ? (
          <EmptyState
            icon="📦"
            title={products.length === 0 ? "No products found" : "No products match your filters"}
            description={
              products.length === 0
                ? "We do not have stack-ready products for this category yet."
                : "Try adjusting your filters to see more results."
            }
            variant="card"
            action={
              products.length > 0 ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({});
                    setSortBy('name');
                  }}
                >
                  Clear Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={6}>
              {displayedProducts.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </Grid>

            {hasMore && (
              <div className="text-center pt-6">
                <Button variant="outline" onClick={loadMoreProducts}>
                  Load More Products ({filteredProducts.length - displayedProducts.length} remaining)
                </Button>
              </div>
            )}
          </>
        )}

        {/* Compare Products */}
        {products.length >= 2 && !products.some(product => product.data_source === 'catalog_fallback') && (
          <CompareProducts supplementId={supplementId} />
        )}
      </Stack>
    </main>
  );
}
