import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iclidsxmazhoexdpktal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbGlkc3htYXpob2V4ZHBrdGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzMjQ4NDgsImV4cCI6MjA0MDkwMDg0OH0.HuvNvP_419fWPb1z68EcJ8twZyagAx9uRU814mU8s-s';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    const { data, error } = await supabase
      .from('brands')
      .insert(brand)
      .select();

    if (error) {
      console.error(`Error adding ${brand.brand_name}:`, error);
    } else {
      console.log(`Successfully added ${brand.brand_name}`);
    }
  }
}

addPopularBrands().catch(console.error);
