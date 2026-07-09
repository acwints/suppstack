'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FiArrowLeft,
  FiBookmark,
  FiChevronDown,
  FiCreditCard,
  FiLogOut,
  FiPackage,
  FiUser,
} from 'react-icons/fi';
import { cn } from '@/lib/design-system';

/**
 * The same destinations as the mobile tab bar — one IA everywhere.
 * Discovery drill-ins (products, brands, health, search) belong to Shop.
 */
const NAV_LINKS = [
  { href: '/', label: 'Shop' },
  { href: '/stack', label: 'Stack' },
  { href: '/premium', label: 'Premium' },
] as const;

const SHOP_PREFIXES = ['/supplement', '/brands', '/products', '/health', '/search', '/product'];
const LAST_APP_PATH_KEY = 'suppstack:last-app-path';

interface MobileAppBarConfig {
  title: string;
  backHref?: string;
  brandTitle?: boolean;
  showSaved?: boolean;
}

function isNavActive(href: string, pathname: string): boolean {
  if (href === '/') {
    return (
      pathname === '/' ||
      SHOP_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getMobileAppBarConfig(pathname: string): MobileAppBarConfig {
  if (pathname === '/') return { title: 'SuppStack AI', brandTitle: true, showSaved: true };
  if (pathname === '/stack') return { title: 'My Stack' };
  if (pathname === '/profile') return { title: 'You' };
  if (pathname === '/saved') return { title: 'Saved', backHref: '/', showSaved: false };
  if (pathname === '/products') return { title: 'All Products', backHref: '/', showSaved: false };
  if (pathname === '/brands') return { title: 'Brands', backHref: '/', showSaved: false };
  if (pathname.startsWith('/brands/')) return { title: 'Brand', backHref: '/brands' };
  if (pathname === '/health') return { title: 'Shop by Goal', backHref: '/' };
  if (pathname === '/health/tracker') return { title: 'Apple Health', backHref: '/profile' };
  if (pathname.startsWith('/health/')) return { title: 'Health Goal', backHref: '/health' };
  if (pathname === '/search') return { title: 'Search', backHref: '/' };
  if (pathname.startsWith('/supplement/')) return { title: 'Supplement', backHref: '/' };
  if (pathname.startsWith('/product/')) return { title: 'Product', backHref: '/' };
  if (pathname === '/premium') return { title: 'Premium', backHref: '/profile' };
  if (pathname === '/stacks/create') return { title: 'Create Stack', backHref: '/profile' };
  if (pathname.startsWith('/stacks/')) return { title: 'Stack', backHref: '/profile' };
  if (pathname === '/privacy') return { title: 'Privacy', backHref: '/' };
  if (pathname === '/terms') return { title: 'Terms', backHref: '/' };

  return { title: 'SuppStack AI', brandTitle: true, showSaved: true };
}

export default function Header() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const mobileAppBar = getMobileAppBarConfig(pathname);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [hasInAppBackTarget, setHasInAppBackTarget] = useState(false);
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

  useEffect(() => {
    if (isLoginPage) return;

    try {
      const lastPath = window.sessionStorage.getItem(LAST_APP_PATH_KEY);
      setHasInAppBackTarget(Boolean(lastPath && lastPath !== pathname));
      window.sessionStorage.setItem(LAST_APP_PATH_KEY, pathname);
    } catch {
      setHasInAppBackTarget(false);
    }
  }, [isLoginPage, pathname]);

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleSignOut = async () => {
    setIsAccountMenuOpen(false);
    await logout();
    router.push('/');
  };

  const handleMobileBack = () => {
    const fallback = mobileAppBar.backHref ?? '/';
    if (hasInAppBackTarget) {
      router.back();
      return;
    }
    router.push(fallback);
  };

  const accountMenuLinkClass =
    'flex min-h-11 items-center gap-3 rounded px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-900';

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
        className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded px-1.5 py-1 text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 sm:px-2"
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
          className="absolute right-0 mt-2 w-72 rounded-md border border-gray-200 bg-white p-2 shadow-md ring-1 ring-black/5"
        >
          <div className="border-b border-gray-100 px-3 py-3">
            <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
            {user.email && <p className="mt-0.5 truncate text-xs text-gray-500">{user.email}</p>}
          </div>

          <div className="py-2">
            <Link href="/stack" role="menuitem" className={accountMenuLinkClass}>
              <FiPackage size={16} aria-hidden="true" />
              My Stack
            </Link>
            <Link href="/profile" role="menuitem" className={accountMenuLinkClass}>
              <FiUser size={16} aria-hidden="true" />
              Profile
            </Link>
            <Link href="/premium" role="menuitem" className={accountMenuLinkClass}>
              <FiCreditCard size={16} aria-hidden="true" />
              Premium
            </Link>
          </div>

          <div className="border-t border-gray-100 pt-2">
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="flex min-h-11 w-full items-center gap-3 rounded px-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-900"
            >
              <FiLogOut size={16} aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  ) : null;

  // The auth screen is a full-bleed experience — no app chrome.
  if (isLoginPage) return null;

  const authControl = loading ? null : user ? (
    accountMenu
  ) : !isLoginPage ? (
    <button
      onClick={handleSignIn}
      className="min-h-11 rounded bg-gray-900 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-800 active:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 sm:px-5"
    >
      Sign in
    </button>
  ) : null;

  const savedProductsLink = (
    <Link
      href="/saved"
      aria-label="Saved products"
      className={cn(
        'flex min-h-11 min-w-11 items-center justify-center rounded transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900',
        isNavActive('/saved', pathname)
          ? 'text-gray-900'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <FiBookmark size={20} aria-hidden="true" />
    </Link>
  );

  return (
    <header className="app-header sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container-custom">
        <div className="app-header-row flex items-center justify-between gap-3 md:hidden">
          {mobileAppBar.backHref ? (
            <>
              <button
                type="button"
                onClick={handleMobileBack}
                aria-label="Go back"
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
              >
                <FiArrowLeft size={21} aria-hidden="true" />
              </button>
              <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-gray-900">
                {mobileAppBar.title}
              </p>
              {mobileAppBar.showSaved ? savedProductsLink : <span className="h-11 w-11 shrink-0" aria-hidden="true" />}
            </>
          ) : (
            <>
              {mobileAppBar.brandTitle ? (
                <Link href="/" className="group min-w-0 flex-1">
                  <span className="block truncate font-serif text-xl font-normal tracking-normal text-gray-900">
                    {mobileAppBar.title}
                  </span>
                </Link>
              ) : (
                <p className="min-w-0 flex-1 truncate text-base font-semibold text-gray-900">
                  {mobileAppBar.title}
                </p>
              )}
              {mobileAppBar.showSaved ? savedProductsLink : <span className="h-11 w-11 shrink-0" aria-hidden="true" />}
            </>
          )}
        </div>

        <div className="app-header-row hidden items-center justify-between gap-3 md:flex">
          {/* Logo */}
          <Link href="/" className="group flex min-w-0 items-center">
            <span className="truncate font-serif text-xl font-normal tracking-normal text-gray-900 sm:text-2xl">
              SuppStack AI
            </span>
          </Link>

          {/* Navigation */}
          <nav aria-label="Primary" className="hidden items-center gap-5 md:flex xl:gap-8">
            {NAV_LINKS.map((link) => {
              const active = isNavActive(link.href, pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded text-sm transition-colors hover:text-gray-900',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2',
                    active
                      ? 'font-semibold text-gray-900 underline decoration-gray-900 underline-offset-8'
                      : 'font-medium text-gray-600'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            {savedProductsLink}
            {/* Auth — desktop only; on mobile the tab bar's You tab covers it,
                keeping a single avatar per screen. */}
            <div className="hidden shrink-0 items-center md:flex">{authControl}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
