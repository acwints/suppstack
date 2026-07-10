'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { brandSlug, buildCatalogBrandDiscovery } from '@/lib/catalog/brand-discovery';
import { brandMatchesCatalogQuery } from '@/lib/catalog/catalog-search';
import { formatCurrency } from '@/lib/utils';
import { BrandLogo } from '@/components/composite/Brand';
import { EnhancedSearchBar } from '@/components/composite/Search';
import { getProductImageSrc, isRemoteImageSrc } from '@/lib/catalog/product-image';

export default function BrandsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const brands = useMemo(
    () => buildCatalogBrandDiscovery({ includeCatalogFallback: true }),
    []
  );
  const filteredBrands = useMemo(() => {
    const term = searchTerm.trim();
    if (!term) return brands;

    return brands.filter((brand) => brandMatchesCatalogQuery(brand, term));
  }, [brands, searchTerm]);

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-gray-200">
        <div className="container-custom py-6 sm:py-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Brand Shop
            </p>
            <h1 className="text-3xl font-serif text-gray-900">
              Shop Brands
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Find brands by name, product, category, or official store domain.
            </p>
          </div>

          <div className="mt-6 max-w-xl">
            <EnhancedSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onSubmit={(term) => router.push(`/search?q=${encodeURIComponent(term)}`)}
              placeholder="Search supplements and brands..."
            />
          </div>
        </div>
      </section>

      <section className="container-custom py-10">
        {filteredBrands.length === 0 ? (
          <div className="rounded border border-gray-200 bg-gray-50 p-10 text-center">
            <p className="text-base font-medium text-gray-900">
              No brands match &ldquo;{searchTerm}&rdquo;
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Try a shorter term, or browse every brand below.
            </p>
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
            >
              Show all brands
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBrands.map((brand) => (
              <article
                key={brand.brandName}
                className="border border-gray-200 rounded bg-white overflow-hidden hover:border-gray-300 transition-colors"
              >
                <div className="relative aspect-[4/3] border-b border-gray-100 bg-white">
                  {brand.heroProduct.product_image && (
                    <Image
                      src={getProductImageSrc(brand.heroProduct.product_image)}
                      alt={brand.heroProduct.product_name}
                      fill
                      className="object-contain p-6"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      unoptimized={isRemoteImageSrc(getProductImageSrc(brand.heroProduct.product_image))}
                    />
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <BrandLogo
                        domain={brand.storeDomains[0]}
                        brandName={brand.brandName}
                        size="lg"
                      />
                      <div>
                        <h2 className="text-xl font-serif text-gray-900">{brand.brandName}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {brand.productCount} products from{' '}
                          {formatCurrency(
                            Math.min(...brand.products.map((product) => product.product_price))
                          )}
                        </p>
                        <p className="text-xs font-medium text-orange-700 mt-2">
                          {brand.commerceReadyCount} purchase-ready picks
                        </p>
                      </div>
                    </div>
                    <FiArrowRight className="text-gray-400 shrink-0" />
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {brand.categories.slice(0, 3).map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded"
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex gap-3">
                    <Link
                      href={`/brands/${brandSlug(brand.brandName)}`}
                      className="inline-flex h-10 flex-1 items-center justify-center rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      View Brand Shelf
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
