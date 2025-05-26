export const bComplexProducts = (supplementMap, brandMap) => [
  {
    product_name: 'Thorne Basic B Complex',
    product_description: 'Comprehensive B vitamin complex. Supports energy production, nervous system health, and cellular metabolism.',
    product_price: 20.00,
    product_url: 'https://www.thorne.com/products/dp/basic-b-complex',
    amazon_url: 'https://www.amazon.com/dp/B00HST919C',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 60,
    servings_per_day: 1,
    supplement_id: supplementMap.get('B-Complex'),
    brand_id: brandMap.get('Thorne')
  },
  {
    product_name: 'Garden of Life Vitamin B Complex',
    product_description: 'Whole food B vitamin complex with probiotics and enzymes. Supports energy, metabolism, and stress response.',
    product_price: 19.99,
    product_url: 'https://www.gardenoflife.com/vitamin-code-raw-b-complex',
    amazon_url: 'https://www.amazon.com/dp/B00280M13Y',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 60,
    servings_per_day: 1,
    supplement_id: supplementMap.get('B-Complex'),
    brand_id: brandMap.get('Garden of Life')
  },
  {
    product_name: 'NOW Foods B-100 Complex',
    product_description: 'High potency B vitamin complex. Supports energy production, nervous system health, and cellular metabolism.',
    product_price: 19.99,
    product_url: 'https://www.nowfoods.com/products/supplements/b-100-veg-capsules',
    amazon_url: 'https://www.amazon.com/dp/B0013OQAVU',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 100,
    servings_per_day: 1,
    supplement_id: supplementMap.get('B-Complex'),
    brand_id: brandMap.get('NOW Foods')
  }
];
