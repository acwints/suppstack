import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ftjnxqyvqhpawsipfkay.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0am54cXl2cWhwYXdzaXBma2F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUyOTYxMzcsImV4cCI6MjA0MDg3MjEzN30.CSOuqJmQwDl6jYpAFAk8k1ZW04E5PVscm3uaVeUvVWo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Category-based image URLs from Unsplash (high-quality, relevant images)
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

const popularSupplements = [
  // ============================================================================
  // VITAMINS
  // ============================================================================
  {
    supplement_name: 'Vitamin D3',
    supplement_description: 'Essential for bone health, immune function, and mood regulation. Helps the body absorb calcium and supports overall health.',
    image_url: categoryImages.vitamins,
    category: 'Vitamins',
  },
  {
    supplement_name: 'Vitamin C',
    supplement_description: 'Powerful antioxidant that supports immune function, skin health, and iron absorption.',
    image_url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400&h=300&fit=crop',
    category: 'Vitamins',
  },
  {
    supplement_name: 'B-Complex',
    supplement_description: 'Group of vitamins that support energy production, brain function, and cell metabolism.',
    image_url: categoryImages.vitamins,
    category: 'Vitamins',
  },
  {
    supplement_name: 'Vitamin B12',
    supplement_description: 'Essential for nerve function, red blood cell formation, and DNA synthesis.',
    image_url: categoryImages.vitamins,
    category: 'Vitamins',
  },
  {
    supplement_name: 'Vitamin A',
    supplement_description: 'Important for vision, immune function, and skin health. Supports cell growth and reproduction.',
    image_url: categoryImages.vitamins,
    category: 'Vitamins',
  },
  {
    supplement_name: 'Vitamin E',
    supplement_description: 'Antioxidant that protects cells from damage. Supports skin health and immune function.',
    image_url: categoryImages.vitamins,
    category: 'Vitamins',
  },
  {
    supplement_name: 'Vitamin K2',
    supplement_description: 'Essential for bone health and calcium metabolism. Helps direct calcium to bones instead of arteries.',
    image_url: categoryImages.vitamins,
    category: 'Vitamins',
  },
  {
    supplement_name: 'Folate/Folic Acid',
    supplement_description: 'Essential for cell division and DNA synthesis. Critical during pregnancy for fetal development.',
    image_url: categoryImages.vitamins,
    category: 'Vitamins',
  },
  {
    supplement_name: 'Biotin',
    supplement_description: 'Supports healthy hair, skin, and nails. Important for metabolism and energy production.',
    image_url: categoryImages.beauty,
    category: 'Vitamins',
  },
  {
    supplement_name: 'Niacin (Vitamin B3)',
    supplement_description: 'Supports energy metabolism and cardiovascular health. May help maintain healthy cholesterol levels.',
    image_url: categoryImages.vitamins,
    category: 'Vitamins',
  },
  {
    supplement_name: 'Vitamin B6',
    supplement_description: 'Important for brain development, immune function, and protein metabolism. Helps produce neurotransmitters.',
    image_url: categoryImages.vitamins,
    category: 'Vitamins',
  },
  {
    supplement_name: 'Multivitamin',
    supplement_description: 'Comprehensive blend of essential vitamins and minerals to fill nutritional gaps in your diet.',
    image_url: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop',
    category: 'Vitamins',
  },

  // ============================================================================
  // MINERALS
  // ============================================================================
  {
    supplement_name: 'Magnesium',
    supplement_description: 'Important for muscle function, nerve transmission, and energy production. Helps with sleep and stress management.',
    image_url: categoryImages.minerals,
    category: 'Minerals',
  },
  {
    supplement_name: 'Zinc',
    supplement_description: 'Essential for immune function, protein synthesis, and wound healing. Important for hormone production.',
    image_url: categoryImages.minerals,
    category: 'Minerals',
  },
  {
    supplement_name: 'Iron',
    supplement_description: 'Important for oxygen transport and energy production. Essential for preventing anemia.',
    image_url: categoryImages.minerals,
    category: 'Minerals',
  },
  {
    supplement_name: 'Calcium',
    supplement_description: 'Essential for bone health, muscle function, and nerve transmission.',
    image_url: categoryImages.minerals,
    category: 'Minerals',
  },
  {
    supplement_name: 'Potassium',
    supplement_description: 'Critical for heart function, muscle contractions, and maintaining proper fluid balance.',
    image_url: categoryImages.minerals,
    category: 'Minerals',
  },
  {
    supplement_name: 'Selenium',
    supplement_description: 'Powerful antioxidant that supports thyroid function and immune health. May help protect against oxidative stress.',
    image_url: categoryImages.minerals,
    category: 'Minerals',
  },
  {
    supplement_name: 'Chromium',
    supplement_description: 'Helps regulate blood sugar levels and supports healthy metabolism. May improve insulin sensitivity.',
    image_url: categoryImages.minerals,
    category: 'Minerals',
  },
  {
    supplement_name: 'Copper',
    supplement_description: 'Essential for iron metabolism, connective tissue formation, and nervous system function.',
    image_url: categoryImages.minerals,
    category: 'Minerals',
  },
  {
    supplement_name: 'Iodine',
    supplement_description: 'Critical for thyroid function and hormone production. Important for metabolism and cognitive function.',
    image_url: categoryImages.minerals,
    category: 'Minerals',
  },
  {
    supplement_name: 'Boron',
    supplement_description: 'Supports bone health, brain function, and hormone metabolism. May help with testosterone levels.',
    image_url: categoryImages.minerals,
    category: 'Minerals',
  },
  {
    supplement_name: 'Manganese',
    supplement_description: 'Important for bone health, metabolism, and antioxidant function. Supports connective tissue.',
    image_url: categoryImages.minerals,
    category: 'Minerals',
  },

  // ============================================================================
  // OMEGA FATTY ACIDS
  // ============================================================================
  {
    supplement_name: 'Omega-3 Fish Oil',
    supplement_description: 'Supports heart health, brain function, and reduces inflammation. Contains essential fatty acids EPA and DHA.',
    image_url: categoryImages.omega,
    category: 'Omega & Fish Oil',
  },
  {
    supplement_name: 'Krill Oil',
    supplement_description: 'Rich in omega-3s with enhanced absorption. Contains astaxanthin for additional antioxidant benefits.',
    image_url: categoryImages.omega,
    category: 'Omega & Fish Oil',
  },
  {
    supplement_name: 'Algal Oil',
    supplement_description: 'Plant-based omega-3 source from algae. Vegan-friendly alternative to fish oil with DHA and EPA.',
    image_url: categoryImages.omega,
    category: 'Omega & Fish Oil',
  },
  {
    supplement_name: 'Cod Liver Oil',
    supplement_description: 'Rich in omega-3s plus vitamins A and D. Traditional supplement for overall health support.',
    image_url: categoryImages.omega,
    category: 'Omega & Fish Oil',
  },

  // ============================================================================
  // HERBS & ADAPTOGENS
  // ============================================================================
  {
    supplement_name: 'Ashwagandha',
    supplement_description: 'Adaptogenic herb that helps manage stress and supports overall wellness.',
    image_url: categoryImages.herbs,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Turmeric/Curcumin',
    supplement_description: 'Anti-inflammatory compound that supports joint health and overall wellness.',
    image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=300&fit=crop',
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Rhodiola Rosea',
    supplement_description: 'Adaptogen that helps combat fatigue and supports mental performance. May improve stress resilience.',
    image_url: categoryImages.herbs,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Ginseng',
    supplement_description: 'Traditional herb that supports energy, cognitive function, and immune health. Popular adaptogen.',
    image_url: categoryImages.herbs,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: "Lion's Mane Mushroom",
    supplement_description: 'Medicinal mushroom that supports brain health, cognitive function, and nerve regeneration.',
    image_url: categoryImages.mushrooms,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Reishi Mushroom',
    supplement_description: 'Known as the "mushroom of immortality." Supports immune function, sleep, and stress management.',
    image_url: categoryImages.mushrooms,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Cordyceps',
    supplement_description: 'Medicinal mushroom that supports energy, athletic performance, and respiratory health.',
    image_url: categoryImages.mushrooms,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Maca Root',
    supplement_description: 'Peruvian superfood that supports energy, libido, and hormonal balance.',
    image_url: categoryImages.herbs,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Ginkgo Biloba',
    supplement_description: 'Supports cognitive function, memory, and circulation. Ancient herbal remedy for brain health.',
    image_url: categoryImages.herbs,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Bacopa Monnieri',
    supplement_description: 'Ayurvedic herb that supports memory, learning, and cognitive function. Natural nootropic.',
    image_url: categoryImages.herbs,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Holy Basil (Tulsi)',
    supplement_description: 'Adaptogenic herb that helps manage stress and supports respiratory and immune health.',
    image_url: categoryImages.herbs,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Milk Thistle',
    supplement_description: 'Supports liver health and detoxification. Contains silymarin, a powerful antioxidant compound.',
    image_url: categoryImages.herbs,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Elderberry',
    supplement_description: 'Rich in antioxidants and supports immune function. Traditional remedy for cold and flu symptoms.',
    image_url: 'https://images.unsplash.com/photo-1596591868231-a191a8e0f5aa?w=400&h=300&fit=crop',
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Echinacea',
    supplement_description: 'Immune-supporting herb traditionally used to fight infections and reduce cold duration.',
    image_url: categoryImages.herbs,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Valerian Root',
    supplement_description: 'Natural sleep aid that promotes relaxation and may improve sleep quality.',
    image_url: categoryImages.sleep,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: "St. John's Wort",
    supplement_description: 'Traditional herb that supports mood and emotional well-being. Natural support for mild depression.',
    image_url: categoryImages.herbs,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Saw Palmetto',
    supplement_description: "Supports prostate health and may help with hair loss. Popular men's health supplement.",
    image_url: categoryImages.herbs,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Black Seed Oil',
    supplement_description: 'Traditional remedy with anti-inflammatory and antioxidant properties. Supports immune and metabolic health.',
    image_url: categoryImages.herbs,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Berberine',
    supplement_description: 'Plant compound that supports healthy blood sugar levels and metabolic function.',
    image_url: categoryImages.herbs,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Tongkat Ali',
    supplement_description: 'Southeast Asian herb that supports testosterone levels, energy, and athletic performance.',
    image_url: categoryImages.herbs,
    category: 'Herbs & Adaptogens',
  },
  {
    supplement_name: 'Fenugreek',
    supplement_description: 'Supports healthy testosterone levels, blood sugar management, and digestive health.',
    image_url: categoryImages.herbs,
    category: 'Herbs & Adaptogens',
  },

  // ============================================================================
  // AMINO ACIDS
  // ============================================================================
  {
    supplement_name: 'L-Theanine',
    supplement_description: 'Amino acid found in tea that promotes relaxation without drowsiness. Great paired with caffeine.',
    image_url: categoryImages.amino,
    category: 'Amino Acids',
  },
  {
    supplement_name: 'L-Glutamine',
    supplement_description: 'Most abundant amino acid in the body. Supports gut health, immune function, and muscle recovery.',
    image_url: categoryImages.amino,
    category: 'Amino Acids',
  },
  {
    supplement_name: 'L-Carnitine',
    supplement_description: 'Supports fat metabolism and energy production. May enhance exercise performance and recovery.',
    image_url: categoryImages.amino,
    category: 'Amino Acids',
  },
  {
    supplement_name: 'L-Tyrosine',
    supplement_description: 'Precursor to dopamine and other neurotransmitters. Supports focus, mood, and stress response.',
    image_url: categoryImages.amino,
    category: 'Amino Acids',
  },
  {
    supplement_name: 'L-Arginine',
    supplement_description: 'Precursor to nitric oxide. Supports blood flow, athletic performance, and cardiovascular health.',
    image_url: categoryImages.amino,
    category: 'Amino Acids',
  },
  {
    supplement_name: 'L-Citrulline',
    supplement_description: 'Converts to L-arginine in the body. Supports blood flow, exercise performance, and recovery.',
    image_url: categoryImages.amino,
    category: 'Amino Acids',
  },
  {
    supplement_name: 'Glycine',
    supplement_description: 'Amino acid that supports sleep quality, collagen production, and cognitive function.',
    image_url: categoryImages.amino,
    category: 'Amino Acids',
  },
  {
    supplement_name: 'Taurine',
    supplement_description: 'Supports heart health, exercise performance, and nervous system function.',
    image_url: categoryImages.amino,
    category: 'Amino Acids',
  },
  {
    supplement_name: 'GABA',
    supplement_description: 'Neurotransmitter that promotes relaxation and may help with stress and sleep.',
    image_url: categoryImages.amino,
    category: 'Amino Acids',
  },
  {
    supplement_name: '5-HTP',
    supplement_description: 'Precursor to serotonin. Supports mood, sleep, and appetite regulation.',
    image_url: categoryImages.amino,
    category: 'Amino Acids',
  },
  {
    supplement_name: 'NAC (N-Acetyl Cysteine)',
    supplement_description: 'Powerful antioxidant that supports liver health, respiratory function, and detoxification.',
    image_url: categoryImages.amino,
    category: 'Amino Acids',
  },
  {
    supplement_name: 'BCAAs',
    supplement_description: 'Branched-chain amino acids that support muscle protein synthesis and reduce exercise fatigue.',
    image_url: categoryImages.performance,
    category: 'Amino Acids',
  },
  {
    supplement_name: 'EAAs',
    supplement_description: 'Essential amino acids that the body cannot produce. Complete amino acid profile for muscle building.',
    image_url: categoryImages.performance,
    category: 'Amino Acids',
  },

  // ============================================================================
  // PROTEIN & PERFORMANCE
  // ============================================================================
  {
    supplement_name: 'Protein Powder',
    supplement_description: 'Supports muscle growth and recovery. Helps meet daily protein requirements.',
    image_url: categoryImages.protein,
    category: 'Protein & Performance',
  },
  {
    supplement_name: 'Whey Protein',
    supplement_description: 'Fast-absorbing complete protein from milk. Ideal for post-workout muscle recovery.',
    image_url: categoryImages.protein,
    category: 'Protein & Performance',
  },
  {
    supplement_name: 'Casein Protein',
    supplement_description: 'Slow-digesting protein from milk. Ideal for sustained amino acid release, especially before bed.',
    image_url: categoryImages.protein,
    category: 'Protein & Performance',
  },
  {
    supplement_name: 'Plant Protein',
    supplement_description: 'Vegan protein blend from sources like pea, rice, and hemp. Complete amino acid profile.',
    image_url: categoryImages.protein,
    category: 'Protein & Performance',
  },
  {
    supplement_name: 'Creatine Monohydrate',
    supplement_description: 'Supports muscle strength and power. Helps with high-intensity exercise performance.',
    image_url: categoryImages.performance,
    category: 'Protein & Performance',
  },
  {
    supplement_name: 'Beta-Alanine',
    supplement_description: 'Buffers lactic acid to improve endurance. Reduces fatigue during high-intensity exercise.',
    image_url: categoryImages.performance,
    category: 'Protein & Performance',
  },
  {
    supplement_name: 'Citrulline Malate',
    supplement_description: 'Enhances blood flow and reduces fatigue. Popular pre-workout ingredient for better pumps.',
    image_url: categoryImages.performance,
    category: 'Protein & Performance',
  },
  {
    supplement_name: 'Pre-Workout',
    supplement_description: 'Energy and performance blend with caffeine, beta-alanine, and other ingredients for intense workouts.',
    image_url: categoryImages.performance,
    category: 'Protein & Performance',
  },
  {
    supplement_name: 'HMB',
    supplement_description: 'Metabolite of leucine that helps prevent muscle breakdown and supports recovery.',
    image_url: categoryImages.performance,
    category: 'Protein & Performance',
  },
  {
    supplement_name: 'Beetroot Powder',
    supplement_description: 'Natural source of nitrates that supports blood flow, endurance, and athletic performance.',
    image_url: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=400&h=300&fit=crop',
    category: 'Protein & Performance',
  },

  // ============================================================================
  // GUT HEALTH & DIGESTION
  // ============================================================================
  {
    supplement_name: 'Probiotics',
    supplement_description: 'Supports gut health and immune function. Helps maintain healthy gut bacteria balance.',
    image_url: categoryImages.gut,
    category: 'Gut Health',
  },
  {
    supplement_name: 'Prebiotics',
    supplement_description: 'Fiber that feeds beneficial gut bacteria. Supports digestive health and immune function.',
    image_url: categoryImages.gut,
    category: 'Gut Health',
  },
  {
    supplement_name: 'Digestive Enzymes',
    supplement_description: 'Helps break down food for better nutrient absorption. Supports digestive comfort.',
    image_url: categoryImages.gut,
    category: 'Gut Health',
  },
  {
    supplement_name: 'Psyllium Husk',
    supplement_description: 'Soluble fiber that supports digestive regularity and may help manage cholesterol levels.',
    image_url: categoryImages.gut,
    category: 'Gut Health',
  },
  {
    supplement_name: 'Apple Cider Vinegar',
    supplement_description: 'Supports digestive health, blood sugar management, and may aid weight management.',
    image_url: categoryImages.gut,
    category: 'Gut Health',
  },
  {
    supplement_name: 'Ginger Root',
    supplement_description: 'Supports digestive health, reduces nausea, and has anti-inflammatory properties.',
    image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=300&fit=crop',
    category: 'Gut Health',
  },

  // ============================================================================
  // JOINT & BONE HEALTH
  // ============================================================================
  {
    supplement_name: 'Glucosamine',
    supplement_description: 'Supports joint health and cartilage repair. Often combined with chondroitin for joint support.',
    image_url: categoryImages.joint,
    category: 'Joint & Bone',
  },
  {
    supplement_name: 'Chondroitin',
    supplement_description: 'Supports joint cushioning and flexibility. Works synergistically with glucosamine.',
    image_url: categoryImages.joint,
    category: 'Joint & Bone',
  },
  {
    supplement_name: 'MSM',
    supplement_description: 'Sulfur compound that supports joint health, reduces inflammation, and aids recovery.',
    image_url: categoryImages.joint,
    category: 'Joint & Bone',
  },
  {
    supplement_name: 'Collagen',
    supplement_description: 'Supports skin elasticity, joint health, and connective tissue. The most abundant protein in the body.',
    image_url: categoryImages.beauty,
    category: 'Joint & Bone',
  },
  {
    supplement_name: 'Hyaluronic Acid',
    supplement_description: 'Supports joint lubrication and skin hydration. Important for joint and skin health.',
    image_url: categoryImages.joint,
    category: 'Joint & Bone',
  },

  // ============================================================================
  // HEART & CIRCULATION
  // ============================================================================
  {
    supplement_name: 'CoQ10',
    supplement_description: 'Antioxidant that supports heart health and energy production. Important for cellular function.',
    image_url: categoryImages.heart,
    category: 'Heart Health',
  },
  {
    supplement_name: 'Nattokinase',
    supplement_description: 'Enzyme from fermented soybeans that supports healthy circulation and cardiovascular function.',
    image_url: categoryImages.heart,
    category: 'Heart Health',
  },
  {
    supplement_name: 'Garlic Extract',
    supplement_description: 'Supports cardiovascular health, immune function, and healthy blood pressure.',
    image_url: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2f89?w=400&h=300&fit=crop',
    category: 'Heart Health',
  },
  {
    supplement_name: 'Red Yeast Rice',
    supplement_description: 'Natural support for healthy cholesterol levels. Traditional Chinese remedy for heart health.',
    image_url: categoryImages.heart,
    category: 'Heart Health',
  },
  {
    supplement_name: 'Hawthorn Berry',
    supplement_description: 'Traditional herb that supports heart health and healthy blood pressure.',
    image_url: categoryImages.heart,
    category: 'Heart Health',
  },

  // ============================================================================
  // COGNITIVE & NOOTROPICS
  // ============================================================================
  {
    supplement_name: 'Alpha-GPC',
    supplement_description: 'Choline compound that supports cognitive function, memory, and focus. Popular nootropic.',
    image_url: categoryImages.cognitive,
    category: 'Brain & Focus',
  },
  {
    supplement_name: 'Phosphatidylserine',
    supplement_description: 'Supports brain health, memory, and cognitive function. Important for cell membrane health.',
    image_url: categoryImages.cognitive,
    category: 'Brain & Focus',
  },
  {
    supplement_name: 'Acetyl-L-Carnitine',
    supplement_description: 'Supports brain energy metabolism and cognitive function. May help with age-related mental decline.',
    image_url: categoryImages.cognitive,
    category: 'Brain & Focus',
  },
  {
    supplement_name: 'CDP-Choline',
    supplement_description: 'Supports brain health, memory, and focus. Precursor to the neurotransmitter acetylcholine.',
    image_url: categoryImages.cognitive,
    category: 'Brain & Focus',
  },
  {
    supplement_name: 'Omega-3 DHA',
    supplement_description: 'Essential fatty acid critical for brain health and cognitive function. Important throughout life.',
    image_url: categoryImages.omega,
    category: 'Brain & Focus',
  },

  // ============================================================================
  // SLEEP & RELAXATION
  // ============================================================================
  {
    supplement_name: 'Melatonin',
    supplement_description: 'Natural hormone that regulates sleep-wake cycles. Helps with jet lag and sleep onset.',
    image_url: categoryImages.sleep,
    category: 'Sleep & Relaxation',
  },
  {
    supplement_name: 'Magnesium Glycinate',
    supplement_description: 'Highly absorbable form of magnesium that promotes relaxation and better sleep quality.',
    image_url: categoryImages.sleep,
    category: 'Sleep & Relaxation',
  },
  {
    supplement_name: 'Passionflower',
    supplement_description: 'Herbal remedy that promotes relaxation and may improve sleep quality.',
    image_url: categoryImages.sleep,
    category: 'Sleep & Relaxation',
  },
  {
    supplement_name: 'Lemon Balm',
    supplement_description: 'Calming herb that supports relaxation, sleep, and cognitive function.',
    image_url: categoryImages.sleep,
    category: 'Sleep & Relaxation',
  },
  {
    supplement_name: 'Chamomile',
    supplement_description: 'Gentle herb that promotes relaxation and supports healthy sleep patterns.',
    image_url: categoryImages.sleep,
    category: 'Sleep & Relaxation',
  },
  {
    supplement_name: 'Apigenin',
    supplement_description: 'Flavonoid found in chamomile that promotes relaxation and supports sleep quality.',
    image_url: categoryImages.sleep,
    category: 'Sleep & Relaxation',
  },

  // ============================================================================
  // SKIN, HAIR & BEAUTY
  // ============================================================================
  {
    supplement_name: 'Collagen Peptides',
    supplement_description: 'Hydrolyzed collagen for better absorption. Supports skin, hair, nails, and joint health.',
    image_url: categoryImages.beauty,
    category: 'Skin, Hair & Beauty',
  },
  {
    supplement_name: 'Keratin',
    supplement_description: 'Protein that supports strong, healthy hair and nails.',
    image_url: categoryImages.beauty,
    category: 'Skin, Hair & Beauty',
  },
  {
    supplement_name: 'Astaxanthin',
    supplement_description: 'Powerful antioxidant that supports skin health, eye health, and athletic recovery.',
    image_url: categoryImages.beauty,
    category: 'Skin, Hair & Beauty',
  },
  {
    supplement_name: 'Silica',
    supplement_description: 'Mineral that supports collagen production, skin elasticity, and healthy hair and nails.',
    image_url: categoryImages.beauty,
    category: 'Skin, Hair & Beauty',
  },

  // ============================================================================
  // HORMONAL & SPECIALTY
  // ============================================================================
  {
    supplement_name: 'DIM',
    supplement_description: 'Compound from cruciferous vegetables that supports healthy estrogen metabolism.',
    image_url: categoryImages.hormonal,
    category: 'Hormonal & Specialty',
  },
  {
    supplement_name: 'Vitamin D + K2',
    supplement_description: 'Synergistic combination for optimal calcium absorption and bone health.',
    image_url: categoryImages.vitamins,
    category: 'Hormonal & Specialty',
  },
  {
    supplement_name: 'DHEA',
    supplement_description: 'Hormone precursor that supports energy, mood, and hormone balance with age.',
    image_url: categoryImages.hormonal,
    category: 'Hormonal & Specialty',
  },
  {
    supplement_name: 'Pregnenolone',
    supplement_description: 'Master hormone precursor that supports memory, mood, and overall hormone balance.',
    image_url: categoryImages.hormonal,
    category: 'Hormonal & Specialty',
  },
  {
    supplement_name: 'Shilajit',
    supplement_description: 'Mineral-rich substance from the Himalayas. Supports energy, testosterone, and overall vitality.',
    image_url: categoryImages.hormonal,
    category: 'Hormonal & Specialty',
  },
  {
    supplement_name: 'Pine Bark Extract',
    supplement_description: 'Powerful antioxidant that supports circulation, skin health, and cognitive function.',
    image_url: categoryImages.herbs,
    category: 'Hormonal & Specialty',
  },
  {
    supplement_name: 'Quercetin',
    supplement_description: 'Flavonoid with anti-inflammatory and antihistamine properties. Supports immune and cardiovascular health.',
    image_url: categoryImages.hormonal,
    category: 'Hormonal & Specialty',
  },
  {
    supplement_name: 'Resveratrol',
    supplement_description: 'Antioxidant found in red wine that supports heart health and healthy aging.',
    image_url: categoryImages.heart,
    category: 'Hormonal & Specialty',
  },
  {
    supplement_name: 'PQQ',
    supplement_description: 'Supports mitochondrial health and energy production. May support cognitive function and heart health.',
    image_url: categoryImages.hormonal,
    category: 'Hormonal & Specialty',
  },
  {
    supplement_name: 'Chlorophyll',
    supplement_description: 'Plant pigment that supports detoxification, fresh breath, and overall wellness.',
    image_url: categoryImages.superfood,
    category: 'Hormonal & Specialty',
  },
  {
    supplement_name: 'Spirulina',
    supplement_description: 'Nutrient-dense blue-green algae. Rich in protein, vitamins, minerals, and antioxidants.',
    image_url: categoryImages.superfood,
    category: 'Hormonal & Specialty',
  },
  {
    supplement_name: 'Chlorella',
    supplement_description: 'Green algae that supports detoxification, immune function, and overall nutrition.',
    image_url: categoryImages.superfood,
    category: 'Hormonal & Specialty',
  },
  {
    supplement_name: 'Moringa',
    supplement_description: 'Nutrient-rich superfood that supports energy, inflammation, and overall health.',
    image_url: categoryImages.superfood,
    category: 'Hormonal & Specialty',
  },
  {
    supplement_name: 'Sea Moss',
    supplement_description: 'Mineral-rich sea vegetable that supports thyroid health, digestion, and immune function.',
    image_url: categoryImages.superfood,
    category: 'Hormonal & Specialty',
  },
  {
    supplement_name: 'Electrolytes',
    supplement_description: 'Essential minerals for hydration, muscle function, and nerve transmission.',
    image_url: categoryImages.minerals,
    category: 'Hormonal & Specialty',
  },
];

async function addPopularSupplements() {
  console.log('Adding popular supplements with images...');
  console.log(`Total supplements: ${popularSupplements.length}`);

  let successCount = 0;
  let errorCount = 0;

  for (const supplement of popularSupplements) {
    // First try to update existing record, then insert if not exists
    const { data: existing } = await supabase
      .from('supplements')
      .select('supplement_id')
      .eq('supplement_name', supplement.supplement_name)
      .single();

    if (existing) {
      // Update existing record with image and category
      const { error } = await supabase
        .from('supplements')
        .update({
          image_url: supplement.image_url,
          category: supplement.category,
          supplement_description: supplement.supplement_description,
        })
        .eq('supplement_name', supplement.supplement_name);

      if (error) {
        console.error(`Error updating ${supplement.supplement_name}:`, error);
        errorCount++;
      } else {
        console.log(`✓ Updated ${supplement.supplement_name}`);
        successCount++;
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('supplements')
        .insert(supplement);

      if (error) {
        console.error(`Error adding ${supplement.supplement_name}:`, error);
        errorCount++;
      } else {
        console.log(`✓ Added ${supplement.supplement_name}`);
        successCount++;
      }
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

addPopularSupplements().catch(console.error);
