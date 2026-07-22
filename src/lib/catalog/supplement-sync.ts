import { supabase } from '@/app/supabase';
import type { Product, Supplement } from '@/types';
import {
  findCatalogSupplementById,
  findCatalogSupplementByName,
} from '@/lib/catalog/supplement-catalog';
import { isCuratedCatalogProductId } from '@/lib/commerce/product-source';

interface SyncSupplementResponse {
  supplementId: number;
}

interface SyncProductResponse {
  productId: number | string;
}

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

async function postCatalogSync<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new Error('Please log in to sync catalog data');
  }

  const response = await fetch(path, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null;

  if (!response.ok || !payload) {
    throw new Error(payload?.error ?? 'Catalog sync failed');
  }

  return payload;
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

  const synced = await postCatalogSync<SyncSupplementResponse>('/api/catalog/sync-supplement', {
    supplementId,
  });

  return synced.supplementId;
}

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

/**
 * Finds the database row for a curated catalog product, creating it on first
 * authenticated use through a server route. Catalog products live in static
 * code with string IDs (`real-*`), but user tracking (`users_products`)
 * references integer rows in `products`. The server route validates the static
 * catalog ID and performs all catalog writes with the service role.
 */
export async function resolveDatabaseProductId(product: Product): Promise<number | string> {
  if (!isCuratedCatalogProductId(product.product_id)) return product.product_id;

  const existingId = await findDatabaseProductId(product);
  if (existingId !== null) {
    if (!product.ingredients?.length) return existingId;

    try {
      const synced = await postCatalogSync<SyncProductResponse>('/api/catalog/sync-product', {
        productId: product.product_id,
      });
      return synced.productId;
    } catch (error) {
      console.error('Could not refresh catalog ingredient composition:', error);
      return existingId;
    }
  }

  const synced = await postCatalogSync<SyncProductResponse>('/api/catalog/sync-product', {
    productId: product.product_id,
  });

  return synced.productId;
}
