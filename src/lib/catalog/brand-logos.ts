/**
 * Brand logo URLs discovered from merchant storefront favicons
 * (apple-touch-icon preferred). Served to the frontend through the
 * /api/brand-logo/[domain] proxy so no third-party image hosts leak into
 * next.config or the client.
 *
 * Regenerate with: node src/scripts/sourceBrandLogos.mjs
 */
export const brandLogoByDomain: Record<string, string> = {
  '1stphorm.com': 'https://1stphorm.com/cdn/shop/files/1st_Phorm_Logo_1f647b08-280e-40be-9f8b-f370f755d573_32x32.png?v=1675721983',
  'animalpak.com': 'https://www.animalpak.com/cdn/shop/files/a_favicon_32x32.png?v=1675442592',
  'axeandsledge.com': 'https://axeandsledge.com/cdn/shop/files/Icon_32x32.jpg?v=1768842066',
  'brainmd.com': 'https://brainmd.com/cdn/shop/files/2025-BrainMD-Circle-Icon.svg?crop=center&height=32&v=1759957093&width=32',
  'bulksupplements.com': 'https://www.bulksupplements.com/cdn/shop/files/android-chrome-192x192_6c502b37-9f86-49c1-baaf-f564dc905cf9.png?v=1704242240&width=180',
  'cellucor.com': 'https://cellucor.com/cdn/shop/files/logo-c4_1.png?crop=center&height=32&v=1772820679&width=32',
  'doublewoodsupplements.com': 'https://doublewoodsupplements.com/cdn/shop/files/favicon_ad7a7786-14a1-43e4-853a-35848e5061ac.png?crop=center&height=180&v=1656014870&width=180',
  'getrawnutrition.com': 'https://getrawnutrition.com/cdn/shop/files/r-logo_05c90b42-c690-4627-8acf-031c185913ac.webp?v=1745899605&width=180',
  'gorillamind.com': 'https://gorillamind.com/cdn/shop/files/Gorilla_Full2a.png?crop=center&height=180&v=1774297792&width=180',
  'gruns.co': 'https://gruns.co/cdn/shop/files/Adults_U_Logo_PNG.png?crop=center&height=32&v=1759775360&width=32',
  'horbaach.com': 'https://horbaach.com/cdn/shop/files/Horbaach_4438d5f9-98f8-47c2-8568-b58d2a2f031c_96x96.png?v=1684781486',
  'hugesupplements.com': 'https://hugesupplements.com/cdn/shop/files/favicon_32x32.png?v=1667731232',
  'jockofuel.com': 'https://jockofuel.com/cdn/shop/files/Favicon.jpg?crop=center&height=32&v=1757689585&width=32',
  'levelsprotein.com': 'https://levelsprotein.com/cdn/shop/files/favilvls.png?v=1613774398&width=180',
  'microingredients.com': 'https://www.microingredients.com/cdn/shop/files/Micro-Ingredients_Primary-Logo_Digital_Icon_407adc26-c515-45e4-89c2-d409d4687f2c.png?crop=center&height=32&v=1781651608&width=32',
  'nakednutrition.com': 'https://nakednutrition.com/cdn/shop/files/favicon.jpg?v=1771974964&width=64',
  'nutricost.com': 'https://nutricost.com/cdn/shop/files/favicon.png',
  'pescience.com': 'https://pescience.com/cdn/shop/files/favicon.png?crop=center&height=32&v=1618014975&width=32',
  'rysesupps.com': 'https://cdn.shopify.com/s/files/1/2316/6807/files/webclip.png?v=1583944013',
  'secure.buckedup.com': 'https://secure.buckedup.com/cdn/shop/files/Logo_Bucked_Up_3_1_300x300.png?v=1692820748',
  'trycreate.co': 'https://trycreate.co/cdn/shop/files/ast.svg?v=1774398932&width=96',
  'www.alaninu.com': 'https://www.alaninu.com/cdn/shop/files/AN_New_Favicon_-_Sep_2023_228x228.png?v=1696357321',
  'www.bareperformancenutrition.com': 'https://www.bareperformancenutrition.com/cdn/shop/t/792/assets/apple-touch-icon.png?v=20153161940833834701782400778',
  'www.ghostlifestyle.com': 'https://www.ghostlifestyle.com/cdn/shop/files/GHOST_SiteIcons.png?v=1742920825&width=32',
  'www.kaged.com': 'https://www.kaged.com/cdn/shop/files/favicon.png?v=1775237952&width=180',
  'www.livemomentous.com': 'https://www.livemomentous.com/cdn/shop/t/1271/assets/apple-touch-icon_small.png?v=14811670991533047571777461329',
  'www.muscletech.com': 'https://www.muscletech.com/cdn/shop/files/mt-logo-muscletech-com.png?v=1730838322&width=180',
  'www.optimumnutrition.com': 'https://www.optimumnutrition.com/cdn/shop/files/ON-fav-icon-2.png?v=1762357320&width=180',
  'www.pipingrock.com': 'https://www.pipingrock.com/cdn/shop/files/favicon_96x96.png?v=1651080982',
  'www.ruleoneproteins.com': 'https://www.ruleoneproteins.com/cdn/shop/files/r1_favicon-white.png?crop=center&height=32&v=1695330429&width=32',
  'www.transparentlabs.com': 'https://www.transparentlabs.com/cdn/shop/files/Favicon.png?crop=center&height=32&v=1715871266&width=32',
};

export function normalizeStoreDomain(domain: string) {
  return domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
}

export function getBrandLogoSourceUrl(domain?: string | null) {
  if (!domain) return null;
  return brandLogoByDomain[normalizeStoreDomain(domain)] ?? null;
}

/** Same-origin URL the frontend should use to render a brand logo. */
export function getBrandLogoUrl(domain?: string | null) {
  if (!domain) return null;
  const normalized = normalizeStoreDomain(domain);
  return brandLogoByDomain[normalized] ? `/api/brand-logo/${normalized}` : null;
}
