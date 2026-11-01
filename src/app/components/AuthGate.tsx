'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui';
import { useAuth } from '@/app/context/AuthContext';
import { isNativeApp } from '@/lib/native/capacitor';
import { loginHref } from '@/lib/navigation/login';

/**
 * Web keeps guest browsing (SEO, link sharing); the native app is
 * auth-first — everything except the login screen and legal pages
 * requires an account.
 */
const WEB_PUBLIC_PATHS = [
  '/',
  '/brands',
  '/health',
  '/login',
  '/peptides',
  '/premium',
  '/privacy',
  '/products',
  '/product',
  '/saved',
  '/scan',
  '/search',
  '/supplement',
  '/terms',
];

const NATIVE_PUBLIC_PATHS = ['/login', '/privacy', '/terms'];

/**
 * Guest-readable guides on the web. Exact matches only, so they do not widen
 * `/supplement/...`. The native shell stays auth-first and does not include them.
 */
const WEB_SEO_PATHS = [
  '/best-supplement-stack-app',
  '/creatine-and-magnesium-timing',
  '/how-to-avoid-supplement-overlap',
  '/how-to-track-supplements',
  '/magnesium-glycinate-vs-citrate',
  '/supplement-interaction-checker',
  '/supplement-restock-reminder',
  '/supplement-schedule-app',
  '/supplement-stack-tracker',
  '/supplement-tracker-app',
  '/vitamin-d-and-k2-timing',
];

function isPublicPath(pathname: string) {
  const native = isNativeApp();
  const paths = native ? NATIVE_PUBLIC_PATHS : WEB_PUBLIC_PATHS;
  if (pathname === '/') return paths.includes('/');
  if (!native && WEB_SEO_PATHS.includes(pathname)) return true;
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const publicPath = isPublicPath(pathname);

  useEffect(() => {
    if (loading || user || publicPath) return;

    router.replace(loginHref(pathname || '/profile'));
  }, [loading, pathname, publicPath, router, user]);

  if (publicPath) return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center bg-white px-4">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
