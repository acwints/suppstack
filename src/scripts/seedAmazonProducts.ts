import { supabase } from '../app/supabase';

const popularBrands = [
  {
    brand_name: 'NOW Foods',
    brand_description: 'High-quality natural products at affordable prices',
    brand_website: 'https://www.nowfoods.com'
  },
  {
    brand_name: 'Nature Made',
    brand_description: 'Science-backed supplements verified for quality',
    brand_website: 'https://www.naturemade.com'
  },
  {
    brand_name: 'Thorne Research',
    brand_description: 'Premium research-backed supplements with high bioavailability',
    brand_website: 'https://www.thorne.com'
  },
  {
    brand_name: 'Garden of Life',
    brand_description: 'Organic, non-GMO whole food supplements',
    brand_website: 'https://www.gardenoflife.com'
  },
  {
    brand_name: 'Life Extension',
    brand_description: 'Science-based premium supplements for longevity',
    brand_website: 'https://www.lifeextension.com'
  },
  {
    brand_name: 'Jarrow Formulas',
    brand_description: 'Superior nutritional formulas backed by science',
    brand_website: 'https://www.jarrow.com'
  },
  {
    brand_name: 'Pure Encapsulations',
    brand_description: 'Hypoallergenic supplements free from common allergens',
    brand_website: 'https://www.pureencapsulations.com'
  },
  {
    brand_name: 'Solgar',
    brand_description: 'Premium quality supplements since 1947',
    brand_website: 'https://www.solgar.com'
  },
  {
    brand_name: 'Nordic Naturals',
    brand_description: 'Industry leader in omega-3 supplements',
    brand_website: 'https://www.nordicnaturals.com'
  },
  {
    brand_name: 'Optimum Nutrition',
    brand_description: 'Sports nutrition supplements for performance',
    brand_website: 'https://www.optimumnutrition.com'
  }
];

async function seedBrands() {
  console.log('🏢 Starting brand seeding...');
  const brandIds: { [key: string]: number } = {};
  
  for (const brand of popularBrands) {
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('brand_id, brand_name')
      .eq('brand_name', brand.brand_name)
      .single();
    
    if (existingBrand) {
      console.log(`✅ Brand already exists: ${brand.brand_name}`);
      brandIds[brand.brand_name] = existingBrand.brand_id;
      continue;
    }
    
    const { data: newBrand, error } = await supabase
      .from('brands')
      .insert(brand)
      .select('brand_id')
      .single();
    
    if (error) {
      console.error(`❌ Error creating brand ${brand.brand_name}:`, error);
      continue;
    }
    
    brandIds[brand.brand_name] = newBrand.brand_id;
    console.log(`✅ Created brand: ${brand.brand_name}`);
  }
  
  return brandIds;
}

async function seedAmazonProducts(brandIds: { [key: string]: number }) {
  console.log('🛒 Starting Amazon product seeding...');
  
  const supplementCategories = [
    {
      name: 'Vitamin D3',
      products: [
        {
          product_name: 'NOW Supplements Vitamin D3 5000 IU',
          product_description: 'High-potency vitamin D3 for immune support and bone health. Each softgel provides 5000 IU of vitamin D3.',
          product_price: 10.99,
          product_url: 'https://www.nowfoods.com/products/vitamin-d3-5000',
          amazon_url: 'https://www.amazon.com/NOW-Supplements-Vitamin-5-000-Softgels/dp/B0032BH76O',
          product_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          servings_per_container: 120,
          servings_per_day: 1,
          brand_name: 'NOW Foods'
        },
        {
          product_name: 'Nature Made Vitamin D3 2000 IU',
          product_description: 'USP verified vitamin D3 supplement for immune health and calcium absorption. Each softgel provides 2000 IU of vitamin D3.',
          product_price: 14.29,
          product_url: 'https://www.naturemade.com/products/vitamin-d3-2000-iu',
          amazon_url: 'https://www.amazon.com/Nature-Made-Vitamin-Softgels-Supply/dp/B004GJVTRI',
          product_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          servings_per_container: 90,
          servings_per_day: 1,
          brand_name: 'Nature Made'
        },
        {
          product_name: 'Thorne Vitamin D/K2 Liquid',
          product_description: 'Liquid vitamin D3 with vitamin K2 for optimal calcium utilization and bone health. Each drop provides 1000 IU of vitamin D3 and 200 mcg of vitamin K2.',
          product_price: 24.00,
          product_url: 'https://www.thorne.com/products/dp/vitamin-d-k2-liquid',
          amazon_url: 'https://www.amazon.com/Thorne-Research-Vitamin-Liquid-Fluid/dp/B0038NF8MG',
          product_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          servings_per_container: 600,
          servings_per_day: 2,
          brand_name: 'Thorne Research'
        },
        {
          product_name: 'Garden of Life Vitamin Code Raw D3',
          product_description: 'Whole food vitamin D3 supplement with probiotics and enzymes. Each capsule provides 2000 IU of raw vitamin D3.',
          product_price: 19.99,
          product_url: 'https://www.gardenoflife.com/products/vitamin-code-raw-d3',
          amazon_url: 'https://www.amazon.com/Garden-Life-Vegetarian-Supplement-Capsules/dp/B00K5NEPJY',
          product_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          servings_per_container: 60,
          servings_per_day: 1,
          brand_name: 'Garden of Life'
        }
      ]
    },
    {
      name: 'Omega-3 Fish Oil',
      products: [
        {
          product_name: 'Nordic Naturals Ultimate Omega',
          product_description: 'Pharmaceutical grade omega-3 fish oil for heart, brain, and immune health. Each serving provides 1280mg of omega-3s.',
          product_price: 29.95,
          product_url: 'https://www.nordicnaturals.com/products/ultimate-omega',
          amazon_url: 'https://www.amazon.com/Nordic-Naturals-Ultimate-Omega-Softgels/dp/B002CQU564',
          product_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          servings_per_container: 90,
          servings_per_day: 2,
          brand_name: 'Nordic Naturals'
        },
        {
          product_name: 'NOW Ultra Omega-3 Fish Oil',
          product_description: 'Molecularly distilled fish oil with high EPA and DHA content. Each softgel provides 500mg of EPA and 250mg of DHA.',
          product_price: 19.99,
          product_url: 'https://www.nowfoods.com/products/ultra-omega-3',
          amazon_url: 'https://www.amazon.com/NOW-Supplements-Ultra-Omega-3-Softgels/dp/B000SE5SY6',
          product_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          servings_per_container: 90,
          servings_per_day: 1,
          brand_name: 'NOW Foods'
        },
        {
          product_name: 'Life Extension Super Omega-3 EPA/DHA',
          product_description: 'Highly purified fish oil with olive extract and sesame lignans. Each softgel provides 700mg of EPA and 500mg of DHA.',
          product_price: 24.75,
          product_url: 'https://www.lifeextension.com/products/super-omega-3-epa-dha',
          amazon_url: 'https://www.amazon.com/Life-Extension-Omega-3-Fish-Softgels/dp/B000FFHPJC',
          product_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          servings_per_container: 120,
          servings_per_day: 2,
          brand_name: 'Life Extension'
        },
        {
          product_name: 'Solgar Omega-3 Triple Strength',
          product_description: 'Concentrated omega-3 fish oil in an easy-to-swallow softgel. Each softgel provides 950mg of EPA and DHA.',
          product_price: 32.99,
          product_url: 'https://www.solgar.com/products/omega-3-triple-strength',
          amazon_url: 'https://www.amazon.com/Solgar-Triple-Strength-Softgels-Count/dp/B0058A1VXO',
          product_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          servings_per_container: 50,
          servings_per_day: 1,
          brand_name: 'Solgar'
        }
      ]
    },
    {
      name: 'Magnesium',
      products: [
        {
          product_name: 'Pure Encapsulations Magnesium Glycinate',
          product_description: 'Highly absorbable magnesium glycinate for relaxation and muscle function. Each capsule provides 120mg of elemental magnesium.',
          product_price: 28.90,
          product_url: 'https://www.pureencapsulations.com/products/magnesium-glycinate',
          amazon_url: 'https://www.amazon.com/Pure-Encapsulations-Magnesium-Glycinate-Capsules/dp/B0058HWV9S',
          product_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          servings_per_container: 180,
          servings_per_day: 3,
          brand_name: 'Pure Encapsulations'
        },
        {
          product_name: 'NOW Magnesium Citrate',
          product_description: 'Highly bioavailable magnesium citrate for cardiovascular and nervous system support. Each capsule provides 200mg of elemental magnesium.',
          product_price: 14.99,
          product_url: 'https://www.nowfoods.com/products/magnesium-citrate',
          amazon_url: 'https://www.amazon.com/NOW-Supplements-Magnesium-Citrate-Capsules/dp/B000BV1O26',
          product_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          servings_per_container: 120,
          servings_per_day: 2,
          brand_name: 'NOW Foods'
        },
        {
          product_name: 'Thorne Magnesium Bisglycinate',
          product_description: 'Optimally absorbed magnesium for muscle relaxation and stress support. Each capsule provides 200mg of elemental magnesium.',
          product_price: 40.00,
          product_url: 'https://www.thorne.com/products/dp/magnesium-bisglycinate',
          amazon_url: 'https://www.amazon.com/Thorne-Research-Magnesium-Bisglycinate-Capsules/dp/B0797SJ7HG',
          product_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          servings_per_container: 60,
          servings_per_day: 1,
          brand_name: 'Thorne Research'
        },
        {
          product_name: 'Nature Made Magnesium 250mg',
          product_description: 'USP verified magnesium oxide for bone and muscle health. Each tablet provides 250mg of elemental magnesium.',
          product_price: 9.99,
          product_url: 'https://www.naturemade.com/products/magnesium-250-mg',
          amazon_url: 'https://www.amazon.com/Nature-Made-Magnesium-250-Tablets/dp/B000GFHPCU',
          product_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          servings_per_container: 100,
          servings_per_day: 1,
          brand_name: 'Nature Made'
        }
      ]
    }
  ];
  
  const additionalCategories = [
    'Vitamin C', 'Zinc', 'B-Complex', 'Probiotics', 'Protein Powder',
    'Creatine Monohydrate', 'CoQ10', 'Turmeric/Curcumin', 'Ashwagandha', 'Collagen',
    'Iron', 'Calcium', 'Multivitamin', 'Vitamin E', 'Vitamin K2',
    'Vitamin B12', 'Vitamin A', 'Melatonin', 'L-Theanine', 'Glutamine',
    'BCAA', 'Glucosamine', 'MSM', 'Biotin', 'Selenium'
  ];
  
  interface ProductData {
    product_name: string;
    product_description: string;
    product_price: number;
    product_url: string;
    amazon_url: string;
    product_image: string;
    servings_per_container: number;
    servings_per_day: number;
    brand_name: string;
  }

  for (const category of additionalCategories) {
    const products: ProductData[] = [];
    
    const brandNames = Object.keys(brandIds);
    for (let i = 0; i < 4; i++) {
      const brandName = brandNames[Math.floor(Math.random() * brandNames.length)];
      const price = (Math.random() * 30 + 10).toFixed(2);
      const servings = Math.floor(Math.random() * 100) + 30;
      const servingsPerDay = Math.floor(Math.random() * 3) + 1;
      
      products.push({
        product_name: `${brandName} ${category} ${Math.floor(Math.random() * 1000) + 100}mg`,
        product_description: `Premium ${category} supplement for optimal health and wellness. Each serving provides essential nutrients for your daily needs.`,
        product_price: parseFloat(price),
        product_url: `https://www.${brandName.toLowerCase().replace(/\s+/g, '')}.com/products/${category.toLowerCase().replace(/\s+/g, '-')}`,
        amazon_url: `https://www.amazon.com/${brandName.replace(/\s+/g, '-')}-${category.replace(/\s+/g, '-')}/dp/B${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
        product_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        servings_per_container: servings,
        servings_per_day: servingsPerDay,
        brand_name: brandName
      });
    }
    
    supplementCategories.push({
      name: category,
      products: products
    });
  }
  
  let totalProducts = 0;
  let successfulProducts = 0;
  
  for (const category of supplementCategories) {
    console.log(`\n📦 Processing category: ${category.name}`);
    
    let supplementId: number;
    
    const { data: existingSupplement } = await supabase
      .from('supplements')
      .select('supplement_id')
      .eq('supplement_name', category.name)
      .single();
    
    if (existingSupplement) {
      supplementId = existingSupplement.supplement_id;
      console.log(`✅ Found existing supplement: ${category.name} (ID: ${supplementId})`);
    } else {
      const { data: newSupplement, error: supplementError } = await supabase
        .from('supplements')
        .insert({
          supplement_name: category.name,
          supplement_description: `${category.name} supplements for health and wellness.`
        })
        .select('supplement_id')
        .single();
      
      if (supplementError) {
        console.error(`❌ Error creating supplement ${category.name}:`, supplementError);
        continue;
      }
      
      supplementId = newSupplement.supplement_id;
      console.log(`✅ Created new supplement: ${category.name} (ID: ${supplementId})`);
    }
    
    for (const product of category.products) {
      totalProducts++;
      
      const brandId = brandIds[product.brand_name];
      if (!brandId) {
        console.error(`❌ Brand not found: ${product.brand_name}`);
        continue;
      }
      
      const { data: existingProduct } = await supabase
        .from('products')
        .select('product_id')
        .eq('product_name', product.product_name)
        .single();
      
      if (existingProduct) {
        console.log(`⚠️ Product already exists: ${product.product_name}`);
        successfulProducts++;
        continue;
      }
      
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          product_name: product.product_name,
          product_description: product.product_description,
          product_price: product.product_price,
          product_url: product.product_url,
          amazon_url: product.amazon_url,
          product_image: product.product_image,
          servings_per_container: product.servings_per_container,
          servings_per_day: product.servings_per_day,
          supplement_id: supplementId,
          brand_id: brandId
        })
        .select('product_id')
        .single();
      
      if (productError) {
        console.error(`❌ Error creating product ${product.product_name}:`, productError);
        continue;
      }
      
      successfulProducts++;
      console.log(`✅ Created product: ${product.product_name}`);
    }
  }
  
  console.log(`\n🎉 Amazon product seeding completed!`);
  console.log(`📊 Summary:`);
  console.log(`- Total products attempted: ${totalProducts}`);
  console.log(`- Successfully created/found: ${successfulProducts}`);
  console.log(`- Total supplement categories: ${supplementCategories.length}`);
  
  return { totalProducts, successfulProducts, categories: supplementCategories.length };
}

async function seedAmazonProductsMain() {
  console.log('🚀 Starting Amazon products seeding process...');
  
  try {
    const brandIds = await seedBrands();
    
    const result = await seedAmazonProducts(brandIds);
    
    console.log('✅ Seeding process completed successfully!');
    return result;
  } catch (error) {
    console.error('❌ Fatal error during seeding:', error);
    throw error;
  }
}

export { seedAmazonProductsMain };

seedAmazonProductsMain().catch(console.error);
