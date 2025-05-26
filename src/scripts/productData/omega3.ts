import { SupplementMap, BrandMap, Product } from './types';

export const omega3Products = (supplementMap: SupplementMap, brandMap: BrandMap): Product[] => [
  {
    product_name: 'Nordic Naturals Ultimate Omega',
    product_description: 'High-quality fish oil supplement providing EPA and DHA omega-3 fatty acids. Supports heart, brain, and immune health.',
    product_price: 29.99,
    product_url: 'https://www.nordicnaturals.com/consumers/ultimate-omega',
    amazon_url: 'https://www.amazon.com/dp/B002CQU564',
    product_image: 'https://m.media-amazon.com/images/I/71jFZH5YIML._AC_SL1500_.jpg',
    servings_per_container: 90,
    servings_per_day: 2,
    supplement_id: supplementMap.get('Omega-3 Fish Oil'),
    brand_id: brandMap.get('Nordic Naturals')
  },
  {
    product_name: 'Nature Made Fish Oil 1000 mg',
    product_description: 'Purified fish oil supplement providing omega-3 fatty acids EPA and DHA. Supports heart health and may reduce coronary heart disease risk.',
    product_price: 11.99,
    product_url: 'https://www.naturemade.com/products/fish-oil-1000-mg',
    amazon_url: 'https://www.amazon.com/dp/B004U3Y8OM',
    product_image: 'https://m.media-amazon.com/images/I/71Vy+UyOZsL._AC_SL1500_.jpg',
    servings_per_container: 100,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Omega-3 Fish Oil'),
    brand_id: brandMap.get('Nature Made')
  },
  {
    product_name: 'Sports Research Triple Strength Omega-3 Fish Oil',
    product_description: 'High potency fish oil with 1,250mg of Omega-3s per serving. Enhanced with vitamin E for freshness. Supports heart, brain, and joint health.',
    product_price: 29.95,
    product_url: 'https://sportsresearch.com/products/omega-3-fish-oil',
    amazon_url: 'https://www.amazon.com/dp/B01LLLK2XA',
    product_image: 'https://m.media-amazon.com/images/I/71Vy+UyOZsL._AC_SL1500_.jpg',
    servings_per_container: 90,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Omega-3 Fish Oil'),
    brand_id: brandMap.get('Sports Research')
  }
];
