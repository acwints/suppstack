import { isNativeApp, openInNativeBrowser } from './capacitor';

export function isSecureCheckoutUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password;
  } catch { return false; }
}

function validateCheckoutUrl(url: string) {
  if (!isSecureCheckoutUrl(url)) {
    throw new Error('A secure merchant checkout URL is required.');
  }
}

export type MerchantCheckoutOutcome = NativeCheckoutResult['status'] | 'opened';

/** One merchant handoff for product and stack checkout; only the SDK confirms completion. */
export async function presentMerchantCheckout(url: string, shopifyCheckout: boolean): Promise<MerchantCheckoutOutcome> {
  validateCheckoutUrl(url);
  if (isNativeApp()) {
    const result = shopifyCheckout ? await presentNativeCheckout(url) : null;
    if (result) return result.status;
    return await openInNativeBrowser(url) ? 'opened' : 'failed';
  }
  // No await before window.open: preserve the buyer gesture for popup blockers.
  const opened = window.open(url, '_blank');
  if (!opened) return 'failed';
  opened.opener = null;
  return 'opened';
}

export type NativeCheckoutResult = {
  status: 'completed' | 'dismissed' | 'failed';
};

interface NativeCheckoutPlugin {
  present(options: { url: string }): Promise<NativeCheckoutResult>;
}

export async function presentNativeCheckout(url: string): Promise<NativeCheckoutResult | null> {
  if (!isNativeApp()) return null;
  const plugin = (window.Capacitor?.Plugins as Record<string, unknown> | undefined)
    ?.SuppStackCheckout as NativeCheckoutPlugin | undefined;
  // Previously installed binaries use the merchant-browser fallback.
  if (!plugin) return null;

  validateCheckoutUrl(url);

  const result = await plugin.present({ url });
  if (!['completed', 'dismissed', 'failed'].includes(result?.status)) {
    throw new Error('Checkout returned an unrecognized outcome.');
  }
  return result;
}
