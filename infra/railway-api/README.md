# Railway API (migration in progress)

The web app remains on Vercel. This gateway exposes Supabase-compatible Auth
and PostgREST services on Railway. It does not require moving the website's DNS.

Project: `15bf2fed-1d4b-41d4-814d-02e658be7dfd`.
Gateway: `https://gateway-production-bd61.up.railway.app`.

## Services

- PostgreSQL 18 with persistent storage and SSL.
- Auth: `supabase/gotrue:v2.189.0`, private port 9999.
- REST: `postgrest/postgrest:v14.12`, private port 3000.
- Gateway: this Dockerfile, public port 8080.

Gateway variables: `PORT=8080`, `AUTH_UPSTREAM=auth.railway.internal:9999`,
`REST_UPSTREAM=rest.railway.internal:3000`.

Preserve database ownership, grants, RLS policies, Auth users/identities, and
role search paths when restoring. Auth connects as `supabase_auth_admin` with
`search_path=auth`; REST connects as `authenticator`, with membership in `anon`,
`authenticated`, and `service_role`. These three roles must not have database
login access. The REST exposed schema is `public`.

Store service credentials in Railway variables. Auth's `GOTRUE_JWT_SECRET`
and REST's `PGRST_JWT_SECRET` must match the application anon and service JWTs.
Set `API_EXTERNAL_URL` to the gateway URL plus `/auth/v1`, and register its
`/auth/v1/callback` with Google and Apple. Retain the website and native deep
link in Auth's redirect allowlist.

Email uses Resend SMTP over STARTTLS on port 587 with a domain-scoped sending
key. SMTP authentication has been verified; delivery has not yet been tested.
An existing verified sender domain is being reused to avoid DNS changes.

## Required before production cutover

- Supply the replacement Google client secret. Supabase's exported provider
  secret fields are hashes, not usable credentials.
- Apply and redeploy the recovered Apple secret and SMTP configuration, then
  verify OAuth callbacks and email flows through the deployed application.
- Review PostgreSQL extension parity, including the source's `safeupdate`
  session extension, before declaring database compatibility complete.
- Freeze source writes and take a final synchronized backup of public and
  Auth data. Restore and compare before changing the live Vercel deployment.
- Update Vercel's public URL, anon key, and server service key together, keeping
  production on the source until the replacement is verified.

All 18 public tables matched after the initial copy. Password login, refresh,
profile creation, private stack CRUD, and anonymous access restrictions passed
on Railway using disposable fixtures that were removed afterward. The existing
App Review account also logged in with its unchanged password. Production
remains on Supabase until the outstanding checks are complete.

Backups, credentials, and detailed verification reports are stored outside
the repository in the operator's private migration directory.
