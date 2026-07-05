/**
 * Discovers brand logos from merchant storefront favicons. For every unique
 * shopify_store_domain in the catalog, fetches the store homepage, parses
 * icon <link> tags (preferring apple-touch-icon and the largest PNG),
 * verifies the asset resolves to an image, and emits
 * src/lib/catalog/brand-logos.ts.
 *
 * The emitted map is consumed by the /api/brand-logo/[domain] proxy route,
 * so icon hosts never need to be allowlisted in next.config and the frontend
 * only ever loads same-origin logo URLs.
 *
 * Usage: node src/scripts/sourceBrandLogos.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';

const CATALOG_FILES = [
  new URL('../lib/catalog/supplement-catalog.ts', import.meta.url),
  new URL('../lib/catalog/shopify-sourced-products.ts', import.meta.url),
];

const OUTPUT_PATH = new URL('../lib/catalog/brand-logos.ts', import.meta.url);

/**
 * Stores whose homepages sit behind bot challenges or don't expose icon
 * links; assets below were resolved manually and verified live.
 */
const MANUAL_OVERRIDES = {
  'nutricost.com': 'https://nutricost.com/cdn/shop/files/favicon.png',
  'secure.buckedup.com':
    'https://secure.buckedup.com/cdn/shop/files/Logo_Bucked_Up_3_1_300x300.png?v=1692820748',
};

const HEADERS = {
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
};

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function fetchWithTimeout(url, init = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { redirect: 'follow', signal: controller.signal, ...init });
  } finally {
    clearTimeout(timer);
  }
}

/** Storefronts rate-limit bursts aggressively; back off through 429s. */
async function fetchWithRetry(url, init = {}, attempts = 4) {
  let response = await fetchWithTimeout(url, init);
  for (let attempt = 1; attempt < attempts && response.status === 429; attempt += 1) {
    await sleep(8000 * attempt);
    response = await fetchWithTimeout(url, init);
  }
  return response;
}

function parseIconLinks(html, baseUrl) {
  const icons = [];
  const linkPattern = /<link\s[^>]*>/gi;

  for (const match of html.match(linkPattern) ?? []) {
    const rel = /rel=["']([^"']+)["']/i.exec(match)?.[1]?.toLowerCase() ?? '';
    if (!/(^|\s)(icon|shortcut icon|apple-touch-icon|apple-touch-icon-precomposed|mask-icon)(\s|$)/.test(rel)) {
      continue;
    }

    const rawHref = /href=["']([^"']+)["']/i.exec(match)?.[1];
    if (!rawHref) continue;
    const href = rawHref.replace(/&amp;/g, '&');

    const sizeAttr = /sizes=["'](\d+)x\d+["']/i.exec(match)?.[1];
    const size = sizeAttr ? Number(sizeAttr) : null;

    let resolved;
    try {
      resolved = new URL(href, baseUrl).toString();
    } catch {
      continue;
    }

    // Score: apple-touch-icon first (large, square, brand-safe), then bigger
    // declared sizes, then PNG over ICO/SVG.
    let score = 0;
    if (rel.includes('apple-touch-icon')) score += 400;
    if (size) score += Math.min(size, 256);
    if (/\.png(\?|$)/i.test(resolved)) score += 50;
    if (/\.svg(\?|$)/i.test(resolved)) score += 20;
    if (/\.ico(\?|$)/i.test(resolved)) score -= 10;

    icons.push({ url: resolved, score });
  }

  return icons.sort((a, b) => b.score - a.score);
}

/**
 * Icon links usually request a 32px rendition; ask the Shopify CDN for 180px
 * instead (it never upscales past the source asset, so this is safe).
 */
function upsizeShopifyIcon(url) {
  try {
    const parsed = new URL(url);
    if (!/\/cdn\/shop\//.test(parsed.pathname)) return url;
    if (parsed.searchParams.has('width')) parsed.searchParams.set('width', '180');
    if (parsed.searchParams.has('height')) parsed.searchParams.set('height', '180');
    return parsed.toString();
  } catch {
    return url;
  }
}

async function verifyImage(url) {
  try {
    const response = await fetchWithTimeout(url, { headers: { ...HEADERS, accept: 'image/*' } });
    if (!response.ok) return false;
    const type = response.headers.get('content-type') ?? '';
    return type.startsWith('image/') || /\.(png|ico|svg|jpg|jpeg|webp)(\?|$)/i.test(url);
  } catch {
    return false;
  }
}

async function resolveLogo(domain) {
  if (MANUAL_OVERRIDES[domain] && (await verifyImage(MANUAL_OVERRIDES[domain]))) {
    return MANUAL_OVERRIDES[domain];
  }

  const base = `https://${domain}/`;

  try {
    const response = await fetchWithRetry(base, { headers: HEADERS });
    if (response.ok) {
      const html = await response.text();
      for (const icon of parseIconLinks(html, response.url || base).slice(0, 4)) {
        const upsized = upsizeShopifyIcon(icon.url);
        if (await verifyImage(upsized)) return upsized;
        if (upsized !== icon.url && (await verifyImage(icon.url))) return icon.url;
      }
    }
  } catch {
    // fall through to favicon.ico
  }

  const fallback = new URL('/favicon.ico', base).toString();
  if (await verifyImage(fallback)) return fallback;
  return null;
}

async function main() {
  const domains = new Set();
  for (const file of CATALOG_FILES) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(/shopify_store_domain: '([^']+)'/g)) {
      domains.add(match[1]);
    }
  }

  const entries = [];
  for (const domain of Array.from(domains).sort()) {
    const logo = await resolveLogo(domain);
    console.log(logo ? `OK    ${domain} -> ${logo}` : `MISS  ${domain}`);
    if (logo) entries.push([domain, logo]);
    await sleep(1500);
  }

  const file = `/**
 * Brand logo URLs discovered from merchant storefront favicons
 * (apple-touch-icon preferred). Served to the frontend through the
 * /api/brand-logo/[domain] proxy so no third-party image hosts leak into
 * next.config or the client.
 *
 * Regenerate with: node src/scripts/sourceBrandLogos.mjs
 */
export const brandLogoByDomain: Record<string, string> = {
${entries.map(([domain, logo]) => `  '${domain}': '${logo}',`).join('\n')}
};

export function normalizeStoreDomain(domain: string) {
  return domain.toLowerCase().replace(/^https?:\\/\\//, '').replace(/\\/.*$/, '');
}

export function getBrandLogoSourceUrl(domain?: string | null) {
  if (!domain) return null;
  return brandLogoByDomain[normalizeStoreDomain(domain)] ?? null;
}

/** Same-origin URL the frontend should use to render a brand logo. */
export function getBrandLogoUrl(domain?: string | null) {
  if (!domain) return null;
  const normalized = normalizeStoreDomain(domain);
  return brandLogoByDomain[normalized] ? \`/api/brand-logo/\${normalized}\` : null;
}
`;

  await writeFile(OUTPUT_PATH, file);
  console.log(`\nWrote ${entries.length}/${domains.size} brand logos to brand-logos.ts`);
}

main();
