export const probioticsProducts = (supplementMap, brandMap) => [
  {
    product_name: 'Garden of Life Dr. Formulated Probiotics',
    product_description: 'High potency probiotic with 50 billion CFU and 16 probiotic strains. Supports digestive health and immune system function.',
    product_price: 39.99,
    product_url: 'https://www.gardenoflife.com/dr-formulated-probiotics-once-daily-30-capsules',
    amazon_url: 'https://www.amazon.com/dp/B00Y8MP4G6',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 30,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Probiotics'),
    brand_id: brandMap.get('Garden of Life')
  },
  {
    product_name: 'NOW Supplements Probiotic-10',
    product_description: 'Balanced spectrum probiotic with 10 strains and 25 billion CFU. Supports healthy intestinal flora and digestive health.',
    product_price: 24.99,
    product_url: 'https://www.nowfoods.com/products/supplements/probiotic-10-25-billion-veg-capsules',
    amazon_url: 'https://www.amazon.com/dp/B002S1U7RU',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 50,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Probiotics'),
    brand_id: brandMap.get('NOW Foods')
  },
  {
    product_name: 'Thorne FloraSport 20B',
    product_description: 'Shelf-stable probiotic formulated for athletes. Supports digestive health and immune function during exercise and travel.',
    product_price: 49.00,
    product_url: 'https://www.thorne.com/products/dp/florasport-20b',
    amazon_url: 'https://www.amazon.com/dp/B000FGXMWC',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 30,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Probiotics'),
    brand_id: brandMap.get('Thorne')
  }
];
