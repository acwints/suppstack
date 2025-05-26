import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  },
  global: {
    fetch: (url, options) => {
      return fetch(url, { ...options, cache: 'no-store' })
    }
  }
});

const popularBrands = [
  { brand_name: 'Nature Made' },
  { brand_name: 'NOW Foods' },
  { brand_name: 'Garden of Life' },
  { brand_name: 'Optimum Nutrition' },
  { brand_name: 'Thorne' },
  { brand_name: 'Nordic Naturals' },
  { brand_name: 'Life Extension' },
  { brand_name: 'Vital Proteins' },
  { brand_name: 'Sports Research' },
  { brand_name: 'Amazing Grass' },
  { brand_name: 'Solgar' },
  { brand_name: 'Jarrow Formulas' },
  { brand_name: 'Doctor\'s Best' },
  { brand_name: 'Pure Encapsulations' },
  { brand_name: 'Country Life' },
  { brand_name: 'New Chapter' },
  { brand_name: 'MegaFood' },
  { brand_name: 'Nutricost' },
  { brand_name: 'Bulk Supplements' },
  { brand_name: 'Nature\'s Bounty' }
];

async function addPopularBrands() {
  console.log('Adding popular brands...');
  
  for (const brand of popularBrands) {
    let attempts = 0;
    const maxAttempts = 3;
    let success = false;
    
    while (attempts < maxAttempts && !success) {
      try {
        const { data, error } = await supabase
          .from('brands')
          .insert(brand)
          .select();
        
        if (error) {
          console.error(`Attempt ${attempts + 1}: Error adding ${brand.brand_name}:`, error);
        } else {
          console.log(`Successfully added ${brand.brand_name}`);
          success = true;
        }
      } catch (err) {
        console.error(`Attempt ${attempts + 1}: Network error adding ${brand.brand_name}:`, err);
      }
      
      attempts++;
      
      if (!success && attempts < maxAttempts) {
        console.log(`Retrying in 2 seconds... (${attempts}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (!success) {
      console.error(`Failed to add ${brand.brand_name} after ${maxAttempts} attempts.`);
    }
  }
}

addPopularBrands().catch(console.error);
