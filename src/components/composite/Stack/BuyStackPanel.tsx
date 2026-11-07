'use client';

import { useState, useEffect } from 'react';
import { FiShoppingCart, FiChevronDown, FiChevronUp, FiCheck } from 'react-icons/fi';
import { supabase } from '@/app/supabase';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import { cn } from '@/lib/design-system';
import { calculatePrices, formatCurrency } from '@/lib/utils';
import type { StackSupplement, Product } from '@/types';
import { buildStackCheckout } from '@/lib/commerce/stack-checkout';
import { StackCheckout } from './StackCheckout';
import { mergeProductSources } from '@/lib/commerce/product-source';
import {
  findCatalogSupplementById,
  findCatalogSupplementByName,
  resolveProductsForSupplement,
} from '@/lib/catalog/supplement-catalog';

export interface BuyStackPanelProps {
  stackId: string;
  supplements: StackSupplement[];
  className?: string;
}

interface StackProduct {
  supplement_name: string;
  supplement_id: number;
  dosage?: string;
  is_core: boolean;
  researchOnly: boolean;
  products: Product[];
  selectedProduct: Product | null;
}

export function BuyStackPanel({
  stackId,
  supplements,
  className,
}: BuyStackPanelProps) {
  const [stackProducts, setStackProducts] = useState<StackProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);

      // Fetch products for each supplement in the stack
      const supplementIds = supplements.map(s => s.supplement_id);

      const { data, error } = await supabase
        .from('products')
        .select('*, brands(brand_name), supplements(supplement_name)')
        .in('supplement_id', supplementIds)
        .order('product_price', { ascending: true });

      const databaseProducts = !error && data ? data : [];
      const productsBySupp = new Map<number, Product[]>();
      databaseProducts.forEach((p: Product) => {
        const existing = productsBySupp.get(p.supplement_id) || [];
        existing.push(p);
        productsBySupp.set(p.supplement_id, existing);
      });

      const items: StackProduct[] = supplements.map(s => {
        const databaseForSupplement = productsBySupp.get(s.supplement_id) || [];
        const catalogSupplement =
          findCatalogSupplementById(s.supplement_id) ?? findCatalogSupplementByName(s.supplement_name);
        const prods = mergeProductSources(
          resolveProductsForSupplement(
            {
              supplement_id: s.supplement_id,
              supplement_name: catalogSupplement?.supplement_name ?? s.supplement_name,
              supplement_description: catalogSupplement?.supplement_description ?? '',
              category: catalogSupplement?.category,
              aliases: catalogSupplement?.aliases,
              research_only: catalogSupplement?.research_only,
            },
            databaseForSupplement
          )
        );

        return {
          supplement_name: s.supplement_name,
          supplement_id: s.supplement_id,
          dosage: s.dosage,
          is_core: s.is_core,
          researchOnly: catalogSupplement?.research_only === true,
          products: prods,
          selectedProduct: prods[0] || null,
        };
      });

      setStackProducts(items);
      // Check all core items by default
      const defaultChecked = new Set<number>();
      items.forEach((item, i) => {
        if (item.is_core && item.selectedProduct) {
          defaultChecked.add(i);
        }
      });
      setCheckedItems(defaultChecked);
      setIsLoading(false);
    }

    if (supplements.length > 0) {
      fetchProducts();
    }
  }, [supplements]);

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectProduct = (supplementIndex: number, product: Product) => {
    setStackProducts(prev =>
      prev.map((item, i) =>
        i === supplementIndex ? { ...item, selectedProduct: product } : item
      )
    );
  };

  const checkedProducts = stackProducts.filter((_, i) => checkedItems.has(i));
  const totalPrice = checkedProducts.reduce(
    (sum, item) => sum + (item.selectedProduct?.product_price || 0),
    0
  );
  const totalMonthlyCost = checkedProducts.reduce((sum, item) => {
    const p = item.selectedProduct;
    if (!p) return sum;
    return (
      sum + calculatePrices(p.product_price, p.servings_per_container, p.servings_per_day || 1).monthlyCost
    );
  }, 0);

  const purchasableProducts = checkedProducts.filter(
    item => item.selectedProduct
  );
  const selectedProducts = purchasableProducts
    .map(item => item.selectedProduct)
    .filter((product): product is Product => Boolean(product));
  const merchants = buildStackCheckout(selectedProducts);

  if (isLoading) {
    return (
      <Card variant="default" padding="md" className={className}>
        <div className="flex items-center justify-center py-6">
          <Spinner size="md" />
        </div>
      </Card>
    );
  }

  if (stackProducts.every(item => item.products.length === 0)) {
    return null; // No products found for any supplement
  }

  return (
    <Card variant="default" padding="md" className={className}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <FiShoppingCart className="text-gray-600" size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Buy This Stack</h3>
            <p className="text-sm text-gray-500">
              {checkedProducts.length} product{checkedProducts.length !== 1 ? 's' : ''} selected
              {totalPrice > 0 && (
                <span className="ml-2 font-medium text-gray-700">
                  {formatCurrency(totalPrice)} total
                </span>
              )}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <FiChevronUp className="text-gray-400" size={20} />
        ) : (
          <FiChevronDown className="text-gray-400" size={20} />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {/* Product List */}
          <div className="space-y-3 mb-6">
            {stackProducts.map((item, index) => (
              <div
                key={item.supplement_id}
                className={cn(
                  'p-3 rounded-lg border transition-colors',
                  checkedItems.has(index)
                    ? 'border-gray-200 bg-white'
                    : 'border-gray-100 bg-gray-50 opacity-60'
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    aria-label={`${checkedItems.has(index) ? 'Remove' : 'Include'} ${item.supplement_name} in checkout`}
                    aria-pressed={checkedItems.has(index)}
                    onClick={() => toggleCheck(index)}
                    className={cn(
                      'mt-0.5 w-11 h-11 rounded border flex items-center justify-center shrink-0 transition-colors',
                      checkedItems.has(index)
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    )}
                  >
                    {checkedItems.has(index) && <FiCheck size={12} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {item.supplement_name}
                      </span>
                      {item.is_core && (
                        <Badge variant="primary" size="sm">Core</Badge>
                      )}
                      {item.dosage && (
                        <span className="text-xs text-gray-500">{item.dosage}</span>
                      )}
                    </div>

                    {item.products.length === 0 ? (
                      <p
                        className={cn(
                          'text-xs',
                          item.researchOnly ? 'text-warning-700' : 'text-gray-400'
                        )}
                      >
                        {item.researchOnly
                          ? 'Reference only; no purchase path'
                          : 'No products available'}
                      </p>
                    ) : (
                      <select
                        aria-label={`Product for ${item.supplement_name}`}
                        value={item.selectedProduct?.product_id || ''}
                        onChange={(e) => {
                          // product_id is an integer for database rows;
                          // <option value> is always a string.
                          const prod = item.products.find(p => String(p.product_id) === e.target.value);
                          if (prod) selectProduct(index, prod);
                        }}
                        disabled={!checkedItems.has(index)}
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:opacity-50"
                      >
                        {item.products.map((p) => (
                          <option key={p.product_id} value={p.product_id}>
                            {p.product_name} - {formatCurrency(p.product_price)}
                            {p.brands?.brand_name ? ` (${p.brands.brand_name})` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {item.selectedProduct && checkedItems.has(index) && (
                    <span className="text-sm font-medium text-gray-900 shrink-0">
                      {formatCurrency(item.selectedProduct.product_price)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cost Summary */}
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total one-time cost</span>
              <span className="text-lg font-serif font-medium text-gray-900">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estimated monthly cost</span>
              <span className="text-sm font-medium text-gray-700">
                ~{formatCurrency(totalMonthlyCost)}/mo
              </span>
            </div>
          </div>

          {merchants.length > 0 && (
            <Button variant="primary" fullWidth onClick={() => setCheckoutOpen(true)} leftIcon={<FiShoppingCart />}>
              Review checkout · {merchants.length} merchant{merchants.length !== 1 ? 's' : ''}
            </Button>
          )}
          {selectedProducts.some(product => product.inventory_status === 'out_of_stock') && (
            <p className="mt-2 text-sm text-gray-500">Sold-out products are excluded from checkout.</p>
          )}
        </div>
      )}
      <StackCheckout merchants={merchants} isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </Card>
  );
}
