/**
 * Catalog integrity gate: every browsable supplement must have a real
 * merchant product image, an honest price/option count derived from curated
 * products, and at least one purchasable product.
 *
 * Run: npm run check:catalog
 */
import { supplementCatalog, getCuratedCatalogProducts } from '../lib/catalog/supplement-catalog';
import { getSupplementKnowledge } from '../lib/catalog/supplement-knowledge';
import type { Product } from '../types';

const products = getCuratedCatalogProducts();
let failures = 0;
let researchEntries = 0;

for (const s of supplementCatalog) {
  const issues: string[] = [];

  if (s.research_only) {
    // Research-only (wiki) entries have no purchasable products, price, or
    // merchant image on purpose. They must instead carry real knowledge-base
    // content so the page is a useful reference rather than an empty listing.
    researchEntries++;
    const prods = products.filter((p: Product) => p.supplement_id === s.supplement_id);
    if (prods.length > 0) issues.push('research entry must not have curated products');
    if (typeof s.average_price === 'number') issues.push('research entry must not have a price');
    const knowledge = getSupplementKnowledge(s.supplement_name, s.aliases);
    if (!knowledge) issues.push('research entry missing knowledge-base content');
    else {
      if (!knowledge.overview) issues.push('knowledge missing overview');
      if (!knowledge.legalStatus) issues.push('knowledge missing regulatory status');
    }
  } else {
    const prods = products.filter((p: Product) => p.supplement_id === s.supplement_id);
    if (!s.image_url) issues.push('no image');
    else if (!s.image_url.startsWith('https://cdn.shopify.com')) issues.push(`non-shopify image: ${s.image_url}`);
    if (typeof s.average_price !== 'number' || !(s.average_price > 0)) issues.push('no price');
    if (typeof s.product_count !== 'number' || s.product_count < 1) issues.push('no product count');
    if (prods.length === 0) issues.push('no curated products');
    if (prods.length !== s.product_count) issues.push(`count mismatch ${prods.length} vs ${s.product_count}`);
    if (prods.some((p: Product) => !p.product_image)) issues.push('product missing image');
    // product_url is the natural key used to sync catalog products into the
    // database for user tracking — it must never be empty.
    if (prods.some((p: Product) => !p.product_url)) issues.push('product missing product_url');
  }

  if (issues.length) {
    failures++;
    console.log(`FAIL ${s.supplement_name} (#${s.supplement_id}): ${issues.join('; ')}`);
  }
}
console.log(
  `${supplementCatalog.length} supplements (${researchEntries} research-only), ${products.length} curated products, ${failures} failures`
);
if (failures > 0) process.exit(1);
