import { buildProductDirectory } from '@/lib/catalog/product-directory';
import { supplementCatalog } from '@/lib/catalog/supplement-catalog';
import { formatPrice } from '@/lib/utils';

interface CoverageRow {
  supplementId: string;
  supplementName: string;
  category: string;
  productCount: number;
  directCheckoutCount: number;
  brandCount: number;
  lowestPrice: number | null;
  healthGoalCount: number;
  researchOnly: boolean;
}

function argValue(name: string) {
  const prefix = `${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function argNumber(name: string, fallback: number) {
  const raw = argValue(name);
  if (!raw) return fallback;

  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function hasFlag(name: string) {
  return process.argv.includes(name);
}

function money(value: number | null) {
  return value === null ? '--' : `$${formatPrice(value)}`;
}

function main() {
  const minProducts = argNumber('--min-products', 2);
  const json = hasFlag('--json');
  const directory = buildProductDirectory();
  const productsBySupplementId = new Map<string, typeof directory.products>();

  for (const product of directory.products) {
    const supplementId = String(product.supplement_id);
    const rows = productsBySupplementId.get(supplementId) ?? [];
    rows.push(product);
    productsBySupplementId.set(supplementId, rows);
  }

  const coverageRows: CoverageRow[] = supplementCatalog.map((supplement) => {
    const products = productsBySupplementId.get(String(supplement.supplement_id)) ?? [];
    const brands = new Set(
      products
        .map((product) => product.brands?.brand_name ?? product.shopify_store_domain)
        .filter(Boolean)
    );
    const prices = products
      .map((product) => product.product_price)
      .filter((price) => Number.isFinite(price) && price > 0);
    const healthGoals = new Set(products.flatMap((product) => product.health_goal_ids));

    return {
      supplementId: String(supplement.supplement_id),
      supplementName: supplement.supplement_name,
      category: supplement.category ?? 'Uncategorized',
      productCount: products.length,
      directCheckoutCount: products.filter((product) => product.ucp_enabled).length,
      brandCount: brands.size,
      lowestPrice: prices.length ? Math.min(...prices) : null,
      healthGoalCount: healthGoals.size,
      researchOnly: supplement.research_only === true,
    };
  });

  const commercialRows = coverageRows.filter((row) => !row.researchOnly);
  const researchOnlyRows = coverageRows.filter((row) => row.researchOnly);
  const thinSupplements = coverageRows
    .filter((row) => !row.researchOnly && row.productCount < minProducts)
    .sort((a, b) => {
      const countDelta = a.productCount - b.productCount;
      if (countDelta !== 0) return countDelta;
      return a.supplementName.localeCompare(b.supplementName);
    });
  const categorySummary = Array.from(
    coverageRows.reduce((map, row) => {
      const current = map.get(row.category) ?? {
        category: row.category,
        supplementCount: 0,
        commercialCount: 0,
        researchOnlyCount: 0,
        productCount: 0,
        thinCount: 0,
      };
      current.supplementCount += 1;
      if (row.researchOnly) current.researchOnlyCount += 1;
      else current.commercialCount += 1;
      current.productCount += row.productCount;
      current.thinCount += !row.researchOnly && row.productCount < minProducts ? 1 : 0;
      map.set(row.category, current);
      return map;
    }, new Map<string, { category: string; supplementCount: number; commercialCount: number; researchOnlyCount: number; productCount: number; thinCount: number }>())
      .values()
  ).sort((a, b) => b.thinCount - a.thinCount || a.category.localeCompare(b.category));
  const healthGoalSummary = directory.healthGoals
    .map((goal) => {
      const products = directory.products.filter((product) => product.health_goal_ids.includes(goal.id));
      return {
        id: goal.id,
        title: goal.title,
        productCount: products.length,
        directCheckoutCount: products.filter((product) => product.ucp_enabled).length,
      };
    })
    .sort((a, b) => a.productCount - b.productCount);

  const payload = {
    totals: {
      supplements: supplementCatalog.length,
      commercialSupplements: commercialRows.length,
      researchOnlySupplements: researchOnlyRows.length,
      products: directory.productCount,
      brands: directory.brandCount,
      categories: directory.categoryCount,
      directCheckout: directory.directCheckoutCount,
      thinSupplements: thinSupplements.length,
      minProducts,
    },
    healthGoals: healthGoalSummary,
    categories: categorySummary,
    thinSupplements,
  };

  if (json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(
    `Catalog coverage: ${payload.totals.products} products, ${payload.totals.supplements} supplements, ` +
      `${payload.totals.brands} brands, ${payload.totals.directCheckout} direct-checkout products.`
  );
  console.log(
    `${thinSupplements.length} commercial supplements have fewer than ${minProducts} product${minProducts === 1 ? '' : 's'}; ` +
      `${researchOnlyRows.length} research-only supplements are excluded.`
  );

  console.log('\nHealth goal shelves');
  for (const goal of healthGoalSummary) {
    console.log(
      `- ${goal.title}: ${goal.productCount} products, ${goal.directCheckoutCount} checkout`
    );
  }

  console.log('\nThinnest categories');
  for (const category of categorySummary.slice(0, 8)) {
    console.log(
      `- ${category.category}: ${category.productCount} products across ${category.commercialCount} commercial supplements; ` +
        `${category.thinCount} below target${category.researchOnlyCount ? `, ${category.researchOnlyCount} research-only` : ''}`
    );
  }

  console.log('\nPriority supplement gaps');
  for (const row of thinSupplements.slice(0, 30)) {
    console.log(
      `- ${row.supplementName} (${row.category}): ${row.productCount} products, ` +
        `${row.brandCount} brands, ${row.directCheckoutCount} checkout, from ${money(row.lowestPrice)}`
    );
  }
}

main();
