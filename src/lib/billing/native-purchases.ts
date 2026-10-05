/**
 * Apple IAP via the RevenueCat Capacitor plugin.
 *
 * Follows the same injected-global pattern as `@/lib/native/capacitor`: the
 * native shell registers the Purchases plugin and Capacitor bridges it into
 * the remote page as `window.Capacitor.Plugins.Purchases`, so the web bundle
 * never imports the plugin JS. Everything degrades to "unsupported" on the
 * web, in old shells without the plugin, or until the API key env var is set.
 *
 * Purchases identify to RevenueCat with the Supabase user id, so the existing
 * webhook (`/api/billing/revenuecat`) attributes Apple subscriptions to the
 * same `user_entitlements` row web billing uses.
 */

import { isNativeApp } from '@/lib/native/capacitor';
import { PREMIUM_ENTITLEMENT } from '@/lib/billing/entitlements';

interface RcEntitlementInfo {
  isActive: boolean;
}

interface RcCustomerInfo {
  entitlements: {
    active: Record<string, RcEntitlementInfo>;
  };
}

interface RcIntroPrice {
  price: number;
  priceString: string;
  periodUnit: string;
  periodNumberOfUnits: number;
}

interface RcStoreProduct {
  identifier: string;
  price: number;
  priceString: string;
  currencyCode: string;
  pricePerMonthString?: string | null;
  subscriptionPeriod?: string | null;
  introPrice?: RcIntroPrice | null;
}

interface RcPackage {
  identifier: string;
  packageType: string;
  product: RcStoreProduct;
}

interface RcOffering {
  availablePackages: RcPackage[];
  annual?: RcPackage | null;
  monthly?: RcPackage | null;
}

/** RevenueCat INTRO_ELIGIBILITY_STATUS_ELIGIBLE. */
const INTRO_ELIGIBLE = 2;

interface PurchasesPlugin {
  configure: (options: { apiKey: string; appUserID?: string | null }) => Promise<void>;
  logIn: (options: { appUserID: string }) => Promise<{ customerInfo: RcCustomerInfo }>;
  logOut: () => Promise<{ customerInfo: RcCustomerInfo }>;
  getCustomerInfo: () => Promise<{ customerInfo: RcCustomerInfo }>;
  getOfferings: () => Promise<{ current: RcOffering | null }>;
  checkTrialOrIntroductoryPriceEligibility: (options: {
    productIdentifiers: string[];
  }) => Promise<Record<string, { status: number }>>;
  purchasePackage: (options: { aPackage: RcPackage }) => Promise<{ customerInfo: RcCustomerInfo }>;
  restorePurchases: () => Promise<{ customerInfo: RcCustomerInfo }>;
}

function getPurchasesPlugin(): PurchasesPlugin | null {
  if (!isNativeApp()) return null;
  const plugins = window.Capacitor?.Plugins as
    | { Purchases?: PurchasesPlugin }
    | undefined;
  return plugins?.Purchases ?? null;
}

const APPLE_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_APPLE_API_KEY;

/** Native IAP is available: in the shell, plugin registered, key configured. */
export function isNativePurchasesSupported(): boolean {
  return Boolean(APPLE_API_KEY) && getPurchasesPlugin() !== null;
}

let configuredForUser: string | null = null;

/**
 * Configure the SDK for the signed-in user. Safe to call repeatedly; only the
 * first call configures, later calls with a new user re-identify via logIn.
 */
export async function configureNativePurchases(appUserId: string): Promise<boolean> {
  const plugin = getPurchasesPlugin();
  if (!plugin || !APPLE_API_KEY) return false;
  if (configuredForUser === appUserId) return true;

  if (configuredForUser === null) {
    await plugin.configure({ apiKey: APPLE_API_KEY, appUserID: appUserId });
  } else {
    await plugin.logIn({ appUserID: appUserId });
  }
  configuredForUser = appUserId;
  return true;
}

/** Reset identification on sign-out so the next user doesn't inherit it. */
export async function resetNativePurchases(): Promise<void> {
  const plugin = getPurchasesPlugin();
  if (!plugin || configuredForUser === null) return;
  configuredForUser = null;
  await plugin.logOut().catch(() => undefined);
}

export type PremiumPlanPeriod = 'annual' | 'monthly';

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

function periodOf(pkg: RcPackage): PremiumPlanPeriod {
  if (pkg.packageType === 'ANNUAL' || pkg.product.subscriptionPeriod === 'P1Y') return 'annual';
  return 'monthly';
}

function trialDaysOf(intro: RcIntroPrice | null | undefined): number | null {
  if (!intro || intro.price > 0) return null;
  const perUnit: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };
  return (perUnit[intro.periodUnit] ?? 0) * intro.periodNumberOfUnits || null;
}

/**
 * The premium plans in the current offering (annual first), with free-trial
 * lengths only where Apple says this Apple ID is still eligible.
 */
export async function getPremiumOffers(): Promise<PremiumOffer[]> {
  const plugin = getPurchasesPlugin();
  if (!plugin) return [];

  const { current } = await plugin.getOfferings();
  const packages = current?.availablePackages ?? [];
  if (!packages.length) return [];

  const withIntro = packages.filter((pkg) => pkg.product.introPrice);
  const eligibility = withIntro.length
    ? await plugin
        .checkTrialOrIntroductoryPriceEligibility({
          productIdentifiers: withIntro.map((pkg) => pkg.product.identifier),
        })
        .catch(() => ({}) as Record<string, { status: number }>)
    : {};

  return packages
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
 * Whether the App Store says this device's customer has premium right now.
 * Lets the app unlock immediately after purchase instead of waiting for the
 * webhook to reach Supabase.
 */
export async function hasNativePremium(): Promise<boolean> {
  const plugin = getPurchasesPlugin();
  if (!plugin || configuredForUser === null) return false;
  const { customerInfo } = await plugin.getCustomerInfo();
  return hasPremium(customerInfo);
}

function hasPremium(customerInfo: RcCustomerInfo): boolean {
  return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]);
}

/**
 * Run the Apple purchase sheet for the package. Resolves true when the
 * premium entitlement is active afterwards. A user cancel rejects with an
 * error the caller should treat as a no-op (RevenueCat flags it
 * `userCancelled`).
 */
export async function purchasePremium(offer: PremiumOffer): Promise<boolean> {
  const plugin = getPurchasesPlugin();
  if (!plugin) return false;

  const { customerInfo } = await plugin.purchasePackage({ aPackage: offer.pkg });
  return hasPremium(customerInfo);
}

/** Apple "Restore Purchases" (required by App Review for subscriptions). */
export async function restorePremium(): Promise<boolean> {
  const plugin = getPurchasesPlugin();
  if (!plugin) return false;

  const { customerInfo } = await plugin.restorePurchases();
  return hasPremium(customerInfo);
}

/** Whether a purchase error was just the user closing the payment sheet. */
export function isPurchaseCancellation(error: unknown): boolean {
  const err = error as { userCancelled?: boolean; code?: string; message?: string } | null;
  if (!err) return false;
  if (err.userCancelled) return true;
  const text = `${err.code ?? ''} ${err.message ?? ''}`.toLowerCase();
  return text.includes('cancel');
}
