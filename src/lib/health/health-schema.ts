const MISSING_RELATION_CODES = new Set(['42P01', 'PGRST205']);
const MISSING_COLUMN_CODES = new Set(['42703', 'PGRST204']);

export function isRemoteHealthStorageEnabled() {
  return process.env.NEXT_PUBLIC_HEALTH_REMOTE_STORAGE === 'enabled';
}

interface SupabaseLikeError {
  code?: string;
  message?: string;
  details?: string;
}

function errorParts(error: unknown): SupabaseLikeError {
  if (!error || typeof error !== 'object') return {};
  const maybe = error as Record<string, unknown>;

  return {
    code: typeof maybe.code === 'string' ? maybe.code : undefined,
    message: typeof maybe.message === 'string' ? maybe.message : undefined,
    details: typeof maybe.details === 'string' ? maybe.details : undefined,
  };
}

function errorText(error: unknown) {
  const parts = errorParts(error);
  return `${parts.message ?? ''} ${parts.details ?? ''}`.toLowerCase();
}

export function isMissingHealthRelationError(error: unknown) {
  const parts = errorParts(error);
  const text = errorText(error);

  return (
    (parts.code ? MISSING_RELATION_CODES.has(parts.code) : false) ||
    text.includes('health_metric_snapshots') && text.includes('does not exist') ||
    text.includes('health_experiments') && text.includes('does not exist') ||
    text.includes("could not find the table 'public.health_metric_snapshots'") ||
    text.includes("could not find the table 'public.health_experiments'")
  );
}

export function isMissingHealthColumnError(error: unknown, columns: string[]) {
  const parts = errorParts(error);
  const text = errorText(error);

  return (
    (parts.code ? MISSING_COLUMN_CODES.has(parts.code) : false) &&
    columns.some((column) => text.includes(column.toLowerCase()))
  );
}

export function healthMigrationMessage(feature = 'Health history') {
  return `${feature} needs the Supabase health migration. Apply supabase/migrations/20260101000006_health_snapshots.sql before relying on saved Apple Health history.`;
}
