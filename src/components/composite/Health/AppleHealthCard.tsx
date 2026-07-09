'use client';

import { useEffect, useState } from 'react';
import { FaApple } from 'react-icons/fa';
import { Button, Spinner } from '@/components/ui';
import {
  getAppleHealthAvailability,
  requestAppleHealthSnapshot,
  type HealthMetricSnapshot,
} from '@/lib/native/apple-health';

const KG_TO_LB = 2.20462;

interface MetricTile {
  label: string;
  value: string;
  detail?: string;
}

function buildMetricTiles(snapshot: HealthMetricSnapshot): MetricTile[] {
  const tiles: MetricTile[] = [];

  if (snapshot.sleepHoursAvg != null) {
    tiles.push({
      label: 'Sleep',
      value: `${snapshot.sleepHoursAvg.toFixed(1)}h`,
      detail:
        snapshot.sleepRemHoursAvg != null && snapshot.sleepDeepHoursAvg != null
          ? `${snapshot.sleepRemHoursAvg.toFixed(1)}h REM · ${snapshot.sleepDeepHoursAvg.toFixed(1)}h deep`
          : undefined,
    });
  }
  if (snapshot.weightKg != null) {
    tiles.push({
      label: 'Weight',
      value: `${Math.round(snapshot.weightKg * KG_TO_LB)} lb`,
      detail:
        snapshot.weightTrendKg != null
          ? `${snapshot.weightTrendKg >= 0 ? '+' : ''}${(snapshot.weightTrendKg * KG_TO_LB).toFixed(1)} lb trend`
          : undefined,
    });
  }
  if (snapshot.activeEnergyBurnedKcalAvg != null) {
    tiles.push({
      label: 'Active energy',
      value: `${Math.round(snapshot.activeEnergyBurnedKcalAvg)} kcal`,
      detail: snapshot.stepsAvg != null ? `${Math.round(snapshot.stepsAvg).toLocaleString()} steps` : undefined,
    });
  }
  if (snapshot.restingHeartRateBpmAvg != null) {
    tiles.push({
      label: 'Resting HR',
      value: `${Math.round(snapshot.restingHeartRateBpmAvg)} bpm`,
      detail:
        snapshot.heartRateVariabilityMsAvg != null
          ? `${Math.round(snapshot.heartRateVariabilityMsAvg)} ms HRV`
          : undefined,
    });
  }

  return tiles;
}

/**
 * The one Apple Health surface: connect on iOS, see your last two weeks.
 * Read straight from HealthKit on demand — nothing is stored.
 */
export function AppleHealthCard() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [snapshot, setSnapshot] = useState<HealthMetricSnapshot | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAppleHealthAvailability()
      .then((availability) => setIsAvailable(availability.available))
      .catch(() => setIsAvailable(false));
  }, []);

  const handleConnect = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      setSnapshot(await requestAppleHealthSnapshot());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read Apple Health data.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isAvailable === null) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded border border-gray-200">
        <Spinner size="md" />
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="rounded border border-gray-200 p-4">
        <p className="text-sm text-gray-600">
          Apple Health sync is available in the SuppStack iOS app.
        </p>
      </div>
    );
  }

  const tiles = snapshot ? buildMetricTiles(snapshot) : [];

  return (
    <div className="rounded border border-gray-200 p-4">
      {!snapshot ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-gray-600">
            See your last two weeks of sleep, weight, and activity next to your stack. Read
            directly from Apple Health — nothing is stored.
          </p>
          <Button
            variant="primary"
            onClick={handleConnect}
            isLoading={isSyncing}
            leftIcon={<FaApple />}
          >
            Connect Apple Health
          </Button>
          {error && <p className="text-sm text-error-600">{error}</p>}
        </div>
      ) : tiles.length > 0 ? (
        <div>
          <div className="grid grid-cols-2 gap-3">
            {tiles.map((tile) => (
              <div key={tile.label} className="rounded border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {tile.label}
                </p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{tile.value}</p>
                {tile.detail && <p className="mt-0.5 text-xs text-gray-500">{tile.detail}</p>}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400">
            {snapshot.dateRangeDays}-day averages from Apple Health.
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-600">
          No Apple Health data found for the last {snapshot.dateRangeDays} days.
        </p>
      )}
    </div>
  );
}

export default AppleHealthCard;
