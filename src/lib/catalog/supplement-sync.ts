import { supabase } from '@/app/supabase';
import type { Product, Supplement } from '@/types';
import {
  findCatalogSupplementById,
  findCatalogSupplementByName,
} from '@/lib/catalog/supplement-catalog';
import { isCuratedCatalogProductId } from '@/lib/commerce/product-source';

const UNIQUE_VIOLATION = '23505';

/**
 * Finds the database row that refers to the same supplement as the catalog
 * entry, tolerating legacy naming ("NAC (N-Acetyl Cysteine)" vs "NAC",
 * "Turmeric/Curcumin" vs "Turmeric Curcumin"). Matching reuses the catalog's
 * alias-aware name normalization: a database row matches when its name
 * resolves back to the same catalog supplement.
 */
async function findDatabaseSupplementRow(catalogSupplement: Supplement) {
  // Deterministic order (oldest row wins) and an explicit limit so behavior
  // does not silently depend on PostgREST's default row cap.
  const { data: rows } = await supabase
    .from('supplements')
    .select('supplement_id, supplement_name')
    .order('supplement_id', { ascending: true })
    .limit(10000);

  for (const row of rows ?? []) {
    if (row.supplement_name.toLowerCase() === catalogSupplement.supplement_name.toLowerCase()) {
      return row;
    }
  }

  for (const row of rows ?? []) {
    const match = findCatalogSupplementByName(row.supplement_name);
    if (match?.supplement_id === catalogSupplement.supplement_id) {
      return row;
    }
  }

  return null;
}

/**
 * Catalog supplements live in static code with IDs in the 9000+ range, but
 * user data (stacks, tracking) references rows in the `supplements` table via
 * foreign keys. Before persisting user data, catalog IDs are resolved to a
 * database row — reusing an existing row by name/alias or creating one on
 * demand.
 */
export async function resolveDatabaseSupplementId(supplementId: number): Promise<number> {
  const catalogSupplement = findCatalogSupplementById(supplementId);
  if (!catalogSupplement) return supplementId;

  const existing = await findDatabaseSupplementRow(catalogSupplement);
  if (existing) return existing.supplement_id;

  const { data: inserted, error } = await supabase
    .from('supplements')
    .insert({
      supplement_name: catalogSupplement.supplement_name,
      supplement_description: catalogSupplement.supplement_description,
      category: catalogSupplement.category ?? null,
      image_url: catalogSupplement.image_url ?? null,
    })
    .select('supplement_id')
    .single();

  if (inserted) return inserted.supplement_id;

  // Concurrent insert of the same name: re-read the winner's row.
  if (error?.code === UNIQUE_VIOLATION) {
    const raced = await findDatabaseSupplementRow(catalogSupplement);
    if (raced) return raced.supplement_id;
  }

  throw error ?? new Error(`Failed to sync supplement "${catalogSupplement.supplement_name}"`);
}

async function resolveDatabaseBrandId(brandName?: string | null): Promise<number | null> {
  if (!brandName) return null;

  const findExisting = async () => {
    const { data } = await supabase
      .from('brands')
      .select('brand_id')
      .ilike('brand_name', brandName)
      .limit(1);
    return data?.[0]?.brand_id ?? null;
  };

  const existingId = await findExisting();
  if (existingId) return existingId;

  const { data: inserted, error } = await supabase
    .from('brands')
    .insert({ brand_name: brandName })
    .select('brand_id')
    .single();

  if (inserted?.brand_id) return inserted.brand_id;
  if (error?.code === UNIQUE_VIOLATION) return findExisting();
  return null;
}

/**
 * Finds the database row for a curated catalog product, creating it on first
 * use. Catalog products live in static code with string IDs (`real-*`), but
 * user tracking (`users_products`) references integer rows in `products`.
 * The product URL is the stable natural key between the two.
 */
export async function findDatabaseProductId(product: Product): Promise<number | string | null> {
  if (!isCuratedCatalogProductId(product.product_id)) return product.product_id;
  if (!product.product_url) return null;

  const { data: existing } = await supabase
    .from('products')
    .select('product_id')
    .eq('product_url', product.product_url)
    .limit(1);

  return existing?.[0]?.product_id ?? null;
}

export async function resolveDatabaseProductId(product: Product): Promise<number | string> {
  if (!isCuratedCatalogProductId(product.product_id)) return product.product_id;

  const existingId = await findDatabaseProductId(product);
  if (existingId !== null) return existingId;

  const [supplementId, brandId] = await Promise.all([
    resolveDatabaseSupplementId(product.supplement_id),
    resolveDatabaseBrandId(product.brands?.brand_name),
  ]);

  const { data: inserted, error } = await supabase
    .from('products')
    .insert({
      product_name: product.product_name,
      product_description: product.product_description ?? null,
      product_price: product.product_price,
      product_url: product.product_url || null,
      amazon_url: product.amazon_url || null,
      product_image: product.product_image || null,
      servings_per_container: product.servings_per_container ?? null,
      servings_per_day: product.servings_per_day ?? null,
      supplement_id: supplementId,
      brand_id: brandId,
    })
    .select('product_id')
    .single();

  if (error || !inserted) {
    throw error ?? new Error(`Failed to sync product "${product.product_name}"`);
  }

  return inserted.product_id;
}
