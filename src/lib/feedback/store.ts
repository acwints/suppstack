import 'server-only';

import { getSupabaseServiceClient } from '@/lib/server/supabase';
import { isMissingRelation } from './validate';

export type FeedbackStore = 'feedback' | 'commerce_checkout_events';

export interface StoredFeedback {
  message: string;
  email: string | null;
  pagePath: string;
  userId: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface FeedbackRecord extends StoredFeedback {
  id: string;
  store: FeedbackStore;
}

const FEEDBACK_PROVIDER = 'in_app_feedback';

type WriteError = { code?: string; message?: string } | null;

function client() {
  return getSupabaseServiceClient();
}

export async function saveFeedback(
  row: StoredFeedback
): Promise<{ ok: true; store: FeedbackStore } | { ok: false; error: string }> {
  const supabase = client();
  if (!supabase) {
    return { ok: false, error: 'Feedback storage is not configured.' };
  }

  const inserted = await supabase.from('feedback').insert({
    message: row.message,
    email: row.email,
    page_path: row.pagePath,
    user_id: row.userId,
    user_agent: row.userAgent,
    created_at: row.createdAt,
  });

  if (!inserted.error) {
    return { ok: true, store: 'feedback' };
  }

  if (!isMissingRelation(inserted.error)) {
    console.error('feedback insert failed', inserted.error.code ?? 'unknown');
    return { ok: false, error: 'Could not store that note.' };
  }

  const fallback = await supabase.from('commerce_checkout_events').insert({
    user_id: row.userId,
    product_id: 'feedback',
    provider: FEEDBACK_PROVIDER,
    session_mode: 'suggestion',
    status: 'received',
    metadata: {
      kind: 'feedback',
      message: row.message,
      email: row.email,
      page_path: row.pagePath,
      user_agent: row.userAgent,
    },
    created_at: row.createdAt,
  });

  if (fallback.error) {
    console.error('feedback fallback insert failed', fallback.error.code ?? 'unknown');
    return { ok: false, error: 'Could not store that note.' };
  }

  return { ok: true, store: 'commerce_checkout_events' };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export async function listFeedback(limit: number): Promise<
  { ok: true; records: FeedbackRecord[] } | { ok: false; error: string }
> {
  const supabase = client();
  if (!supabase) {
    return { ok: false, error: 'Feedback storage is not configured.' };
  }

  const records: FeedbackRecord[] = [];
  let sawAnyStore = false;

  const primary = await supabase
    .from('feedback')
    .select('feedback_id,message,email,page_path,user_id,user_agent,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!primary.error) {
    sawAnyStore = true;
    for (const row of primary.data ?? []) {
      const record = asRecord(row);
      if (!record || typeof record.message !== 'string') continue;
      records.push({
        id: asString(record.feedback_id) ?? '',
        store: 'feedback',
        message: record.message,
        email: asString(record.email),
        pagePath: asString(record.page_path) ?? '',
        userId: asString(record.user_id),
        userAgent: asString(record.user_agent),
        createdAt: asString(record.created_at) ?? '',
      });
    }
  } else if (!isMissingRelation(primary.error as WriteError)) {
    console.error('feedback read failed', primary.error.code ?? 'unknown');
    return { ok: false, error: 'Could not read notes.' };
  }

  const legacy = await supabase
    .from('commerce_checkout_events')
    .select('event_id,user_id,metadata,created_at')
    .eq('provider', FEEDBACK_PROVIDER)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!legacy.error) {
    sawAnyStore = true;
    for (const row of legacy.data ?? []) {
      const record = asRecord(row);
      const metadata = asRecord(record?.metadata);
      const message = asString(metadata?.message);
      if (!record || !message) continue;
      records.push({
        id: asString(record.event_id) ?? '',
        store: 'commerce_checkout_events',
        message,
        email: asString(metadata?.email),
        pagePath: asString(metadata?.page_path) ?? '',
        userId: asString(record.user_id),
        userAgent: asString(metadata?.user_agent),
        createdAt: asString(record.created_at) ?? '',
      });
    }
  } else if (!isMissingRelation(legacy.error as WriteError)) {
    console.error('feedback fallback read failed', legacy.error.code ?? 'unknown');
    if (!sawAnyStore) return { ok: false, error: 'Could not read notes.' };
  }

  if (!sawAnyStore) {
    return { ok: false, error: 'Could not read notes.' };
  }

  records.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return { ok: true, records: records.slice(0, limit) };
}
