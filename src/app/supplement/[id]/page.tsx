'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiPackage, FiPlus } from 'react-icons/fi';
import { supabase } from '../../supabase';
import ProductCard from '../../components/ProductCard';
import type { Supplement, Product, ProductFilters, ProductSortBy } from '@/types';
import { Spinner, Button, EmptyState, Stack, Inline, Grid } from '@/components/ui';
import { ProductFilterPanel } from '@/components/composite/Filter';
import { CompareProducts, SupplementKnowledge } from '@/components/composite/Supplement';
import {
  createCanonicalCatalogProductsForSupplement,
  findCatalogSupplementById,
  findCatalogSupplementForSupplement,
  resolveProductsForSupplement,
  supplementCatalog,
} from '@/lib/catalog/supplement-catalog';
import { familyForSupplement, familyFormLabel } from '@/lib/catalog/supplement-families';
import { getSupplementKnowledge } from '@/lib/catalog/supplement-knowledge';

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
        setProducts(createCanonicalCatalogProductsForSupplement(catalogSupplement));
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

      const databaseSupplement = supplementResult.data as Supplement | null;
      const catalogMatch = findCatalogSupplementForSupplement(databaseSupplement);

      if (supplementResult.error) {
        console.error('Error fetching supplement:', supplementResult.error);
      } else if (!databaseSupplement) {
        setSupplement(null);
      } else {
        setSupplement({
          ...catalogMatch,
          ...databaseSupplement,
          supplement_description:
            catalogMatch?.supplement_description ??
            databaseSupplement?.supplement_description ??
            '',
          category: catalogMatch?.category ?? databaseSupplement?.category,
          image_url: catalogMatch?.image_url ?? databaseSupplement?.image_url,
          aliases: databaseSupplement?.aliases ?? catalogMatch?.aliases,
          evidence_rating: databaseSupplement?.evidence_rating ?? catalogMatch?.evidence_rating,
          primary_goals: databaseSupplement?.primary_goals ?? catalogMatch?.primary_goals,
          typical_forms: databaseSupplement?.typical_forms ?? catalogMatch?.typical_forms,
          common_dosage: databaseSupplement?.common_dosage ?? catalogMatch?.common_dosage,
          product_count: catalogMatch?.product_count ?? databaseSupplement?.product_count,
          average_price: catalogMatch?.average_price ?? databaseSupplement?.average_price,
        } as Supplement);
      }

      if (productsResult.error) {
        console.error('Error fetching products:', productsResult.error);
      } else {
        const databaseProducts = productsResult.data || [];
        if (!supplementResult.error && databaseSupplement) {
          setProducts(resolveProductsForSupplement(databaseSupplement, databaseProducts));
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
      // brand_id is a string for catalog products and an integer for database
      // rows; compare as strings so the filter works for both.
      result = result.filter(p => String(p.brand_id) === String(filters.brandId));
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

  // Sibling forms of the same ingredient (e.g. Monohydrate | HCl) for the
  // form switcher; null when this supplement is not part of a family.
  const family = useMemo(
    () => (supplement ? familyForSupplement(supplement, supplementCatalog) : null),
    [supplement]
  );

  const knowledge = useMemo(
    () =>
      supplement
        ? getSupplementKnowledge(supplement.supplement_name, supplement.aliases)
        : null,
    [supplement]
  );

  const isResearchOnly = supplement?.research_only ?? false;

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
      <main className="mobile-page">
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
    <main className="mobile-page">
      {/* Back Navigation */}
      <Link
        href="/"
        className="mb-5 hidden min-h-10 items-center gap-2 rounded border border-gray-200 px-3 text-sm text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 md:inline-flex md:border-0 md:px-0"
      >
        <FiArrowLeft />
        <span>All products</span>
      </Link>

      {/* Header */}
      <Stack gap={2} className="mb-5 sm:mb-6">
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
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-4xl leading-tight tracking-normal text-gray-900 sm:text-5xl">
            {supplement.supplement_name}
          </h1>
          {isResearchOnly && (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
              Research reference
            </span>
          )}
        </div>
        <p className="max-w-3xl text-base leading-7 text-gray-600 sm:line-clamp-2">
          {supplement.supplement_description}
        </p>
        {supplement.common_dosage && (
          <p className="text-sm text-gray-500">Typical dose: {supplement.common_dosage}</p>
        )}
        {family && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {family.familyName} forms
            </span>
            {family.members.map((member) => {
              const isCurrent = member.supplement_id === supplement.supplement_id;
              return (
                <Link
                  key={member.supplement_id}
                  href={`/supplement/${member.supplement_id}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={
                    isCurrent
                      ? 'rounded border border-gray-900 bg-gray-900 px-2.5 py-1 text-xs font-medium text-white'
                      : 'rounded border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900'
                  }
                >
                  {familyFormLabel(member.supplement_name, family.familyName)}
                  {typeof member.product_count === 'number' && (
                    <span className={isCurrent ? 'text-gray-300' : 'text-gray-400'}>
                      {' '}({member.product_count})
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </Stack>

      <Stack gap={6}>
        {isResearchOnly ? (
          /* Research-only compounds are documented, not sold. No shopping
             surface — just a prominent safety disclaimer and the wiki. */
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-5">
            <h2 className="text-base font-semibold text-amber-900">
              Reference information only — not for sale
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-amber-800">
              {supplement.supplement_name} is a research compound or prescription
              medication, not a dietary supplement. SuppStack does not sell it and does
              not facilitate its purchase. This page exists for education only and is not
              medical advice. Talk to a licensed healthcare professional before
              considering anything described here.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href={`/stacks/create?supplement=${supplement.supplement_id}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                <FiPlus />
                Add to stack
              </Link>
              <p className="text-xs font-medium text-amber-800">
                Stack planning only; no checkout path is provided.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Filter Panel */}
            <ProductFilterPanel
              products={products}
              filters={filters}
              sortBy={sortBy}
              onFiltersChange={setFilters}
              onSortChange={setSortBy}
              totalResults={filteredProducts.length}
            />

            {filteredProducts.length === 0 ? (
              <EmptyState
                icon={<FiPackage size={32} className="text-gray-400" />}
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
                <Grid cols={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={4}>
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

            {/* Compare Products — only for database-backed products, since the
                compare picker queries Supabase and local catalog products have no
                rows there. */}
            {products.filter(
              (product) =>
                !String(product.product_id).startsWith('real-') &&
                !String(product.product_id).startsWith('catalog-')
            ).length >= 2 && <CompareProducts supplementId={supplementId} />}
          </>
        )}

        {/* Knowledge / wiki surface — shown for every supplement so the
            platform reads as a marketplace + wiki, not just a store. */}
        <SupplementKnowledge supplement={supplement} knowledge={knowledge} />
      </Stack>
    </main>
  );
}
