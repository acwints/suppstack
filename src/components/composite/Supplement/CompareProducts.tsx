'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiX, FiPlus, FiCheck, FiStar, FiExternalLink } from 'react-icons/fi';
import { supabase } from '@/app/supabase';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import { cn } from '@/lib/design-system/utils';
import { formatPrice } from '@/lib/utils';
import { isListableDatabaseProduct } from '@/lib/catalog/supplement-catalog';
import type { Product } from '@/types';

export interface CompareProductsProps {
  supplementId: number;
  initialProductIds?: string[];
  className?: string;
}

interface CompareProduct extends Product {
  rating_stats?: {
    average_rating: number;
    total_reviews: number;
  };
}

const MAX_COMPARE = 3;

export function CompareProducts({
  supplementId,
  initialProductIds = [],
  className,
}: CompareProductsProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialProductIds);
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [allProducts, setAllProducts] = useState<CompareProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Fetch all products for this supplement
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brands(brand_name),
          supplements(supplement_name),
          product_rating_stats(average_rating, total_reviews)
        `)
        .eq('supplement_id', supplementId)
        .order('product_name');

      if (!error && data) {
        const mapped = data
          .filter((p: any) => isListableDatabaseProduct(p))
          .map((p: any) => ({
            ...p,
            rating_stats: p.product_rating_stats?.[0] || null,
          }));
        setAllProducts(mapped);
      }

      setIsLoading(false);
    }

    fetchProducts();
  }, [supplementId]);

  // Update comparison products when selection changes
  useEffect(() => {
    const selected = allProducts.filter(p => selectedIds.includes(p.product_id));
    setProducts(selected);
  }, [selectedIds, allProducts]);

  const addProduct = (productId: string) => {
    if (selectedIds.length < MAX_COMPARE && !selectedIds.includes(productId)) {
      setSelectedIds(prev => [...prev, productId]);
    }
    setShowPicker(false);
  };

  const removeProduct = (productId: string) => {
    setSelectedIds(prev => prev.filter(id => id !== productId));
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={className}
        size="sm"
      >
        Compare Products
      </Button>
    );
  }

  const costPerServing = (p: Product) =>
    p.servings_per_container > 0 ? p.product_price / p.servings_per_container : 0;

  const monthlyCost = (p: Product) =>
    costPerServing(p) * (p.servings_per_day || 1) * 30.437;

  const availableProducts = allProducts.filter(p => !selectedIds.includes(p.product_id));

  return (
    <Card variant="outlined" padding="md" className={cn('mt-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Compare Products</h3>
        <button
          onClick={() => {
            setIsOpen(false);
            setSelectedIds([]);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX size={18} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
        </div>
      ) : (
        <>
          {/* Product Slots */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: MAX_COMPARE }).map((_, i) => {
              const product = products[i];

              if (!product) {
                return (
                  <button
                    key={`slot-${i}`}
                    onClick={() => setShowPicker(true)}
                    className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
                  >
                    <FiPlus size={24} />
                    <span className="text-sm">Add Product</span>
                  </button>
                );
              }

              return (
                <div key={product.product_id} className="border border-gray-200 rounded-lg p-4 relative">
                  <button
                    onClick={() => removeProduct(product.product_id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                  <div className="text-center mb-3">
                    {product.product_image ? (
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <Image
                          src={product.product_image}
                          alt={product.product_name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-400">
                          {product.product_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {product.product_name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {product.brands?.brand_name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Product Picker */}
          {showPicker && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Select a product</span>
                <button
                  onClick={() => setShowPicker(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={16} />
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {availableProducts.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-3">
                    No more products available to compare
                  </p>
                ) : (
                  availableProducts.map((p) => (
                    <button
                      key={p.product_id}
                      onClick={() => addProduct(p.product_id)}
                      className="flex items-center justify-between w-full px-3 py-2 text-left text-sm rounded-md hover:bg-white transition-colors"
                    >
                      <div>
                        <span className="text-gray-900">{p.product_name}</span>
                        <span className="text-gray-400 ml-2">{p.brands?.brand_name}</span>
                      </div>
                      <span className="text-gray-500">${formatPrice(p.product_price)}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Comparison Table */}
          {products.length >= 2 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium text-xs uppercase tracking-wider">
                      Attribute
                    </th>
                    {products.map((p) => (
                      <th
                        key={p.product_id}
                        className="text-center py-2 px-2 text-gray-900 font-medium text-xs"
                      >
                        {p.product_name.length > 20
                          ? p.product_name.slice(0, 20) + '...'
                          : p.product_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 pr-4 text-gray-600">Price</td>
                    {products.map((p) => {
                      const lowestPrice = Math.min(...products.map(pp => pp.product_price));
                      return (
                        <td
                          key={p.product_id}
                          className={cn(
                            'py-2.5 px-2 text-center font-medium',
                            p.product_price === lowestPrice ? 'text-green-600' : 'text-gray-900'
                          )}
                        >
                          ${formatPrice(p.product_price)}
                          {p.product_price === lowestPrice && (
                            <Badge variant="success" size="sm" className="ml-1">Best</Badge>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 pr-4 text-gray-600">Per Serving</td>
                    {products.map((p) => {
                      const costs = products.map(pp => costPerServing(pp)).filter(cost => cost > 0);
                      const lowest = costs.length > 0 ? Math.min(...costs) : 0;
                      const thisCost = costPerServing(p);
                      return (
                        <td
                          key={p.product_id}
                          className={cn(
                            'py-2.5 px-2 text-center font-medium',
                            thisCost > 0 && thisCost === lowest ? 'text-green-600' : 'text-gray-900'
                          )}
                        >
                          {thisCost > 0 ? `$${formatPrice(thisCost)}` : '—'}
                          {thisCost > 0 && thisCost === lowest && (
                            <Badge variant="success" size="sm" className="ml-1">Best</Badge>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 pr-4 text-gray-600">Monthly Cost</td>
                    {products.map((p) => {
                      const costs = products.map(pp => monthlyCost(pp)).filter(cost => cost > 0);
                      const lowest = costs.length > 0 ? Math.min(...costs) : 0;
                      const thisCost = monthlyCost(p);
                      return (
                        <td
                          key={p.product_id}
                          className={cn(
                            'py-2.5 px-2 text-center font-medium',
                            thisCost > 0 && thisCost === lowest ? 'text-green-600' : 'text-gray-900'
                          )}
                        >
                          {thisCost > 0 ? `$${formatPrice(thisCost)}` : '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 pr-4 text-gray-600">Servings</td>
                    {products.map((p) => (
                      <td key={p.product_id} className="py-2.5 px-2 text-center text-gray-900">
                        {p.servings_per_container > 0 ? p.servings_per_container : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 pr-4 text-gray-600">Daily Servings</td>
                    {products.map((p) => (
                      <td key={p.product_id} className="py-2.5 px-2 text-center text-gray-900">
                        {p.servings_per_day}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 pr-4 text-gray-600">Rating</td>
                    {products.map((p) => {
                      const rating = p.rating_stats?.average_rating;
                      return (
                        <td key={p.product_id} className="py-2.5 px-2 text-center">
                          {rating ? (
                            <span className="inline-flex items-center gap-1 text-gray-900">
                              <FiStar className="text-amber-400" size={12} />
                              {rating.toFixed(1)}
                              <span className="text-gray-400 text-xs">
                                ({p.rating_stats?.total_reviews})
                              </span>
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-gray-600">Buy</td>
                    {products.map((p) => (
                      <td key={p.product_id} className="py-2.5 px-2 text-center">
                        <Link href={`/product/${p.product_id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {products.length < 2 && (
            <p className="text-sm text-gray-400 text-center py-4">
              Select at least 2 products to compare
            </p>
          )}
        </>
      )}
    </Card>
  );
}

export default CompareProducts;
