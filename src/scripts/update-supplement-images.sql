-- Update supplement images and categories
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ftjnxqyvqhpawsipfkay/sql

-- Vitamins
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop', category = 'Vitamins' WHERE supplement_name = 'Vitamin D3';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400&h=300&fit=crop', category = 'Vitamins' WHERE supplement_name = 'Vitamin C';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop', category = 'Vitamins' WHERE supplement_name = 'B-Complex';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop', category = 'Vitamins' WHERE supplement_name = 'Vitamin B12';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop', category = 'Vitamins' WHERE supplement_name = 'Vitamin A';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop', category = 'Vitamins' WHERE supplement_name = 'Vitamin E';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop', category = 'Vitamins' WHERE supplement_name = 'Vitamin K2';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop', category = 'Vitamins' WHERE supplement_name = 'Folate/Folic Acid';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop', category = 'Vitamins' WHERE supplement_name = 'Biotin';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop', category = 'Vitamins' WHERE supplement_name = 'Niacin (Vitamin B3)';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop', category = 'Vitamins' WHERE supplement_name = 'Vitamin B6';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop', category = 'Vitamins' WHERE supplement_name = 'Multivitamin';

-- Minerals
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop', category = 'Minerals' WHERE supplement_name = 'Magnesium';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop', category = 'Minerals' WHERE supplement_name = 'Zinc';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop', category = 'Minerals' WHERE supplement_name = 'Iron';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop', category = 'Minerals' WHERE supplement_name = 'Calcium';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop', category = 'Minerals' WHERE supplement_name = 'Potassium';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop', category = 'Minerals' WHERE supplement_name = 'Selenium';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop', category = 'Minerals' WHERE supplement_name = 'Chromium';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop', category = 'Minerals' WHERE supplement_name = 'Copper';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop', category = 'Minerals' WHERE supplement_name = 'Iodine';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop', category = 'Minerals' WHERE supplement_name = 'Boron';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop', category = 'Minerals' WHERE supplement_name = 'Manganese';

-- Omega Fatty Acids
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1535185384036-28bbc8035f28?w=400&h=300&fit=crop', category = 'Omega Fatty Acids' WHERE supplement_name = 'Omega-3 Fish Oil';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1535185384036-28bbc8035f28?w=400&h=300&fit=crop', category = 'Omega Fatty Acids' WHERE supplement_name = 'Krill Oil';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1535185384036-28bbc8035f28?w=400&h=300&fit=crop', category = 'Omega Fatty Acids' WHERE supplement_name = 'Algal Oil';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1535185384036-28bbc8035f28?w=400&h=300&fit=crop', category = 'Omega Fatty Acids' WHERE supplement_name = 'Cod Liver Oil';

-- Herbs & Adaptogens
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Ashwagandha';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Turmeric/Curcumin';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Rhodiola Rosea';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Ginseng';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Lion''s Mane Mushroom';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Reishi Mushroom';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Cordyceps';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Maca Root';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Ginkgo Biloba';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Bacopa Monnieri';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Holy Basil (Tulsi)';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Milk Thistle';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Elderberry';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Echinacea';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Valerian Root';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'St. John''s Wort';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Saw Palmetto';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Black Seed Oil';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Berberine';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Tongkat Ali';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop', category = 'Herbs & Adaptogens' WHERE supplement_name = 'Fenugreek';

-- Amino Acids
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400&h=300&fit=crop', category = 'Amino Acids' WHERE supplement_name = 'L-Theanine';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400&h=300&fit=crop', category = 'Amino Acids' WHERE supplement_name = 'L-Glutamine';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400&h=300&fit=crop', category = 'Amino Acids' WHERE supplement_name = 'L-Carnitine';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400&h=300&fit=crop', category = 'Amino Acids' WHERE supplement_name = 'L-Tyrosine';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400&h=300&fit=crop', category = 'Amino Acids' WHERE supplement_name = 'L-Arginine';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400&h=300&fit=crop', category = 'Amino Acids' WHERE supplement_name = 'L-Citrulline';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400&h=300&fit=crop', category = 'Amino Acids' WHERE supplement_name = 'Glycine';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400&h=300&fit=crop', category = 'Amino Acids' WHERE supplement_name = 'Taurine';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400&h=300&fit=crop', category = 'Amino Acids' WHERE supplement_name = 'GABA';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400&h=300&fit=crop', category = 'Amino Acids' WHERE supplement_name = '5-HTP';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400&h=300&fit=crop', category = 'Amino Acids' WHERE supplement_name = 'NAC (N-Acetyl Cysteine)';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400&h=300&fit=crop', category = 'Amino Acids' WHERE supplement_name = 'BCAAs';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400&h=300&fit=crop', category = 'Amino Acids' WHERE supplement_name = 'EAAs';

-- Protein & Performance
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop', category = 'Protein & Performance' WHERE supplement_name = 'Protein Powder';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop', category = 'Protein & Performance' WHERE supplement_name = 'Whey Protein';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop', category = 'Protein & Performance' WHERE supplement_name = 'Casein Protein';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop', category = 'Protein & Performance' WHERE supplement_name = 'Plant Protein';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', category = 'Protein & Performance' WHERE supplement_name = 'Creatine Monohydrate';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', category = 'Protein & Performance' WHERE supplement_name = 'Beta-Alanine';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', category = 'Protein & Performance' WHERE supplement_name = 'Citrulline Malate';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', category = 'Protein & Performance' WHERE supplement_name = 'Pre-Workout';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', category = 'Protein & Performance' WHERE supplement_name = 'HMB';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', category = 'Protein & Performance' WHERE supplement_name = 'Beetroot Powder';

-- Gut Health
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop', category = 'Gut Health' WHERE supplement_name = 'Probiotics';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop', category = 'Gut Health' WHERE supplement_name = 'Prebiotics';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop', category = 'Gut Health' WHERE supplement_name = 'Digestive Enzymes';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop', category = 'Gut Health' WHERE supplement_name = 'Psyllium Husk';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop', category = 'Gut Health' WHERE supplement_name = 'Apple Cider Vinegar';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop', category = 'Gut Health' WHERE supplement_name = 'Ginger Root';

-- Joint & Bone
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', category = 'Joint & Bone' WHERE supplement_name = 'Glucosamine';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', category = 'Joint & Bone' WHERE supplement_name = 'Chondroitin';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', category = 'Joint & Bone' WHERE supplement_name = 'MSM';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', category = 'Joint & Bone' WHERE supplement_name = 'Collagen';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', category = 'Joint & Bone' WHERE supplement_name = 'Hyaluronic Acid';

-- Heart Health
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop', category = 'Heart Health' WHERE supplement_name = 'CoQ10';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop', category = 'Heart Health' WHERE supplement_name = 'Nattokinase';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2f89?w=400&h=300&fit=crop', category = 'Heart Health' WHERE supplement_name = 'Garlic Extract';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop', category = 'Heart Health' WHERE supplement_name = 'Red Yeast Rice';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop', category = 'Heart Health' WHERE supplement_name = 'Hawthorn Berry';

-- Brain & Focus
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop', category = 'Brain & Focus' WHERE supplement_name = 'Alpha-GPC';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop', category = 'Brain & Focus' WHERE supplement_name = 'Phosphatidylserine';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop', category = 'Brain & Focus' WHERE supplement_name = 'Acetyl-L-Carnitine';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop', category = 'Brain & Focus' WHERE supplement_name = 'CDP-Choline';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1535185384036-28bbc8035f28?w=400&h=300&fit=crop', category = 'Brain & Focus' WHERE supplement_name = 'Omega-3 DHA';

-- Sleep & Relaxation
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop', category = 'Sleep & Relaxation' WHERE supplement_name = 'Melatonin';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop', category = 'Sleep & Relaxation' WHERE supplement_name = 'Magnesium Glycinate';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop', category = 'Sleep & Relaxation' WHERE supplement_name = 'Passionflower';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop', category = 'Sleep & Relaxation' WHERE supplement_name = 'Lemon Balm';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop', category = 'Sleep & Relaxation' WHERE supplement_name = 'Chamomile';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop', category = 'Sleep & Relaxation' WHERE supplement_name = 'Apigenin';

-- Beauty & Skin
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop', category = 'Beauty & Skin' WHERE supplement_name = 'Collagen Peptides';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop', category = 'Beauty & Skin' WHERE supplement_name = 'Keratin';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop', category = 'Beauty & Skin' WHERE supplement_name = 'Astaxanthin';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop', category = 'Beauty & Skin' WHERE supplement_name = 'Silica';

-- Hormonal & Specialty
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=300&fit=crop', category = 'Hormonal & Specialty' WHERE supplement_name = 'DIM';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=300&fit=crop', category = 'Hormonal & Specialty' WHERE supplement_name = 'Vitamin D + K2';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=300&fit=crop', category = 'Hormonal & Specialty' WHERE supplement_name = 'DHEA';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=300&fit=crop', category = 'Hormonal & Specialty' WHERE supplement_name = 'Pregnenolone';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=300&fit=crop', category = 'Hormonal & Specialty' WHERE supplement_name = 'Shilajit';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=300&fit=crop', category = 'Hormonal & Specialty' WHERE supplement_name = 'Pine Bark Extract';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=300&fit=crop', category = 'Hormonal & Specialty' WHERE supplement_name = 'Quercetin';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=300&fit=crop', category = 'Hormonal & Specialty' WHERE supplement_name = 'Resveratrol';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=300&fit=crop', category = 'Hormonal & Specialty' WHERE supplement_name = 'PQQ';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop', category = 'Hormonal & Specialty' WHERE supplement_name = 'Chlorophyll';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop', category = 'Hormonal & Specialty' WHERE supplement_name = 'Spirulina';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop', category = 'Hormonal & Specialty' WHERE supplement_name = 'Chlorella';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop', category = 'Hormonal & Specialty' WHERE supplement_name = 'Moringa';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop', category = 'Hormonal & Specialty' WHERE supplement_name = 'Sea Moss';
UPDATE supplements SET image_url = 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop', category = 'Hormonal & Specialty' WHERE supplement_name = 'Electrolytes';
