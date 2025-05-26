import { NextResponse } from 'next/server';
import { supabase } from '../../supabase';

export async function POST() {
  try {
    console.log('🌟 Starting manual influencer seeding...');

    // First, let's create the influencer profiles one by one
    const influencers = [
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
        is_verified: false,
        follower_count: 15000000
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
        follower_count: 2000000
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
        follower_count: 3500000
      }
    ];

    const profileIds: { [key: string]: string } = {};

    // Insert profiles
    for (const influencer of influencers) {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .insert(influencer)
        .select()
        .single();

      if (error) {
        console.error(`Error creating ${influencer.display_name}:`, error);
        continue;
      }

      profileIds[influencer.username] = profile.profile_id;
      console.log(`✅ Created ${influencer.display_name}`);
    }

    // Now create some featured stacks
    const stacks = [
      {
        profile_username: 'joerogan',
        stack_name: "Joe's Daily Stack",
        stack_description: "Joe Rogan's comprehensive daily supplement routine for optimal health and performance.",
        is_featured: true,
        is_verified: false,
        source_title: "Joe Rogan's Supplement Stack - JRE #1873",
        source_url: "https://www.youtube.com/watch?v=example",
        source_type: "podcast",
        source_date: "2024-01-15",
        supplements: [
          { name: "Vitamin D3", dosage: "4000 IU", timing: "morning", is_core: true },
          { name: "Omega-3", dosage: "2g", timing: "morning", is_core: true },
          { name: "B-Complex", dosage: "1 capsule", timing: "morning", is_core: true },
          { name: "Creatine", dosage: "5g", timing: "pre-workout", is_core: true }
        ]
      },
      {
        profile_username: 'timferriss',
        stack_name: "Tim's Morning Stack",
        stack_description: "Tim Ferriss's optimized morning supplement routine for productivity and focus.",
        is_featured: true,
        is_verified: false,
        source_title: "The Tim Ferriss Show - My Current Supplement Stack",
        source_url: "https://tim.blog/supplement-stack/",
        source_type: "article",
        source_date: "2024-02-10",
        supplements: [
          { name: "Magnesium", dosage: "400mg", timing: "evening", is_core: true },
          { name: "Vitamin C", dosage: "1000mg", timing: "morning", is_core: true },
          { name: "Zinc", dosage: "15mg", timing: "evening", is_core: true },
          { name: "Ashwagandha", dosage: "600mg", timing: "evening", is_core: false }
        ]
      },
      {
        profile_username: 'andrewhuberman',
        stack_name: "Huberman's Sleep Stack",
        stack_description: "Andrew Huberman's science-based supplement protocol for optimal sleep quality.",
        is_featured: true,
        is_verified: false,
        source_title: "Master Your Sleep - Huberman Lab Podcast #2",
        source_url: "https://www.youtube.com/watch?v=nm1TxQj9IsQ",
        source_type: "youtube",
        source_date: "2024-01-08",
        supplements: [
          { name: "Magnesium", dosage: "300-400mg", timing: "evening", is_core: true },
          { name: "Omega-3", dosage: "1-2g EPA", timing: "morning", is_core: true },
          { name: "Vitamin D3", dosage: "5000 IU", timing: "morning", is_core: true }
        ]
      }
    ];

    // Insert stacks
    for (const stackData of stacks) {
      const profileId = profileIds[stackData.profile_username];
      if (!profileId) continue;

      const { data: stack, error: stackError } = await supabase
        .from('stacks')
        .insert({
          profile_id: profileId,
          stack_name: stackData.stack_name,
          stack_description: stackData.stack_description,
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
        console.error(`Error creating stack ${stackData.stack_name}:`, stackError);
        continue;
      }

      console.log(`✅ Created stack: ${stack.stack_name}`);

      // Add supplements to stack
      for (let i = 0; i < stackData.supplements.length; i++) {
        const supplement = stackData.supplements[i];
        
        // Get supplement ID
        let { data: existingSupplement } = await supabase
          .from('supplements')
          .select('supplement_id')
          .eq('supplement_name', supplement.name)
          .single();

        let supplementId: number;

        if (existingSupplement) {
          supplementId = existingSupplement.supplement_id;
        } else {
          const { data: newSupplement, error: supplementError } = await supabase
            .from('supplements')
            .insert({
              supplement_name: supplement.name,
              supplement_description: `${supplement.name} supplement`
            })
            .select()
            .single();

          if (supplementError) {
            console.error(`Error creating supplement ${supplement.name}:`, supplementError);
            continue;
          }

          supplementId = newSupplement.supplement_id;
        }

        // Add to stack
        const { error: stackSupplementError } = await supabase
          .from('stack_supplements')
          .insert({
            stack_id: stack.stack_id,
            supplement_id: supplementId,
            dosage: supplement.dosage,
            frequency: "Daily",
            timing: supplement.timing,
            is_core: supplement.is_core,
            order_index: i + 1
          });

        if (stackSupplementError) {
          console.error(`Error adding supplement to stack:`, stackSupplementError);
        } else {
          console.log(`  💊 Added ${supplement.name} to stack`);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Manual seeding completed successfully!',
      profileIds 
    });

  } catch (error) {
    console.error('❌ Manual seeding failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Manual seeding failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 