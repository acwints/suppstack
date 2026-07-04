import { supabase } from '@/app/supabase';
import type { Product } from '@/types';
import { findCatalogSupplementById } from '@/lib/catalog/supplement-catalog';
import { isCuratedCatalogProductId } from '@/lib/commerce/product-source';

/**
 * Catalog supplements live in static code with IDs in the 9000+ range, but
 * user data (stacks, tracking) references rows in the `supplements` table via
 * foreign keys. Before persisting user data, catalog IDs are resolved to a
 * database row — reusing an existing row by name or creating one on demand.
 */
export async function resolveDatabaseSupplementId(supplementId: number): Promise<number> {
  const catalogSupplement = findCatalogSupplementById(supplementId);
  if (!catalogSupplement) return supplementId;

  const { data: existing } = await supabase
    .from('supplements')
    .select('supplement_id')
    .ilike('supplement_name', catalogSupplement.supplement_name)
    .limit(1)
    .maybeSingle();

  if (existing?.supplement_id) return existing.supplement_id;

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

  if (error || !inserted) {
    throw error ?? new Error(`Failed to sync supplement "${catalogSupplement.supplement_name}"`);
  }

  return inserted.supplement_id;
}

async function resolveDatabaseBrandId(brandName?: string | null): Promise<number | null> {
  if (!brandName) return null;

  const { data: existing } = await supabase
    .from('brands')
    .select('brand_id')
    .ilike('brand_name', brandName)
    .limit(1)
    .maybeSingle();

  if (existing?.brand_id) return existing.brand_id;

  const { data: inserted } = await supabase
    .from('brands')
    .insert({ brand_name: brandName })
    .select('brand_id')
    .single();

  return inserted?.brand_id ?? null;
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
    .limit(1)
    .maybeSingle();

  return existing?.product_id ?? null;
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
