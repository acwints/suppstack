/**
 * Plugin classes the iOS shell must register.
 *
 * `npx cap sync` rewrites `ios/App/App/capacitor.config.json` from npm plugins
 * it can see, then this list is merged back on top. Local Swift plugins are
 * invisible to that scan. PurchasesPlugin is included here as well so a sync
 * that misses `@revenuecat/purchases-capacitor` cannot drop in-app purchases.
 */
export const REQUIRED_IOS_PLUGIN_CLASSES = [
  'PurchasesPlugin',
  'SuppStackHealthPlugin',
  'SuppStackAppleSignInPlugin',
];

/** Pull the string entries out of the `packageClassList` array in capacitor.config.ts. */
export function packageClassListFromSource(source) {
  const block = source.match(/packageClassList\s*:\s*\[([\s\S]*?)\]/);
  if (!block) return [];
  return [...block[1].matchAll(/['"]([A-Za-z0-9_]+)['"]/g)].map((match) => match[1]);
}

/**
 * Keep every class Capacitor discovered, then append any required class it
 * omitted. Existing entries stay in place and are not duplicated.
 */
export function mergePackageClassList(discovered, required = REQUIRED_IOS_PLUGIN_CLASSES) {
  const classList = Array.isArray(discovered) ? discovered.filter((entry) => typeof entry === 'string') : [];
  const merged = [...classList];
  for (const pluginClass of required) {
    if (!merged.includes(pluginClass)) merged.push(pluginClass);
  }
  return merged;
}
