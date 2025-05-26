import { SupplementMap, BrandMap, Product } from './types';

export const otherProducts = (supplementMap: SupplementMap, brandMap: BrandMap): Product[] => [
  {
    product_name: 'Nature Made Melatonin 3 mg',
    product_description: 'Melatonin supplement that helps with occasional sleeplessness. Supports natural sleep cycle.',
    product_price: 9.99,
    product_url: 'https://www.naturemade.com/products/melatonin-3-mg',
    amazon_url: 'https://www.amazon.com/dp/B005DEK9CC',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 120,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Melatonin'),
    brand_id: brandMap.get('Nature Made')
  },
  {
    product_name: 'NOW Supplements Melatonin 5 mg',
    product_description: 'Melatonin supplement that supports sleep quality and helps regulate sleep-wake cycles.',
    product_price: 8.99,
    product_url: 'https://www.nowfoods.com/products/supplements/melatonin-5-mg-veg-capsules',
    amazon_url: 'https://www.amazon.com/dp/B00BPUY3W6',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 60,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Melatonin'),
    brand_id: brandMap.get('NOW Foods')
  },
  
  {
    product_name: 'Vital Proteins Collagen Peptides',
    product_description: 'Grass-fed, pasture-raised bovine collagen peptides. Supports skin, hair, nails, joints, and gut health.',
    product_price: 27.00,
    product_url: 'https://www.vitalproteins.com/products/collagen-peptides',
    amazon_url: 'https://www.amazon.com/dp/B00K6JUG4K',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 28,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Collagen'),
    brand_id: brandMap.get('Vital Proteins')
  },
  {
    product_name: 'Sports Research Collagen Peptides',
    product_description: 'Hydrolyzed collagen peptides from grass-fed, pasture-raised sources. Supports skin, hair, nails, and joints.',
    product_price: 27.95,
    product_url: 'https://sportsresearch.com/products/collagen-peptides-powder',
    amazon_url: 'https://www.amazon.com/dp/B01N12XTLC',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 41,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Collagen'),
    brand_id: brandMap.get('Sports Research')
  },
  
  {
    product_name: 'Garden of Life Vitamin Code Men\'s Multivitamin',
    product_description: 'Whole food multivitamin for men with probiotics and enzymes. Supports energy, heart health, and prostate health.',
    product_price: 39.99,
    product_url: 'https://www.gardenoflife.com/vitamin-code-men',
    amazon_url: 'https://www.amazon.com/dp/B00280M13O',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 120,
    servings_per_day: 4,
    supplement_id: supplementMap.get('Multivitamin'),
    brand_id: brandMap.get('Garden of Life')
  },
  {
    product_name: 'Garden of Life Vitamin Code Women\'s Multivitamin',
    product_description: 'Whole food multivitamin for women with probiotics and enzymes. Supports energy, breast health, and reproductive health.',
    product_price: 39.99,
    product_url: 'https://www.gardenoflife.com/vitamin-code-women',
    amazon_url: 'https://www.amazon.com/dp/B00280M12O',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 120,
    servings_per_day: 4,
    supplement_id: supplementMap.get('Multivitamin'),
    brand_id: brandMap.get('Garden of Life')
  },
  
  {
    product_name: 'Nature Made Biotin 2500 mcg',
    product_description: 'Biotin supplement that supports healthy hair, skin, and nails. Important for metabolism and cellular energy production.',
    product_price: 11.99,
    product_url: 'https://www.naturemade.com/products/biotin-2500-mcg',
    amazon_url: 'https://www.amazon.com/dp/B00DYSUQEE',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 160,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Biotin'),
    brand_id: brandMap.get('Nature Made')
  },
  
  {
    product_name: 'NOW Supplements Glucosamine & Chondroitin',
    product_description: 'Combination of glucosamine and chondroitin. Supports joint health, cartilage maintenance, and mobility.',
    product_price: 24.99,
    product_url: 'https://www.nowfoods.com/products/supplements/glucosamine-chondroitin-tablets',
    amazon_url: 'https://www.amazon.com/dp/B0013OXBMI',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 120,
    servings_per_day: 3,
    supplement_id: supplementMap.get('Glucosamine'),
    brand_id: brandMap.get('NOW Foods')
  },
  
  {
    product_name: 'Optimum Nutrition BCAA Capsules',
    product_description: 'Branched-chain amino acids in convenient capsule form. Supports muscle recovery and exercise performance.',
    product_price: 19.99,
    product_url: 'https://www.optimumnutrition.com/en-us/Products/Amino-Acids/BCAAs/BCAA-1000-CAPS/p/bcaa-1000-caps',
    amazon_url: 'https://www.amazon.com/dp/B000SOXALE',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 60,
    servings_per_day: 2,
    supplement_id: supplementMap.get('BCAA'),
    brand_id: brandMap.get('Optimum Nutrition')
  },
  
  {
    product_name: 'NOW Supplements Green Tea Extract',
    product_description: 'Standardized green tea extract with antioxidants. Supports metabolism, cellular health, and overall wellness.',
    product_price: 14.99,
    product_url: 'https://www.nowfoods.com/products/supplements/green-tea-extract-400-mg-veg-capsules',
    amazon_url: 'https://www.amazon.com/dp/B001DNV5CA',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 100,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Green Tea Extract'),
    brand_id: brandMap.get('NOW Foods')
  },
  
  {
    product_name: 'NOW Supplements Spirulina Powder',
    product_description: 'Pure spirulina powder. Rich source of protein, vitamins, minerals, and antioxidants.',
    product_price: 19.99,
    product_url: 'https://www.nowfoods.com/products/supplements/spirulina-powder',
    amazon_url: 'https://www.amazon.com/dp/B000MGR1N4',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 38,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Spirulina'),
    brand_id: brandMap.get('NOW Foods')
  },
  
  {
    product_name: 'Host Defense Lion\'s Mane Mushroom Capsules',
    product_description: 'Organic lion\'s mane mushroom supplement. Supports cognitive function, nerve health, and mental clarity.',
    product_price: 29.95,
    product_url: 'https://hostdefense.com/products/lions-mane-capsules',
    amazon_url: 'https://www.amazon.com/dp/B00WJ1TPRW',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 60,
    servings_per_day: 2,
    supplement_id: supplementMap.get('Lion\'s Mane'),
    brand_id: brandMap.get('NOW Foods')
  },
  
  {
    product_name: 'NOW Supplements Rhodiola Rosea',
    product_description: 'Standardized rhodiola extract. Supports mental and physical performance during stress and fatigue.',
    product_price: 14.99,
    product_url: 'https://www.nowfoods.com/products/supplements/rhodiola-rosea-500-mg-veg-capsules',
    amazon_url: 'https://www.amazon.com/dp/B000GAP9RM',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 60,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Rhodiola'),
    brand_id: brandMap.get('NOW Foods')
  },
  
  {
    product_name: 'Nature Made Vitamin E 400 IU',
    product_description: 'Vitamin E supplement that acts as an antioxidant. Supports immune function and cellular health.',
    product_price: 13.99,
    product_url: 'https://www.naturemade.com/products/vitamin-e-400-iu',
    amazon_url: 'https://www.amazon.com/dp/B0000DJARR',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 100,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Vitamin E'),
    brand_id: brandMap.get('Nature Made')
  },
  
  {
    product_name: 'NOW Supplements Vitamin K-2 MK-7',
    product_description: 'Menaquinone-7 form of vitamin K2. Supports bone health and cardiovascular function.',
    product_price: 14.99,
    product_url: 'https://www.nowfoods.com/products/supplements/vitamin-k-2-mk-7-100-mcg-veg-capsules',
    amazon_url: 'https://www.amazon.com/dp/B0013EJ5QM',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 60,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Vitamin K2'),
    brand_id: brandMap.get('NOW Foods')
  },
  
  {
    product_name: 'NOW Supplements L-Theanine 200 mg',
    product_description: 'Pure L-theanine supplement. Promotes relaxation without drowsiness and supports stress management.',
    product_price: 19.99,
    product_url: 'https://www.nowfoods.com/products/supplements/l-theanine-200-mg-veg-capsules',
    amazon_url: 'https://www.amazon.com/dp/B000H7P9M0',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 60,
    servings_per_day: 1,
    supplement_id: supplementMap.get('L-Theanine'),
    brand_id: brandMap.get('NOW Foods')
  },
  
  {
    product_name: 'NOW Sports L-Glutamine Powder',
    product_description: 'Pure L-glutamine powder. Supports muscle recovery, immune function, and gut health.',
    product_price: 19.99,
    product_url: 'https://www.nowfoods.com/products/sports-nutrition/l-glutamine-powder',
    amazon_url: 'https://www.amazon.com/dp/B0013OXBMI',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 66,
    servings_per_day: 1,
    supplement_id: supplementMap.get('Glutamine'),
    brand_id: brandMap.get('NOW Foods')
  },
  
  {
    product_name: 'NOW Supplements MSM Powder',
    product_description: 'Pure MSM (methylsulfonylmethane) powder. Supports joint health, reduces inflammation, and aids recovery.',
    product_price: 14.99,
    product_url: 'https://www.nowfoods.com/products/supplements/msm-powder',
    amazon_url: 'https://www.amazon.com/dp/B0013OVAS2',
    product_image: 'https://m.media-amazon.com/images/I/71ZPJqgZPYL._AC_SL1500_.jpg',
    servings_per_container: 189,
    servings_per_day: 1,
    supplement_id: supplementMap.get('MSM'),
    brand_id: brandMap.get('NOW Foods')
  }
];
