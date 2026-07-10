'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui';
import { useAuth } from '@/app/context/AuthContext';
import { isNativeApp } from '@/lib/native/capacitor';

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
  '/search',
  '/supplement',
  '/terms',
];

const NATIVE_PUBLIC_PATHS = ['/login', '/privacy', '/terms'];

function isPublicPath(pathname: string) {
  const paths = isNativeApp() ? NATIVE_PUBLIC_PATHS : WEB_PUBLIC_PATHS;
  if (pathname === '/') return paths.includes('/');
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const publicPath = isPublicPath(pathname);

  useEffect(() => {
    if (loading || user || publicPath) return;

    const next = encodeURIComponent(pathname || '/profile');
    router.replace(`/login?next=${next}`);
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
