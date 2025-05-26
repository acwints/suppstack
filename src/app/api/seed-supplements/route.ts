import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
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
  },
  {
    supplement_name: 'Multivitamin',
    supplement_description: 'Comprehensive blend of essential vitamins and minerals to support overall health and fill nutritional gaps.',
  },
  {
    supplement_name: 'Vitamin E',
    supplement_description: 'Powerful antioxidant that protects cells from damage and supports immune function.',
  },
  {
    supplement_name: 'Biotin',
    supplement_description: 'Supports healthy hair, skin, and nails. Important for metabolism and gene regulation.',
  },
  {
    supplement_name: 'Folate/Folic Acid',
    supplement_description: 'Essential for DNA synthesis and red blood cell formation. Important during pregnancy.',
  },
  {
    supplement_name: 'Glucosamine',
    supplement_description: 'Supports joint health and cartilage maintenance. May help with joint pain and stiffness.',
  }
];

export async function GET() {
  try {
    const results = [];
    
    for (const supplement of popularSupplements) {
      // Check if supplement already exists
      const { data: existing, error: checkError } = await supabase
        .from('supplements')
        .select('supplement_name')
        .eq('supplement_name', supplement.supplement_name)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        results.push({ 
          name: supplement.supplement_name, 
          status: 'error', 
          error: checkError.message 
        });
        continue;
      }

      if (existing) {
        results.push({ 
          name: supplement.supplement_name, 
          status: 'already_exists' 
        });
        continue;
      }

      // Insert new supplement
      const { error } = await supabase
        .from('supplements')
        .insert(supplement);

      if (error) {
        results.push({ 
          name: supplement.supplement_name, 
          status: 'error', 
          error: error.message 
        });
      } else {
        results.push({ 
          name: supplement.supplement_name, 
          status: 'success' 
        });
      }
    }

    const summary = {
      total: results.length,
      successful: results.filter(r => r.status === 'success').length,
      already_existed: results.filter(r => r.status === 'already_exists').length,
      errors: results.filter(r => r.status === 'error').length
    };

    return NextResponse.json({ 
      message: 'Supplement seeding completed',
      summary,
      results 
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to seed supplements', details: error },
      { status: 500 }
    );
  }
} 