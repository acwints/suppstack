import { NextRequest, NextResponse } from 'next/server';
import { getBrandLogoSourceUrl } from '@/lib/catalog/brand-logos';

/**
 * Same-origin proxy for merchant brand logos (storefront favicons).
 * Only domains present in the baked brand-logo map can be requested, so this
 * cannot be used as an open proxy, and no third-party image hosts need to be
 * exposed to the client or allowlisted in next.config.
 */
export async function GET(_request: NextRequest, props: { params: Promise<{ domain: string }> }) {
  const params = await props.params;
  const sourceUrl = getBrandLogoSourceUrl(params.domain);
  if (!sourceUrl) {
    return NextResponse.json({ error: 'Unknown brand domain.' }, { status: 404 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let response: Response;
    try {
      response = await fetch(sourceUrl, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          accept: 'image/*',
          'user-agent': 'SuppStackBrandLogo/1.0',
        },
        // Merchant favicons rarely change; refresh at most daily.
        next: { revalidate: 86400 },
      });
    } finally {
      clearTimeout(timeout);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!response.ok || !contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Logo unavailable.' }, { status: 502 });
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Logo unavailable.' }, { status: 502 });
  }
}
