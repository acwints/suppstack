-- Keep product_ingredients read-only for client roles at the privilege layer.
-- RLS already allows public SELECT only; this also removes inherited table and
-- sequence privileges such as TRUNCATE/REFERENCES/TRIGGER from client roles.

revoke all privileges on table product_ingredients from anon, authenticated;
revoke all privileges on sequence product_ingredients_product_ingredient_id_seq from anon, authenticated;

grant select on table product_ingredients to anon, authenticated;
