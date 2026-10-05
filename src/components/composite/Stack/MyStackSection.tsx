'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiPackage, FiSettings } from 'react-icons/fi';
import { ConfirmDialog, EmptyState } from '@/components/ui';
import { calculatePrices, formatCurrency } from '@/lib/utils';
import type { MyStackItem, UserSupplementSettingsInput } from '@/types';
import { SupplementSettingsModal } from './SupplementSettingsModal';

export interface MyStackSectionProps {
  items: MyStackItem[];
  onSaveSettings: (input: UserSupplementSettingsInput) => Promise<void>;
  onRemove: (productId: string) => Promise<void>;
}

function monthlyCostOf(item: MyStackItem): number {
  const { product_price, servings_per_container, servings_per_day } = item.products;
  return calculatePrices(product_price, servings_per_container, servings_per_day).monthlyCost;
}

/**
 * The user's current stack: what they take, what it costs, per-product
 * settings, and removal.
 */
export function MyStackSection({ items, onSaveSettings, onRemove }: MyStackSectionProps) {
  const [editingItem, setEditingItem] = useState<MyStackItem | null>(null);
  const [removingItem, setRemovingItem] = useState<MyStackItem | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const totalMonthlyCost = items
    .filter((item) => item.settings.status === 'active')
    .reduce((sum, item) => sum + monthlyCostOf(item), 0);

  const handleConfirmRemove = async () => {
    if (!removingItem) return;
    setIsRemoving(true);
    try {
      await onRemove(removingItem.product_id);
      setRemovingItem(null);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <section>
      <div className="section-header flex items-end justify-between">
        <h2>My Stack</h2>
        <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">
          Add supplements
        </Link>
      </div>

      {items.length === 0 ? (
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
          {items.map((item) => {
            const monthlyCost = monthlyCostOf(item);

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
                    {monthlyCost > 0 && <span>{formatCurrency(monthlyCost)}/mo</span>}
                    {item.settings.custom_dosage && <span>{item.settings.custom_dosage}</span>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {item.settings.status === 'paused' && (
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      Paused
                    </span>
                  )}
                  <button
                    onClick={() => setEditingItem(item)}
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

      {editingItem && (
        <SupplementSettingsModal
          productId={editingItem.product_id}
          productName={editingItem.products.product_name}
          settings={editingItem.settings}
          onClose={() => setEditingItem(null)}
          onSave={onSaveSettings}
          onRemove={() => {
            setRemovingItem(editingItem);
            setEditingItem(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={removingItem !== null}
        onClose={() => setRemovingItem(null)}
        onConfirm={handleConfirmRemove}
        title="Remove from your stack?"
        description={
          removingItem
            ? `${removingItem.products.product_name} will leave your stack and daily checklist. Your past logs stay.`
            : undefined
        }
        confirmText="Remove"
        isLoading={isRemoving}
        danger
      />
    </section>
  );
}
