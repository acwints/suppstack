'use client';

import Link from 'next/link';
import { FiArrowLeft, FiExternalLink, FiShoppingBag } from 'react-icons/fi';
import ProductCard from '@/app/components/ProductCard';
import { formatCurrency } from '@/lib/utils';
import { buildShopifyCartGroups, getPreferredPurchaseUrl } from '@/lib/commerce/shopify-ucp';
import { compareProductsByCommerceSource } from '@/lib/commerce/product-source';
import { findCatalogBrandBySlug } from '@/lib/catalog/brand-discovery';

export default function BrandDetailPage({ params }: { params: { slug: string } }) {
  const brand = findCatalogBrandBySlug(params.slug);

  if (!brand) {
    return (
      <main className="min-h-screen bg-white">
        <section className="container-custom py-12">
          <Link
            href="/brands"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft />
            Back to brands
          </Link>
          <div className="max-w-xl border-t border-gray-900 pt-8">
            <h1 className="text-4xl font-serif text-gray-900">Brand not found</h1>
            <p className="mt-4 text-gray-600">
              This brand shelf is not in the real merchant catalog yet. Browse the current
              performance brands and Shopify-ready product paths.
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
  const cartGroups = buildShopifyCartGroups(products);
  const heroProduct = products[0] ?? brand.heroProduct;

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-gray-200">
        <div className="container-custom py-10 lg:py-14">
          <Link
            href="/brands"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft />
            Back to brands
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Brand Shelf
              </p>
              <h1 className="mt-3 text-4xl lg:text-5xl font-serif text-gray-900">
                {brand.brandName}
              </h1>
              <p className="mt-5 text-lg text-gray-600">
                Shop {brand.brandName} products across {brand.categories.join(', ')} with
                serving-cost context, refill fit, and Shopify purchase paths in one place.
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
                className="rounded border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="container-custom py-8">
        {cartGroups.length > 0 ? (
          <div className="border border-orange-200 bg-orange-50 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <FiShoppingBag className="text-orange-600" />
                  Shopify merchant cart
                </div>
                <p className="mt-1 text-sm text-gray-700">
                  Add in-stock {brand.brandName} picks to the merchant cart for a faster restock.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                {cartGroups.map((group) => (
                  <a
                    key={group.storeDomain}
                    href={group.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Cart at {group.storeDomain}
                    <FiExternalLink />
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Official product path</p>
                <p className="mt-1 text-sm text-gray-600">
                  This brand has product URLs ready, but not a variant-level Shopify cart yet.
                </p>
              </div>
              <a
                href={getPreferredPurchaseUrl(heroProduct)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
              >
                Shop {brand.brandName}
                <FiExternalLink />
              </a>
            </div>
          </div>
        )}
      </section>

      <section className="container-custom pb-14">
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
