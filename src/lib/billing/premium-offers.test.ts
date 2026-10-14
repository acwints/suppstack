import assert from 'node:assert/strict';
import test from 'node:test';
import { isEntitlementActive } from './entitlements';
import {
  APP_STORE_PREMIUM_ANNUAL_PRODUCT_ID,
  APP_STORE_PREMIUM_MONTHLY_PRODUCT_ID,
  premiumPurchaseHref,
  resolvePaywallAction,
  toPremiumOffers,
  type RcPackage,
} from './premium-offers';

function pkg(overrides: Partial<RcPackage> & { productId: string; packageType?: string }): RcPackage {
  return {
    identifier: overrides.identifier ?? overrides.productId,
    packageType: overrides.packageType ?? 'MONTHLY',
    webCheckoutUrl: overrides.webCheckoutUrl,
    presentedOfferingContext: overrides.presentedOfferingContext ?? { offeringIdentifier: 'default' },
    product: {
      identifier: overrides.productId,
      price: overrides.product?.price ?? 5.99,
      priceString: overrides.product?.priceString ?? '$5.99',
      currencyCode: 'USD',
      pricePerMonthString: overrides.product?.pricePerMonthString,
      subscriptionPeriod: overrides.product?.subscriptionPeriod,
      introPrice: overrides.product?.introPrice,
    },
  };
}

const annual = pkg({
  productId: APP_STORE_PREMIUM_ANNUAL_PRODUCT_ID,
  packageType: 'ANNUAL',
  identifier: '$rc_annual',
  product: {
    identifier: APP_STORE_PREMIUM_ANNUAL_PRODUCT_ID,
    price: 39.99,
    priceString: '$39.99',
    currencyCode: 'USD',
    pricePerMonthString: '$3.33',
    subscriptionPeriod: 'P1Y',
    introPrice: { price: 0, priceString: '$0.00', periodUnit: 'WEEK', periodNumberOfUnits: 1 },
  },
});

const monthly = pkg({
  productId: APP_STORE_PREMIUM_MONTHLY_PRODUCT_ID,
  packageType: 'MONTHLY',
  identifier: '$rc_monthly',
  product: {
    identifier: APP_STORE_PREMIUM_MONTHLY_PRODUCT_ID,
    price: 5.99,
    priceString: '$5.99',
    currencyCode: 'USD',
    subscriptionPeriod: 'P1M',
  },
});

test('an expired review entitlement does not unlock Premium', () => {
  assert.equal(
    isEntitlementActive({
      status: 'expired',
      current_period_end: '2026-08-01T00:00:00.000Z',
    }),
    false
  );
});

test('iPad expired user sees both App Store plans and no web checkout', () => {
  const offers = toPremiumOffers(
    [
      monthly,
      annual,
      pkg({
        productId: 'premium_monthly_ios',
        packageType: 'MONTHLY',
        webCheckoutUrl: 'https://pay.rev.cat/legacy',
      }),
      pkg({
        productId: 'premium_monthly',
        packageType: 'MONTHLY',
        webCheckoutUrl: 'https://pay.rev.cat/web',
      }),
    ],
    { [APP_STORE_PREMIUM_ANNUAL_PRODUCT_ID]: { status: 2 } }
  );

  assert.deepEqual(
    offers.map((offer) => offer.pkg.product.identifier),
    [APP_STORE_PREMIUM_ANNUAL_PRODUCT_ID, APP_STORE_PREMIUM_MONTHLY_PRODUCT_ID]
  );
  assert.equal(offers[0].period, 'annual');
  assert.equal(offers[0].trialDays, 7);
  assert.equal(offers[1].trialDays, null);

  const action = resolvePaywallAction({
    loading: false,
    isPremium: false,
    hasUser: true,
    isNative: true,
    purchasable: true,
    offersStatus: 'ready',
    hasWebCheckout: true,
  });
  assert.equal(action, 'native-products');
  assert.equal(
    premiumPurchaseHref({
      native: true,
      checkoutUrl: 'https://pay.rev.cat/premium/user-id',
    }),
    null
  );
});

test('a failed or empty offering is an error, including on iPad', () => {
  assert.equal(toPremiumOffers([]).length, 0);
  assert.equal(toPremiumOffers([pkg({ productId: 'premium_monthly_ios' })]).length, 0);
  assert.equal(
    resolvePaywallAction({
      loading: false,
      isPremium: false,
      hasUser: true,
      isNative: true,
      purchasable: true,
      offersStatus: 'error',
      hasWebCheckout: true,
    }),
    'native-error'
  );
});

test('the website can still use its own checkout link', () => {
  assert.equal(
    resolvePaywallAction({
      loading: false,
      isPremium: false,
      hasUser: true,
      isNative: false,
      purchasable: true,
      offersStatus: 'idle',
      hasWebCheckout: true,
    }),
    'web-checkout'
  );
  assert.equal(
    premiumPurchaseHref({ native: false, checkoutUrl: 'https://pay.rev.cat/premium/user' }),
    'https://pay.rev.cat/premium/user'
  );
});
