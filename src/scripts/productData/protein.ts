import { SupplementMap, BrandMap, Product } from './types';

export const proteinProducts = (supplementMap: SupplementMap, brandMap: BrandMap): Product[] => [
  {
    product_name: 'Optimum Nutrition Gold Standard Whey',
    product_description: 'High-quality whey protein isolate and concentrate blend. 24g protein per serving with minimal fat and carbs.',
    product_price: 29.99,
    product_url: 'https://www.optimumnutrition.com/en-us/Products/Protein/Shakes-%26-Powders/GOLD-STANDARD-100%25-WHEY-PROTEIN/p/gold-standard-100-whey-protein',
    amazon_url: 'https://www.amazon.com/dp/B000QSNYGI',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 29,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Protein Powder'),
    brand_id: brandMap.get('Optimum Nutrition')
  },
  {
    product_name: 'Garden of Life Raw Organic Protein',
    product_description: 'Plant-based protein powder with 22g protein per serving. Contains probiotics, enzymes, and no added sugars.',
    product_price: 37.49,
    product_url: 'https://www.gardenoflife.com/raw-organic-protein-vanilla',
    amazon_url: 'https://www.amazon.com/dp/B0031JK96C',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 20,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Protein Powder'),
    brand_id: brandMap.get('Garden of Life')
  },
  {
    product_name: 'NOW Sports Pea Protein',
    product_description: 'Plant-based protein powder from yellow peas. 24g protein per serving, non-GMO and vegan-friendly.',
    product_price: 19.99,
    product_url: 'https://www.nowfoods.com/products/sports-nutrition/pea-protein-powder-unflavored',
    amazon_url: 'https://www.amazon.com/dp/B001DB4MFO',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 12,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Protein Powder'),
    brand_id: brandMap.get('NOW Foods')
  }
];
