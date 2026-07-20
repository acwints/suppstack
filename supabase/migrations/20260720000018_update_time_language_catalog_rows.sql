-- Keep DB-backed catalog copy aligned with product-led language.

update products
set
  product_description = 'Onnit daily supplement packs positioned as an all-in-one wellness routine with vitamins, minerals, omega-3s, herbs, and amino acids.',
  quality_badges = ARRAY['Daily packs', 'Verified merchant', '30 days']::text[]
where product_url = 'https://www.onnit.com/products/total-human-30-day-supply';
