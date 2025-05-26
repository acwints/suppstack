import { SupplementMap, BrandMap, Product } from './types';

export const creatineProducts = (supplementMap: SupplementMap, brandMap: BrandMap): Product[] => [
  {
    product_name: 'Optimum Nutrition Micronized Creatine Monohydrate',
    product_description: 'Pure creatine monohydrate powder that supports muscle strength, power, and recovery. 5g per serving.',
    product_price: 19.99,
    product_url: 'https://www.optimumnutrition.com/en-us/Products/Specialty-Products/Creatine/MICRONIZED-CREATINE-POWDER/p/micronized-creatine-powder',
    amazon_url: 'https://www.amazon.com/dp/B002DYIZEO',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 72,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Creatine Monohydrate'),
    brand_id: brandMap.get('Optimum Nutrition')
  },
  {
    product_name: 'NOW Sports Creatine Monohydrate',
    product_description: 'Pure creatine monohydrate powder. Supports muscle strength, power output, and high-intensity exercise performance.',
    product_price: 14.99,
    product_url: 'https://www.nowfoods.com/products/sports-nutrition/creatine-monohydrate-powder',
    amazon_url: 'https://www.amazon.com/dp/B0013OXD38',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 100,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Creatine Monohydrate'),
    brand_id: brandMap.get('NOW Foods')
  },
  {
    product_name: 'Bulk Supplements Creatine Monohydrate',
    product_description: 'Pure creatine monohydrate powder in bulk packaging. Supports muscle strength, power, and recovery.',
    product_price: 15.96,
    product_url: 'https://www.bulksupplements.com/products/creatine-monohydrate-powder',
    amazon_url: 'https://www.amazon.com/dp/B00E9M4XEE',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 200,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Creatine Monohydrate'),
    brand_id: brandMap.get('Bulk Supplements')
  }
];
