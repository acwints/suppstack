import type { SupabaseClient } from '@supabase/supabase-js';
import type { Product, Supplement } from '@/types';
import {
  findCatalogSupplementById,
  findCatalogSupplementByName,
} from '@/lib/catalog/supplement-catalog';
import { isCuratedCatalogProductId } from '@/lib/commerce/product-source';

const UNIQUE_VIOLATION = '23505';

export async function findDatabaseSupplementRowWithClient(
  supabase: SupabaseClient,
  catalogSupplement: Supplement
) {
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

export async function resolveDatabaseSupplementIdWithClient(
  supabase: SupabaseClient,
  supplementId: number
): Promise<number> {
  const catalogSupplement = findCatalogSupplementById(supplementId);
  if (!catalogSupplement) return supplementId;

  const existing = await findDatabaseSupplementRowWithClient(supabase, catalogSupplement);
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

  if (error?.code === UNIQUE_VIOLATION) {
    const raced = await findDatabaseSupplementRowWithClient(supabase, catalogSupplement);
    if (raced) return raced.supplement_id;
  }

  throw error ?? new Error(`Failed to sync supplement "${catalogSupplement.supplement_name}"`);
}

async function resolveDatabaseBrandIdWithClient(
  supabase: SupabaseClient,
  brandName?: string | null
): Promise<number | null> {
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

export async function findDatabaseProductIdWithClient(
  supabase: SupabaseClient,
  product: Product
): Promise<number | string | null> {
  if (!isCuratedCatalogProductId(product.product_id)) return product.product_id;
  if (!product.product_url) return null;

  const { data: existing } = await supabase
    .from('products')
    .select('product_id')
    .eq('product_url', product.product_url)
    .limit(1);

  return existing?.[0]?.product_id ?? null;
}

async function syncProductIngredientsWithClient(
  supabase: SupabaseClient,
  dbProductId: number,
  product: Product
) {
  for (const ingredient of product.ingredients ?? []) {
    let ingredientSupplementId: number;

    try {
      ingredientSupplementId = await resolveDatabaseSupplementIdWithClient(
        supabase,
        ingredient.supplement_id
      );
    } catch (error) {
      console.error(
        `Failed to resolve ingredient "${ingredient.supplement_name}" for product "${product.product_name}":`,
        error
      );
      continue;
    }

    const { error } = await supabase
      .from('product_ingredients')
      .upsert(
        {
          product_id: dbProductId,
          ingredient_supplement_id: ingredientSupplementId,
          amount: ingredient.amount ?? null,
          unit: ingredient.unit ?? null,
          order_index: ingredient.order_index ?? 0,
          is_primary: ingredient.is_primary ?? false,
          notes: ingredient.notes ?? null,
        },
        { onConflict: 'product_id,ingredient_supplement_id' }
      );

    if (error && error.code !== UNIQUE_VIOLATION) {
      console.error(
        `Failed to sync ingredient "${ingredient.supplement_name}" for product "${product.product_name}":`,
        error
      );
    }
  }
}

export async function resolveDatabaseProductIdWithClient(
  supabase: SupabaseClient,
  product: Product
): Promise<number | string> {
  if (!isCuratedCatalogProductId(product.product_id)) return product.product_id;

  const existingId = await findDatabaseProductIdWithClient(supabase, product);
  if (existingId !== null) {
    if (typeof existingId === 'number' && product.ingredients?.length) {
      await syncProductIngredientsWithClient(supabase, existingId, product);
    }
    return existingId;
  }

  const [supplementId, brandId] = await Promise.all([
    resolveDatabaseSupplementIdWithClient(supabase, product.supplement_id),
    resolveDatabaseBrandIdWithClient(supabase, product.brands?.brand_name),
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

  if (product.ingredients?.length) {
    await syncProductIngredientsWithClient(supabase, inserted.product_id, product);
  }

  return inserted.product_id;
}
