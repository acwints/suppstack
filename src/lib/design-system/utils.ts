/**
 * Design System Utilities
 *
 * Formatting helpers live in `@/lib/utils`. Design tokens (colors, spacing,
 * typography, shadows) live in `tailwind.config.ts`.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS conflict resolution
 * Usage: cn('px-4 py-2', condition && 'bg-error-500', 'hover:bg-info-500')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
