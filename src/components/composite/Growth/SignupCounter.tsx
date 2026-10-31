'use client';

import { useEffect, useState } from 'react';
import { growthEnabled } from '@/lib/flags';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/design-system';

export interface SignupCounterProps {
  /** Hide the line until the real account count reaches this. No seed offset. */
  minToShow?: number;
  className?: string;
}

/**
 * Renders nothing when the flag is off, inside the native shell, on error,
 * or while the count is below `minToShow`. The first paint is always empty
 * so the Capacitor shell never flashes a number from server HTML.
 */
export function SignupCounter({ minToShow = 100, className }: SignupCounterProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!growthEnabled('signupCounter')) return;
    const controller = new AbortController();

    fetch('/api/growth/signup-count', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { count?: unknown } | null) => {
        if (typeof data?.count === 'number' && Number.isFinite(data.count)) {
          setCount(data.count);
        }
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  if (count == null || count < minToShow) return null;

  return (
    <p className={cn('text-sm text-gray-500', className)}>
      Join {formatNumber(count)} people tracking their stack
    </p>
  );
}
