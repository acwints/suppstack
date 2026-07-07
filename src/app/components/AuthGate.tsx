'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui';
import { useAuth } from '@/app/context/AuthContext';

const PUBLIC_PATHS = [
  '/',
  '/brands',
  '/health',
  '/login',
  '/premium',
  '/privacy',
  '/products',
  '/product',
  '/supplement',
  '/terms',
];

function isPublicPath(pathname: string) {
  if (pathname === '/') return true;
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
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
