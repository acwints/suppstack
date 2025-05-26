export const coq10Products = (supplementMap, brandMap) => [
  {
    product_name: 'Qunol Ultra CoQ10 100mg',
    product_description: 'Highly absorbable water and fat-soluble CoQ10. Supports heart health and cellular energy production.',
    product_price: 29.99,
    product_url: 'https://qunol.com/products/qunol-ultra-coq10-100mg',
    amazon_url: 'https://www.amazon.com/dp/B004VCOOUU',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 120,
    servings_per_day: 1,
    supplement_id: supplementMap.get('CoQ10'),
    brand_id: brandMap.get('Nature\'s Bounty')
  },
  {
    product_name: 'NOW Supplements CoQ10 200mg',
    product_description: 'High potency CoQ10 supplement. Supports cardiovascular health and cellular energy production.',
    product_price: 19.99,
    product_url: 'https://www.nowfoods.com/products/supplements/coq10-200-mg-veg-capsules',
    amazon_url: 'https://www.amazon.com/dp/B0013OXBH6',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 60,
    servings_per_day: 1,
    supplement_id: supplementMap.get('CoQ10'),
    brand_id: brandMap.get('NOW Foods')
  },
  {
    product_name: 'Life Extension Super Ubiquinol CoQ10',
    product_description: 'Highly bioavailable form of CoQ10. Supports heart health, cellular energy production, and healthy aging.',
    product_price: 38.25,
    product_url: 'https://www.lifeextension.com/vitamins-supplements/item01426/super-ubiquinol-coq10',
    amazon_url: 'https://www.amazon.com/dp/B000FGWL02',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 60,
    servings_per_day: 1,
    supplement_id: supplementMap.get('CoQ10'),
    brand_id: brandMap.get('Life Extension')
  }
];
