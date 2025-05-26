export const vitaminB12Products = (supplementMap, brandMap) => [
  {
    product_name: 'Garden of Life Vitamin B12',
    product_description: 'Whole food vitamin B12 supplement with probiotics and enzymes. Supports energy, metabolism, and blood cell formation.',
    product_price: 17.49,
    product_url: 'https://www.gardenoflife.com/vitamin-code-raw-b12',
    amazon_url: 'https://www.amazon.com/dp/B00280M12M',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 30,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Vitamin B12'),
    brand_id: brandMap.get('Garden of Life')
  },
  {
    product_name: 'NOW Supplements Methyl B-12 5000 mcg',
    product_description: 'High potency methylcobalamin form of B12. Supports nervous system health and energy production.',
    product_price: 14.99,
    product_url: 'https://www.nowfoods.com/products/supplements/methyl-b-12-5000-mcg-lozenges',
    amazon_url: 'https://www.amazon.com/dp/B001F0R7VE',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 60,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Vitamin B12'),
    brand_id: brandMap.get('NOW Foods')
  },
  {
    product_name: 'Jarrow Formulas Methyl B-12',
    product_description: 'Methylcobalamin form of B12 in lozenge form. Supports brain health, energy, and homocysteine metabolism.',
    product_price: 14.95,
    product_url: 'https://www.jarrow.com/product/57/Methyl_B-12',
    amazon_url: 'https://www.amazon.com/dp/B0013OQGO6',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 100,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Vitamin B12'),
    brand_id: brandMap.get('Jarrow Formulas')
  }
];
