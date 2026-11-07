import assert from 'node:assert/strict';
import type { Product } from '../types';
import { createFallbackPurchaseSession } from '../lib/commerce/purchase-session';
import { buildShopifyCartGroups, getShopifyCartPermalink } from '../lib/commerce/shopify-ucp';
import { resolveShopifyPurchaseSession } from '../lib/commerce/shopify-ucp-server';
import { openInNativeBrowser } from '../lib/native/capacitor';

const product: Product = {
  product_id: 'eval-product',
  product_name: 'Checkout fixture',
  product_description: '',
  product_price: 20,
  product_url: 'https://merchant.example/products/fixture',
  amazon_url: '',
  product_image: '',
  servings_per_container: 30,
  servings_per_day: 2,
  supplement_id: 1,
  shopify_store_domain: 'merchant.example',
  shopify_variant_gid: 'gid://shopify/ProductVariant/123',
  inventory_status: 'in_stock',
};
const results: { id: string; passed: boolean; error?: string }[] = [];

async function evaluate(id: string, run: () => void | Promise<void>) {
  try {
    await run();
    results.push({ id, passed: true });
  } catch (error) {
    results.push({ id, passed: false, error: error instanceof Error ? error.message : String(error) });
  }
}

async function main() {
  await evaluate('COM-01-selected-variant-and-quantity', () => {
    const url = new URL(getShopifyCartPermalink(product, 3)!);
    assert.equal(url.hostname, 'merchant.example');
    assert.equal(url.pathname, '/cart/123:3');
  });
  await evaluate('COM-02-out-of-stock-stays-unavailable', async () => {
    const originalFetch = globalThis.fetch;
    let requests = 0;
    globalThis.fetch = async () => {
      requests += 1;
      throw new Error('An unavailable product must never contact a merchant.');
    };
    try {
      const session = await resolveShopifyPurchaseSession({ ...product, inventory_status: 'out_of_stock' });
      assert.equal(session.status, 'unavailable');
      assert.equal(session.mode, 'unavailable');
      assert.equal(requests, 0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
  await evaluate('COM-03-permalink-does-not-claim-ucp-checkout', async () => {
    const session = await resolveShopifyPurchaseSession(product);
    assert.equal(session.provider, 'shopify');
    assert.equal(session.mode, 'shopify_cart_permalink');
    assert.equal(session.capabilityStatus?.discovery, 'not_required');
    assert.equal(session.capabilityStatus?.checkout, 'fallback');
    assert.equal(session.checkoutId, undefined);
  });
  await evaluate('COM-04-missing-variant-uses-merchant-fallback', async () => {
    const session = await resolveShopifyPurchaseSession({ ...product, shopify_variant_gid: undefined });
    assert.equal(session.purchaseUrl, product.product_url);
    assert.equal(session.status, 'fallback');
    assert.equal(session.cartId, undefined);
  });
  await evaluate('COM-05-multi-merchant-stays-separate', () => {
    const groups = buildShopifyCartGroups([
      product,
      { ...product, product_id: 'second', shopify_store_domain: 'second.example' },
      { ...product, product_id: 'sold-out', inventory_status: 'out_of_stock' },
    ]);
    assert.equal(groups.length, 2);
    assert.equal(groups.reduce((count, group) => count + group.products.length, 0), 2);
    assert.equal(new URL(groups[0].url).pathname, '/cart/123:1');
  });
  await evaluate('COM-06-browser-is-not-a-native-presentation', async () => {
    assert.equal(await openInNativeBrowser('https://merchant.example/cart/123:1'), false);
  });
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  try {
    let openedUrl = '';
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { Capacitor: { isNativePlatform: () => true, Plugins: {
        Browser: { open: async ({ url }: { url: string }) => { openedUrl = url; } },
      } } },
    });
    await evaluate('COM-07-native-presents-selected-checkout', async () => {
      const url = getShopifyCartPermalink(product, 2)!;
      assert.equal(await openInNativeBrowser(url), true);
      assert.equal(new URL(openedUrl).pathname, '/cart/123:2');
    });
    await evaluate('COM-08-native-missing-bridge-is-recoverable', async () => {
      delete window.Capacitor?.Plugins?.Browser;
      assert.equal(await openInNativeBrowser('https://merchant.example/cart/123:1'), false);
    });
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }

  const passed = results.filter((result) => result.passed).length;
  console.log(JSON.stringify({ suite: 'commerce', passed, total: results.length, results }, null, 2));
  if (passed !== results.length) process.exitCode = 1;
}
void main();
