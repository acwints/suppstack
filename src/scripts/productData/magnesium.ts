import { SupplementMap, BrandMap, Product } from './types';

export const magnesiumProducts = (supplementMap: SupplementMap, brandMap: BrandMap): Product[] => [
  {
    product_name: 'Doctor\'s Best High Absorption Magnesium',
    product_description: 'Highly bioavailable magnesium glycinate lysinate chelate. Supports muscle, nerve, and heart function. Non-laxative formula.',
    product_price: 14.99,
    product_url: 'https://www.drbvitamins.com/products/high-absorption-magnesium',
    amazon_url: 'https://www.amazon.com/dp/B000BD0RT0',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 120,
    servings_per_day: 2,
    supplement_id: supplementMap.get('Magnesium'),
    brand_id: brandMap.get('Doctor\'s Best')
  },
  {
    product_name: 'Natural Vitality Calm Magnesium Supplement',
    product_description: 'Anti-stress magnesium supplement in powder form. Promotes healthy magnesium levels and supports a calm, relaxed state.',
    product_price: 23.95,
    product_url: 'https://www.naturalvitality.com/natural-calm',
    amazon_url: 'https://www.amazon.com/dp/B000OQ2DL4',
    product_image: 'https://m.media-amazon.com/images/I/81Dw+35fU-L._AC_SL1500_.jpg',
    servings_per_container: 113,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Magnesium'),
    brand_id: brandMap.get('Nature\'s Bounty')
  },
  {
    product_name: 'NOW Supplements Magnesium Citrate',
    product_description: 'Highly bioavailable magnesium citrate. Supports energy production, muscle function, and nervous system health.',
    product_price: 12.99,
    product_url: 'https://www.nowfoods.com/products/supplements/magnesium-citrate-tablets',
    amazon_url: 'https://www.amazon.com/dp/B000BV1O26',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 100,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Magnesium'),
    brand_id: brandMap.get('NOW Foods')
  }
];
