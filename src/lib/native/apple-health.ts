import { isNativeApp } from './capacitor';

/** Shape of the JSON returned by the native SuppStackHealth Capacitor plugin. */
export interface HealthMetricSnapshot {
  source: 'apple_health';
  dateRangeDays: number;
  lastSyncedAt?: string;
  sleepHoursAvg?: number | null;
  sleepQualityAvg?: number | null;
  sleepDaysTracked?: number | null;
  sleepDebtHours?: number | null;
  sleepConsistencyScore?: number | null;
  sleepRemHoursAvg?: number | null;
  sleepDeepHoursAvg?: number | null;
  sleepAwakeHoursAvg?: number | null;
  weightKg?: number | null;
  weightTrendKg?: number | null;
  bodyFatPercent?: number | null;
  bodyFatTrendPercent?: number | null;
  activeEnergyBurnedKcalAvg?: number | null;
  restingEnergyBurnedKcalAvg?: number | null;
  stepsAvg?: number | null;
  exerciseMinutesAvg?: number | null;
  restingHeartRateBpmAvg?: number | null;
  heartRateVariabilityMsAvg?: number | null;
  vo2MaxMlKgMin?: number | null;
}

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
