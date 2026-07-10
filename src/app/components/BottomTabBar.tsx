'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { IconType } from 'react-icons';
import { FiLayers, FiShoppingBag, FiUser } from 'react-icons/fi';
import { cn } from '@/lib/design-system';

interface TabItem {
  href: string;
  label: string;
  icon: IconType;
  /** Route prefixes (besides href) that keep this tab active. */
  match: string[];
}

/**
 * Three destinations, three jobs: find products (Shop), track and manage the
 * routine (Stack), manage yourself (You). Discovery drill-ins (products,
 * brands, health shelves, search) all belong to Shop; saved bookmarks live
 * behind the header bookmark icon.
 */
const TABS: TabItem[] = [
  {
    href: '/',
    label: 'Shop',
    icon: FiShoppingBag,
    match: ['/supplement', '/brands', '/products', '/health', '/search', '/saved', '/peptides'],
  },
  { href: '/stack', label: 'Stack', icon: FiLayers, match: [] },
  { href: '/profile', label: 'You', icon: FiUser, match: ['/stacks', '/premium', '/health/tracker'] },
];

/** Routes where the tab bar yields to a route-specific bottom bar (e.g. the PDP buy bar). */
const HIDDEN_PREFIXES = ['/product/', '/login', '/privacy', '/terms'];

function matchingPrefix(tab: TabItem, pathname: string): string | null {
  const prefixes = [tab.href, ...tab.match];
  const match = prefixes.find((prefix) => {
    if (prefix === '/') return pathname === '/';
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });

  return match ?? null;
}

function isTabActive(tab: TabItem, pathname: string): boolean {
  const ownPrefix = matchingPrefix(tab, pathname);
  if (!ownPrefix) return false;

  return TABS.every((other) => {
    if (other === tab) return true;
    const otherPrefix = matchingPrefix(other, pathname);
    return !otherPrefix || ownPrefix.length >= otherPrefix.length;
  });
}

export default function BottomTabBar() {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <nav
      aria-label="Primary"
      className="app-tabbar fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden"
    >
      <div className="grid grid-cols-3">
        {TABS.map((tab) => {
          const active = isTabActive(tab, pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-14 flex-col items-center justify-center gap-1 px-1 pt-2 pb-1.5 transition-colors duration-150',
                'touch-manipulation active:bg-gray-50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-900',
                active ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.25 : 2} aria-hidden="true" />
              <span className={cn('text-[10px] leading-none tracking-wide', active ? 'font-semibold' : 'font-medium')}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
