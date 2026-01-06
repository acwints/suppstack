import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iclidsxmazhoexdpktal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbGlkc3htYXpob2V4ZHBrdGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzMjQ4NDgsImV4cCI6MjA0MDkwMDg0OH0.HuvNvP_419fWPb1z68EcJ8twZyagAx9uRU814mU8s-s';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const popularSupplements = [
  // ============================================================================
  // VITAMINS
  // ============================================================================
  {
    supplement_name: 'Vitamin D3',
    supplement_description: 'Essential for bone health, immune function, and mood regulation. Helps the body absorb calcium and supports overall health.',
  },
  {
    supplement_name: 'Vitamin C',
    supplement_description: 'Powerful antioxidant that supports immune function, skin health, and iron absorption.',
  },
  {
    supplement_name: 'B-Complex',
    supplement_description: 'Group of vitamins that support energy production, brain function, and cell metabolism.',
  },
  {
    supplement_name: 'Vitamin B12',
    supplement_description: 'Essential for nerve function, red blood cell formation, and DNA synthesis.',
  },
  {
    supplement_name: 'Vitamin A',
    supplement_description: 'Important for vision, immune function, and skin health. Supports cell growth and reproduction.',
  },
  {
    supplement_name: 'Vitamin E',
    supplement_description: 'Antioxidant that protects cells from damage. Supports skin health and immune function.',
  },
  {
    supplement_name: 'Vitamin K2',
    supplement_description: 'Essential for bone health and calcium metabolism. Helps direct calcium to bones instead of arteries.',
  },
  {
    supplement_name: 'Folate/Folic Acid',
    supplement_description: 'Essential for cell division and DNA synthesis. Critical during pregnancy for fetal development.',
  },
  {
    supplement_name: 'Biotin',
    supplement_description: 'Supports healthy hair, skin, and nails. Important for metabolism and energy production.',
  },
  {
    supplement_name: 'Niacin (Vitamin B3)',
    supplement_description: 'Supports energy metabolism and cardiovascular health. May help maintain healthy cholesterol levels.',
  },
  {
    supplement_name: 'Vitamin B6',
    supplement_description: 'Important for brain development, immune function, and protein metabolism. Helps produce neurotransmitters.',
  },
  {
    supplement_name: 'Multivitamin',
    supplement_description: 'Comprehensive blend of essential vitamins and minerals to fill nutritional gaps in your diet.',
  },

  // ============================================================================
  // MINERALS
  // ============================================================================
  {
    supplement_name: 'Magnesium',
    supplement_description: 'Important for muscle function, nerve transmission, and energy production. Helps with sleep and stress management.',
  },
  {
    supplement_name: 'Zinc',
    supplement_description: 'Essential for immune function, protein synthesis, and wound healing. Important for hormone production.',
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
    supplement_name: 'Potassium',
    supplement_description: 'Critical for heart function, muscle contractions, and maintaining proper fluid balance.',
  },
  {
    supplement_name: 'Selenium',
    supplement_description: 'Powerful antioxidant that supports thyroid function and immune health. May help protect against oxidative stress.',
  },
  {
    supplement_name: 'Chromium',
    supplement_description: 'Helps regulate blood sugar levels and supports healthy metabolism. May improve insulin sensitivity.',
  },
  {
    supplement_name: 'Copper',
    supplement_description: 'Essential for iron metabolism, connective tissue formation, and nervous system function.',
  },
  {
    supplement_name: 'Iodine',
    supplement_description: 'Critical for thyroid function and hormone production. Important for metabolism and cognitive function.',
  },
  {
    supplement_name: 'Boron',
    supplement_description: 'Supports bone health, brain function, and hormone metabolism. May help with testosterone levels.',
  },
  {
    supplement_name: 'Manganese',
    supplement_description: 'Important for bone health, metabolism, and antioxidant function. Supports connective tissue.',
  },

  // ============================================================================
  // OMEGA FATTY ACIDS
  // ============================================================================
  {
    supplement_name: 'Omega-3 Fish Oil',
    supplement_description: 'Supports heart health, brain function, and reduces inflammation. Contains essential fatty acids EPA and DHA.',
  },
  {
    supplement_name: 'Krill Oil',
    supplement_description: 'Rich in omega-3s with enhanced absorption. Contains astaxanthin for additional antioxidant benefits.',
  },
  {
    supplement_name: 'Algal Oil',
    supplement_description: 'Plant-based omega-3 source from algae. Vegan-friendly alternative to fish oil with DHA and EPA.',
  },
  {
    supplement_name: 'Cod Liver Oil',
    supplement_description: 'Rich in omega-3s plus vitamins A and D. Traditional supplement for overall health support.',
  },

  // ============================================================================
  // HERBS & ADAPTOGENS
  // ============================================================================
  {
    supplement_name: 'Ashwagandha',
    supplement_description: 'Adaptogenic herb that helps manage stress and supports overall wellness.',
  },
  {
    supplement_name: 'Turmeric/Curcumin',
    supplement_description: 'Anti-inflammatory compound that supports joint health and overall wellness.',
  },
  {
    supplement_name: 'Rhodiola Rosea',
    supplement_description: 'Adaptogen that helps combat fatigue and supports mental performance. May improve stress resilience.',
  },
  {
    supplement_name: 'Ginseng',
    supplement_description: 'Traditional herb that supports energy, cognitive function, and immune health. Popular adaptogen.',
  },
  {
    supplement_name: 'Lion\'s Mane Mushroom',
    supplement_description: 'Medicinal mushroom that supports brain health, cognitive function, and nerve regeneration.',
  },
  {
    supplement_name: 'Reishi Mushroom',
    supplement_description: 'Known as the "mushroom of immortality." Supports immune function, sleep, and stress management.',
  },
  {
    supplement_name: 'Cordyceps',
    supplement_description: 'Medicinal mushroom that supports energy, athletic performance, and respiratory health.',
  },
  {
    supplement_name: 'Maca Root',
    supplement_description: 'Peruvian superfood that supports energy, libido, and hormonal balance.',
  },
  {
    supplement_name: 'Ginkgo Biloba',
    supplement_description: 'Supports cognitive function, memory, and circulation. Ancient herbal remedy for brain health.',
  },
  {
    supplement_name: 'Bacopa Monnieri',
    supplement_description: 'Ayurvedic herb that supports memory, learning, and cognitive function. Natural nootropic.',
  },
  {
    supplement_name: 'Holy Basil (Tulsi)',
    supplement_description: 'Adaptogenic herb that helps manage stress and supports respiratory and immune health.',
  },
  {
    supplement_name: 'Milk Thistle',
    supplement_description: 'Supports liver health and detoxification. Contains silymarin, a powerful antioxidant compound.',
  },
  {
    supplement_name: 'Elderberry',
    supplement_description: 'Rich in antioxidants and supports immune function. Traditional remedy for cold and flu symptoms.',
  },
  {
    supplement_name: 'Echinacea',
    supplement_description: 'Immune-supporting herb traditionally used to fight infections and reduce cold duration.',
  },
  {
    supplement_name: 'Valerian Root',
    supplement_description: 'Natural sleep aid that promotes relaxation and may improve sleep quality.',
  },
  {
    supplement_name: 'St. John\'s Wort',
    supplement_description: 'Traditional herb that supports mood and emotional well-being. Natural support for mild depression.',
  },
  {
    supplement_name: 'Saw Palmetto',
    supplement_description: 'Supports prostate health and may help with hair loss. Popular men\'s health supplement.',
  },
  {
    supplement_name: 'Black Seed Oil',
    supplement_description: 'Traditional remedy with anti-inflammatory and antioxidant properties. Supports immune and metabolic health.',
  },
  {
    supplement_name: 'Berberine',
    supplement_description: 'Plant compound that supports healthy blood sugar levels and metabolic function.',
  },
  {
    supplement_name: 'Tongkat Ali',
    supplement_description: 'Southeast Asian herb that supports testosterone levels, energy, and athletic performance.',
  },
  {
    supplement_name: 'Fenugreek',
    supplement_description: 'Supports healthy testosterone levels, blood sugar management, and digestive health.',
  },

  // ============================================================================
  // AMINO ACIDS
  // ============================================================================
  {
    supplement_name: 'L-Theanine',
    supplement_description: 'Amino acid found in tea that promotes relaxation without drowsiness. Great paired with caffeine.',
  },
  {
    supplement_name: 'L-Glutamine',
    supplement_description: 'Most abundant amino acid in the body. Supports gut health, immune function, and muscle recovery.',
  },
  {
    supplement_name: 'L-Carnitine',
    supplement_description: 'Supports fat metabolism and energy production. May enhance exercise performance and recovery.',
  },
  {
    supplement_name: 'L-Tyrosine',
    supplement_description: 'Precursor to dopamine and other neurotransmitters. Supports focus, mood, and stress response.',
  },
  {
    supplement_name: 'L-Arginine',
    supplement_description: 'Precursor to nitric oxide. Supports blood flow, athletic performance, and cardiovascular health.',
  },
  {
    supplement_name: 'L-Citrulline',
    supplement_description: 'Converts to L-arginine in the body. Supports blood flow, exercise performance, and recovery.',
  },
  {
    supplement_name: 'Glycine',
    supplement_description: 'Amino acid that supports sleep quality, collagen production, and cognitive function.',
  },
  {
    supplement_name: 'Taurine',
    supplement_description: 'Supports heart health, exercise performance, and nervous system function.',
  },
  {
    supplement_name: 'GABA',
    supplement_description: 'Neurotransmitter that promotes relaxation and may help with stress and sleep.',
  },
  {
    supplement_name: '5-HTP',
    supplement_description: 'Precursor to serotonin. Supports mood, sleep, and appetite regulation.',
  },
  {
    supplement_name: 'NAC (N-Acetyl Cysteine)',
    supplement_description: 'Powerful antioxidant that supports liver health, respiratory function, and detoxification.',
  },
  {
    supplement_name: 'BCAAs',
    supplement_description: 'Branched-chain amino acids that support muscle protein synthesis and reduce exercise fatigue.',
  },
  {
    supplement_name: 'EAAs',
    supplement_description: 'Essential amino acids that the body cannot produce. Complete amino acid profile for muscle building.',
  },

  // ============================================================================
  // PROTEIN & PERFORMANCE
  // ============================================================================
  {
    supplement_name: 'Protein Powder',
    supplement_description: 'Supports muscle growth and recovery. Helps meet daily protein requirements.',
  },
  {
    supplement_name: 'Whey Protein',
    supplement_description: 'Fast-absorbing complete protein from milk. Ideal for post-workout muscle recovery.',
  },
  {
    supplement_name: 'Casein Protein',
    supplement_description: 'Slow-digesting protein from milk. Ideal for sustained amino acid release, especially before bed.',
  },
  {
    supplement_name: 'Plant Protein',
    supplement_description: 'Vegan protein blend from sources like pea, rice, and hemp. Complete amino acid profile.',
  },
  {
    supplement_name: 'Creatine Monohydrate',
    supplement_description: 'Supports muscle strength and power. Helps with high-intensity exercise performance.',
  },
  {
    supplement_name: 'Beta-Alanine',
    supplement_description: 'Buffers lactic acid to improve endurance. Reduces fatigue during high-intensity exercise.',
  },
  {
    supplement_name: 'Citrulline Malate',
    supplement_description: 'Enhances blood flow and reduces fatigue. Popular pre-workout ingredient for better pumps.',
  },
  {
    supplement_name: 'Pre-Workout',
    supplement_description: 'Energy and performance blend with caffeine, beta-alanine, and other ingredients for intense workouts.',
  },
  {
    supplement_name: 'HMB',
    supplement_description: 'Metabolite of leucine that helps prevent muscle breakdown and supports recovery.',
  },
  {
    supplement_name: 'Beetroot Powder',
    supplement_description: 'Natural source of nitrates that supports blood flow, endurance, and athletic performance.',
  },

  // ============================================================================
  // GUT HEALTH & DIGESTION
  // ============================================================================
  {
    supplement_name: 'Probiotics',
    supplement_description: 'Supports gut health and immune function. Helps maintain healthy gut bacteria balance.',
  },
  {
    supplement_name: 'Prebiotics',
    supplement_description: 'Fiber that feeds beneficial gut bacteria. Supports digestive health and immune function.',
  },
  {
    supplement_name: 'Digestive Enzymes',
    supplement_description: 'Helps break down food for better nutrient absorption. Supports digestive comfort.',
  },
  {
    supplement_name: 'Psyllium Husk',
    supplement_description: 'Soluble fiber that supports digestive regularity and may help manage cholesterol levels.',
  },
  {
    supplement_name: 'Apple Cider Vinegar',
    supplement_description: 'Supports digestive health, blood sugar management, and may aid weight management.',
  },
  {
    supplement_name: 'Ginger Root',
    supplement_description: 'Supports digestive health, reduces nausea, and has anti-inflammatory properties.',
  },

  // ============================================================================
  // JOINT & BONE HEALTH
  // ============================================================================
  {
    supplement_name: 'Glucosamine',
    supplement_description: 'Supports joint health and cartilage repair. Often combined with chondroitin for joint support.',
  },
  {
    supplement_name: 'Chondroitin',
    supplement_description: 'Supports joint cushioning and flexibility. Works synergistically with glucosamine.',
  },
  {
    supplement_name: 'MSM',
    supplement_description: 'Sulfur compound that supports joint health, reduces inflammation, and aids recovery.',
  },
  {
    supplement_name: 'Collagen',
    supplement_description: 'Supports skin elasticity, joint health, and connective tissue. The most abundant protein in the body.',
  },
  {
    supplement_name: 'Hyaluronic Acid',
    supplement_description: 'Supports joint lubrication and skin hydration. Important for joint and skin health.',
  },

  // ============================================================================
  // HEART & CIRCULATION
  // ============================================================================
  {
    supplement_name: 'CoQ10',
    supplement_description: 'Antioxidant that supports heart health and energy production. Important for cellular function.',
  },
  {
    supplement_name: 'Nattokinase',
    supplement_description: 'Enzyme from fermented soybeans that supports healthy circulation and cardiovascular function.',
  },
  {
    supplement_name: 'Garlic Extract',
    supplement_description: 'Supports cardiovascular health, immune function, and healthy blood pressure.',
  },
  {
    supplement_name: 'Red Yeast Rice',
    supplement_description: 'Natural support for healthy cholesterol levels. Traditional Chinese remedy for heart health.',
  },
  {
    supplement_name: 'Hawthorn Berry',
    supplement_description: 'Traditional herb that supports heart health and healthy blood pressure.',
  },

  // ============================================================================
  // COGNITIVE & NOOTROPICS
  // ============================================================================
  {
    supplement_name: 'Alpha-GPC',
    supplement_description: 'Choline compound that supports cognitive function, memory, and focus. Popular nootropic.',
  },
  {
    supplement_name: 'Phosphatidylserine',
    supplement_description: 'Supports brain health, memory, and cognitive function. Important for cell membrane health.',
  },
  {
    supplement_name: 'Acetyl-L-Carnitine',
    supplement_description: 'Supports brain energy metabolism and cognitive function. May help with age-related mental decline.',
  },
  {
    supplement_name: 'CDP-Choline',
    supplement_description: 'Supports brain health, memory, and focus. Precursor to the neurotransmitter acetylcholine.',
  },
  {
    supplement_name: 'Omega-3 DHA',
    supplement_description: 'Essential fatty acid critical for brain health and cognitive function. Important throughout life.',
  },

  // ============================================================================
  // SLEEP & RELAXATION
  // ============================================================================
  {
    supplement_name: 'Melatonin',
    supplement_description: 'Natural hormone that regulates sleep-wake cycles. Helps with jet lag and sleep onset.',
  },
  {
    supplement_name: 'Magnesium Glycinate',
    supplement_description: 'Highly absorbable form of magnesium that promotes relaxation and better sleep quality.',
  },
  {
    supplement_name: 'Passionflower',
    supplement_description: 'Herbal remedy that promotes relaxation and may improve sleep quality.',
  },
  {
    supplement_name: 'Lemon Balm',
    supplement_description: 'Calming herb that supports relaxation, sleep, and cognitive function.',
  },
  {
    supplement_name: 'Chamomile',
    supplement_description: 'Gentle herb that promotes relaxation and supports healthy sleep patterns.',
  },
  {
    supplement_name: 'Apigenin',
    supplement_description: 'Flavonoid found in chamomile that promotes relaxation and supports sleep quality.',
  },

  // ============================================================================
  // SKIN, HAIR & BEAUTY
  // ============================================================================
  {
    supplement_name: 'Collagen Peptides',
    supplement_description: 'Hydrolyzed collagen for better absorption. Supports skin, hair, nails, and joint health.',
  },
  {
    supplement_name: 'Keratin',
    supplement_description: 'Protein that supports strong, healthy hair and nails.',
  },
  {
    supplement_name: 'Astaxanthin',
    supplement_description: 'Powerful antioxidant that supports skin health, eye health, and athletic recovery.',
  },
  {
    supplement_name: 'Silica',
    supplement_description: 'Mineral that supports collagen production, skin elasticity, and healthy hair and nails.',
  },

  // ============================================================================
  // HORMONAL & SPECIALTY
  // ============================================================================
  {
    supplement_name: 'DIM',
    supplement_description: 'Compound from cruciferous vegetables that supports healthy estrogen metabolism.',
  },
  {
    supplement_name: 'Vitamin D + K2',
    supplement_description: 'Synergistic combination for optimal calcium absorption and bone health.',
  },
  {
    supplement_name: 'DHEA',
    supplement_description: 'Hormone precursor that supports energy, mood, and hormone balance with age.',
  },
  {
    supplement_name: 'Pregnenolone',
    supplement_description: 'Master hormone precursor that supports memory, mood, and overall hormone balance.',
  },
  {
    supplement_name: 'Shilajit',
    supplement_description: 'Mineral-rich substance from the Himalayas. Supports energy, testosterone, and overall vitality.',
  },
  {
    supplement_name: 'Pine Bark Extract',
    supplement_description: 'Powerful antioxidant that supports circulation, skin health, and cognitive function.',
  },
  {
    supplement_name: 'Quercetin',
    supplement_description: 'Flavonoid with anti-inflammatory and antihistamine properties. Supports immune and cardiovascular health.',
  },
  {
    supplement_name: 'Resveratrol',
    supplement_description: 'Antioxidant found in red wine that supports heart health and healthy aging.',
  },
  {
    supplement_name: 'PQQ',
    supplement_description: 'Supports mitochondrial health and energy production. May support cognitive function and heart health.',
  },
  {
    supplement_name: 'Chlorophyll',
    supplement_description: 'Plant pigment that supports detoxification, fresh breath, and overall wellness.',
  },
  {
    supplement_name: 'Spirulina',
    supplement_description: 'Nutrient-dense blue-green algae. Rich in protein, vitamins, minerals, and antioxidants.',
  },
  {
    supplement_name: 'Chlorella',
    supplement_description: 'Green algae that supports detoxification, immune function, and overall nutrition.',
  },
  {
    supplement_name: 'Moringa',
    supplement_description: 'Nutrient-rich superfood that supports energy, inflammation, and overall health.',
  },
  {
    supplement_name: 'Sea Moss',
    supplement_description: 'Mineral-rich sea vegetable that supports thyroid health, digestion, and immune function.',
  },
  {
    supplement_name: 'Electrolytes',
    supplement_description: 'Essential minerals for hydration, muscle function, and nerve transmission.',
  },
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