import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iclidsxmazhoexdpktal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbGlkc3htYXpob2V4ZHBrdGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzMjQ4NDgsImV4cCI6MjA0MDkwMDg0OH0.HuvNvP_419fWPb1z68EcJ8twZyagAx9uRU814mU8s-s';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { vitaminDProducts } from './productData/vitaminD';
import { omega3Products } from './productData/omega3';
import { magnesiumProducts } from './productData/magnesium';
import { vitaminCProducts } from './productData/vitaminC';
import { zincProducts } from './productData/zinc';
import { bComplexProducts } from './productData/bComplex';
import { probioticsProducts } from './productData/probiotics';
import { proteinProducts } from './productData/protein';
import { creatineProducts } from './productData/creatine';
import { coq10Products } from './productData/coq10';
import { turmericProducts } from './productData/turmeric';
import { vitaminB12Products } from './productData/vitaminB12';
import { otherProducts } from './productData/otherProducts';

async function addAmazonProducts() {
  console.log('Adding Amazon products...');
  
  const { data: supplements, error: supplementsError } = await supabase.from('supplements').select('*');
  const { data: brands, error: brandsError } = await supabase.from('brands').select('*');
  
  if (supplementsError) {
    console.error('Error fetching supplements:', supplementsError);
    return;
  }
  
  if (brandsError) {
    console.error('Error fetching brands:', brandsError);
    return;
  }
  
  if (!supplements || !brands) {
    throw new Error('Failed to fetch supplements or brands');
  }

  const supplementMap = new Map(supplements.map(s => [s.supplement_name, s.supplement_id]));
  const brandMap = new Map(brands.map(b => [b.brand_name, b.brand_id]));

  const allProducts = [
    ...vitaminDProducts(supplementMap, brandMap),
    ...omega3Products(supplementMap, brandMap),
    ...magnesiumProducts(supplementMap, brandMap),
    ...vitaminCProducts(supplementMap, brandMap),
    ...zincProducts(supplementMap, brandMap),
    ...bComplexProducts(supplementMap, brandMap),
    ...probioticsProducts(supplementMap, brandMap),
    ...proteinProducts(supplementMap, brandMap),
    ...creatineProducts(supplementMap, brandMap),
    ...coq10Products(supplementMap, brandMap),
    ...turmericProducts(supplementMap, brandMap),
    ...vitaminB12Products(supplementMap, brandMap),
    ...otherProducts(supplementMap, brandMap)
  ];

  console.log(`Adding ${allProducts.length} Amazon products to database...`);
  
  for (const product of allProducts) {
    const { error } = await supabase
      .from('products')
      .insert(product);

    if (error) {
      console.error(`Error adding ${product.product_name}:`, error);
    } else {
      console.log(`Successfully added ${product.product_name}`);
    }
  }
  
  console.log('Finished adding Amazon products.');
}

addAmazonProducts().catch(console.error);
