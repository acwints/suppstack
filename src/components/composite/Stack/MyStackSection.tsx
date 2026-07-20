'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiPackage, FiSettings } from 'react-icons/fi';
import { Button, EmptyState } from '@/components/ui';
import { SupplementSettingsModal } from '@/components/composite/Tracking';
import { useRegimenCost, useSupplementSettings } from '@/hooks';
import { formatCurrency } from '@/lib/utils';
import type { RegimenItem, UserSupplementSettingsInput } from '@/types';

export interface MyStackSectionProps {
  regimen: RegimenItem[];
}

/**
 * The user's current stack: what they take, what it costs, per-product
 * settings. Lives on the Log tab — the stack is the thing you log.
 */
export function MyStackSection({ regimen }: MyStackSectionProps) {
  const { getSettings, createSettings } = useSupplementSettings();
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);

  const { totalMonthlyCost } = useRegimenCost(
    regimen
      .filter((item) => (item.settings?.status ?? 'active') === 'active')
      .map((item) => ({
        product_price: item.products.product_price,
        servings_per_container: item.products.servings_per_container,
        servings_per_day: item.products.servings_per_day,
      }))
  );

  const handleSaveSettings = async (settingsInput: UserSupplementSettingsInput) => {
    await createSettings(settingsInput);
  };

  return (
    <section>
      <div className="section-header flex items-end justify-between">
        <h2>My Stack</h2>
        <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">
          Add supplements
        </Link>
      </div>

      {regimen.length === 0 ? (
        <EmptyState
          icon={<FiPackage size={32} className="text-gray-400" />}
          title="No supplements yet"
          description="Add products to your stack and they'll appear here and on your daily log."
          action={
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
            >
              Browse supplements
            </Link>
          }
          variant="card"
        />
      ) : (
        <div>
          {regimen.map((item) => {
            const pricePerServing =
              item.products.servings_per_container > 0
                ? item.products.product_price / item.products.servings_per_container
                : 0;
            const costPerMonth = pricePerServing * item.products.servings_per_day * 30.437;
            const productSettings = item.settings ?? getSettings(item.product_id);

            return (
              <div
                key={item.product_id}
                className="flex items-center justify-between border-b border-gray-100 py-4 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-medium text-gray-900">
                    {item.products.product_name}
                  </h4>
                  <p className="mt-0.5 truncate text-sm text-gray-500">
                    {item.products.supplements.supplement_name} &middot;{' '}
                    {item.products.brands.brand_name}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-sm text-gray-600">
                    {costPerMonth > 0 && <span>{formatCurrency(costPerMonth)}/mo</span>}
                    {productSettings?.custom_dosage && <span>{productSettings.custom_dosage}</span>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {productSettings?.status === 'paused' && (
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      Paused
                    </span>
                  )}
                  <button
                    onClick={() =>
                      setSelectedProduct({ id: item.product_id, name: item.products.product_name })
                    }
                    aria-label={`Settings for ${item.products.product_name}`}
                    className="flex min-h-11 min-w-11 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 active:bg-gray-100"
                  >
                    <FiSettings size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-5">
            <span className="font-medium text-gray-700">Total monthly cost</span>
            <span className="font-serif text-xl text-gray-900">
              {formatCurrency(totalMonthlyCost)}
            </span>
          </div>
        </div>
      )}

      {selectedProduct && (
        <SupplementSettingsModal
          isOpen
          onClose={() => setSelectedProduct(null)}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          existingSettings={getSettings(selectedProduct.id)}
          onSave={handleSaveSettings}
        />
      )}
    </section>
  );
}
