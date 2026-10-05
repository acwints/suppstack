/**
 * Normalize a `product_url` into a stable comparison key. The stack's
 * "in your stack" marker is keyed on it because it survives the catalog-id
 * vs DB-id namespace split.
 */
export function normalizeProductUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  const cleaned = url.trim().toLowerCase();
  return cleaned === '' ? null : cleaned;
}
