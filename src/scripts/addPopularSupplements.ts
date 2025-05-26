import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iclidsxmazhoexdpktal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbGlkc3htYXpob2V4ZHBrdGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzMjQ4NDgsImV4cCI6MjA0MDkwMDg0OH0.HuvNvP_419fWPb1z68EcJ8twZyagAx9uRU814mU8s-s';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const popularSupplements = [
  {
    supplement_name: 'Vitamin D3',
    supplement_description: 'Essential for bone health, immune function, and mood regulation. Helps the body absorb calcium and supports overall health.',
  },
  {
    supplement_name: 'Omega-3 Fish Oil',
    supplement_description: 'Supports heart health, brain function, and reduces inflammation. Contains essential fatty acids EPA and DHA.',
  },
  {
    supplement_name: 'Magnesium',
    supplement_description: 'Important for muscle function, nerve transmission, and energy production. Helps with sleep and stress management.',
  },
  {
    supplement_name: 'Vitamin C',
    supplement_description: 'Powerful antioxidant that supports immune function, skin health, and iron absorption.',
  },
  {
    supplement_name: 'Zinc',
    supplement_description: 'Essential for immune function, protein synthesis, and wound healing. Important for hormone production.',
  },
  {
    supplement_name: 'B-Complex',
    supplement_description: 'Group of vitamins that support energy production, brain function, and cell metabolism.',
  },
  {
    supplement_name: 'Probiotics',
    supplement_description: 'Supports gut health and immune function. Helps maintain healthy gut bacteria balance.',
  },
  {
    supplement_name: 'Protein Powder',
    supplement_description: 'Supports muscle growth and recovery. Helps meet daily protein requirements.',
  },
  {
    supplement_name: 'Creatine Monohydrate',
    supplement_description: 'Supports muscle strength and power. Helps with high-intensity exercise performance.',
  },
  {
    supplement_name: 'CoQ10',
    supplement_description: 'Antioxidant that supports heart health and energy production. Important for cellular function.',
  },
  {
    supplement_name: 'Turmeric/Curcumin',
    supplement_description: 'Anti-inflammatory compound that supports joint health and overall wellness.',
  },
  {
    supplement_name: 'Vitamin B12',
    supplement_description: 'Essential for nerve function, red blood cell formation, and DNA synthesis.',
  },
  {
    supplement_name: 'Iron',
    supplement_description: 'Important for oxygen transport and energy production. Essential for preventing anemia.',
  },
  {
    supplement_name: 'Calcium',
    supplement_description: 'Essential for bone health, muscle function, and nerve transmission.',
  },
  {
    supplement_name: 'Ashwagandha',
    supplement_description: 'Adaptogenic herb that helps manage stress and supports overall wellness.',
  }
];

async function addPopularSupplements() {
  console.log('Adding popular supplements...');
  
  for (const supplement of popularSupplements) {
    const { data, error } = await supabase
      .from('supplements')
      .insert(supplement)
      .select();

    if (error) {
      console.error(`Error adding ${supplement.supplement_name}:`, error);
    } else {
      console.log(`Successfully added ${supplement.supplement_name}`);
    }
  }
}

addPopularSupplements().catch(console.error); 