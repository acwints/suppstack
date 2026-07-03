'use client';

import { useState } from 'react';
import { cn } from '@/lib/design-system';
import { getBrandLogoUrl } from '@/lib/catalog/brand-logos';

export interface BrandLogoProps {
  /** Merchant store domain, e.g. "nutricost.com". */
  domain?: string | null;
  brandName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles: Record<NonNullable<BrandLogoProps['size']>, string> = {
  sm: 'h-4 w-4 text-[9px]',
  md: 'h-7 w-7 text-xs',
  lg: 'h-12 w-12 text-lg',
};

/**
 * Merchant brand logo sourced from the store's favicon and served through
 * the same-origin /api/brand-logo proxy. Falls back to a letter monogram
 * when no logo is known or the image fails to load.
 */
export function BrandLogo({ domain, brandName, size = 'md', className }: BrandLogoProps) {
  const [failed, setFailed] = useState(false);
  const logoUrl = getBrandLogoUrl(domain);

  if (!logoUrl || failed) {
    return (
      <span
        aria-hidden
        className={cn(
          'inline-flex flex-shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-50 font-semibold text-gray-500',
          sizeStyles[size],
          className
        )}
      >
        {brandName.charAt(0).toUpperCase()}
      </span>
    );
  }

  // Plain <img>: logos can be ICO/SVG which the Next image optimizer rejects,
  // and the proxy route already handles caching.
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={logoUrl}
      alt={`${brandName} logo`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn(
        'inline-block flex-shrink-0 rounded border border-gray-100 bg-white object-contain',
        sizeStyles[size],
        className
      )}
    />
  );
}

export default BrandLogo;
