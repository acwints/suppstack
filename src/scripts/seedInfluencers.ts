import { supabase } from '../app/supabase';

interface InfluencerData {
  username: string;
  display_name: string;
  bio: string;
  profile_image: string;
  website?: string;
  twitter_handle?: string;
  instagram_handle?: string;
  youtube_channel?: string;
  is_featured: boolean;
  is_influencer: boolean;
  is_verified: boolean;
  follower_count: number;
  stacks: StackData[];
}

interface StackData {
  stack_name: string;
  stack_description: string;
  stack_image?: string;
  is_featured: boolean;
  is_verified: boolean;
  source_title: string;
  source_url: string;
  source_type: string;
  source_date: string;
  supplements: SupplementData[];
}

interface SupplementData {
  supplement_name: string;
  dosage?: string;
  frequency?: string;
  timing?: string;
  notes?: string;
  is_core: boolean;
  order_index: number;
}

const influencerData: InfluencerData[] = [
  {
    username: 'joerogan',
    display_name: 'Joe Rogan',
    bio: 'Comedian, podcaster, and UFC commentator. Host of The Joe Rogan Experience.',
    profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    website: 'https://www.joerogan.com',
    twitter_handle: 'joerogan',
    instagram_handle: 'joerogan',
    youtube_channel: 'https://www.youtube.com/channel/UCzQUP1qoWDoEbmsQxvdjxgQ',
    is_featured: true,
    is_influencer: true,
    is_verified: false, // Not authenticated on our platform
    follower_count: 15000000,
    stacks: [
      {
        stack_name: "Joe's Daily Stack",
        stack_description: "Joe Rogan's comprehensive daily supplement routine for optimal health and performance.",
        is_featured: true,
        is_verified: false,
        source_title: "Joe Rogan's Supplement Stack - JRE #1873",
        source_url: "https://www.youtube.com/watch?v=example",
        source_type: "podcast",
        source_date: "2024-01-15",
        supplements: [
          {
            supplement_name: "Vitamin D3",
            dosage: "4000 IU",
            frequency: "Daily",
            timing: "morning",
            notes: "For immune support and mood",
            is_core: true,
            order_index: 1
          },
          {
            supplement_name: "Omega-3",
            dosage: "2g",
            frequency: "Daily",
            timing: "morning",
            notes: "Fish oil for brain health",
            is_core: true,
            order_index: 2
          },
          {
            supplement_name: "B-Complex",
            dosage: "1 capsule",
            frequency: "Daily",
            timing: "morning",
            notes: "Energy and nervous system support",
            is_core: true,
            order_index: 3
          },
          {
            supplement_name: "Creatine",
            dosage: "5g",
            frequency: "Daily",
            timing: "pre-workout",
            notes: "For strength and power",
            is_core: true,
            order_index: 4
          },
          {
            supplement_name: "Alpha-GPC",
            dosage: "300mg",
            frequency: "Daily",
            timing: "morning",
            notes: "Cognitive enhancement",
            is_core: false,
            order_index: 5
          }
        ]
      }
    ]
  },
  {
    username: 'timferriss',
    display_name: 'Tim Ferriss',
    bio: 'Author of The 4-Hour Workweek, entrepreneur, and human optimization expert.',
    profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    website: 'https://tim.blog',
    twitter_handle: 'tferriss',
    instagram_handle: 'timferriss',
    is_featured: true,
    is_influencer: true,
    is_verified: false,
    follower_count: 2000000,
    stacks: [
      {
        stack_name: "Tim's Morning Stack",
        stack_description: "Tim Ferriss's optimized morning supplement routine for productivity and focus.",
        is_featured: true,
        is_verified: false,
        source_title: "The Tim Ferriss Show - My Current Supplement Stack",
        source_url: "https://tim.blog/supplement-stack/",
        source_type: "article",
        source_date: "2024-02-10",
        supplements: [
          {
            supplement_name: "Magnesium",
            dosage: "400mg",
            frequency: "Daily",
            timing: "evening",
            notes: "Better sleep and recovery",
            is_core: true,
            order_index: 1
          },
          {
            supplement_name: "Vitamin C",
            dosage: "1000mg",
            frequency: "Daily",
            timing: "morning",
            notes: "Immune system support",
            is_core: true,
            order_index: 2
          },
          {
            supplement_name: "Zinc",
            dosage: "15mg",
            frequency: "Daily",
            timing: "evening",
            notes: "Immune and hormonal support",
            is_core: true,
            order_index: 3
          },
          {
            supplement_name: "Ashwagandha",
            dosage: "600mg",
            frequency: "Daily",
            timing: "evening",
            notes: "Stress reduction and cortisol management",
            is_core: false,
            order_index: 4
          }
        ]
      }
    ]
  },
  {
    username: 'andrewhuberman',
    display_name: 'Andrew Huberman',
    bio: 'Neuroscientist at Stanford University. Host of the Huberman Lab podcast.',
    profile_image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    website: 'https://hubermanlab.com',
    twitter_handle: 'hubermanlab',
    instagram_handle: 'hubermanlab',
    youtube_channel: 'https://www.youtube.com/channel/UC2D2CMWXMOVWx7giW1n3LIg',
    is_featured: true,
    is_influencer: true,
    is_verified: false,
    follower_count: 3500000,
    stacks: [
      {
        stack_name: "Huberman's Sleep Stack",
        stack_description: "Andrew Huberman's science-based supplement protocol for optimal sleep quality.",
        is_featured: true,
        is_verified: false,
        source_title: "Master Your Sleep - Huberman Lab Podcast #2",
        source_url: "https://www.youtube.com/watch?v=nm1TxQj9IsQ",
        source_type: "youtube",
        source_date: "2024-01-08",
        supplements: [
          {
            supplement_name: "Magnesium",
            dosage: "300-400mg",
            frequency: "Daily",
            timing: "evening",
            notes: "Magnesium bisglycinate for better absorption",
            is_core: true,
            order_index: 1
          },
          {
            supplement_name: "Omega-3",
            dosage: "1-2g EPA",
            frequency: "Daily",
            timing: "morning",
            notes: "High EPA content for mood and cognition",
            is_core: true,
            order_index: 2
          },
          {
            supplement_name: "Vitamin D3",
            dosage: "5000 IU",
            frequency: "Daily",
            timing: "morning",
            notes: "With K2 for optimal absorption",
            is_core: true,
            order_index: 3
          }
        ]
      },
      {
        stack_name: "Huberman's Focus Stack",
        stack_description: "Evidence-based supplements for enhanced focus and cognitive performance.",
        is_featured: true,
        is_verified: false,
        source_title: "Optimizing Workspace for Productivity - Huberman Lab",
        source_url: "https://www.youtube.com/watch?v=Ze2pc6NwsHQ",
        source_type: "youtube",
        source_date: "2024-02-15",
        supplements: [
          {
            supplement_name: "Alpha-GPC",
            dosage: "300mg",
            frequency: "3-4x per week",
            timing: "pre-workout",
            notes: "Cycling to prevent tolerance",
            is_core: true,
            order_index: 1
          },
          {
            supplement_name: "Creatine",
            dosage: "5g",
            frequency: "Daily",
            timing: "any time",
            notes: "Cognitive and physical performance",
            is_core: true,
            order_index: 2
          }
        ]
      }
    ]
  }
];

export async function seedInfluencers() {
  console.log('🌟 Starting influencer seeding...');
  
  try {
    for (const influencer of influencerData) {
      console.log(`\n👤 Creating profile for ${influencer.display_name}...`);
      
      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          username: influencer.username,
          display_name: influencer.display_name,
          bio: influencer.bio,
          profile_image: influencer.profile_image,
          website: influencer.website,
          twitter_handle: influencer.twitter_handle,
          instagram_handle: influencer.instagram_handle,
          youtube_channel: influencer.youtube_channel,
          is_public: true,
          is_featured: influencer.is_featured,
          is_influencer: influencer.is_influencer,
          is_verified: influencer.is_verified,
          follower_count: influencer.follower_count,
          stack_count: influencer.stacks.length
        })
        .select()
        .single();

      if (profileError) {
        console.error(`❌ Error creating profile for ${influencer.display_name}:`, profileError);
        continue;
      }

      console.log(`✅ Created profile: ${profile.username}`);

      // Create stacks for this influencer
      for (const stackData of influencer.stacks) {
        console.log(`  📚 Creating stack: ${stackData.stack_name}...`);
        
        const { data: stack, error: stackError } = await supabase
          .from('stacks')
          .insert({
            profile_id: profile.profile_id,
            stack_name: stackData.stack_name,
            stack_description: stackData.stack_description,
            stack_image: stackData.stack_image,
            is_public: true,
            is_featured: stackData.is_featured,
            is_verified: stackData.is_verified,
            source_title: stackData.source_title,
            source_url: stackData.source_url,
            source_type: stackData.source_type,
            source_date: stackData.source_date,
            view_count: Math.floor(Math.random() * 10000) + 1000,
            like_count: Math.floor(Math.random() * 500) + 50
          })
          .select()
          .single();

        if (stackError) {
          console.error(`❌ Error creating stack ${stackData.stack_name}:`, stackError);
          continue;
        }

        console.log(`  ✅ Created stack: ${stack.stack_name}`);

        // Add supplements to the stack
        for (const supplement of stackData.supplements) {
          // First, get or create the supplement
          let { data: existingSupplement } = await supabase
            .from('supplements')
            .select('supplement_id')
            .eq('supplement_name', supplement.supplement_name)
            .single();

          let supplementId: number;

          if (existingSupplement) {
            supplementId = existingSupplement.supplement_id;
            console.log(`    🔗 Using existing supplement: ${supplement.supplement_name}`);
          } else {
            const { data: newSupplement, error: supplementError } = await supabase
              .from('supplements')
              .insert({
                supplement_name: supplement.supplement_name,
                supplement_description: `${supplement.supplement_name} supplement`
              })
              .select()
              .single();

            if (supplementError) {
              console.error(`❌ Error creating supplement ${supplement.supplement_name}:`, supplementError);
              continue;
            }

            supplementId = newSupplement.supplement_id;
            console.log(`    ✅ Created supplement: ${supplement.supplement_name}`);
          }

          // Add supplement to stack
          const { error: stackSupplementError } = await supabase
            .from('stack_supplements')
            .insert({
              stack_id: stack.stack_id,
              supplement_id: supplementId,
              dosage: supplement.dosage,
              frequency: supplement.frequency,
              timing: supplement.timing,
              notes: supplement.notes,
              is_core: supplement.is_core,
              order_index: supplement.order_index
            });

          if (stackSupplementError) {
            console.error(`❌ Error adding supplement to stack:`, stackSupplementError);
          } else {
            console.log(`    💊 Added ${supplement.supplement_name} to stack`);
          }
        }
      }
    }

    console.log('\n🎉 Influencer seeding completed successfully!');
    
    // Show summary
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('display_name')
      .eq('is_featured', true);
    
    const { data: stacks } = await supabase
      .from('stacks')
      .select('stack_name')
      .eq('is_featured', true);

    console.log(`\n📊 Summary:`);
    console.log(`- Featured profiles: ${profiles?.length || 0}`);
    console.log(`- Featured stacks: ${stacks?.length || 0}`);

  } catch (error) {
    console.error('❌ Fatal error during seeding:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedInfluencers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
} 