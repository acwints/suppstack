'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowUpRight, FiSearch, FiShoppingBag } from 'react-icons/fi';
import { useSupplements } from '@/hooks';
import { brandSlug, buildBrandDiscovery } from '@/lib/catalog/brand-discovery';
import { getPreferredPurchaseUrl } from '@/lib/commerce/shopify-ucp';
import { formatCurrency } from '@/lib/utils';
import { Spinner } from '@/components/ui';

export default function BrandsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { supplements, isLoading } = useSupplements({ sortBy: 'popular' });

  const brands = useMemo(
    () => buildBrandDiscovery(supplements, { includeCatalogFallback: true }),
    [supplements]
  );
  const filteredBrands = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return brands;

    return brands.filter((brand) =>
      brand.brandName.toLowerCase().includes(term) ||
      brand.categories.some((category) => category.toLowerCase().includes(term)) ||
      brand.products.some((product) => product.product_name.toLowerCase().includes(term))
    );
  }, [brands, searchTerm]);

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-gray-200">
        <div className="container-custom py-12 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Brand Shop
            </p>
            <h1 className="text-4xl lg:text-5xl font-serif text-gray-900">
              Compare supplement brands by price, quality, and checkout path.
            </h1>
            <p className="text-lg text-gray-600 mt-5">
              Browse vitamins, protein, herbs, and everyday wellness brands by category, price,
              and Shopify purchase path.
            </p>
          </div>

          <div className="relative mt-8 max-w-xl">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search supplements and brands..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
        </div>
      </section>

      <section className="container-custom py-10">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBrands.map((brand) => (
              <article
                key={brand.brandName}
                className="border border-gray-200 rounded bg-white overflow-hidden hover:border-gray-300 transition-colors"
              >
                <div className="relative aspect-[4/3] bg-gray-100">
                  {brand.heroProduct.product_image && (
                    <Image
                      src={brand.heroProduct.product_image}
                      alt={brand.heroProduct.product_name}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-serif text-gray-900">{brand.brandName}</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {brand.productCount} products from {formatCurrency(brand.averagePrice)}
                      </p>
                      <p className="text-xs font-medium text-orange-700 mt-2">
                        {brand.commerceReadyCount} purchase-ready picks
                      </p>
                    </div>
                    <FiShoppingBag className="text-gray-400 shrink-0" />
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
                    <a
                      href={getPreferredPurchaseUrl(brand.heroProduct)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center border border-gray-200 rounded hover:bg-gray-50"
                      aria-label={`Shop ${brand.brandName}`}
                    >
                      <FiArrowUpRight />
                    </a>
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
