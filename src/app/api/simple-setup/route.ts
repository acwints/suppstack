import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin client with service role key - bypasses RLS
// SECURITY: Only use server-side, never expose to client
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials. Set SUPABASE_SERVICE_ROLE_KEY in .env.local');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

export async function POST(request: Request) {
  try {
    // SECURITY: Verify admin authorization
    const authHeader = request.headers.get('Authorization');
    const adminToken = process.env.ADMIN_SEED_TOKEN;

    // Require either:
    // 1. Matching admin token, OR
    // 2. Running in development mode
    const isDev = process.env.NODE_ENV === 'development';
    const hasValidToken = adminToken && authHeader === `Bearer ${adminToken}`;

    if (!isDev && !hasValidToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const supabase = getAdminClient();
    console.log('🌟 Starting simple database setup (admin mode)...');

    // Step 1: Check if we can access existing tables
    console.log('📋 Checking existing tables...');
    
    const { data: existingProfiles } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    console.log('Existing user_profiles accessible:', !!existingProfiles);

    // Step 2: Clear existing data if any
    console.log('🧹 Clearing existing featured data...');
    
    // Get featured stack IDs first
    const { data: featuredStacks } = await supabase
      .from('stacks')
      .select('stack_id')
      .eq('is_featured', true);

    if (featuredStacks && featuredStacks.length > 0) {
      const stackIds = featuredStacks.map(s => s.stack_id);
      
      // Delete stack supplements first
      await supabase
        .from('stack_supplements')
        .delete()
        .in('stack_id', stackIds);
    }

    // Delete featured stacks
    await supabase
      .from('stacks')
      .delete()
      .eq('is_featured', true);

    // Delete featured profiles
    await supabase
      .from('user_profiles')
      .delete()
      .eq('is_featured', true);

    // Step 3: Create influencer profiles manually
    console.log('👤 Creating influencer profiles...');
    
    const profileData = [
      {
        username: 'joerogan',
        display_name: 'Joe Rogan',
        bio: 'Comedian, podcaster, and UFC commentator. Host of The Joe Rogan Experience.',
        profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        website: 'https://www.joerogan.com',
        twitter_handle: 'joerogan',
        instagram_handle: 'joerogan',
        youtube_channel: 'https://www.youtube.com/channel/UCzQUP1qoWDoEbmsQxvdjxgQ',
        is_public: true,
        is_featured: true,
        is_influencer: true,
        is_verified: false,
        follower_count: 15000000,
        following_count: 0,
        stack_count: 1
      },
      {
        username: 'timferriss',
        display_name: 'Tim Ferriss',
        bio: 'Author of The 4-Hour Workweek, entrepreneur, and human optimization expert.',
        profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        website: 'https://tim.blog',
        twitter_handle: 'tferriss',
        instagram_handle: 'timferriss',
        is_public: true,
        is_featured: true,
        is_influencer: true,
        is_verified: false,
        follower_count: 2000000,
        following_count: 0,
        stack_count: 1
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
        is_public: true,
        is_featured: true,
        is_influencer: true,
        is_verified: false,
        follower_count: 3500000,
        following_count: 0,
        stack_count: 2
      }
    ];

    const createdProfiles: { [key: string]: string } = {};

    for (const profile of profileData) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .insert(profile)
          .select('profile_id, username')
          .single();

        if (error) {
          console.error(`❌ Error creating ${profile.display_name}:`, error);
          return NextResponse.json({
            success: false,
            error: `Failed to create profile for ${profile.display_name}`,
            details: error
          }, { status: 500 });
        }

        createdProfiles[profile.username] = data.profile_id;
        console.log(`✅ Created profile: ${profile.display_name}`);
      } catch (err) {
        console.error(`❌ Exception creating ${profile.display_name}:`, err);
        return NextResponse.json({
          success: false,
          error: `Exception creating profile for ${profile.display_name}`,
          details: err
        }, { status: 500 });
      }
    }

    // Step 4: Create stacks
    console.log('📚 Creating featured stacks...');

    const stacksData = [
      {
        profile_username: 'joerogan',
        stack_name: "Joe's Daily Stack",
        stack_description: "Joe Rogan's comprehensive daily supplement routine for optimal health and performance.",
        is_public: true,
        is_featured: true,
        is_verified: false,
        source_title: "Joe Rogan's Supplement Stack - JRE #1873",
        source_url: "https://www.youtube.com/watch?v=example",
        source_type: "podcast",
        source_date: "2024-01-15",
        view_count: 8543,
        like_count: 324,
        copy_count: 89,
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
        is_public: true,
        is_featured: true,
        is_verified: false,
        source_title: "The Tim Ferriss Show - My Current Supplement Stack",
        source_url: "https://tim.blog/supplement-stack/",
        source_type: "article",
        source_date: "2024-02-10",
        view_count: 6234,
        like_count: 198,
        copy_count: 67,
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
        is_public: true,
        is_featured: true,
        is_verified: false,
        source_title: "Master Your Sleep - Huberman Lab Podcast #2",
        source_url: "https://www.youtube.com/watch?v=nm1TxQj9IsQ",
        source_type: "youtube",
        source_date: "2024-01-08",
        view_count: 12456,
        like_count: 567,
        copy_count: 234,
        supplements: [
          { name: "Magnesium", dosage: "300-400mg", timing: "evening", is_core: true },
          { name: "Omega-3", dosage: "1-2g EPA", timing: "morning", is_core: true },
          { name: "Vitamin D3", dosage: "5000 IU", timing: "morning", is_core: true }
        ]
      }
    ];

    const createdStacks = [];

    for (const stackData of stacksData) {
      const profileId = createdProfiles[stackData.profile_username];
      if (!profileId) {
        console.error(`❌ No profile found for ${stackData.profile_username}`);
        continue;
      }

      try {
        const { data: stack, error: stackError } = await supabase
          .from('stacks')
          .insert({
            profile_id: profileId,
            stack_name: stackData.stack_name,
            stack_description: stackData.stack_description,
            is_public: stackData.is_public,
            is_featured: stackData.is_featured,
            is_verified: stackData.is_verified,
            source_title: stackData.source_title,
            source_url: stackData.source_url,
            source_type: stackData.source_type,
            source_date: stackData.source_date,
            view_count: stackData.view_count,
            like_count: stackData.like_count,
            copy_count: stackData.copy_count
          })
          .select('stack_id, stack_name')
          .single();

        if (stackError) {
          console.error(`❌ Error creating stack ${stackData.stack_name}:`, stackError);
          continue;
        }

        createdStacks.push({ ...stack, supplements: stackData.supplements });
        console.log(`✅ Created stack: ${stack.stack_name}`);

        // Add supplements to stack
        for (let i = 0; i < stackData.supplements.length; i++) {
          const supplement = stackData.supplements[i];
          
          // Get or create supplement
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
                supplement_description: `${supplement.name} supplement for health optimization`
              })
              .select('supplement_id')
              .single();

            if (supplementError) {
              console.error(`❌ Error creating supplement ${supplement.name}:`, supplementError);
              continue;
            }

            supplementId = newSupplement.supplement_id;
            console.log(`  ✅ Created supplement: ${supplement.name}`);
          }

          // Add supplement to stack
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
            console.error(`❌ Error adding supplement to stack:`, stackSupplementError);
          } else {
            console.log(`    💊 Added ${supplement.name} to ${stack.stack_name}`);
          }
        }
      } catch (err) {
        console.error(`❌ Exception creating stack ${stackData.stack_name}:`, err);
      }
    }

    console.log('🎉 Setup completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully!',
      data: {
        profiles_created: Object.keys(createdProfiles).length,
        stacks_created: createdStacks.length,
        profiles: createdProfiles,
        stacks: createdStacks.map(s => ({ stack_id: s.stack_id, stack_name: s.stack_name }))
      }
    });

  } catch (error) {
    console.error('❌ Simple setup failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Simple setup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 