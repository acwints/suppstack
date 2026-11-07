import assert from 'node:assert/strict';
import type { Product } from '../types';
import { createFallbackPurchaseSession } from '../lib/commerce/purchase-session';
import { buildShopifyCartGroups, getShopifyCartPermalink } from '../lib/commerce/shopify-ucp';
import { resolveShopifyPurchaseSession } from '../lib/commerce/shopify-ucp-server';
import { buildStackCheckout } from '../lib/commerce/stack-checkout';
import { openInNativeBrowser } from '../lib/native/capacitor';
import { presentMerchantCheckout, presentNativeCheckout } from '../lib/native/checkout';

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
  await evaluate('COM-STACK-PLAN-01-one-container-per-variant', () => {
    const groups = buildStackCheckout([product, product, { ...product, product_id: 'duplicate-variant' }]);
    assert.equal(groups.length, 1);
    assert.equal(new URL(groups[0].url).pathname, '/cart/123:1');
    assert.equal(groups[0].products.length, 2);
  });
  await evaluate('COM-STACK-PLAN-02-sold-out-never-becomes-fallback', () => {
    assert.deepEqual(buildStackCheckout([{ ...product, inventory_status: 'out_of_stock' }]), []);
  });
  await evaluate('COM-STACK-PLAN-03-mixed-destinations-retain-their-presentation', () => {
    const plan = buildStackCheckout([product, {
      ...product, product_id: 'official', shopify_store_domain: undefined, shopify_variant_gid: undefined,
      product_url: 'https://official.example/products/fixture',
    }]);
    assert.equal(plan.length, 2);
    assert.equal(plan[0].nativeCheckout, true);
    assert.equal(plan[1].nativeCheckout, false);
    assert.equal(plan[1].url, 'https://official.example/products/fixture');
  });
  await evaluate('COM-STACK-PLAN-04-untrusted-destinations-are-not-actions', () => {
    for (const url of ['javascript:alert(1)', 'http://merchant.example/buy', 'https://user:secret@merchant.example/buy', '']) {
      assert.deepEqual(buildStackCheckout([{
        ...product, shopify_store_domain: undefined, shopify_variant_gid: undefined, product_url: url,
      }]), []);
    }
  });
  await evaluate('COM-STACK-PLAN-05-shared-fallback-has-one-action', () => {
    const fallback = { ...product, shopify_store_domain: undefined, shopify_variant_gid: undefined };
    const plan = buildStackCheckout([fallback, { ...fallback, product_id: 'second' }]);
    assert.equal(plan.length, 1);
    assert.equal(plan[0].products.length, 2);
  });
  await evaluate('COM-STACK-PLAN-06-cart-identity-survives-selection-reordering', () => {
    const second = { ...product, product_id: 'second', shopify_variant_gid: 'gid://shopify/ProductVariant/456' };
    assert.equal(buildStackCheckout([product, second])[0].id, buildStackCheckout([second, product])[0].id);
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
    await evaluate('COM-09-old-binary-falls-back-without-sdk', async () => {
      assert.equal(await presentNativeCheckout('https://merchant.example/cart/123:1'), null);
    });
    await evaluate('COM-10-sdk-rejects-insecure-url-before-presenting', async () => {
      const plugins = window.Capacitor!.Plugins as Record<string, unknown>;
      let calls = 0;
      plugins.SuppStackCheckout = { present: async () => { calls += 1; return { status: 'completed' }; } };
      await assert.rejects(presentNativeCheckout('http://merchant.example/cart/123:1'));
      assert.equal(calls, 0);
    });
    await evaluate('COM-11-unknown-sdk-outcome-is-not-success', async () => {
      const plugins = window.Capacitor!.Plugins as Record<string, unknown>;
      plugins.SuppStackCheckout = { present: async () => ({ status: 'unknown' }) };
      await assert.rejects(presentNativeCheckout('https://merchant.example/cart/123:1'));
    });
    await evaluate('COM-PARITY-01-direct-shopify-uses-sdk', async () => {
      const plugins = window.Capacitor!.Plugins as Record<string, unknown>;
      plugins.SuppStackCheckout = { present: async () => ({ status: 'completed' }) };
      assert.equal(await presentMerchantCheckout('https://merchant.example/checkouts/fixture', true), 'completed');
      const plan = buildStackCheckout([{ ...product, shopify_variant_gid: undefined, shopify_checkout_url: 'https://merchant.example/checkouts/fixture' }]);
      assert.equal(plan[0].nativeCheckout, true);
    });
    await evaluate('COM-PARITY-02-official-page-uses-browser', async () => {
      const plugins = window.Capacitor!.Plugins as Record<string, unknown>;
      plugins.SuppStackCheckout = { present: async () => { throw new Error('Official pages must not enter Checkout Kit'); } };
      assert.equal(await presentMerchantCheckout('https://merchant.example/products/fixture', false), 'opened');
    });
    await evaluate('COM-PARITY-03-sdk-error-does-not-auto-reopen', async () => {
      const plugins = window.Capacitor!.Plugins as Record<string, unknown>;
      plugins.SuppStackCheckout = { present: async () => { throw new Error('SDK failed'); } };
      openedUrl = '';
      await assert.rejects(presentMerchantCheckout('https://merchant.example/checkouts/fixture', true));
      assert.equal(openedUrl, '');
    });
    await evaluate('COM-PARITY-04-insecure-destination-never-opens', async () => {
      openedUrl = '';
      await assert.rejects(presentMerchantCheckout('http://merchant.example/cart/123:1', false));
      assert.equal(openedUrl, '');
    });
    await evaluate('COM-PARITY-05-web-popup-keeps-buyer-gesture', async () => {
      const capacitor = window.Capacitor!;
      const native = capacitor.isNativePlatform;
      capacitor.isNativePlatform = () => false;
      let calls = 0;
      window.open = () => { calls += 1; return null; };
      try {
        const result = presentMerchantCheckout('https://merchant.example/cart/123:1', true);
        assert.equal(calls, 1);
        assert.equal(await result, 'failed');
      } finally { capacitor.isNativePlatform = native; }
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
