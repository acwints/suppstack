import { SupplementMap, BrandMap, Product } from './types';

export const turmericProducts = (supplementMap: SupplementMap, brandMap: BrandMap): Product[] => [
  {
    product_name: 'Sports Research Turmeric Curcumin C3 Complex',
    product_description: 'Standardized turmeric extract with BioPerine for enhanced absorption. Supports joint health and inflammatory response.',
    product_price: 23.95,
    product_url: 'https://sportsresearch.com/products/turmeric-curcumin-c3-complex',
    amazon_url: 'https://www.amazon.com/dp/B01DBTFO98',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 90,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Turmeric/Curcumin'),
    brand_id: brandMap.get('Sports Research')
  },
  {
    product_name: 'Garden of Life mykind Organics Maximum Strength Turmeric',
    product_description: 'Organic turmeric supplement with black pepper for absorption. Supports joint health and inflammatory response.',
    product_price: 29.99,
    product_url: 'https://www.gardenoflife.com/mykind-organics-maximum-strength-turmeric',
    amazon_url: 'https://www.amazon.com/dp/B00F8K8L2Q',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 60,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Turmeric/Curcumin'),
    brand_id: brandMap.get('Garden of Life')
  },
  {
    product_name: 'NOW Supplements Curcumin Extract',
    product_description: 'Standardized turmeric extract with curcuminoids. Supports joint health and inflammatory response.',
    product_price: 24.99,
    product_url: 'https://www.nowfoods.com/products/supplements/curcumin-extract-veg-capsules',
    amazon_url: 'https://www.amazon.com/dp/B0013OULVA',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 60,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Turmeric/Curcumin'),
    brand_id: brandMap.get('NOW Foods')
  }
];
