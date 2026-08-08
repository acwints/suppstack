'use client';

import { use } from 'react';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import ProductCard from '@/app/components/ProductCard';
import { formatCurrency } from '@/lib/utils';
import { compareProductsByCommerceSource } from '@/lib/commerce/product-source';
import { findCatalogBrandBySlug } from '@/lib/catalog/brand-discovery';
import { BrandLogo } from '@/components/composite/Brand';

export default function BrandDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const brand = findCatalogBrandBySlug(params.slug);

  if (!brand) {
    return (
      <main className="min-h-screen bg-white">
        <section className="container-custom py-12">
          <Link
            href="/brands"
            className="mb-8 hidden items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 md:inline-flex"
          >
            <FiArrowLeft />
            Back to brands
          </Link>
          <div className="max-w-xl border-t border-gray-900 pt-8">
            <h1 className="text-4xl font-serif text-gray-900">Brand not found</h1>
            <p className="mt-4 text-gray-600">
              This brand is not in the verified merchant catalog yet. Browse the current
              brands and their product ranges.
            </p>
            <Link
              href="/brands"
              className="mt-6 inline-flex h-10 items-center justify-center rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
            >
              Browse Brands
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const products = [...brand.products].sort(compareProductsByCommerceSource);

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-gray-200">
        <div className="container-custom py-10 lg:py-14">
          <Link
            href="/brands"
            className="mb-8 hidden items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 md:inline-flex"
          >
            <FiArrowLeft />
            Back to brands
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Brand Shelf
              </p>
              <div className="mt-3 flex items-center gap-4">
                <BrandLogo domain={brand.storeDomains[0]} brandName={brand.brandName} size="lg" />
                <h1 className="text-4xl lg:text-5xl font-serif text-gray-900">
                  {brand.brandName}
                </h1>
              </div>
              <p className="mt-5 text-lg text-gray-600">
                Compare {brand.brandName} products across {brand.categories.join(', ')} with
                serving-cost context before adding them to your stack.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 border-y border-gray-100 py-4 text-center lg:text-left">
              <div>
                <p className="text-2xl font-serif text-gray-900">{brand.productCount}</p>
                <p className="text-xs text-gray-500">Products</p>
              </div>
              <div>
                <p className="text-2xl font-serif text-gray-900">{brand.commerceReadyCount}</p>
                <p className="text-xs text-gray-500">Buy paths</p>
              </div>
              <div>
                <p className="text-2xl font-serif text-gray-900">
                  {formatCurrency(brand.averagePrice)}
                </p>
                <p className="text-xs text-gray-500">Avg. price</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {brand.categories.map((category) => (
              <span
                key={category}
                className="rounded border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600"
              >
                {category}
              </span>
            ))}
            {brand.storeDomains.map((domain) => (
              <span
                key={domain}
                className="rounded border border-accent-200 bg-accent-50 px-2 py-1 text-xs font-medium text-accent-700"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="container-custom py-8 pb-14">
        <div className="section-header">
          <h2>{brand.brandName} Product Shelf</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
