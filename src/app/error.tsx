'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Route-level error boundary: a render crash shows a recoverable screen
 * instead of a blank page (critical inside the native shell, which has no
 * browser chrome to reload from).
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <main className="flex min-h-[60dvh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-2xl text-gray-900">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-600">
        This screen hit a problem loading. Your stack and logs are safe.
      </p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        <button
          type="button"
          onClick={reset}
          className="flex min-h-11 items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          Try again
        </button>
        <Link
          href="/stack"
          className="flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Go to Today
        </Link>
      </div>
    </main>
  );
}
