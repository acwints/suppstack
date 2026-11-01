'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { isNativeApp } from '@/lib/native/capacitor';

/**
 * External purchase UI stays hidden until the client confirms this is a
 * browser, not the Capacitor shell. The first paint matches the server, so
 * the iOS webview never flashes a web checkout link.
 */
export function useAllowsExternalPurchase(): boolean {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(!isNativeApp());
  }, []);

  return allowed;
}

/** Renders children only on the website, never inside the iOS shell. */
export function WebOnly({ children }: { children: ReactNode }) {
  const allowed = useAllowsExternalPurchase();
  if (!allowed) return null;
  return <>{children}</>;
}
