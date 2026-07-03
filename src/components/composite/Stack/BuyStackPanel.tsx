'use client';

import { useState, useEffect } from 'react';
import { FiShoppingCart, FiExternalLink, FiChevronDown, FiChevronUp, FiCheck } from 'react-icons/fi';
import { supabase } from '@/app/supabase';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import { cn } from '@/lib/design-system/utils';
import { formatPrice } from '@/lib/utils';
import type { StackSupplement, Product } from '@/types';
import {
  buildShopifyCartGroups,
  getPreferredPurchaseUrl,
  getPurchaseLabel,
  isShopifySearchUrl,
} from '@/lib/commerce/shopify-ucp';
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
            },
            databaseForSupplement
          )
        );

        return {
          supplement_name: s.supplement_name,
          supplement_id: s.supplement_id,
          dosage: s.dosage,
          is_core: s.is_core,
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
    const perServing = p.servings_per_container > 0 ? p.product_price / p.servings_per_container : 0;
    return sum + perServing * (p.servings_per_day || 1) * 30.437;
  }, 0);

  const purchasableProducts = checkedProducts.filter(
    item => item.selectedProduct
  );
  const selectedProducts = purchasableProducts
    .map(item => item.selectedProduct)
    .filter((product): product is Product => Boolean(product));
  const cartGroups = buildShopifyCartGroups(selectedProducts);
  const groupedProductIds = new Set(cartGroups.flatMap(group => group.products.map(product => product.product_id)));
  const individualFallbackProducts = selectedProducts.filter(
    product => !groupedProductIds.has(product.product_id)
  );

  const handleBuySelected = () => {
    cartGroups.forEach(group => {
      window.open(group.url, '_blank', 'noopener,noreferrer');
    });
    individualFallbackProducts.forEach(product => {
      window.open(getPreferredPurchaseUrl(product), '_blank', 'noopener,noreferrer');
    });
  };

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
                  ${formatPrice(totalPrice)} total
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
                    onClick={() => toggleCheck(index)}
                    className={cn(
                      'mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors',
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
                      <p className="text-xs text-gray-400">No products available</p>
                    ) : (
                      <select
                        value={item.selectedProduct?.product_id || ''}
                        onChange={(e) => {
                          const prod = item.products.find(p => p.product_id === e.target.value);
                          if (prod) selectProduct(index, prod);
                        }}
                        disabled={!checkedItems.has(index)}
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:opacity-50"
                      >
                        {item.products.map((p) => (
                          <option key={p.product_id} value={p.product_id}>
                            {p.product_name} - ${formatPrice(p.product_price)}
                            {p.brands?.brand_name ? ` (${p.brands.brand_name})` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {item.selectedProduct && checkedItems.has(index) && (
                    <span className="text-sm font-medium text-gray-900 shrink-0">
                      ${formatPrice(item.selectedProduct.product_price)}
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
                ${formatPrice(totalPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estimated monthly cost</span>
              <span className="text-sm font-medium text-gray-700">
                ~${formatPrice(totalMonthlyCost)}/mo
              </span>
            </div>
          </div>

          {cartGroups.length > 0 && (
            <div className="mb-4 rounded-lg border border-orange-100 bg-orange-50 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange-800">
                One-click brand carts
              </div>
              <div className="space-y-2">
                {cartGroups.map(group => (
                  <a
                    key={group.storeDomain}
                    href={group.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded border border-orange-100 bg-white px-3 py-2 text-sm text-gray-800 hover:border-orange-200 hover:bg-orange-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {group.brandNames.join(', ') || group.storeDomain}
                      </span>
                      <span className="text-xs text-gray-500">
                        {group.products.length} item{group.products.length !== 1 ? 's' : ''} in one cart
                      </span>
                    </span>
                    <FiExternalLink className="shrink-0 text-orange-700" size={14} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Buy Actions */}
          <div className="space-y-2">
            {purchasableProducts.length > 0 && (
              <Button
                variant="primary"
                fullWidth
                onClick={handleBuySelected}
                leftIcon={<FiShoppingCart />}
              >
                {cartGroups.length > 0
                  ? `Open ${cartGroups.length} Merchant Cart${cartGroups.length !== 1 ? 's' : ''}`
                  : `Buy ${purchasableProducts.length > 1 ? `All ${purchasableProducts.length}` : ''} Selected`}
              </Button>
            )}

            {checkedProducts.length > 0 && (
              <div className="grid grid-cols-1 gap-1.5">
                {checkedProducts.map(item => {
                  const p = item.selectedProduct;
                  if (!p) return null;
                  return (
                    <div key={p.product_id} className="flex items-center gap-2">
                      {(p.shopify_checkout_url || p.ucp_enabled || p.product_url || p.amazon_url) && (
                        <a
                          href={getPreferredPurchaseUrl(p)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-gray-50"
                        >
                          <FiExternalLink size={10} />
                          {item.supplement_name} · {getPurchaseLabel(p)}
                        </a>
                      )}
                      {p.product_url && !isShopifySearchUrl(p.product_url) && p.product_url !== getPreferredPurchaseUrl(p) && (
                        <a
                          href={p.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-gray-50"
                        >
                          <FiExternalLink size={10} />
                          Official
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export default BuyStackPanel;
