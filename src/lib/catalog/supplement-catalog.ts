import type { Product, Supplement } from '@/types';

type EvidenceRating = NonNullable<Supplement['evidence_rating']>;

interface CatalogSeed {
  name: string;
  category: string;
  description: string;
  aliases?: string[];
  goals: string[];
  forms: string[];
  dosage: string;
  evidence: EvidenceRating;
  price: number;
}

const CATALOG_START_ID = 9000;

const seeds: CatalogSeed[] = [
  { name: 'Vitamin D3', category: 'Vitamins', description: 'Supports vitamin D status, bone mineralization, immune function, and muscle performance when sunlight or dietary intake is low.', aliases: ['cholecalciferol', 'vitamin d'], goals: ['Bone health', 'Immune support', 'Mood support'], forms: ['Softgel', 'Capsule', 'Liquid'], dosage: '1000-5000 IU daily', evidence: 'strong', price: 18 },
  { name: 'Vitamin K2', category: 'Vitamins', description: 'Works with vitamin D and calcium metabolism to support bone health and normal vascular calcium handling.', aliases: ['mk-7', 'menaquinone'], goals: ['Bone health', 'Heart health'], forms: ['Capsule', 'Softgel'], dosage: '90-200 mcg daily', evidence: 'moderate', price: 24 },
  { name: 'Vitamin C', category: 'Vitamins', description: 'An antioxidant vitamin used for immune support, collagen formation, and helping improve non-heme iron absorption.', aliases: ['ascorbic acid'], goals: ['Immune support', 'Skin health', 'Antioxidant support'], forms: ['Capsule', 'Powder', 'Gummy'], dosage: '250-1000 mg daily', evidence: 'strong', price: 16 },
  { name: 'Vitamin B12', category: 'Vitamins', description: 'Supports red blood cell formation, methylation, and nerve function, especially for vegan, vegetarian, or older adults.', aliases: ['methylcobalamin', 'cyanocobalamin'], goals: ['Energy metabolism', 'Nerve support'], forms: ['Lozenge', 'Capsule', 'Spray'], dosage: '250-1000 mcg daily', evidence: 'strong', price: 15 },
  { name: 'B-Complex', category: 'Vitamins', description: 'Combines several B vitamins that support energy metabolism, methylation, and normal nervous system function.', goals: ['Energy metabolism', 'Stress support'], forms: ['Capsule', 'Tablet'], dosage: '1 serving daily', evidence: 'moderate', price: 22 },
  { name: 'Folate', category: 'Vitamins', description: 'Supports methylation, DNA synthesis, and prenatal neural tube development when intake is adequate before and during pregnancy.', aliases: ['folic acid', '5-mthf'], goals: ['Prenatal support', 'Methylation'], forms: ['Capsule', 'Tablet'], dosage: '400-1000 mcg DFE daily', evidence: 'strong', price: 14 },
  { name: 'Biotin', category: 'Vitamins', description: 'A B vitamin involved in macronutrient metabolism and commonly used in hair, skin, and nail routines.', aliases: ['vitamin b7'], goals: ['Hair support', 'Nail support'], forms: ['Capsule', 'Gummy'], dosage: '30-5000 mcg daily', evidence: 'moderate', price: 13 },
  { name: 'Multivitamin', category: 'Vitamins', description: 'Broad micronutrient coverage designed to close common diet gaps across vitamins, minerals, and trace nutrients.', goals: ['Daily essentials', 'Nutrient gaps'], forms: ['Tablet', 'Capsule', 'Powder'], dosage: '1 serving daily', evidence: 'moderate', price: 28 },
  { name: 'Magnesium Glycinate', category: 'Minerals', description: 'A gentle magnesium form often chosen for sleep, relaxation, muscle function, and nervous system support.', aliases: ['magnesium bisglycinate'], goals: ['Sleep support', 'Relaxation', 'Muscle function'], forms: ['Capsule', 'Powder'], dosage: '100-400 mg elemental magnesium daily', evidence: 'strong', price: 25 },
  { name: 'Magnesium Citrate', category: 'Minerals', description: 'A bioavailable magnesium form used for magnesium repletion and occasional constipation support.', goals: ['Mineral support', 'Digestive regularity'], forms: ['Capsule', 'Powder'], dosage: '100-300 mg elemental magnesium daily', evidence: 'strong', price: 18 },
  { name: 'Zinc', category: 'Minerals', description: 'Essential mineral for immune function, wound healing, skin health, and normal testosterone production.', aliases: ['zinc picolinate', 'zinc gluconate'], goals: ['Immune support', 'Skin health'], forms: ['Capsule', 'Lozenge'], dosage: '10-30 mg daily', evidence: 'strong', price: 12 },
  { name: 'Iron', category: 'Minerals', description: 'Supports hemoglobin production and energy when iron status is low; best selected with lab guidance.', aliases: ['ferrous bisglycinate', 'ferrous sulfate'], goals: ['Energy metabolism', 'Red blood cells'], forms: ['Capsule', 'Liquid'], dosage: '18-65 mg daily as directed', evidence: 'strong', price: 16 },
  { name: 'Calcium', category: 'Minerals', description: 'Supports bone mineral density and muscle contraction when dietary calcium intake is insufficient.', goals: ['Bone health', 'Muscle function'], forms: ['Tablet', 'Chewable'], dosage: '500-1200 mg daily from diet and supplements', evidence: 'strong', price: 17 },
  { name: 'Selenium', category: 'Minerals', description: 'Trace mineral involved in thyroid hormone metabolism and antioxidant enzyme systems.', goals: ['Thyroid support', 'Antioxidant support'], forms: ['Capsule', 'Tablet'], dosage: '55-200 mcg daily', evidence: 'moderate', price: 12 },
  { name: 'Iodine', category: 'Minerals', description: 'Essential mineral for thyroid hormone production, especially when iodine intake from food is low.', aliases: ['kelp iodine'], goals: ['Thyroid support'], forms: ['Capsule', 'Liquid'], dosage: '150 mcg daily', evidence: 'strong', price: 11 },
  { name: 'Electrolytes', category: 'Minerals', description: 'Blends sodium, potassium, magnesium, and sometimes calcium for hydration, sweat replacement, and endurance support.', aliases: ['hydration salts'], goals: ['Hydration', 'Endurance'], forms: ['Powder', 'Tablet'], dosage: '1 serving around training or heat exposure', evidence: 'strong', price: 27 },
  { name: 'Omega-3 Fish Oil', category: 'Omega & Fish Oil', description: 'EPA and DHA fatty acids that support heart, brain, eye, and inflammatory balance.', aliases: ['epa', 'dha'], goals: ['Heart health', 'Brain health', 'Inflammatory balance'], forms: ['Softgel', 'Liquid'], dosage: '1000-2000 mg combined EPA/DHA daily', evidence: 'strong', price: 32 },
  { name: 'Krill Oil', category: 'Omega & Fish Oil', description: 'A phospholipid-rich omega-3 source that includes astaxanthin and supports omega-3 intake.', goals: ['Heart health', 'Omega-3 intake'], forms: ['Softgel'], dosage: '500-1000 mg daily', evidence: 'moderate', price: 34 },
  { name: 'Algal Oil', category: 'Omega & Fish Oil', description: 'Vegan EPA and DHA source made from algae for plant-based omega-3 support.', aliases: ['vegan dha'], goals: ['Vegan omega-3', 'Brain health'], forms: ['Softgel'], dosage: '250-1000 mg DHA/EPA daily', evidence: 'strong', price: 30 },
  { name: 'Cod Liver Oil', category: 'Omega & Fish Oil', description: 'Traditional omega-3 oil that also provides naturally occurring vitamins A and D.', goals: ['Omega-3 intake', 'Fat-soluble vitamins'], forms: ['Liquid', 'Softgel'], dosage: '1 serving daily', evidence: 'moderate', price: 26 },
  { name: 'Whey Protein', category: 'Protein', description: 'Fast-digesting complete protein supporting daily protein targets, muscle repair, and lean mass maintenance.', goals: ['Muscle recovery', 'Protein intake'], forms: ['Powder'], dosage: '20-30 g protein per serving', evidence: 'strong', price: 42 },
  { name: 'Casein Protein', category: 'Protein', description: 'Slow-digesting dairy protein often used before longer gaps between meals or overnight.', goals: ['Protein intake', 'Muscle recovery'], forms: ['Powder'], dosage: '20-40 g protein per serving', evidence: 'strong', price: 39 },
  { name: 'Plant Protein', category: 'Protein', description: 'Vegan protein blends using pea, rice, soy, hemp, or seed proteins to support daily protein targets.', aliases: ['pea protein', 'vegan protein'], goals: ['Vegan protein', 'Muscle recovery'], forms: ['Powder'], dosage: '20-30 g protein per serving', evidence: 'strong', price: 36 },
  { name: 'Collagen Peptides', category: 'Protein', description: 'Hydrolyzed collagen peptides used for skin elasticity, connective tissue, and joint comfort routines.', aliases: ['hydrolyzed collagen'], goals: ['Skin health', 'Joint support'], forms: ['Powder', 'Capsule'], dosage: '5-15 g daily', evidence: 'moderate', price: 31 },
  { name: 'Creatine Monohydrate', category: 'Performance', description: 'Well-studied sports nutrition ingredient for strength, power, lean mass, and high-intensity performance.', aliases: ['creatine'], goals: ['Strength', 'Power', 'Lean mass'], forms: ['Powder', 'Capsule'], dosage: '3-5 g daily', evidence: 'strong', price: 24 },
  { name: 'Beta-Alanine', category: 'Performance', description: 'Supports muscle carnosine levels and may improve repeated high-intensity exercise capacity.', goals: ['Endurance', 'High-intensity training'], forms: ['Powder', 'Capsule'], dosage: '3.2-6.4 g daily split doses', evidence: 'strong', price: 22 },
  { name: 'Citrulline Malate', category: 'Performance', description: 'Nitric-oxide-supporting amino acid used for pumps, blood flow, and exercise performance.', aliases: ['l-citrulline'], goals: ['Blood flow', 'Training performance'], forms: ['Powder', 'Capsule'], dosage: '6-8 g before training', evidence: 'moderate', price: 25 },
  { name: 'BCAAs', category: 'Performance', description: 'Branched-chain amino acids used around training, though most useful when total protein is low.', aliases: ['leucine', 'isoleucine', 'valine'], goals: ['Training support'], forms: ['Powder', 'Capsule'], dosage: '5-10 g around training', evidence: 'moderate', price: 28 },
  { name: 'EAAs', category: 'Performance', description: 'Essential amino acids for supporting muscle protein synthesis when complete protein intake is limited.', aliases: ['essential amino acids'], goals: ['Muscle protein synthesis'], forms: ['Powder'], dosage: '8-15 g around training', evidence: 'moderate', price: 34 },
  { name: 'Beetroot', category: 'Performance', description: 'Dietary nitrate source that can support nitric oxide production and endurance performance.', aliases: ['beet root', 'nitrates'], goals: ['Endurance', 'Blood flow'], forms: ['Powder', 'Capsule', 'Shot'], dosage: '400-800 mg nitrate equivalent pre-workout', evidence: 'strong', price: 29 },
  { name: 'Ashwagandha', category: 'Herbs & Adaptogens', description: 'Adaptogenic root used for perceived stress, sleep quality, and resilience routines.', aliases: ['withania somnifera', 'ksm-66', 'sensoril'], goals: ['Stress support', 'Sleep quality'], forms: ['Capsule', 'Powder'], dosage: '300-600 mg extract daily', evidence: 'moderate', price: 23 },
  { name: 'Rhodiola Rosea', category: 'Herbs & Adaptogens', description: 'Adaptogenic herb used for fatigue resistance, stress tolerance, and mental performance support.', aliases: ['rhodiola'], goals: ['Fatigue support', 'Focus'], forms: ['Capsule'], dosage: '200-400 mg extract daily', evidence: 'moderate', price: 24 },
  { name: 'Panax Ginseng', category: 'Herbs & Adaptogens', description: 'Traditional adaptogen used for energy, mental performance, and vitality.', aliases: ['ginseng'], goals: ['Energy', 'Focus'], forms: ['Capsule', 'Tea'], dosage: '200-400 mg extract daily', evidence: 'moderate', price: 27 },
  { name: 'Maca Root', category: 'Herbs & Adaptogens', description: 'Peruvian root powder used for energy, mood, libido, and hormonal wellness routines.', aliases: ['maca'], goals: ['Energy', 'Libido support'], forms: ['Powder', 'Capsule'], dosage: '1.5-3 g daily', evidence: 'emerging', price: 21 },
  { name: 'Turmeric Curcumin', category: 'Herbs & Adaptogens', description: 'Curcuminoid extract used for inflammatory balance, joint comfort, and antioxidant support.', aliases: ['curcumin'], goals: ['Joint comfort', 'Inflammatory balance'], forms: ['Capsule', 'Powder'], dosage: '500-1000 mg extract daily', evidence: 'moderate', price: 26 },
  { name: 'Ginger', category: 'Herbs & Adaptogens', description: 'Root extract used for digestive comfort, nausea support, and inflammatory balance.', goals: ['Digestive comfort', 'Nausea support'], forms: ['Capsule', 'Tea', 'Chew'], dosage: '500-1500 mg daily', evidence: 'strong', price: 14 },
  { name: 'Garlic Extract', category: 'Herbs & Adaptogens', description: 'Aged or standardized garlic extract used in heart health and immune support routines.', aliases: ['aged garlic'], goals: ['Heart health', 'Immune support'], forms: ['Capsule'], dosage: '600-1200 mg daily', evidence: 'moderate', price: 20 },
  { name: 'Milk Thistle', category: 'Herbs & Adaptogens', description: 'Silymarin-rich herb commonly used for liver support and antioxidant defense.', aliases: ['silymarin'], goals: ['Liver support', 'Antioxidant support'], forms: ['Capsule', 'Liquid'], dosage: '150-300 mg silymarin daily', evidence: 'moderate', price: 18 },
  { name: 'Holy Basil', category: 'Herbs & Adaptogens', description: 'Adaptogenic herb used for calm, stress resilience, and metabolic wellness routines.', aliases: ['tulsi'], goals: ['Stress support', 'Calm'], forms: ['Capsule', 'Tea'], dosage: '300-600 mg extract daily', evidence: 'emerging', price: 19 },
  { name: 'Bacopa Monnieri', category: 'Brain & Focus', description: 'Herbal nootropic used for memory, learning, and cognitive performance over sustained use.', aliases: ['bacopa'], goals: ['Memory', 'Learning'], forms: ['Capsule'], dosage: '300 mg standardized extract daily', evidence: 'moderate', price: 25 },
  { name: 'Ginkgo Biloba', category: 'Brain & Focus', description: 'Botanical extract used for cognitive function and circulation support.', aliases: ['ginkgo'], goals: ['Cognitive support', 'Circulation'], forms: ['Capsule'], dosage: '120-240 mg extract daily', evidence: 'moderate', price: 18 },
  { name: "Lion's Mane Mushroom", category: 'Brain & Focus', description: 'Functional mushroom used for cognitive wellness, focus, and nerve growth factor support research interest.', aliases: ['hericium erinaceus'], goals: ['Focus', 'Brain health'], forms: ['Capsule', 'Powder'], dosage: '500-3000 mg daily', evidence: 'emerging', price: 30 },
  { name: 'Alpha-GPC', category: 'Brain & Focus', description: 'Choline donor used for acetylcholine support, focus, and power output research.', aliases: ['alpha glycerylphosphorylcholine'], goals: ['Focus', 'Choline support'], forms: ['Capsule', 'Powder'], dosage: '300-600 mg daily', evidence: 'moderate', price: 29 },
  { name: 'CDP-Choline', category: 'Brain & Focus', description: 'Choline source used for attention, memory, and phospholipid support.', aliases: ['citicoline'], goals: ['Focus', 'Memory'], forms: ['Capsule'], dosage: '250-500 mg daily', evidence: 'moderate', price: 31 },
  { name: 'Phosphatidylserine', category: 'Brain & Focus', description: 'Phospholipid used for cognitive performance, stress response, and memory support.', aliases: ['ps'], goals: ['Memory', 'Stress response'], forms: ['Softgel', 'Capsule'], dosage: '100-300 mg daily', evidence: 'moderate', price: 35 },
  { name: 'L-Theanine', category: 'Amino Acids', description: 'Tea-derived amino acid used for calm focus and smoothing stimulant effects.', aliases: ['theanine'], goals: ['Calm focus', 'Relaxation'], forms: ['Capsule', 'Chewable'], dosage: '100-200 mg as needed', evidence: 'strong', price: 16 },
  { name: 'Glycine', category: 'Amino Acids', description: 'Amino acid used for sleep quality, collagen synthesis support, and calming routines.', goals: ['Sleep quality', 'Relaxation'], forms: ['Powder', 'Capsule'], dosage: '3 g before bed', evidence: 'moderate', price: 15 },
  { name: 'L-Tyrosine', category: 'Amino Acids', description: 'Amino acid precursor for catecholamines, often used during acute stress or demanding cognitive tasks.', aliases: ['tyrosine'], goals: ['Focus under stress'], forms: ['Capsule', 'Powder'], dosage: '500-2000 mg as needed', evidence: 'moderate', price: 17 },
  { name: 'NAC', category: 'Amino Acids', description: 'N-acetyl cysteine supports glutathione production and respiratory antioxidant defense.', aliases: ['n-acetyl cysteine'], goals: ['Antioxidant support', 'Respiratory support'], forms: ['Capsule'], dosage: '600-1200 mg daily', evidence: 'strong', price: 20 },
  { name: 'L-Carnitine', category: 'Amino Acids', description: 'Compound involved in fatty acid transport and studied for exercise, cognition, and metabolic support.', aliases: ['acetyl-l-carnitine', 'alcar'], goals: ['Energy metabolism', 'Brain support'], forms: ['Capsule', 'Liquid'], dosage: '500-2000 mg daily', evidence: 'moderate', price: 24 },
  { name: 'L-Glutamine', category: 'Amino Acids', description: 'Amino acid used for gut barrier, recovery, and high-training-load nutrition support.', aliases: ['glutamine'], goals: ['Gut support', 'Recovery'], forms: ['Powder'], dosage: '5 g daily', evidence: 'moderate', price: 23 },
  { name: 'GABA', category: 'Sleep & Relaxation', description: 'Inhibitory neurotransmitter supplement used for relaxation and sleep routines.', goals: ['Relaxation', 'Sleep support'], forms: ['Capsule', 'Lozenge'], dosage: '100-300 mg as needed', evidence: 'emerging', price: 16 },
  { name: 'Melatonin', category: 'Sleep & Relaxation', description: 'Sleep-timing hormone used for jet lag, circadian rhythm support, and short-term sleep onset help.', goals: ['Sleep timing', 'Jet lag'], forms: ['Tablet', 'Gummy', 'Liquid'], dosage: '0.3-3 mg before bed', evidence: 'strong', price: 12 },
  { name: 'Apigenin', category: 'Sleep & Relaxation', description: 'Chamomile-derived flavone used in relaxation and sleep stacks.', goals: ['Relaxation', 'Sleep quality'], forms: ['Capsule'], dosage: '25-50 mg before bed', evidence: 'emerging', price: 22 },
  { name: 'Valerian Root', category: 'Sleep & Relaxation', description: 'Traditional herb used for relaxation and occasional sleep support.', aliases: ['valerian'], goals: ['Sleep support', 'Relaxation'], forms: ['Capsule', 'Tea'], dosage: '300-600 mg before bed', evidence: 'moderate', price: 16 },
  { name: 'Passionflower', category: 'Sleep & Relaxation', description: 'Botanical used for calm, relaxation, and sleep routines.', goals: ['Calm', 'Sleep support'], forms: ['Capsule', 'Tea', 'Tincture'], dosage: '250-500 mg extract', evidence: 'emerging', price: 18 },
  { name: 'Lemon Balm', category: 'Sleep & Relaxation', description: 'Mint-family herb used for stress support, calm, and occasional sleep support.', aliases: ['melissa officinalis'], goals: ['Calm', 'Stress support'], forms: ['Capsule', 'Tea'], dosage: '300-600 mg extract', evidence: 'emerging', price: 17 },
  { name: 'Probiotics', category: 'Gut Health', description: 'Live microorganisms selected for strain-specific digestive, immune, or microbiome support.', goals: ['Digestive health', 'Microbiome support'], forms: ['Capsule', 'Powder'], dosage: '1-50 billion CFU daily by strain', evidence: 'strong', price: 32 },
  { name: 'Prebiotic Fiber', category: 'Gut Health', description: 'Fermentable fibers that feed beneficial gut microbes and support bowel regularity.', aliases: ['inulin', 'fos'], goals: ['Gut health', 'Regularity'], forms: ['Powder', 'Gummy'], dosage: '3-10 g daily', evidence: 'strong', price: 23 },
  { name: 'Psyllium Husk', category: 'Gut Health', description: 'Soluble fiber used for bowel regularity, cholesterol support, and post-meal glucose moderation.', aliases: ['psyllium'], goals: ['Regularity', 'Heart health'], forms: ['Powder', 'Capsule'], dosage: '5-10 g daily with water', evidence: 'strong', price: 14 },
  { name: 'Digestive Enzymes', category: 'Gut Health', description: 'Enzyme blends used with meals to support digestion of protein, fat, carbohydrates, or lactose.', goals: ['Digestive comfort'], forms: ['Capsule'], dosage: '1 serving with meals', evidence: 'moderate', price: 25 },
  { name: 'Apple Cider Vinegar', category: 'Gut Health', description: 'Vinegar-based supplement used in appetite, digestion, and post-meal glucose routines.', aliases: ['acv'], goals: ['Digestive routine', 'Metabolic support'], forms: ['Liquid', 'Gummy', 'Capsule'], dosage: '1 serving before meals', evidence: 'emerging', price: 15 },
  { name: 'Berberine', category: 'Metabolic', description: 'Plant alkaloid studied for glucose, lipid, and metabolic health support.', goals: ['Glucose support', 'Metabolic health'], forms: ['Capsule'], dosage: '500 mg 1-3 times daily with meals', evidence: 'strong', price: 27 },
  { name: 'Chromium', category: 'Metabolic', description: 'Trace mineral involved in carbohydrate metabolism and insulin signaling.', aliases: ['chromium picolinate'], goals: ['Glucose support'], forms: ['Capsule', 'Tablet'], dosage: '200-1000 mcg daily', evidence: 'moderate', price: 12 },
  { name: 'Cinnamon Extract', category: 'Metabolic', description: 'Botanical extract used for post-meal glucose and metabolic wellness routines.', aliases: ['cinnamomum'], goals: ['Glucose support'], forms: ['Capsule'], dosage: '500-2000 mg daily', evidence: 'moderate', price: 15 },
  { name: 'Myo-Inositol', category: 'Metabolic', description: 'Inositol form used for ovarian, metabolic, and insulin sensitivity support.', aliases: ['inositol'], goals: ['Metabolic health', 'Hormonal support'], forms: ['Powder', 'Capsule'], dosage: '2-4 g daily', evidence: 'strong', price: 24 },
  { name: 'CoQ10', category: 'Heart Health', description: 'Coenzyme involved in mitochondrial energy production and heart health support.', aliases: ['ubiquinone', 'ubiquinol'], goals: ['Heart health', 'Energy'], forms: ['Softgel', 'Capsule'], dosage: '100-300 mg daily with fat', evidence: 'strong', price: 31 },
  { name: 'Nattokinase', category: 'Heart Health', description: 'Enzyme from fermented soy used in circulation and cardiovascular wellness routines.', goals: ['Circulation support'], forms: ['Capsule'], dosage: '100-200 mg daily', evidence: 'emerging', price: 25 },
  { name: 'Resveratrol', category: 'Longevity', description: 'Polyphenol studied for antioxidant pathways, cardiovascular health, and healthy aging research.', goals: ['Healthy aging', 'Antioxidant support'], forms: ['Capsule'], dosage: '100-500 mg daily', evidence: 'moderate', price: 29 },
  { name: 'NMN', category: 'Longevity', description: 'NAD+ precursor used in healthy aging and cellular energy research.', aliases: ['nicotinamide mononucleotide'], goals: ['Healthy aging', 'Cellular energy'], forms: ['Capsule', 'Powder'], dosage: '250-500 mg daily', evidence: 'emerging', price: 48 },
  { name: 'NR', category: 'Longevity', description: 'Nicotinamide riboside is an NAD+ precursor studied for cellular energy and aging biology.', aliases: ['nicotinamide riboside'], goals: ['Healthy aging', 'Cellular energy'], forms: ['Capsule'], dosage: '300-1000 mg daily', evidence: 'moderate', price: 52 },
  { name: 'Spermidine', category: 'Longevity', description: 'Polyamine found in foods and studied for autophagy and healthy aging support.', goals: ['Healthy aging'], forms: ['Capsule'], dosage: '1-6 mg daily', evidence: 'emerging', price: 44 },
  { name: 'PQQ', category: 'Longevity', description: 'Redox cofactor studied for mitochondrial support, often paired with CoQ10.', aliases: ['pyrroloquinoline quinone'], goals: ['Mitochondrial support'], forms: ['Capsule'], dosage: '10-20 mg daily', evidence: 'emerging', price: 34 },
  { name: 'Glucosamine', category: 'Joint & Bone', description: 'Joint-health ingredient used for cartilage support and osteoarthritis symptom routines.', goals: ['Joint comfort', 'Cartilage support'], forms: ['Capsule', 'Tablet'], dosage: '1500 mg daily', evidence: 'strong', price: 21 },
  { name: 'Chondroitin', category: 'Joint & Bone', description: 'Glycosaminoglycan used with glucosamine in joint comfort and cartilage support routines.', goals: ['Joint comfort'], forms: ['Capsule', 'Tablet'], dosage: '800-1200 mg daily', evidence: 'moderate', price: 24 },
  { name: 'MSM', category: 'Joint & Bone', description: 'Sulfur-containing compound used for joint comfort and connective tissue support.', aliases: ['methylsulfonylmethane'], goals: ['Joint comfort'], forms: ['Powder', 'Capsule'], dosage: '1.5-3 g daily', evidence: 'moderate', price: 18 },
  { name: 'Hyaluronic Acid', category: 'Joint & Bone', description: 'Moisture-binding compound used for joint lubrication and skin hydration support.', goals: ['Joint comfort', 'Skin hydration'], forms: ['Capsule', 'Liquid'], dosage: '120-240 mg daily', evidence: 'moderate', price: 26 },
  { name: 'Silica', category: 'Beauty', description: 'Trace mineral source used in hair, skin, nail, and connective tissue routines.', aliases: ['orthosilicic acid'], goals: ['Hair support', 'Skin support'], forms: ['Capsule', 'Liquid'], dosage: '5-20 mg silicon daily', evidence: 'emerging', price: 20 },
  { name: 'Keratin', category: 'Beauty', description: 'Structural protein supplement used for hair and nail strength routines.', goals: ['Hair support', 'Nail support'], forms: ['Capsule'], dosage: '500 mg daily', evidence: 'emerging', price: 28 },
  { name: 'Hemp Seed Oil', category: 'Omega & Fish Oil', description: 'Plant oil source of essential fatty acids used for general wellness and skin support.', goals: ['Essential fatty acids', 'Skin support'], forms: ['Softgel', 'Liquid'], dosage: '1 serving daily', evidence: 'moderate', price: 19 },
  { name: 'MCT Oil', category: 'Metabolic', description: 'Medium-chain triglyceride oil used for quick dietary fat, ketogenic diets, and energy routines.', aliases: ['medium chain triglycerides'], goals: ['Ketogenic support', 'Energy'], forms: ['Oil', 'Powder'], dosage: '1 tbsp daily as tolerated', evidence: 'moderate', price: 24 },
  { name: 'Green Tea Extract', category: 'Metabolic', description: 'Catechin-rich extract used for antioxidant support and metabolic wellness routines.', aliases: ['egcg'], goals: ['Antioxidant support', 'Metabolic support'], forms: ['Capsule'], dosage: '250-500 mg extract daily', evidence: 'moderate', price: 17 },
  { name: 'Quercetin', category: 'Immune Support', description: 'Flavonoid used for antioxidant, immune, and seasonal wellness support.', goals: ['Immune support', 'Antioxidant support'], forms: ['Capsule'], dosage: '500-1000 mg daily', evidence: 'moderate', price: 23 },
  { name: 'Elderberry', category: 'Immune Support', description: 'Berry extract used in seasonal immune support routines.', aliases: ['sambucus'], goals: ['Immune support'], forms: ['Syrup', 'Gummy', 'Capsule'], dosage: '1 serving daily or as directed', evidence: 'moderate', price: 18 },
  { name: 'Echinacea', category: 'Immune Support', description: 'Traditional herb used for seasonal upper respiratory and immune support.', goals: ['Immune support'], forms: ['Capsule', 'Tea', 'Tincture'], dosage: '1 serving as directed', evidence: 'moderate', price: 16 },
  { name: 'Reishi Mushroom', category: 'Herbs & Adaptogens', description: 'Functional mushroom used for immune support, stress balance, and sleep routines.', aliases: ['ganoderma'], goals: ['Immune support', 'Stress support'], forms: ['Capsule', 'Powder'], dosage: '500-1500 mg daily', evidence: 'emerging', price: 29 },
  { name: 'Cordyceps', category: 'Performance', description: 'Functional mushroom used for endurance, oxygen utilization, and energy support routines.', goals: ['Endurance', 'Energy'], forms: ['Capsule', 'Powder'], dosage: '1000-3000 mg daily', evidence: 'emerging', price: 31 },
  { name: 'Chaga Mushroom', category: 'Immune Support', description: 'Functional mushroom used for antioxidant and immune wellness routines.', goals: ['Antioxidant support', 'Immune support'], forms: ['Powder', 'Capsule'], dosage: '500-1500 mg daily', evidence: 'emerging', price: 28 },
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function shopifyGid(type: 'Product' | 'ProductVariant', id: string) {
  return `gid://shopify/${type}/${id}`;
}

function shopifyImage(path: string) {
  return path.startsWith('//') ? `https:${path}` : path;
}

type CuratedProductSeed = Omit<Product, 'supplement_id' | 'supplements'> & {
  supplement_name: string;
};

const curatedProductSeeds: CuratedProductSeed[] = [
  {
    product_id: 'real-on-gold-standard-100-whey',
    product_name: 'Gold Standard 100% Whey',
    product_description:
      'Optimum Nutrition whey protein powder for gym stacks built around daily protein targets, post-training shakes, and refill-ready pantry staples.',
    product_price: 54.99,
    product_url: 'https://www.optimumnutrition.com/en-us/products/gold-standard-100-whey-protein-powder',
    amazon_url: '',
    product_image: shopifyImage('//cdn.shopify.com/s/files/1/0794/9991/9627/files/on-1111968_Image_01.png?v=1756452646'),
    servings_per_container: 29,
    servings_per_day: 1,
    brand_id: 'optimum-nutrition',
    brands: { brand_name: 'Optimum Nutrition' },
    supplement_name: 'Whey Protein',
    shopify_product_gid: shopifyGid('Product', '10686370677003'),
    shopify_variant_gid: shopifyGid('ProductVariant', '52138905501963'),
    shopify_store_domain: 'www.optimumnutrition.com',
    commerce_channel: 'shopify',
    ucp_enabled: true,
    inventory_status: 'in_stock',
    quality_badges: ['24g protein', 'Shopify UCP', 'Gym staple'],
    subscriptions_available: true,
    data_source: 'manual',
  },
  {
    product_id: 'real-transparent-labs-whey-isolate',
    product_name: 'Grass-Fed Whey Protein Isolate',
    product_description:
      'A whey isolate pick for protein-forward stacks where shoppers want a lean formula, clear flavor choice, and direct brand checkout path.',
    product_price: 59.99,
    product_url: 'https://www.transparentlabs.com/products/whey-protein-isolate',
    amazon_url: '',
    product_image: shopifyImage('//cdn.shopify.com/s/files/1/0866/7664/files/01_chocolate.png?v=1778514112'),
    servings_per_container: 30,
    servings_per_day: 1,
    brand_id: 'transparent-labs',
    brands: { brand_name: 'Transparent Labs' },
    supplement_name: 'Whey Protein',
    shopify_product_gid: shopifyGid('Product', '1994224707'),
    shopify_variant_gid: shopifyGid('ProductVariant', '39366090752093'),
    shopify_store_domain: 'www.transparentlabs.com',
    commerce_channel: 'shopify',
    ucp_enabled: true,
    inventory_status: 'in_stock',
    quality_badges: ['Whey isolate', 'Shopify UCP', 'No artificial sweeteners'],
    subscriptions_available: true,
    data_source: 'manual',
  },
  {
    product_id: 'real-myprotein-impact-whey',
    product_name: 'Impact Whey Protein',
    product_description:
      'A value-oriented whey protein option for shoppers comparing flavors, price per serving, and high-frequency shake refills.',
    product_price: 14.99,
    product_url: 'https://us.myprotein.com/p/sports-nutrition/impact-whey-protein/10852500/',
    amazon_url: '',
    product_image:
      'https://main.thgimages.com?url=https://static.thcdn.com/productimg/original/10852500-1615304620165133.jpg&format=webp&width=1500&height=1500&fit=cover',
    servings_per_container: 20,
    servings_per_day: 1,
    brand_id: 'myprotein',
    brands: { brand_name: 'Myprotein' },
    supplement_name: 'Whey Protein',
    commerce_channel: 'official',
    ucp_enabled: false,
    inventory_status: 'in_stock',
    quality_badges: ['22g protein', 'Flavor range', 'Value pick'],
    subscriptions_available: true,
    data_source: 'manual',
  },
  {
    product_id: 'real-brainmd-omni-protein',
    product_name: 'OMNI Protein',
    product_description:
      'Plant protein powder for recovery stacks that need a non-dairy protein base with fiber and digestive enzyme support.',
    product_price: 59.95,
    product_url: 'https://brainmd.com/products/omni-protein-powder',
    amazon_url: '',
    product_image: shopifyImage('//cdn.shopify.com/s/files/1/0696/2656/0681/files/OMNIProtein_PDPImage1.png?v=1766438435'),
    servings_per_container: 20,
    servings_per_day: 1,
    brand_id: 'brainmd',
    brands: { brand_name: 'BrainMD' },
    supplement_name: 'Plant Protein',
    shopify_product_gid: shopifyGid('Product', '8758710763689'),
    shopify_variant_gid: shopifyGid('ProductVariant', '46503066501289'),
    shopify_store_domain: 'brainmd.com',
    commerce_channel: 'shopify',
    ucp_enabled: true,
    inventory_status: 'in_stock',
    quality_badges: ['Plant protein', 'Shopify UCP', 'Recovery stack'],
    subscriptions_available: true,
    data_source: 'manual',
  },
  {
    product_id: 'real-on-micronized-creatine',
    product_name: 'Micronized Creatine Powder',
    product_description:
      'Creatine monohydrate powder for strength, power, and repeatable daily performance stacks.',
    product_price: 19.99,
    product_url: 'https://www.optimumnutrition.com/en-us/products/creatine-monohydrate-micronized-powder',
    amazon_url: '',
    product_image: shopifyImage('//cdn.shopify.com/s/files/1/0794/9991/9627/files/on-1153060_Image_01.png?v=1769135392'),
    servings_per_container: 60,
    servings_per_day: 1,
    brand_id: 'optimum-nutrition',
    brands: { brand_name: 'Optimum Nutrition' },
    supplement_name: 'Creatine Monohydrate',
    shopify_product_gid: shopifyGid('Product', '10677190787339'),
    shopify_variant_gid: shopifyGid('ProductVariant', '52106231283979'),
    shopify_store_domain: 'www.optimumnutrition.com',
    commerce_channel: 'shopify',
    ucp_enabled: true,
    inventory_status: 'in_stock',
    quality_badges: ['5g creatine', 'Shopify UCP', 'Strength stack'],
    subscriptions_available: true,
    data_source: 'manual',
  },
  {
    product_id: 'real-create-creatine-gummies',
    product_name: 'Core Creatine Monohydrate Gummies',
    product_description:
      'Creatine gummies for shoppers who want a portable, no-scoop creatine habit inside a strength or gym-bag stack.',
    product_price: 159,
    product_url: 'https://trycreate.co/products/core-latest-product',
    amazon_url: '',
    product_image: shopifyImage('//cdn.shopify.com/s/files/1/0611/9204/4732/files/Core_HighFive_450Ct_Main.jpg?v=1757512554'),
    servings_per_container: 90,
    servings_per_day: 1,
    brand_id: 'create-wellness',
    brands: { brand_name: 'Create' },
    supplement_name: 'Creatine Monohydrate',
    shopify_product_gid: shopifyGid('Product', '14612124762484'),
    shopify_variant_gid: shopifyGid('ProductVariant', '51620901060980'),
    shopify_store_domain: 'trycreate.co',
    commerce_channel: 'shopify',
    ucp_enabled: true,
    inventory_status: 'in_stock',
    quality_badges: ['Creatine gummies', 'Shopify UCP', 'Portable'],
    subscriptions_available: true,
    data_source: 'manual',
  },
  {
    product_id: 'real-create-creatine-electrolytes',
    product_name: 'Creatine + Electrolytes Mix',
    product_description:
      'Training hydration mix that pairs creatine with electrolytes for sweaty sessions, travel lifts, and repeatable refill routines.',
    product_price: 60,
    product_url: 'https://trycreate.co/products/creatine-electrolytes-mix',
    amazon_url: '',
    product_image: shopifyImage('//cdn.shopify.com/s/files/1/0611/9204/4732/files/Creatine-Single-Serve-Watermnelon-TP.png?v=1774651125'),
    servings_per_container: 30,
    servings_per_day: 1,
    brand_id: 'create-wellness',
    brands: { brand_name: 'Create' },
    supplement_name: 'Electrolytes',
    shopify_product_gid: shopifyGid('Product', '14971655291252'),
    shopify_variant_gid: shopifyGid('ProductVariant', '54065511104884'),
    shopify_store_domain: 'trycreate.co',
    commerce_channel: 'shopify',
    ucp_enabled: true,
    inventory_status: 'in_stock',
    quality_badges: ['Hydration', 'Shopify UCP', 'Training mix'],
    subscriptions_available: true,
    data_source: 'manual',
  },
  {
    product_id: 'real-on-gold-standard-pre-workout',
    product_name: 'Gold Standard Pre-Workout',
    product_description:
      'Pre-workout powder for energy, focus, and high-intensity training stacks with a direct Shopify discovery path.',
    product_price: 26.99,
    product_url: 'https://www.optimumnutrition.com/en-us/products/gold-standard-pre-workout-powder',
    amazon_url: '',
    product_image: shopifyImage('//cdn.shopify.com/s/files/1/0794/9991/9627/files/on-1146471_Image_01.png?v=1755790955'),
    servings_per_container: 30,
    servings_per_day: 1,
    brand_id: 'optimum-nutrition',
    brands: { brand_name: 'Optimum Nutrition' },
    supplement_name: 'Beta-Alanine',
    shopify_product_gid: shopifyGid('Product', '10677190131979'),
    shopify_variant_gid: shopifyGid('ProductVariant', '52106232103179'),
    shopify_store_domain: 'www.optimumnutrition.com',
    commerce_channel: 'shopify',
    ucp_enabled: true,
    inventory_status: 'in_stock',
    quality_badges: ['Pre-workout', 'Shopify UCP', 'Training energy'],
    subscriptions_available: true,
    data_source: 'manual',
  },
  {
    product_id: 'real-gruns-superfood-gummies',
    product_name: 'Gruns Superfood Gummies',
    product_description:
      'A gummy micronutrient pack for shoppers who still want a broad daily slot alongside protein, creatine, and training-day products.',
    product_price: 79.99,
    product_url: 'https://gruns.co/products/gruns',
    amazon_url: '',
    product_image: shopifyImage('//cdn.shopify.com/s/files/1/0550/9614/8034/files/1_Adult_LowSugar.webp?v=1768423690'),
    servings_per_container: 28,
    servings_per_day: 1,
    brand_id: 'gruns',
    brands: { brand_name: 'Gruns' },
    supplement_name: 'Multivitamin',
    shopify_product_gid: shopifyGid('Product', '7362502557762'),
    shopify_variant_gid: shopifyGid('ProductVariant', '41720671830082'),
    shopify_store_domain: 'gruns.co',
    commerce_channel: 'shopify',
    ucp_enabled: true,
    inventory_status: 'in_stock',
    quality_badges: ['Daily pack', 'Shopify UCP', 'Refill-ready'],
    subscriptions_available: true,
    data_source: 'manual',
  },
];

function findCuratedSeedByProductId(productId: string) {
  return curatedProductSeeds.find((product) => product.product_id === productId) ?? null;
}

function createCuratedProduct(seed: CuratedProductSeed, supplement: Supplement): Product {
  return {
    ...seed,
    supplement_id: supplement.supplement_id,
    supplements: {
      supplement_id: supplement.supplement_id,
      supplement_name: supplement.supplement_name,
    },
  };
}

function createCuratedProductsForSupplement(supplement: Supplement): Product[] {
  return curatedProductSeeds
    .filter((product) => product.supplement_name.toLowerCase() === supplement.supplement_name.toLowerCase())
    .map((product) => createCuratedProduct(product, supplement));
}

function categoryImage(category: string) {
  const imageByCategory: Record<string, string> = {
    Vitamins: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=640&h=480&fit=crop',
    Minerals: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=640&h=480&fit=crop',
    'Omega & Fish Oil': 'https://images.unsplash.com/photo-1535185384036-28bbc8035f28?w=640&h=480&fit=crop',
    Protein: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=640&h=480&fit=crop',
    Performance: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640&h=480&fit=crop',
    'Herbs & Adaptogens': 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=640&h=480&fit=crop',
    'Brain & Focus': 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=640&h=480&fit=crop',
    'Amino Acids': 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=640&h=480&fit=crop',
    'Sleep & Relaxation': 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=640&h=480&fit=crop',
    'Gut Health': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=640&h=480&fit=crop',
    Metabolic: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=640&h=480&fit=crop',
    'Heart Health': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=640&h=480&fit=crop',
    Longevity: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=640&h=480&fit=crop',
    'Joint & Bone': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=640&h=480&fit=crop',
    Beauty: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=640&h=480&fit=crop',
    'Immune Support': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=640&h=480&fit=crop',
  };

  return imageByCategory[category] ?? imageByCategory.Vitamins;
}

export const supplementCatalog: Supplement[] = seeds.map((seed, index) => ({
  supplement_id: CATALOG_START_ID + index,
  supplement_name: seed.name,
  supplement_description: seed.description,
  image_url: categoryImage(seed.category),
  category: seed.category,
  aliases: seed.aliases,
  evidence_rating: seed.evidence,
  primary_goals: seed.goals,
  typical_forms: seed.forms,
  common_dosage: seed.dosage,
  product_count: 12 + (index % 11) * 3,
  average_price: seed.price,
}));

export function mergeSupplementCatalog(databaseSupplements: Supplement[]) {
  const byName = new Map<string, Supplement>();

  supplementCatalog.forEach((supplement) => {
    byName.set(supplement.supplement_name.toLowerCase(), supplement);
  });

  databaseSupplements.forEach((supplement) => {
    const catalogMatch = byName.get(supplement.supplement_name.toLowerCase());
    byName.set(supplement.supplement_name.toLowerCase(), {
      ...catalogMatch,
      ...supplement,
      aliases: supplement.aliases ?? catalogMatch?.aliases,
      evidence_rating: supplement.evidence_rating ?? catalogMatch?.evidence_rating,
      primary_goals: supplement.primary_goals ?? catalogMatch?.primary_goals,
      typical_forms: supplement.typical_forms ?? catalogMatch?.typical_forms,
      common_dosage: supplement.common_dosage ?? catalogMatch?.common_dosage,
      product_count: supplement.product_count ?? catalogMatch?.product_count,
      average_price: supplement.average_price ?? catalogMatch?.average_price,
    });
  });

  return Array.from(byName.values());
}

export function findCatalogSupplementById(id: number) {
  return supplementCatalog.find((supplement) => supplement.supplement_id === id);
}

export function findCatalogSupplementByProductId(productId: string) {
  const curatedSeed = findCuratedSeedByProductId(productId);
  if (curatedSeed) {
    return supplementCatalog.find((supplement) => supplement.supplement_name === curatedSeed.supplement_name) ?? null;
  }

  const [, supplementSlug] = productId.match(/^catalog-(.+)-(essential|premium|subscription)$/) ?? [];
  if (!supplementSlug) return null;

  return supplementCatalog.find((supplement) => slugify(supplement.supplement_name) === supplementSlug) ?? null;
}

export function createCatalogProductsForSupplement(supplement: Supplement): Product[] {
  const curatedProducts = createCuratedProductsForSupplement(supplement);
  if (curatedProducts.length > 0) return curatedProducts;

  const slug = slugify(supplement.supplement_name);
  const brandBase = supplement.category?.split(' ')[0] || 'SuppStack';
  const price = supplement.average_price ?? 24;

  return [
    {
      product_id: `catalog-${slug}-essential`,
      product_name: `${supplement.supplement_name} Daily Essential`,
      product_description: `A straightforward ${supplement.supplement_name} option for shoppers comparing verified Shopify merchants.`,
      product_price: Math.max(9, price - 5),
      product_url: `https://www.shopify.com/search?q=${encodeURIComponent(supplement.supplement_name)}`,
      amazon_url: '',
      product_image: supplement.image_url || '',
      servings_per_container: 60,
      servings_per_day: 1,
      supplement_id: supplement.supplement_id,
      brand_id: 'catalog',
      brands: { brand_name: `${brandBase} Labs` },
      supplements: { supplement_id: supplement.supplement_id, supplement_name: supplement.supplement_name },
      commerce_channel: 'shopify',
      ucp_enabled: false,
      inventory_status: 'in_stock',
      quality_badges: ['Third-party tested', 'Clear label'],
      subscriptions_available: true,
      data_source: 'catalog_fallback',
    },
    {
      product_id: `catalog-${slug}-premium`,
      product_name: `${supplement.supplement_name} Clinical Grade`,
      product_description: `A higher-spec ${supplement.supplement_name} product profile for users who prioritize testing, form, and serving transparency.`,
      product_price: price + 8,
      product_url: `https://www.shopify.com/search?q=${encodeURIComponent(`${supplement.supplement_name} clinical grade`)}`,
      amazon_url: '',
      product_image: supplement.image_url || '',
      servings_per_container: 90,
      servings_per_day: 1,
      supplement_id: supplement.supplement_id,
      brand_id: 'catalog',
      brands: { brand_name: `${brandBase} Research` },
      supplements: { supplement_id: supplement.supplement_id, supplement_name: supplement.supplement_name },
      commerce_channel: 'shopify',
      ucp_enabled: false,
      inventory_status: 'in_stock',
      quality_badges: ['GMP facility', 'Batch tested'],
      subscriptions_available: true,
      data_source: 'catalog_fallback',
    },
    {
      product_id: `catalog-${slug}-subscription`,
      product_name: `${supplement.supplement_name} Refill Plan`,
      product_description: `A subscription-friendly ${supplement.supplement_name} listing designed around repeat ordering and monthly adherence.`,
      product_price: Math.max(8, price - 2),
      product_url: `https://www.shopify.com/search?q=${encodeURIComponent(`${supplement.supplement_name} subscription`)}`,
      amazon_url: '',
      product_image: supplement.image_url || '',
      servings_per_container: 30,
      servings_per_day: 1,
      supplement_id: supplement.supplement_id,
      brand_id: 'catalog',
      brands: { brand_name: `${brandBase} Supply` },
      supplements: { supplement_id: supplement.supplement_id, supplement_name: supplement.supplement_name },
      commerce_channel: 'shopify',
      ucp_enabled: false,
      inventory_status: 'in_stock',
      quality_badges: ['Subscribe and save', 'Easy reorder'],
      subscriptions_available: true,
      data_source: 'catalog_fallback',
    },
  ];
}

export function findCatalogProductById(productId: string) {
  const supplement = findCatalogSupplementByProductId(productId);
  if (!supplement) return null;

  return createCatalogProductsForSupplement(supplement).find((product) => product.product_id === productId) ?? null;
}
