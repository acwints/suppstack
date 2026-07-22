-- Keep the canonical catalog read-only from public client roles.
-- Curated catalog materialization now happens through authenticated server
-- sync routes that validate static catalog IDs and use the service role.

drop policy if exists "Allow public insert access on brands" on brands;
drop policy if exists "Allow public insert access on products" on products;
drop policy if exists "Allow public insert access on supplements" on supplements;

revoke all privileges on table brands from anon, authenticated;
revoke all privileges on table products from anon, authenticated;
revoke all privileges on table supplements from anon, authenticated;

revoke all privileges on sequence brands_brand_id_seq from anon, authenticated;
revoke all privileges on sequence products_product_id_seq from anon, authenticated;
revoke all privileges on sequence supplements_supplement_id_seq from anon, authenticated;

grant select on table brands to anon, authenticated;
grant select on table products to anon, authenticated;
grant select on table supplements to anon, authenticated;
