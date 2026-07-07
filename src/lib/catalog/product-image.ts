/**
 * Product imagery standardization. Merchant product photos come in arbitrary
 * aspect ratios; Shopify's image CDN can letterbox any asset into an exact
 * square on a white background (`crop=pad&pad_color=ffffff`), which keeps
 * every product tile visually consistent regardless of the source photo.
 */

const STANDARD_IMAGE_PARAMS: Record<string, string> = {
  width: '900',
  height: '900',
  crop: 'pad',
  pad_color: 'ffffff',
};

export const PRODUCT_IMAGE_FALLBACK = '/icon-512.png';

function normalizeImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return '';
  return imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl;
}

function isKnownBrokenProductImage(imageUrl: string) {
  const lower = imageUrl.toLowerCase();

  return (
    lower.includes('/s/files/1/0035/4654/6274/') &&
    lower.includes('creatine_fro')
  );
}

/**
 * Returns a square, white-padded rendition of a Shopify CDN image.
 * Non-Shopify hosts are returned unchanged (they cannot be transformed);
 * protocol-relative URLs are normalized to https. Idempotent.
 */
export function standardizeProductImage(imageUrl?: string | null): string {
  const normalized = normalizeImageUrl(imageUrl);
  if (!normalized) return '';
  if (isKnownBrokenProductImage(normalized)) return PRODUCT_IMAGE_FALLBACK;

  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    return normalized;
  }

  if (url.hostname !== 'cdn.shopify.com') return normalized;

  for (const [key, value] of Object.entries(STANDARD_IMAGE_PARAMS)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

export function getProductImageSrc(imageUrl?: string | null): string {
  return standardizeProductImage(imageUrl) || PRODUCT_IMAGE_FALLBACK;
}

export function isRemoteImageSrc(imageUrl?: string | null) {
  return Boolean(imageUrl?.startsWith('http://') || imageUrl?.startsWith('https://'));
}
