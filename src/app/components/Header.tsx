'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const router = useRouter();

  const handleAuth = async () => {
    if (user) {
      await logout();
      router.push('/');
    } else {
      await loginWithGoogle();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-xl font-serif font-normal text-gray-900 tracking-tight">
              SuppStack
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
          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
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
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                    <button
                      onClick={handleAuth}
                      className="btn-editorial text-sm"
                    >
                    Sign In
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
