import { SupplementMap, BrandMap, Product } from './types';

export const vitaminDProducts = (supplementMap: SupplementMap, brandMap: BrandMap): Product[] => [
  {
    product_name: 'Nature Made Vitamin D3 2000 IU Softgels',
    product_description: 'High potency vitamin D3 supplements to support bone health and immune function. Each softgel provides 2000 IU of vitamin D3.',
    product_price: 12.99,
    product_url: 'https://www.naturemade.com/products/vitamin-d3-2000-iu',
    amazon_url: 'https://www.amazon.com/dp/B004U3Y8F6',
    product_image: 'https://m.media-amazon.com/images/I/71BoIQRQJJL._AC_SL1500_.jpg',
    servings_per_container: 100,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Vitamin D3'),
    brand_id: brandMap.get('Nature Made')
  },
  {
    product_name: 'NOW Supplements Vitamin D3 5000 IU',
    product_description: 'High-potency vitamin D3 supplement that supports bone health, immune function, and cellular health. Structural support for bones.',
    product_price: 10.99,
    product_url: 'https://www.nowfoods.com/products/supplements/vitamin-d-3-5000-iu-softgels',
    amazon_url: 'https://www.amazon.com/dp/B0032BH76O',
    product_image: 'https://m.media-amazon.com/images/I/61+WBgJrS8L._AC_SL1500_.jpg',
    servings_per_container: 120,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Vitamin D3'),
    brand_id: brandMap.get('NOW Foods')
  },
  {
    product_name: 'Thorne Vitamin D3 Liquid',
    product_description: 'Highly absorbable liquid vitamin D3 supplement. Each drop provides 1,000 IU of vitamin D3 for flexible dosing.',
    product_price: 24.00,
    product_url: 'https://www.thorne.com/products/dp/vitamin-d-liquid',
    amazon_url: 'https://www.amazon.com/dp/B000FGWNI0',
    product_image: 'https://m.media-amazon.com/images/I/61Ky-XbQ4QL._AC_SL1500_.jpg',
    servings_per_container: 250,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Vitamin D3'),
    brand_id: brandMap.get('Thorne')
  },
  {
    product_name: 'Garden of Life Vitamin D3 Supplement',
    product_description: 'Whole food vitamin D3 supplement with probiotics and organic fruits and vegetables. Supports bone health and immune system.',
    product_price: 16.79,
    product_url: 'https://www.gardenoflife.com/vitamin-code-raw-d3',
    amazon_url: 'https://www.amazon.com/dp/B00K5NEPJY',
    product_image: 'https://m.media-amazon.com/images/I/71Lz7zUZUBL._AC_SL1500_.jpg',
    servings_per_container: 60,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Vitamin D3'),
    brand_id: brandMap.get('Garden of Life')
  }
];
