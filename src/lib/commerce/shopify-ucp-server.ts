import type { Product } from '@/types';
import { createFallbackPurchaseSession, type PurchaseSession } from './purchase-session';
import { getPreferredPurchaseUrl } from './shopify-ucp';

const PROFILE_URL = 'https://shopify.dev/ucp/agent-profiles/2026-04-08/valid-with-capabilities.json';

interface UcpDiscovery {
  origin: string;
  endpoint: string;
  capabilities: Record<string, unknown>;
  tools: string[];
}

function normalizeOrigin(value?: string | null) {
  if (!value) return null;

  try {
    const candidate = value.startsWith('http') ? value : `https://${value}`;
    const url = new URL(candidate);
    return `https://${url.hostname.toLowerCase()}`;
  } catch {
    return null;
  }
}

async function callJsonRpc(endpoint: string, method: string, params: Record<string, unknown>) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      id: crypto.randomUUID(),
      params,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Shopify UCP request failed with HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (payload?.error) {
    throw new Error(payload.error.message || 'Shopify UCP returned a JSON-RPC error');
  }

  return payload;
}

function extractEndpoint(document: any, origin: string) {
  const services = document?.ucp?.services?.['dev.ucp.shopping'];
  if (Array.isArray(services)) {
    const service = services.find((item) => item?.transport === 'mcp' && item?.endpoint);
    if (service?.endpoint) return String(service.endpoint);
  }

  return `${origin}/api/ucp/mcp`;
}

async function discoverShopifyUcp(storeDomain?: string | null): Promise<UcpDiscovery | null> {
  const origin = normalizeOrigin(storeDomain);
  if (!origin) return null;

  const response = await fetch(`${origin}/.well-known/ucp`, {
    headers: { accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) return null;

  const document = await response.json();
  const endpoint = extractEndpoint(document, origin);
  let tools: string[] = [];

  try {
    const toolPayload = await callJsonRpc(endpoint, 'tools/list', {
      meta: {
        'ucp-agent': {
          profile: PROFILE_URL,
        },
      },
    });
    tools = (toolPayload?.result?.tools || [])
      .map((tool: any) => tool?.name)
      .filter(Boolean)
      .map(String);
  } catch {
    tools = [];
  }

  return {
    origin,
    endpoint,
    capabilities: document?.ucp?.capabilities || {},
    tools,
  };
}

function toolSupported(discovery: UcpDiscovery, toolName: string) {
  if (discovery.tools.includes(toolName)) return true;

  const capabilities = discovery.capabilities || {};
  if (toolName === 'create_cart' || toolName === 'create_checkout') {
    return (
      Object.prototype.hasOwnProperty.call(capabilities, 'dev.ucp.shopping.cart') ||
      Object.prototype.hasOwnProperty.call(capabilities, 'dev.ucp.shopping.checkout') ||
      Object.prototype.hasOwnProperty.call(capabilities, 'dev.ucp.shopping')
    );
  }

  return false;
}

function toProductVariantGid(value?: string | null) {
  if (!value) return null;
  if (value.startsWith('gid://shopify/ProductVariant/')) return value.split('?')[0];

  const match = value.match(/(\d+)$/);
  return match ? `gid://shopify/ProductVariant/${match[1]}` : value;
}

function structuredContent(payload: any) {
  const structured = payload?.result?.structuredContent;
  if (!structured || typeof structured !== 'object') {
    throw new Error('Shopify UCP response did not include structured content.');
  }
  if (payload?.result?.isError) {
    throw new Error('Shopify UCP returned an error result.');
  }
  return structured;
}

export async function resolveShopifyPurchaseSession(
  product: Product,
  quantity = 1
): Promise<PurchaseSession> {
  const fallback = createFallbackPurchaseSession(product, quantity);
  const variantId = toProductVariantGid(product.shopify_variant_gid);

  if (!variantId || !product.shopify_store_domain) {
    return fallback;
  }

  if (fallback.mode === 'shopify_cart_permalink') {
    return {
      ...fallback,
      provider: 'shopify',
      status: 'ready',
      capabilityStatus: {
        discovery: 'not_required',
        cart: 'supported',
        checkout: 'supported',
      },
      messages: ['Using verified Shopify variant cart permalink.'],
    };
  }

  try {
    const discovery = await discoverShopifyUcp(product.shopify_store_domain);
    if (!discovery || !toolSupported(discovery, 'create_cart')) {
      return {
        ...fallback,
        capabilityStatus: {
          discovery: discovery ? 'supported' : 'unavailable',
          cart: 'unavailable',
          checkout: 'fallback',
        },
        messages: ['Shopify UCP cart is unavailable for this merchant right now.'],
      };
    }

    const cartPayload = await callJsonRpc(discovery.endpoint, 'tools/call', {
      name: 'create_cart',
      arguments: {
        meta: {
          'ucp-agent': {
            profile: PROFILE_URL,
          },
        },
        cart: {
          line_items: [
            {
              quantity: Math.max(1, quantity),
              item: { id: variantId },
            },
          ],
          context: {
            address_country: 'US',
            currency: 'USD',
          },
        },
      },
    });

    const cart = structuredContent(cartPayload)?.cart || structuredContent(cartPayload);
    const cartId = cart?.id;
    let checkout: any = null;

    if (cartId && toolSupported(discovery, 'create_checkout')) {
      try {
        const checkoutPayload = await callJsonRpc(discovery.endpoint, 'tools/call', {
          name: 'create_checkout',
          arguments: {
            meta: {
              'ucp-agent': {
                profile: PROFILE_URL,
              },
            },
            cart_id: cartId,
          },
        });
        checkout = structuredContent(checkoutPayload);
      } catch {
        checkout = null;
      }
    }

    const continueUrl = checkout?.continue_url || cart?.continue_url || getPreferredPurchaseUrl(product);

    return {
      mode: checkout ? 'shopify_checkout' : 'shopify_ucp_candidate',
      provider: 'shopify_ucp',
      label: checkout ? 'Shop with Shopify' : 'Continue with Shopify',
      status: checkout ? 'ready' : 'fallback',
      purchaseUrl: continueUrl,
      fallbackUrl: fallback.purchaseUrl,
      merchantUrl: fallback.merchantUrl,
      checkoutId: checkout?.id,
      cartId,
      capabilityStatus: {
        discovery: 'supported',
        cart: 'supported',
        checkout: checkout ? 'supported' : 'fallback',
      },
      messages: checkout ? [] : ['Merchant provided a cart continuation URL instead of a checkout session.'],
    };
  } catch (error) {
    return {
      ...fallback,
      capabilityStatus: {
        discovery: 'failed',
        cart: 'failed',
        checkout: 'fallback',
      },
      messages: [error instanceof Error ? error.message : 'Shopify UCP failed; using fallback.'],
    };
  }
}
