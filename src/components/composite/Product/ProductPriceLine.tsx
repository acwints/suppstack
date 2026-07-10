import type { Product } from '@/types';
import { calculatePrices, formatPrice } from '@/lib/utils';
import { cn } from '@/lib/design-system/utils';

export interface ProductPriceLineProps {
  product: Product;
  size?: 'compact' | 'detail';
  className?: string;
}

export function ProductPriceLine({
  product,
  size = 'compact',
  className,
}: ProductPriceLineProps) {
  const { costPerServing, dailyCost } = calculatePrices(
    product.product_price,
    product.servings_per_container,
    product.servings_per_day
  );

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      <span
        className={cn(
          'font-semibold leading-5 text-gray-900',
          size === 'detail' ? 'text-xl' : 'text-sm'
        )}
      >
        ${formatPrice(product.product_price)}
      </span>
      {costPerServing > 0 && (
        <span className="text-xs leading-5 text-gray-500">
          ${formatPrice(costPerServing)}/serving
        </span>
      )}
      {size === 'detail' && dailyCost > 0 && product.servings_per_day > 0 && (
        <span className="text-xs leading-5 text-gray-500">
          ${formatPrice(dailyCost)}/day
        </span>
      )}
    </div>
  );
}

export default ProductPriceLine;
