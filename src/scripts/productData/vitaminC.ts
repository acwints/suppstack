import { SupplementMap, BrandMap, Product } from './types';

export const vitaminCProducts = (supplementMap: SupplementMap, brandMap: BrandMap): Product[] => [
  {
    product_name: 'NOW Supplements Vitamin C-1000',
    product_description: 'High potency vitamin C with rose hips. Supports immune function and acts as an antioxidant protecting cells from free radical damage.',
    product_price: 14.99,
    product_url: 'https://www.nowfoods.com/products/supplements/vitamin-c-1000-tablets-rose-hips',
    amazon_url: 'https://www.amazon.com/dp/B0013P1GD6',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 100,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Vitamin C'),
    brand_id: brandMap.get('NOW Foods')
  },
  {
    product_name: 'Nature Made Vitamin C 500mg',
    product_description: 'Vitamin C supplement that supports the immune system and acts as an antioxidant. Helps with iron absorption and collagen formation.',
    product_price: 9.99,
    product_url: 'https://www.naturemade.com/products/vitamin-c-500-mg',
    amazon_url: 'https://www.amazon.com/dp/B00VEKPFVA',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 100,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Vitamin C'),
    brand_id: brandMap.get('Nature Made')
  },
  {
    product_name: 'Garden of Life Vitamin C Spray',
    product_description: 'Whole food vitamin C spray with organic fruits and herbs. Convenient spray delivery for immune support on the go.',
    product_price: 19.99,
    product_url: 'https://www.gardenoflife.com/mykind-organics-vitamin-c-spray',
    amazon_url: 'https://www.amazon.com/dp/B00K5NEMJM',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 30,
    servings_per_day: 2,
    supplement_id: supplementMap.get('Vitamin C'),
    brand_id: brandMap.get('Garden of Life')
  }
];
