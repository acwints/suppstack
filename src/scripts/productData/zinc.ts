import { SupplementMap, BrandMap, Product } from './types';

export const zincProducts = (supplementMap: SupplementMap, brandMap: BrandMap): Product[] => [
  {
    product_name: 'NOW Supplements Zinc Picolinate',
    product_description: 'Highly absorbable form of zinc. Supports immune function, protein synthesis, and wound healing.',
    product_price: 10.99,
    product_url: 'https://www.nowfoods.com/products/supplements/zinc-picolinate-50-mg-veg-capsules',
    amazon_url: 'https://www.amazon.com/dp/B0013HV9O0',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 120,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Zinc'),
    brand_id: brandMap.get('NOW Foods')
  },
  {
    product_name: 'Thorne Zinc Picolinate',
    product_description: 'Highly absorbable zinc supplement. Supports immune function, tissue and skin health, and reproductive health.',
    product_price: 14.00,
    product_url: 'https://www.thorne.com/products/dp/zinc-picolinate',
    amazon_url: 'https://www.amazon.com/dp/B0797VWYZV',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 60,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Zinc'),
    brand_id: brandMap.get('Thorne')
  },
  {
    product_name: 'Garden of Life Vitamin Code Raw Zinc',
    product_description: 'Whole food zinc supplement with probiotics and enzymes. Supports immune function and reproductive health.',
    product_price: 12.59,
    product_url: 'https://www.gardenoflife.com/vitamin-code-raw-zinc',
    amazon_url: 'https://www.amazon.com/dp/B00K5NEPJY',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 60,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Zinc'),
    brand_id: brandMap.get('Garden of Life')
  }
];
