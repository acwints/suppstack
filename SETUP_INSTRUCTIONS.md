# Database Setup

The database schema is defined by the ordered, idempotent migrations in
[`supabase/migrations/`](supabase/migrations/). That directory is the single
source of truth — this document only explains how to apply it.

## Apply the schema

**Option A — Supabase CLI (recommended)**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

**Option B — Supabase dashboard**

1. Open your project's **SQL Editor**.
2. Paste and run each migration file **in order**:
   1. `20260101000001_core_schema.sql`
   2. `20260101000002_commerce.sql`
   3. `20260101000003_reviews.sql`
   4. `20260101000004_tracking.sql`

Every migration is idempotent (`IF NOT EXISTS` / `CREATE OR REPLACE` /
`DROP POLICY IF EXISTS`), so it is safe to run against a fresh database or an
existing one, and safe to re-run.

## Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Public anon key (RLS-scoped) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Used by `/api/commerce/checkout` to write `commerce_checkout_events`, which is RLS-locked to the service role. Never expose this to the client. |

## Verify

Sign in and create a personal stack from `/stacks/create`, then confirm it
appears under **My Collection** on `/profile`. Editing your profile
(date of birth, height, weight, socials) should persist across reloads.

## Notes on security

RLS policies follow least privilege:

- **SELECT:** public profiles/stacks are readable by anyone; private data requires ownership.
- **INSERT/UPDATE/DELETE:** require authentication and ownership.
- **Counters** (`follower_count`, `following_count`, `like_count`) are maintained by database triggers — application code must not write them.
- **`commerce_checkout_events`** has RLS enabled with no client policies, so only the service-role server key can read or write it.
- Public influencer stacks have been removed; stacks are personal collections only.
