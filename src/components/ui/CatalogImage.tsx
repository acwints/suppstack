'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { getProductImageSrc, isRemoteImageSrc, PRODUCT_IMAGE_FALLBACK } from '@/lib/catalog/product-image';

/** One image normalization and recovery path for catalog photography. */
export function CatalogImage({ src, onError, unoptimized, alt, ...props }: Omit<ImageProps, 'src'> & { src?: string | null }) {
  const normalizedSrc = getProductImageSrc(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const displaySrc = failedSrc === normalizedSrc ? PRODUCT_IMAGE_FALLBACK : normalizedSrc;

  return (
    <Image
      {...props}
      alt={alt}
      src={displaySrc}
      unoptimized={unoptimized ?? isRemoteImageSrc(displaySrc)}
      onError={(event) => {
        if (displaySrc !== PRODUCT_IMAGE_FALLBACK) setFailedSrc(normalizedSrc);
        onError?.(event);
      }}
    />
  );
}
