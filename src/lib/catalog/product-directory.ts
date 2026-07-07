import type { Product } from '@/types';
import { buildHealthGoalDirectory, type HealthGoalId } from './health-goal-directory';
import { getCuratedCatalogProducts, supplementCatalog } from './supplement-catalog';

export interface ProductDirectoryProduct extends Product {
  directory_category: string;
  directory_supplement_name: string;
  health_goal_ids: HealthGoalId[];
}

export interface ProductDirectoryGoalFilter {
  id: HealthGoalId;
  title: string;
  signalLabel: string;
  productCount: number;
}

export interface ProductDirectoryShelf extends ProductDirectoryGoalFilter {
  shortTitle: string;
  directCheckoutCount: number;
  brandCount: number;
  priceFrom: number | null;
}

export type ProductDirectoryCoverageLevel = 'research' | 'thin' | 'covered' | 'deep';

export interface ProductDirectorySupplementCoverage {
  supplementId: string;
  supplementName: string;
  category: string;
  productCount: number;
  directCheckoutCount: number;
  brandCount: number;
  priceFrom: number | null;
  healthGoalIds: HealthGoalId[];
  researchOnly: boolean;
  coverageLevel: ProductDirectoryCoverageLevel;
}

export interface ProductDirectoryCategoryCoverage {
  category: string;
  supplementCount: number;
  productCount: number;
  directCheckoutCount: number;
  thinSupplementCount: number;
  researchOnlyCount: number;
  priceFrom: number | null;
  coveragePercent: number;
}

export interface ProductDirectoryData {
  products: ProductDirectoryProduct[];
  healthGoals: ProductDirectoryGoalFilter[];
  commerceShelves: ProductDirectoryShelf[];
  supplementCoverage: ProductDirectorySupplementCoverage[];
  categoryCoverage: ProductDirectoryCategoryCoverage[];
  productCount: number;
  brandCount: number;
  categoryCount: number;
  directCheckoutCount: number;
  thinSupplementCount: number;
  researchOnlyCount: number;
  coveredSupplementCount: number;
}

export function buildProductDirectory(): ProductDirectoryData {
  const products = getCuratedCatalogProducts();
  const supplementById = new Map(
    supplementCatalog.map((supplement) => [supplement.supplement_id, supplement])
  );
  const goals = buildHealthGoalDirectory(supplementCatalog);
  const healthGoalIdsByProductId = new Map<string, Set<HealthGoalId>>();
  const healthGoalIdsBySupplementId = new Map<number, Set<HealthGoalId>>();

  for (const goal of goals) {
    for (const supplement of goal.supplements) {
      const goalIds = healthGoalIdsBySupplementId.get(supplement.supplement_id) ?? new Set<HealthGoalId>();
      goalIds.add(goal.id);
      healthGoalIdsBySupplementId.set(supplement.supplement_id, goalIds);
    }

    for (const product of goal.products) {
      const productId = String(product.product_id);
      const goalIds = healthGoalIdsByProductId.get(productId) ?? new Set<HealthGoalId>();
      goalIds.add(goal.id);
      healthGoalIdsByProductId.set(productId, goalIds);
    }
  }

  const directoryProducts = products.map((product) => {
    const supplement = supplementById.get(product.supplement_id);

    return {
      ...product,
      directory_category: supplement?.category ?? product.supplements?.supplement_name ?? 'Other',
      directory_supplement_name:
        supplement?.supplement_name ?? product.supplements?.supplement_name ?? 'Supplement',
      health_goal_ids: Array.from(healthGoalIdsByProductId.get(String(product.product_id)) ?? []),
    };
  });

  const brands = new Set(
    directoryProducts
      .map((product) => product.brands?.brand_name ?? product.shopify_store_domain)
      .filter(Boolean)
  );
  const categories = new Set(directoryProducts.map((product) => product.directory_category));
  const productsBySupplementId = directoryProducts.reduce((map, product) => {
    const productSupplementId = String(product.supplement_id);
    const rows = map.get(productSupplementId) ?? [];
    rows.push(product);
    map.set(productSupplementId, rows);
    return map;
  }, new Map<string, ProductDirectoryProduct[]>());
  const supplementCoverage = supplementCatalog.map((supplement) => {
    const supplementProducts = productsBySupplementId.get(String(supplement.supplement_id)) ?? [];
    const supplementBrands = new Set(
      supplementProducts
        .map((product) => product.brands?.brand_name ?? product.shopify_store_domain)
        .filter(Boolean)
    );
    const prices = supplementProducts
      .map((product) => product.product_price)
      .filter((price) => Number.isFinite(price) && price > 0);
    const researchOnly = supplement.research_only === true;
    const productCount = supplementProducts.length;
    const brandCount = supplementBrands.size;
    const coverageLevel: ProductDirectoryCoverageLevel = researchOnly
      ? 'research'
      : productCount >= 3 && brandCount >= 2
        ? 'deep'
        : productCount >= 2
          ? 'covered'
          : 'thin';

    return {
      supplementId: String(supplement.supplement_id),
      supplementName: supplement.supplement_name,
      category: supplement.category ?? 'Other',
      productCount,
      directCheckoutCount: supplementProducts.filter((product) => product.ucp_enabled).length,
      brandCount,
      priceFrom: prices.length ? Math.min(...prices) : null,
      healthGoalIds: Array.from(healthGoalIdsBySupplementId.get(supplement.supplement_id) ?? []),
      researchOnly,
      coverageLevel,
    };
  });
  const categoryCoverage = Array.from(
    supplementCoverage
      .reduce((map, row) => {
        const current = map.get(row.category) ?? {
          category: row.category,
          supplementCount: 0,
          productCount: 0,
          directCheckoutCount: 0,
          thinSupplementCount: 0,
          researchOnlyCount: 0,
          priceFrom: null as number | null,
        };

        current.supplementCount += 1;
        current.productCount += row.productCount;
        current.directCheckoutCount += row.directCheckoutCount;
        if (row.researchOnly) current.researchOnlyCount += 1;
        if (!row.researchOnly && row.productCount < 2) current.thinSupplementCount += 1;
        if (row.priceFrom != null) {
          current.priceFrom =
            current.priceFrom == null ? row.priceFrom : Math.min(current.priceFrom, row.priceFrom);
        }
        map.set(row.category, current);
        return map;
      }, new Map<string, Omit<ProductDirectoryCategoryCoverage, 'coveragePercent'>>())
      .values()
  )
    .map((row) => ({
      ...row,
      coveragePercent: Math.min(
        100,
        Math.round((row.productCount / Math.max(1, (row.supplementCount - row.researchOnlyCount) * 2)) * 100)
      ),
    }))
    .sort((a, b) => b.thinSupplementCount - a.thinSupplementCount || a.category.localeCompare(b.category));
  const commerceShelves = goals.map((goal) => {
    const shelfProducts = directoryProducts.filter((product) => product.health_goal_ids.includes(goal.id));
    const shelfBrands = new Set(
      shelfProducts
        .map((product) => product.brands?.brand_name ?? product.shopify_store_domain)
        .filter(Boolean)
    );
    const prices = shelfProducts
      .map((product) => product.product_price)
      .filter((price) => Number.isFinite(price) && price > 0);

    return {
      id: goal.id,
      title: goal.title,
      shortTitle: goal.shortTitle,
      signalLabel: goal.signalLabel,
      productCount: shelfProducts.length,
      directCheckoutCount: shelfProducts.filter((product) => product.ucp_enabled).length,
      brandCount: shelfBrands.size,
      priceFrom: prices.length ? Math.min(...prices) : null,
    };
  });

  return {
    products: directoryProducts,
    healthGoals: goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      signalLabel: goal.signalLabel,
      productCount: goal.productCount,
    })),
    commerceShelves,
    supplementCoverage,
    categoryCoverage,
    productCount: directoryProducts.length,
    brandCount: brands.size,
    categoryCount: categories.size,
    directCheckoutCount: directoryProducts.filter((product) => product.ucp_enabled).length,
    thinSupplementCount: supplementCoverage.filter((row) => !row.researchOnly && row.productCount < 2).length,
    researchOnlyCount: supplementCoverage.filter((row) => row.researchOnly).length,
    coveredSupplementCount: supplementCoverage.filter((row) => !row.researchOnly && row.productCount >= 2).length,
  };
}
