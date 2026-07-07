import type { HealthMetricSnapshot } from '@/lib/health/health-intelligence';
import { isNativeApp } from './capacitor';

export interface AppleHealthAvailability {
  available: boolean;
  platform: 'ios' | 'web' | 'unknown';
}

export interface AppleHealthReadOptions {
  days?: number;
}

interface SuppStackHealthPlugin {
  isAvailable: () => Promise<AppleHealthAvailability>;
  requestAuthorization: () => Promise<{ granted: boolean }>;
  getSnapshot: (options?: AppleHealthReadOptions) => Promise<HealthMetricSnapshot>;
}

function getHealthPlugin(): SuppStackHealthPlugin | null {
  if (typeof window === 'undefined') return null;
  return ((window.Capacitor?.Plugins as Record<string, unknown> | undefined)?.SuppStackHealth ??
    null) as SuppStackHealthPlugin | null;
}

export async function getAppleHealthAvailability(): Promise<AppleHealthAvailability> {
  if (!isNativeApp()) {
    return { available: false, platform: 'web' };
  }

  const plugin = getHealthPlugin();
  if (!plugin) {
    return { available: false, platform: 'ios' };
  }

  return plugin.isAvailable();
}

export async function requestAppleHealthSnapshot(
  options: AppleHealthReadOptions = {}
): Promise<HealthMetricSnapshot> {
  const plugin = getHealthPlugin();
  if (!isNativeApp() || !plugin) {
    throw new Error('Apple Health is available only inside the SuppStack iOS app.');
  }

  const permission = await plugin.requestAuthorization();
  if (!permission.granted) {
    throw new Error('Apple Health permission was not granted.');
  }

  return plugin.getSnapshot({ days: options.days ?? 14 });
}

export function hasAppleHealthBridge(): boolean {
  return isNativeApp() && Boolean(getHealthPlugin());
}
