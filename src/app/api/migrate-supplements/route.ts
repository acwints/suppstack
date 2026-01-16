import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for migrations
const supabaseUrl = 'https://iclidsxmazhoexdpktal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbGlkc3htYXpob2V4ZHBrdGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzMjQ4NDgsImV4cCI6MjA0MDkwMDg0OH0.HuvNvP_419fWPb1z68EcJ8twZyagAx9uRU814mU8s-s';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Category-based image URLs from Unsplash
const categoryImages = {
  vitamins: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
  minerals: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop',
  omega: 'https://images.unsplash.com/photo-1535185384036-28bbc8035f28?w=400&h=300&fit=crop',
  herbs: 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop',
  mushrooms: 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=400&h=300&fit=crop',
  amino: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400&h=300&fit=crop',
  protein: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop',
  performance: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
  gut: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
  joint: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
  heart: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop',
  cognitive: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop',
  sleep: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop',
  beauty: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop',
  hormonal: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=300&fit=crop',
  superfood: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
};

// Mapping supplements to categories and images
const supplementData: Record<string, { category: string; image_url: string }> = {
  // Vitamins
  'Vitamin D3': { category: 'Vitamins', image_url: categoryImages.vitamins },
  'Vitamin C': { category: 'Vitamins', image_url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400&h=300&fit=crop' },
  'B-Complex': { category: 'Vitamins', image_url: categoryImages.vitamins },
  'Vitamin B12': { category: 'Vitamins', image_url: categoryImages.vitamins },
  'Vitamin A': { category: 'Vitamins', image_url: categoryImages.vitamins },
  'Vitamin E': { category: 'Vitamins', image_url: categoryImages.vitamins },
  'Vitamin K2': { category: 'Vitamins', image_url: categoryImages.vitamins },
  'Folate/Folic Acid': { category: 'Vitamins', image_url: categoryImages.vitamins },
  'Biotin': { category: 'Vitamins', image_url: categoryImages.beauty },
  'Niacin (Vitamin B3)': { category: 'Vitamins', image_url: categoryImages.vitamins },
  'Vitamin B6': { category: 'Vitamins', image_url: categoryImages.vitamins },
  'Multivitamin': { category: 'Vitamins', image_url: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop' },

  // Minerals
  'Magnesium': { category: 'Minerals', image_url: categoryImages.minerals },
  'Zinc': { category: 'Minerals', image_url: categoryImages.minerals },
  'Iron': { category: 'Minerals', image_url: categoryImages.minerals },
  'Calcium': { category: 'Minerals', image_url: categoryImages.minerals },
  'Potassium': { category: 'Minerals', image_url: categoryImages.minerals },
  'Selenium': { category: 'Minerals', image_url: categoryImages.minerals },
  'Chromium': { category: 'Minerals', image_url: categoryImages.minerals },
  'Copper': { category: 'Minerals', image_url: categoryImages.minerals },
  'Iodine': { category: 'Minerals', image_url: categoryImages.minerals },
  'Boron': { category: 'Minerals', image_url: categoryImages.minerals },
  'Manganese': { category: 'Minerals', image_url: categoryImages.minerals },
  'Electrolytes': { category: 'Minerals', image_url: categoryImages.minerals },

  // Omega
  'Omega-3 Fish Oil': { category: 'Omega & Fish Oil', image_url: categoryImages.omega },
  'Krill Oil': { category: 'Omega & Fish Oil', image_url: categoryImages.omega },
  'Algal Oil': { category: 'Omega & Fish Oil', image_url: categoryImages.omega },
  'Cod Liver Oil': { category: 'Omega & Fish Oil', image_url: categoryImages.omega },
  'Omega-3 DHA': { category: 'Brain & Focus', image_url: categoryImages.omega },

  // Herbs & Adaptogens
  'Ashwagandha': { category: 'Herbs & Adaptogens', image_url: categoryImages.herbs },
  'Turmeric/Curcumin': { category: 'Herbs & Adaptogens', image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=300&fit=crop' },
  'Rhodiola Rosea': { category: 'Herbs & Adaptogens', image_url: categoryImages.herbs },
  'Ginseng': { category: 'Herbs & Adaptogens', image_url: categoryImages.herbs },
  "Lion's Mane Mushroom": { category: 'Herbs & Adaptogens', image_url: categoryImages.mushrooms },
  'Reishi Mushroom': { category: 'Herbs & Adaptogens', image_url: categoryImages.mushrooms },
  'Cordyceps': { category: 'Herbs & Adaptogens', image_url: categoryImages.mushrooms },
  'Maca Root': { category: 'Herbs & Adaptogens', image_url: categoryImages.herbs },
  'Ginkgo Biloba': { category: 'Herbs & Adaptogens', image_url: categoryImages.herbs },
  'Bacopa Monnieri': { category: 'Herbs & Adaptogens', image_url: categoryImages.herbs },
  'Holy Basil (Tulsi)': { category: 'Herbs & Adaptogens', image_url: categoryImages.herbs },
  'Milk Thistle': { category: 'Herbs & Adaptogens', image_url: categoryImages.herbs },
  'Elderberry': { category: 'Herbs & Adaptogens', image_url: 'https://images.unsplash.com/photo-1596591868231-a191a8e0f5aa?w=400&h=300&fit=crop' },
  'Echinacea': { category: 'Herbs & Adaptogens', image_url: categoryImages.herbs },
  'Valerian Root': { category: 'Sleep & Relaxation', image_url: categoryImages.sleep },
  "St. John's Wort": { category: 'Herbs & Adaptogens', image_url: categoryImages.herbs },
  'Saw Palmetto': { category: 'Herbs & Adaptogens', image_url: categoryImages.herbs },
  'Black Seed Oil': { category: 'Herbs & Adaptogens', image_url: categoryImages.herbs },
  'Berberine': { category: 'Herbs & Adaptogens', image_url: categoryImages.herbs },
  'Tongkat Ali': { category: 'Herbs & Adaptogens', image_url: categoryImages.herbs },
  'Fenugreek': { category: 'Herbs & Adaptogens', image_url: categoryImages.herbs },

  // Amino Acids
  'L-Theanine': { category: 'Amino Acids', image_url: categoryImages.amino },
  'L-Glutamine': { category: 'Amino Acids', image_url: categoryImages.amino },
  'L-Carnitine': { category: 'Amino Acids', image_url: categoryImages.amino },
  'L-Tyrosine': { category: 'Amino Acids', image_url: categoryImages.amino },
  'L-Arginine': { category: 'Amino Acids', image_url: categoryImages.amino },
  'L-Citrulline': { category: 'Amino Acids', image_url: categoryImages.amino },
  'Glycine': { category: 'Amino Acids', image_url: categoryImages.amino },
  'Taurine': { category: 'Amino Acids', image_url: categoryImages.amino },
  'GABA': { category: 'Amino Acids', image_url: categoryImages.amino },
  '5-HTP': { category: 'Amino Acids', image_url: categoryImages.amino },
  'NAC (N-Acetyl Cysteine)': { category: 'Amino Acids', image_url: categoryImages.amino },
  'BCAAs': { category: 'Amino Acids', image_url: categoryImages.performance },
  'EAAs': { category: 'Amino Acids', image_url: categoryImages.performance },

  // Protein & Performance
  'Protein Powder': { category: 'Protein & Performance', image_url: categoryImages.protein },
  'Whey Protein': { category: 'Protein & Performance', image_url: categoryImages.protein },
  'Casein Protein': { category: 'Protein & Performance', image_url: categoryImages.protein },
  'Plant Protein': { category: 'Protein & Performance', image_url: categoryImages.protein },
  'Creatine Monohydrate': { category: 'Protein & Performance', image_url: categoryImages.performance },
  'Beta-Alanine': { category: 'Protein & Performance', image_url: categoryImages.performance },
  'Citrulline Malate': { category: 'Protein & Performance', image_url: categoryImages.performance },
  'Pre-Workout': { category: 'Protein & Performance', image_url: categoryImages.performance },
  'HMB': { category: 'Protein & Performance', image_url: categoryImages.performance },
  'Beetroot Powder': { category: 'Protein & Performance', image_url: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=400&h=300&fit=crop' },

  // Gut Health
  'Probiotics': { category: 'Gut Health', image_url: categoryImages.gut },
  'Prebiotics': { category: 'Gut Health', image_url: categoryImages.gut },
  'Digestive Enzymes': { category: 'Gut Health', image_url: categoryImages.gut },
  'Psyllium Husk': { category: 'Gut Health', image_url: categoryImages.gut },
  'Apple Cider Vinegar': { category: 'Gut Health', image_url: categoryImages.gut },
  'Ginger Root': { category: 'Gut Health', image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=300&fit=crop' },

  // Joint & Bone
  'Glucosamine': { category: 'Joint & Bone', image_url: categoryImages.joint },
  'Chondroitin': { category: 'Joint & Bone', image_url: categoryImages.joint },
  'MSM': { category: 'Joint & Bone', image_url: categoryImages.joint },
  'Collagen': { category: 'Joint & Bone', image_url: categoryImages.beauty },
  'Hyaluronic Acid': { category: 'Joint & Bone', image_url: categoryImages.joint },

  // Heart Health
  'CoQ10': { category: 'Heart Health', image_url: categoryImages.heart },
  'Nattokinase': { category: 'Heart Health', image_url: categoryImages.heart },
  'Garlic Extract': { category: 'Heart Health', image_url: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2f89?w=400&h=300&fit=crop' },
  'Red Yeast Rice': { category: 'Heart Health', image_url: categoryImages.heart },
  'Hawthorn Berry': { category: 'Heart Health', image_url: categoryImages.heart },

  // Brain & Focus
  'Alpha-GPC': { category: 'Brain & Focus', image_url: categoryImages.cognitive },
  'Phosphatidylserine': { category: 'Brain & Focus', image_url: categoryImages.cognitive },
  'Acetyl-L-Carnitine': { category: 'Brain & Focus', image_url: categoryImages.cognitive },
  'CDP-Choline': { category: 'Brain & Focus', image_url: categoryImages.cognitive },

  // Sleep & Relaxation
  'Melatonin': { category: 'Sleep & Relaxation', image_url: categoryImages.sleep },
  'Magnesium Glycinate': { category: 'Sleep & Relaxation', image_url: categoryImages.sleep },
  'Passionflower': { category: 'Sleep & Relaxation', image_url: categoryImages.sleep },
  'Lemon Balm': { category: 'Sleep & Relaxation', image_url: categoryImages.sleep },
  'Chamomile': { category: 'Sleep & Relaxation', image_url: categoryImages.sleep },
  'Apigenin': { category: 'Sleep & Relaxation', image_url: categoryImages.sleep },

  // Skin, Hair & Beauty
  'Collagen Peptides': { category: 'Skin, Hair & Beauty', image_url: categoryImages.beauty },
  'Keratin': { category: 'Skin, Hair & Beauty', image_url: categoryImages.beauty },
  'Astaxanthin': { category: 'Skin, Hair & Beauty', image_url: categoryImages.beauty },
  'Silica': { category: 'Skin, Hair & Beauty', image_url: categoryImages.beauty },

  // Hormonal & Specialty
  'DIM': { category: 'Hormonal & Specialty', image_url: categoryImages.hormonal },
  'Vitamin D + K2': { category: 'Hormonal & Specialty', image_url: categoryImages.vitamins },
  'DHEA': { category: 'Hormonal & Specialty', image_url: categoryImages.hormonal },
  'Pregnenolone': { category: 'Hormonal & Specialty', image_url: categoryImages.hormonal },
  'Shilajit': { category: 'Hormonal & Specialty', image_url: categoryImages.hormonal },
  'Pine Bark Extract': { category: 'Hormonal & Specialty', image_url: categoryImages.herbs },
  'Quercetin': { category: 'Hormonal & Specialty', image_url: categoryImages.hormonal },
  'Resveratrol': { category: 'Hormonal & Specialty', image_url: categoryImages.heart },
  'PQQ': { category: 'Hormonal & Specialty', image_url: categoryImages.hormonal },
  'Chlorophyll': { category: 'Hormonal & Specialty', image_url: categoryImages.superfood },
  'Spirulina': { category: 'Hormonal & Specialty', image_url: categoryImages.superfood },
  'Chlorella': { category: 'Hormonal & Specialty', image_url: categoryImages.superfood },
  'Moringa': { category: 'Hormonal & Specialty', image_url: categoryImages.superfood },
  'Sea Moss': { category: 'Hormonal & Specialty', image_url: categoryImages.superfood },
};

export async function POST() {
  try {
    console.log('🚀 Starting supplement image migration...');

    // Fetch all existing supplements
    const { data: supplements, error: fetchError } = await supabase
      .from('supplements')
      .select('supplement_id, supplement_name');

    if (fetchError) {
      throw new Error(`Failed to fetch supplements: ${fetchError.message}`);
    }

    if (!supplements || supplements.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No supplements found in database'
      });
    }

    console.log(`Found ${supplements.length} supplements to update`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Update each supplement with its image and category
    for (const supplement of supplements) {
      const data = supplementData[supplement.supplement_name];

      if (data) {
        const { error: updateError } = await supabase
          .from('supplements')
          .update({
            image_url: data.image_url,
            category: data.category,
          })
          .eq('supplement_id', supplement.supplement_id);

        if (updateError) {
          console.error(`Error updating ${supplement.supplement_name}:`, updateError);
          errors.push(`${supplement.supplement_name}: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`✓ Updated ${supplement.supplement_name}`);
          successCount++;
        }
      } else {
        // Use a default image for unmapped supplements
        const { error: updateError } = await supabase
          .from('supplements')
          .update({
            image_url: categoryImages.vitamins,
            category: 'General',
          })
          .eq('supplement_id', supplement.supplement_id);

        if (updateError) {
          errorCount++;
        } else {
          console.log(`✓ Updated ${supplement.supplement_name} with default image`);
          successCount++;
        }
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      stats: {
        total: supplements.length,
        success: successCount,
        errors: errorCount,
        errorDetails: errors,
      }
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to run the supplement image migration'
  });
}
