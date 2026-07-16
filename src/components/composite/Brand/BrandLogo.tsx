'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  sm: 'h-5 w-5 text-xs',
  md: 'h-7 w-7 text-xs',
  lg: 'h-12 w-12 text-lg',
};

const imageDimensions: Record<NonNullable<BrandLogoProps['size']>, number> = {
  sm: 20,
  md: 28,
  lg: 48,
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

  return (
    <Image
      src={logoUrl}
      alt={`${brandName} logo`}
      width={imageDimensions[size]}
      height={imageDimensions[size]}
      unoptimized
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
