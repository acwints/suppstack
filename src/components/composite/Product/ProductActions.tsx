'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck, FaPlus, FaShoppingCart } from 'react-icons/fa';
import { FiBookmark } from 'react-icons/fi';
import type { Product } from '@/types';
import { Button, useToast } from '@/components/ui';
import { EmbeddedCheckout } from '@/components/composite/Commerce';
import { useAuth } from '@/app/context/AuthContext';
import { useSavedProducts } from '@/app/context/SavedProductsContext';
import { useStackIngredientsContext } from '@/app/context/StackIngredientsContext';
import { useCommerceCheckout, useProductInStack } from '@/hooks';
import { summarizeProductAddition } from '@/lib/ingredients/mapProductIngredients';
import { canPurchase, getPurchaseLabel } from '@/lib/commerce/shopify-ucp';
import { hasShopifyVariant } from '@/lib/commerce/product-source';
import { cn } from '@/lib/design-system/utils';

export interface ProductActionsProps {
  product: Product;
  variant?: 'compact' | 'detail' | 'sticky';
  className?: string;
}

export function ProductActions({
  product,
  variant = 'detail',
  className,
}: ProductActionsProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { isInStack, isUpdating, addToStack } = useProductInStack(product);
  const { isStartingCheckout, startCheckout } = useCommerceCheckout();
  const { isSaved, toggleSaved } = useSavedProducts();
  // Shared stack-intake context (single fetch across the app). Read via
  // context — NOT a direct `useStackIngredients` call — because this component
  // renders inside every product tile/card. Absent/loading/errored context
  // degrades to the plain "Added to stack" toast and never blocks the add.
  const { ingredientNames, isLoading: isIntakeLoading, error: intakeError } =
    useStackIngredientsContext();
  const productId = String(product.product_id);
  const saved = isSaved(productId);

  /**
   * Build the enriched success-toast description from the product's tracked
   * composition and the current stack overlap. Returns undefined (plain toast)
   * whenever intake data is unavailable or there is nothing meaningful to add.
   */
  const buildAddedDescription = (): string | undefined => {
    if (isIntakeLoading || intakeError) return undefined;
    const composition = product.ingredients ?? [];
    if (composition.length === 0) return undefined;

    try {
      const { addedCount, overlapCount } = summarizeProductAddition(composition, ingredientNames);
      const parts: string[] = [];
      if (addedCount > 0) {
        parts.push(`Adds ${addedCount} ${addedCount === 1 ? 'ingredient' : 'ingredients'}`);
      }
      if (overlapCount > 0) {
        parts.push(`${overlapCount} overlap with your stack`);
      }
      return parts.length > 0 ? parts.join(' · ') : undefined;
    } catch {
      // Never let intake summarization break the add-to-stack flow.
      return undefined;
    }
  };

  const handleAddToStack = async () => {
    if (!user) {
      toast.info('Please log in to add products to your stack');
      router.push('/login');
      return;
    }

    try {
      await addToStack();
      toast.success('Added to stack', buildAddedDescription());
    } catch {
      toast.error('Failed to add product to stack. Please try again.');
    }
  };

  const handleStartCheckout = async () => {
    if (hasShopifyVariant(product)) {
      setIsCheckoutOpen(true);
      return;
    }

    try {
      await startCheckout(product);
    } catch {
      toast.error('Unable to open purchase link. Please try again.');
    }
  };

  if (variant === 'compact') {
    return (
      <>
        <button
          type="button"
          onClick={handleAddToStack}
          disabled={isInStack || isUpdating}
          aria-label={isInStack ? `${product.product_name} is in your stack` : `Add ${product.product_name} to stack`}
          className={cn(
            'flex min-h-10 min-w-10 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-sm backdrop-blur transition-colors',
            'hover:border-gray-300 hover:bg-white hover:text-gray-950 active:bg-gray-50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900',
            'disabled:cursor-default disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-700',
            className
          )}
        >
          {isInStack ? (
            <FaCheck className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <FaPlus className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      </>
    );
  }

  if (variant === 'sticky') {
    return (
      <>
        <div className={cn('flex min-w-0 flex-1 items-center gap-2', className)}>
          <Button
            onClick={handleAddToStack}
            disabled={isInStack || isUpdating}
            variant={isInStack ? 'outline' : 'primary'}
            size="lg"
            leftIcon={isInStack ? <FaCheck /> : <FaPlus />}
            isLoading={isUpdating}
            className={cn('min-h-11 flex-1', isInStack && 'bg-gray-100 text-gray-700 border-gray-200')}
          >
            {isInStack ? 'In Stack' : 'Add'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleStartCheckout}
            disabled={!canPurchase(product)}
            isLoading={isStartingCheckout}
            leftIcon={<FaShoppingCart />}
            className="min-h-11 flex-1"
          >
            Buy
          </Button>
        </div>

        <EmbeddedCheckout
          product={product}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className={cn('flex flex-col gap-2 sm:flex-row', className)}>
        <Button
          onClick={handleAddToStack}
          disabled={isInStack || isUpdating}
          variant={isInStack ? 'outline' : 'primary'}
          size="lg"
          leftIcon={isInStack ? <FaCheck /> : <FaPlus />}
          isLoading={isUpdating}
          className={cn('flex-1', isInStack && 'bg-gray-100 text-gray-700 border-gray-200')}
        >
          {isInStack ? 'In Stack' : 'Add to Stack'}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleStartCheckout}
          disabled={!canPurchase(product)}
          isLoading={isStartingCheckout}
          leftIcon={<FaShoppingCart />}
          className="flex-1"
        >
          {getPurchaseLabel(product)}
        </Button>
        <Button
          type="button"
          variant={saved ? 'secondary' : 'ghost'}
          size="lg"
          onClick={() => toggleSaved(product)}
          leftIcon={<FiBookmark className={saved ? 'fill-current' : ''} />}
          aria-pressed={saved}
        >
          {saved ? 'Saved' : 'Save'}
        </Button>
      </div>

      <EmbeddedCheckout
        product={product}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}

export default ProductActions;
