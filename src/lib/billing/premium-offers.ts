/**
 * Pure Premium paywall decisions shared by the native purchase bridge and tests.
 *
 * App Store products are the only plans the iOS shell may offer. RevenueCat
 * Web Billing links stay on the website.
 */

export const APP_STORE_PREMIUM_ANNUAL_PRODUCT_ID = 'app.suppstack.premium.annual';
export const APP_STORE_PREMIUM_MONTHLY_PRODUCT_ID = 'app.suppstack.premium.monthly';

const APP_STORE_PREMIUM_PRODUCT_IDS = new Set<string>([
  APP_STORE_PREMIUM_ANNUAL_PRODUCT_ID,
  APP_STORE_PREMIUM_MONTHLY_PRODUCT_ID,
]);

/** RevenueCat INTRO_ELIGIBILITY_STATUS_ELIGIBLE. */
const INTRO_ELIGIBLE = 2;

export const OFFERINGS_LOAD_TIMEOUT_MS = 12_000;

export const OFFERINGS_LOAD_ERROR =
  "Couldn't load App Store plans. Check your connection and try again.";

export const OFFERINGS_EMPTY_ERROR =
  "App Store plans aren't available right now. Try again in a moment.";

export type PremiumPlanPeriod = 'annual' | 'monthly';

export interface RcIntroPrice {
  price: number;
  priceString: string;
  periodUnit: string;
  periodNumberOfUnits: number;
}

export interface RcStoreProduct {
  identifier: string;
  price: number;
  priceString: string;
  currencyCode: string;
  pricePerMonthString?: string | null;
  subscriptionPeriod?: string | null;
  introPrice?: RcIntroPrice | null;
}

export interface RcPackage {
  identifier: string;
  packageType: string;
  product: RcStoreProduct;
  /** Present when RevenueCat attached a Web Billing link. Never shown in the iOS app. */
  webCheckoutUrl?: string | null;
  presentedOfferingContext?: Record<string, unknown> | null;
}

export interface RcOffering {
  availablePackages: RcPackage[];
  annual?: RcPackage | null;
  monthly?: RcPackage | null;
}

export interface PremiumOffer {
  pkg: RcPackage;
  period: PremiumPlanPeriod;
  priceString: string;
  /** Localized per-month equivalent ("$3.33"), for the annual plan. */
  pricePerMonthString: string | null;
  price: number;
  /** Free-trial length in days when this Apple ID is eligible, else null. */
  trialDays: number | null;
}

export type PaywallAction =
  | 'loading'
  | 'member'
  | 'sign-in'
  | 'native-unavailable'
  | 'native-loading'
  | 'native-error'
  | 'native-products'
  | 'web-checkout'
  | 'web-unavailable';

export function isAppStorePremiumProduct(productId: string | null | undefined): boolean {
  return Boolean(productId && APP_STORE_PREMIUM_PRODUCT_IDS.has(productId));
}

/**
 * Website purchase link. The native shell always gets null, including when a
 * RevenueCat package carries its own webCheckoutUrl.
 */
export function premiumPurchaseHref(options: {
  native: boolean;
  checkoutUrl: string | null;
}): string | null {
  if (options.native) return null;
  return options.checkoutUrl;
}

export function periodOf(pkg: Pick<RcPackage, 'identifier' | 'packageType' | 'product'>): PremiumPlanPeriod {
  const type = pkg.packageType.toUpperCase();
  const productId = pkg.product.identifier.toLowerCase();
  if (
    type === 'ANNUAL' ||
    pkg.product.subscriptionPeriod === 'P1Y' ||
    productId === APP_STORE_PREMIUM_ANNUAL_PRODUCT_ID ||
    pkg.identifier === '$rc_annual'
  ) {
    return 'annual';
  }
  return 'monthly';
}

function trialDaysOf(intro: RcIntroPrice | null | undefined): number | null {
  if (!intro || intro.price > 0) return null;
  const perUnit: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };
  return (perUnit[intro.periodUnit] ?? 0) * intro.periodNumberOfUnits || null;
}

/** App Store packages the paywall can sell, annual plan first. */
export function toPremiumOffers(
  packages: readonly RcPackage[],
  eligibility: Record<string, { status?: number } | undefined> = {}
): PremiumOffer[] {
  return packages
    .filter((pkg) => isAppStorePremiumProduct(pkg.product?.identifier))
    .map((pkg) => ({
      pkg,
      period: periodOf(pkg),
      priceString: pkg.product.priceString,
      pricePerMonthString: pkg.product.pricePerMonthString ?? null,
      price: pkg.product.price,
      trialDays:
        eligibility[pkg.product.identifier]?.status === INTRO_ELIGIBLE
          ? trialDaysOf(pkg.product.introPrice)
          : null,
    }))
    .sort((a, b) => (a.period === b.period ? 0 : a.period === 'annual' ? -1 : 1));
}

/**
 * Which purchase surface the paywall should render.
 * Native iPhone and iPad builds never fall through to web checkout.
 */
export function resolvePaywallAction(input: {
  loading: boolean;
  isPremium: boolean;
  hasUser: boolean;
  isNative: boolean;
  purchasable: boolean;
  offersStatus: 'idle' | 'loading' | 'ready' | 'error';
  hasWebCheckout: boolean;
}): PaywallAction {
  if (input.loading) return 'loading';
  if (input.isPremium) return 'member';
  if (!input.hasUser) return 'sign-in';
  if (input.isNative) {
    if (!input.purchasable) return 'native-unavailable';
    if (input.offersStatus === 'idle' || input.offersStatus === 'loading') return 'native-loading';
    if (input.offersStatus === 'error') return 'native-error';
    return 'native-products';
  }
  if (input.hasWebCheckout) return 'web-checkout';
  return 'web-unavailable';
}
