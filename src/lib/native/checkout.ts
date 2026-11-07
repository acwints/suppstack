import { isNativeApp } from './capacitor';

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

  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new Error('A secure merchant checkout URL is required.');
  }

  const result = await plugin.present({ url });
  if (!['completed', 'dismissed', 'failed'].includes(result?.status)) {
    throw new Error('Checkout returned an unrecognized outcome.');
  }
  return result;
}
