'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  const handleAuth = async () => {
    if (user) {
      await logout();
      router.push('/');
    } else {
      router.push('/login');
    }
  };

  return (
    <header className="app-header sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container-custom">
        <div className="app-header-row flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="group flex min-w-0 items-center">
            <span className="truncate font-serif text-xl font-normal tracking-normal text-gray-900 sm:text-2xl">
              SuppStack AI
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/brands"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Brands
            </Link>
            <Link
              href="/premium"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Premium
            </Link>
            {user && (
              <Link
                href="/profile"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                My Collection
              </Link>
            )}
          </nav>

          {/* Auth */}
          <div className="flex shrink-0 items-center">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
                    >
                      {user.user_metadata.avatar_url && (
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt="Profile"
                          width={32}
                          height={32}
                          className="rounded-full border border-gray-200"
                        />
                      )}
                      <span className="text-sm font-medium hidden sm:inline">
                        {user.user_metadata.full_name?.split(' ')[0] || 'Account'}
                      </span>
                    </Link>
                    <button
                      onClick={handleAuth}
                      className="min-h-10 rounded border border-gray-200 px-3 text-sm text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
                    >
                      Sign out
                    </button>
                  </div>
                ) : !isLoginPage ? (
                    <button
                      onClick={handleAuth}
                      className="min-h-10 rounded bg-gray-900 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 sm:px-5"
                    >
                    Sign in
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
