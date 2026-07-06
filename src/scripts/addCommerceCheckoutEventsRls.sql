-- Locks down commerce_checkout_events. This table is written by the
-- /api/commerce/checkout server route to record purchase intent. It has no
-- reason to be readable or writable by end-user (anon/authenticated) clients.
--
-- Enabling RLS with no permissive policies denies all access via the anon and
-- authenticated keys, while the service_role key used by the server route
-- bypasses RLS. Run after addCommerceSessionTracking.sql.

ALTER TABLE commerce_checkout_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE commerce_checkout_events FORCE ROW LEVEL SECURITY;

-- No SELECT/INSERT/UPDATE/DELETE policies are defined on purpose: with RLS
-- enabled and no policies, anon/authenticated roles get zero rows and cannot
-- write. Only the service_role (server-side) key can read/write this table.
