import 'dotenv/config';
import { existsSync, readFileSync } from 'node:fs';

const requiredTables = [
  {
    table: 'health_metric_snapshots',
    label: 'Health snapshots',
    columns: [
      'snapshot_id',
      'user_id',
      'source',
      'captured_at',
      'date_range_days',
      'sleep_hours_avg',
      'sleep_quality_avg',
      'sleep_days_tracked',
      'sleep_debt_hours',
      'sleep_consistency_score',
      'sleep_rem_hours_avg',
      'sleep_deep_hours_avg',
      'sleep_awake_hours_avg',
      'weight_kg',
      'weight_trend_kg',
      'body_fat_percent',
      'body_fat_trend_percent',
      'active_energy_burned_kcal_avg',
      'resting_energy_burned_kcal_avg',
      'steps_avg',
      'exercise_minutes_avg',
      'resting_heart_rate_bpm_avg',
      'heart_rate_variability_ms_avg',
      'vo2_max_ml_kg_min',
      'readiness_score',
      'focus_goal_id',
    ],
  },
  {
    table: 'health_experiments',
    label: 'Health experiments',
    columns: [
      'experiment_id',
      'user_id',
      'snapshot_id',
      'outcome_snapshot_id',
      'goal_id',
      'title',
      'status',
      'start_date',
      'end_date',
      'target_days',
      'product_ids',
      'supplement_names',
      'baseline_readiness_score',
      'baseline_sleep_hours_avg',
      'outcome_readiness_score',
      'outcome_sleep_hours_avg',
      'outcome_weight_kg',
      'outcome_body_fat_percent',
      'outcome_active_energy_burned_kcal_avg',
      'outcome_readiness_delta',
      'outcome_sleep_delta_hours',
      'outcome_summary',
    ],
  },
];

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required to verify the hosted health migration.`);
  }

  return value;
}

function linkedProjectRef() {
  const path = 'supabase/.temp/project-ref';
  if (!existsSync(path)) return null;
  const value = readFileSync(path, 'utf8').trim();
  return value || null;
}

async function checkTable(baseUrl, anonKey, definition) {
  const url = new URL(`/rest/v1/${definition.table}`, baseUrl);
  url.searchParams.set('select', definition.columns.join(','));
  url.searchParams.set('limit', '0');

  const response = await fetch(url, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  if (response.ok) {
    return {
      ok: true,
      message: `${definition.label}: ${definition.columns.length} required columns visible`,
    };
  }

  const text = await response.text();
  let detail = text.trim();
  try {
    const payload = JSON.parse(text);
    detail = [payload.code, payload.message, payload.details].filter(Boolean).join(' - ');
  } catch {
    // Keep the raw response text.
  }

  return {
    ok: false,
    message: `${definition.label}: HTTP ${response.status}${detail ? ` - ${detail}` : ''}`,
  };
}

async function main() {
  const supabaseUrl = requiredEnv('NEXT_PUBLIC_SUPABASE_URL').replace(/\/$/, '');
  const anonKey = requiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const host = new URL(supabaseUrl).host;
  const ref = linkedProjectRef();

  console.log(`Checking health migration on ${host}${ref ? ` (linked ${ref})` : ''}`);

  if (ref && !host.startsWith(`${ref}.`)) {
    console.warn(`Warning: env URL host does not match linked Supabase project ref ${ref}.`);
  }

  const results = [];
  for (const table of requiredTables) {
    results.push(await checkTable(supabaseUrl, anonKey, table));
  }

  for (const result of results) {
    console.log(`${result.ok ? 'OK' : 'FAIL'} ${result.message}`);
  }

  if (results.some((result) => !result.ok)) {
    console.error(
      'Apply supabase/migrations/20260101000006_health_snapshots.sql, then rerun npm run check:health-migration.'
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
