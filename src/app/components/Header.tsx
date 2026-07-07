'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiChevronDown, FiCreditCard, FiLogOut, FiPackage, FiShoppingBag } from 'react-icons/fi';

export default function Header() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const displayName = String(
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Account'
  );
  const firstName = displayName.split(' ')[0] || 'Account';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A';

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  useEffect(() => {
    setIsAccountMenuOpen(false);
  }, [pathname]);

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleSignOut = async () => {
    setIsAccountMenuOpen(false);
    await logout();
    router.push('/');
  };

  const accountMenuLinkClass =
    'flex min-h-10 items-center gap-3 rounded px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950 focus:bg-gray-50 focus:text-gray-950 focus:outline-none';

  const mobileNavLinkClass =
    'flex min-h-10 items-center gap-3 rounded px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950 focus:bg-gray-50 focus:text-gray-950 focus:outline-none md:hidden';

  const avatar = avatarUrl ? (
    <Image
      src={avatarUrl}
      alt=""
      width={32}
      height={32}
      className="h-8 w-8 rounded-full border border-gray-200 object-cover"
    />
  ) : (
    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700">
      {initials}
    </span>
  );

  const accountMenu = user ? (
    <div ref={accountMenuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isAccountMenuOpen}
        onClick={() => setIsAccountMenuOpen((open) => !open)}
        className="flex min-h-10 items-center gap-2 rounded px-1.5 py-1 text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 sm:px-2"
      >
        {avatar}
        <span className="hidden max-w-28 truncate text-sm font-medium sm:inline lg:max-w-36">
          {firstName}
        </span>
        <FiChevronDown
          size={16}
          className={`hidden text-gray-400 transition-transform sm:block ${
            isAccountMenuOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
        <span className="sr-only">Open account menu</span>
      </button>

      {isAccountMenuOpen && (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 mt-2 w-72 rounded-md border border-gray-200 bg-white p-2 shadow-lg ring-1 ring-black/5"
        >
          <div className="border-b border-gray-100 px-3 py-3">
            <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
            {user.email && <p className="mt-0.5 truncate text-xs text-gray-500">{user.email}</p>}
          </div>

          <div className="py-2">
            <Link href="/profile" role="menuitem" className={accountMenuLinkClass}>
              <FiPackage size={16} aria-hidden="true" />
              My Stack
            </Link>
            <Link href="/premium" role="menuitem" className={accountMenuLinkClass}>
              <FiCreditCard size={16} aria-hidden="true" />
              Premium
            </Link>
          </div>

          <div className="border-t border-gray-100 py-2 md:hidden">
            <Link href="/" role="menuitem" className={mobileNavLinkClass}>
              <FiShoppingBag size={16} aria-hidden="true" />
              Shop
            </Link>
            <Link href="/brands" role="menuitem" className={mobileNavLinkClass}>
              Brands
            </Link>
            <Link href="/products" role="menuitem" className={mobileNavLinkClass}>
              Products
            </Link>
            <Link href="/health" role="menuitem" className={mobileNavLinkClass}>
              Health
            </Link>
          </div>

          <div className="border-t border-gray-100 pt-2">
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="flex min-h-10 w-full items-center gap-3 rounded px-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950 focus:bg-gray-50 focus:text-gray-950 focus:outline-none"
            >
              <FiLogOut size={16} aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  ) : null;

  const authControl = loading ? null : user ? (
    accountMenu
  ) : !isLoginPage ? (
    <button
      onClick={handleSignIn}
      className="min-h-10 rounded bg-gray-900 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 sm:px-5"
    >
      Sign in
    </button>
  ) : null;

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
          <nav className="hidden items-center gap-5 md:flex xl:gap-8">
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
              href="/products"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Products
            </Link>
            <Link
              href="/health"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Health
            </Link>
            <Link
              href="/health/tracker"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Tracker
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
                My Stack
              </Link>
            )}
          </nav>

          {/* Auth */}
          <div className="flex shrink-0 items-center">{authControl}</div>
        </div>
      </div>
    </header>
  );
}
