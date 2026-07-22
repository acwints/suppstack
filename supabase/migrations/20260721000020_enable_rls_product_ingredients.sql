-- Secure product ingredient composition.
-- Product composition is public catalog data, so clients may read it, but
-- catalog writes must not be available directly through anon/authenticated
-- PostgREST access.

alter table product_ingredients enable row level security;

drop policy if exists "Product ingredients are publicly readable" on product_ingredients;
create policy "Product ingredients are publicly readable"
  on product_ingredients
  for select
  using (true);

revoke insert, update, delete on product_ingredients from anon, authenticated;
grant select on product_ingredients to anon, authenticated;
