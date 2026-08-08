'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  FiAlertCircle,
  FiArrowRight,
  FiCamera,
  FiCheckCircle,
  FiImage,
  FiRefreshCw,
  FiSearch,
  FiUpload,
} from 'react-icons/fi';
import { useAuth } from '@/app/context/AuthContext';
import { ProductActions } from '@/components/composite/Product/ProductActions';
import { ProductPriceLine } from '@/components/composite/Product/ProductPriceLine';
import { ProductSourceBadge } from '@/components/composite/Product/ProductSourceBadge';
import { BrandLogo } from '@/components/composite/Brand';
import { Button, Spinner } from '@/components/ui';
import {
  getProductImageSrc,
  isRemoteImageSrc,
  PRODUCT_IMAGE_FALLBACK,
} from '@/lib/catalog/product-image';
import { cn } from '@/lib/design-system';
import { isNativeApp } from '@/lib/native/capacitor';
import type {
  CounterScanApiError,
  CounterScanApiResponse,
  CounterScanMatchedItem,
} from '@/lib/catalog/counter-scan-types';
import type { Product } from '@/types';

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;

function formatPercent(value: number) {
  return `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
}

function statusLabel(status: CounterScanMatchedItem['matchStatus']) {
  if (status === 'matched') return 'Matched';
  if (status === 'ambiguous') return 'Review';
  return 'No match';
}

function statusClassName(status: CounterScanMatchedItem['matchStatus']) {
  if (status === 'matched') return 'bg-gray-100 text-gray-900 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.10)]';
  if (status === 'ambiguous') return 'bg-warning-50 text-warning-800 shadow-[inset_0_0_0_1px_rgba(146,64,14,0.16)]';
  return 'bg-gray-100 text-gray-700 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)]';
}

function imageFileName(file: File, extension: string) {
  const withoutExtension = file.name.replace(/\.[^.]+$/, '');
  return `${withoutExtension || 'suppstack-counter-scan'}.${extension}`;
}

async function loadImage(file: File) {
  const url = URL.createObjectURL(file);

  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = document.createElement('img');
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Unable to decode image'));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function compressForScan(file: File) {
  if (!file.type.startsWith('image/')) return file;
  if (file.type.includes('heic') || file.type.includes('heif')) return file;

  try {
    const image = await loadImage(file);
    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height)
    );
    const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
    const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));

    if (scale === 1 && file.size <= MAX_UPLOAD_BYTES * 0.6 && file.type === 'image/jpeg') {
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.82)
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], imageFileName(file, 'jpg'), {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

function ProductImage({ product }: { product: Product }) {
  const [src, setSrc] = useState(() => getProductImageSrc(product.product_image));

  useEffect(() => {
    setSrc(getProductImageSrc(product.product_image));
  }, [product.product_image]);

  return (
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded bg-white outline outline-1 -outline-offset-1 outline-black/10 sm:h-28 sm:w-28">
      {src ? (
        <Image
          src={src}
          alt={product.product_name}
          fill
          className="object-contain p-3"
          sizes="112px"
          unoptimized={isRemoteImageSrc(src)}
          onError={() => setSrc(PRODUCT_IMAGE_FALLBACK)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-gray-300">
          {product.product_name.charAt(0)}
        </span>
      )}
    </div>
  );
}

function AlternateLink({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.product_id}`}
      className="inline-flex min-h-10 items-center gap-2 rounded bg-gray-50 px-3 text-sm font-medium text-gray-800 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)] transition-[background-color,box-shadow,transform] duration-150 ease-out hover:bg-white hover:shadow-surface active:scale-[0.96]"
    >
      <span className="truncate">{product.product_name}</span>
      <FiArrowRight size={14} aria-hidden="true" />
    </Link>
  );
}

function ScanResultCard({ item }: { item: CounterScanMatchedItem }) {
  const product = item.product;
  const searchQuery = item.query || item.label;

  return (
    <article className="rounded-lg bg-white p-3 shadow-surface sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        {product ? (
          <ProductImage product={product} />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded bg-gray-50 text-gray-400 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)] sm:h-28 sm:w-28">
            <FiImage size={26} aria-hidden="true" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex min-h-7 items-center rounded px-2 text-xs font-semibold',
                statusClassName(item.matchStatus)
              )}
            >
              {statusLabel(item.matchStatus)}
            </span>
            <span className="text-xs font-medium text-gray-500">
              {formatPercent(product ? item.matchConfidence : item.confidence)}
            </span>
          </div>

          {product ? (
            <>
              <div className="mt-3 flex min-w-0 items-center gap-2">
                <BrandLogo
                  domain={product.shopify_store_domain}
                  brandName={product.brands?.brand_name || 'Brand'}
                  size="sm"
                />
                <span className="truncate text-sm text-gray-500">
                  {product.brands?.brand_name || product.shopify_store_domain || 'Brand'}
                </span>
              </div>
              <Link
                href={`/product/${product.product_id}`}
                className="mt-1 block text-lg font-semibold leading-6 text-gray-950 underline-offset-4 hover:underline"
              >
                {product.product_name}
              </Link>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <ProductPriceLine product={product} />
                <ProductSourceBadge product={product} compact />
              </div>
              <p className="mt-2 text-sm leading-5 text-gray-500">
                Recognized from {item.label || item.visibleText.join(', ')}.
              </p>
              <ProductActions product={product} variant="sticky" className="mt-4" />
            </>
          ) : (
            <>
              <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-950">
                {item.label || 'Unresolved supplement'}
              </h3>
              <p className="mt-2 text-sm leading-5 text-gray-500">
                {item.visualCues || 'The label was not clear enough for a safe catalog match.'}
              </p>
              {item.alternates.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.alternates.map((alternate) => (
                    <AlternateLink key={alternate.product_id} product={alternate} />
                  ))}
                </div>
              )}
              <Link
                href={`/search?q=${encodeURIComponent(searchQuery)}`}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded bg-gray-900 px-4 text-sm font-medium text-white transition-[background-color,transform] duration-150 ease-out hover:bg-gray-800 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              >
                <FiSearch size={16} aria-hidden="true" />
                Search catalog
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export function CounterScanClient() {
  const router = useRouter();
  const { user, session, loading } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scan, setScan] = useState<CounterScanApiResponse | null>(null);
  const [isNativeShell, setIsNativeShell] = useState<boolean | null>(null);

  const hasPhoto = Boolean(file && previewUrl);
  const matchedCount = scan?.matchedCount ?? 0;
  const totalCount = scan?.items.length ?? 0;

  const statusText = scan
    ? totalCount === 0
      ? 'No supplements found'
      : `${matchedCount} of ${totalCount} matched`
    : null;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const native = isNativeApp();
    setIsNativeShell(native);
    if (!native) {
      router.replace('/');
    }
  }, [router]);

  const handleFile = (selectedFile: File | null) => {
    setError(null);
    setScan(null);
    setFile(selectedFile);
    setPreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : null);
  };

  const handleScan = async () => {
    if (!file) return;
    if (isNativeShell !== true) {
      router.replace('/');
      return;
    }
    if (!user || !session?.access_token) {
      router.push('/login?next=/scan');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const uploadFile = await compressForScan(file);
      if (uploadFile.size > MAX_UPLOAD_BYTES) {
        setError('The photo is too large. Crop it or choose a smaller image.');
        return;
      }

      const formData = new FormData();
      formData.append('image', uploadFile);

      const response = await fetch('/api/catalog/photo-scan', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'X-SuppStack-Client': 'native',
        },
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as CounterScanApiError | null;
        if (payload?.code === 'AUTH_REQUIRED') {
          router.push('/login?next=/scan');
          return;
        }
        throw new Error(payload?.error || 'Unable to scan this photo.');
      }

      setScan((await response.json()) as CounterScanApiResponse);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : 'Unable to scan this photo.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    handleFile(null);
    inputRef.current?.focus();
  };

  if (isNativeShell !== true) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center bg-white px-4">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-5 pb-24 sm:px-6 sm:py-8 md:pb-10">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <section className="rounded-lg bg-white p-4 shadow-surface sm:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
              Scan Your Stack
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal text-gray-950 sm:text-3xl">
              Turn a photo of your bottles into your stack.
            </h1>
            <p className="mt-3 max-w-[58ch] text-sm leading-6 text-gray-600">
              Take one clear photo, review the canonical matches, then add the right products.
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded bg-gray-50 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)]">
            {previewUrl ? (
              <div className="relative h-72 w-full sm:h-96">
                <Image
                  src={previewUrl}
                  alt="Selected supplement counter photo"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-contain outline outline-1 -outline-offset-1 outline-black/10"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-72 flex-col items-center justify-center px-6 text-center text-gray-500 sm:h-96">
                <FiImage size={34} aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-gray-800">No photo selected</p>
                <p className="mt-1 max-w-[32ch] text-sm leading-5">
                  Use a clear overhead shot with labels facing the camera.
                </p>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => inputRef.current?.click()}
              leftIcon={hasPhoto ? <FiRefreshCw /> : <FiCamera />}
              className="flex-1"
            >
              {hasPhoto ? 'Change Photo' : 'Take Photo'}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleScan}
              disabled={!file || isScanning || loading}
              isLoading={isScanning}
              leftIcon={<FiUpload />}
              className="flex-1"
            >
              Scan Your Stack
            </Button>
          </div>

          {!loading && !user && (
            <div className="mt-4 rounded bg-gray-50 p-3 text-sm leading-5 text-gray-600 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)]">
              Sign in before scanning so recognized products can be added directly to your stack.
            </div>
          )}

          {error && (
            <div className="mt-4 flex gap-2 rounded bg-error-50 p-3 text-sm leading-5 text-error-700 shadow-[inset_0_0_0_1px_rgba(185,28,28,0.14)]">
              <FiAlertCircle className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
        </section>

        <section className="min-w-0">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                Review
              </p>
              <h2 className="mt-1 text-xl font-semibold text-gray-950">Recognized Supplements</h2>
            </div>
            {statusText && (
              <span className="shrink-0 rounded bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 shadow-surface">
                {statusText}
              </span>
            )}
          </div>

          {isScanning ? (
            <div className="flex min-h-72 items-center justify-center rounded-lg bg-white p-6 shadow-surface">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-sm font-medium text-gray-700">Reading labels</p>
              </div>
            </div>
          ) : scan && scan.items.length > 0 ? (
            <div className="grid gap-3">
              {scan.items.map((item) => (
                <ScanResultCard key={item.id} item={item} />
              ))}
            </div>
          ) : scan ? (
            <div className="rounded-lg bg-white p-6 text-center shadow-surface">
              <FiAlertCircle className="mx-auto text-gray-400" size={28} aria-hidden="true" />
              <h3 className="mt-3 text-lg font-semibold text-gray-950">No supplements found</h3>
              <p className="mx-auto mt-2 max-w-[42ch] text-sm leading-6 text-gray-600">
                Try a closer photo with product labels facing forward.
              </p>
              <Button type="button" variant="outline" size="md" onClick={handleReset} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="rounded-lg bg-white p-6 shadow-surface">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-50 text-gray-500 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)]">
                  <FiCheckCircle size={20} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-950">Safe review before import</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    SuppStack only adds catalog-backed products after you confirm each match.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default CounterScanClient;
