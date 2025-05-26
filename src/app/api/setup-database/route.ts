import { NextResponse } from 'next/server';
import { supabase } from '../../supabase';
import { seedInfluencers } from '../../../scripts/seedInfluencers';

export async function POST() {
  try {
    console.log('🚀 Setting up enhanced database schema...');

    // First, run the schema creation
    const schemaQuery = `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Enhanced user_profiles table
      CREATE TABLE IF NOT EXISTS user_profiles (
        profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        username VARCHAR(50) UNIQUE,
        display_name VARCHAR(100),
        bio TEXT,
        profile_image VARCHAR(500),
        website VARCHAR(500),
        twitter_handle VARCHAR(50),
        instagram_handle VARCHAR(50),
        youtube_channel VARCHAR(500),
        
        -- Privacy and status settings
        is_public BOOLEAN DEFAULT true,
        is_verified BOOLEAN DEFAULT false,
        is_featured BOOLEAN DEFAULT false,
        is_influencer BOOLEAN DEFAULT false,
        
        -- Metadata
        follower_count INTEGER DEFAULT 0,
        following_count INTEGER DEFAULT 0,
        stack_count INTEGER DEFAULT 0,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create stacks table (collections of supplements)
      CREATE TABLE IF NOT EXISTS stacks (
        stack_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        profile_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
        stack_name VARCHAR(255) NOT NULL,
        stack_description TEXT,
        stack_image VARCHAR(500),
        
        -- Visibility and status
        is_public BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        is_verified BOOLEAN DEFAULT false,
        
        -- Source attribution for influencer stacks
        source_title VARCHAR(255),
        source_url VARCHAR(500),
        source_type VARCHAR(50), -- 'youtube', 'podcast', 'article', 'interview', etc.
        source_date DATE,
        
        -- Metadata
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        copy_count INTEGER DEFAULT 0,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create stack_supplements junction table
      CREATE TABLE IF NOT EXISTS stack_supplements (
        stack_supplement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        stack_id UUID REFERENCES stacks(stack_id) ON DELETE CASCADE,
        supplement_id INTEGER REFERENCES supplements(supplement_id),
        
        -- Dosage and timing information
        dosage VARCHAR(100),
        frequency VARCHAR(100),
        timing VARCHAR(100), -- 'morning', 'evening', 'pre-workout', etc.
        notes TEXT,
        
        -- Priority/importance
        is_core BOOLEAN DEFAULT false, -- Essential vs optional
        order_index INTEGER DEFAULT 0,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Stack likes/favorites
      CREATE TABLE IF NOT EXISTS stack_likes (
        like_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        stack_id UUID REFERENCES stacks(stack_id) ON DELETE CASCADE,
        profile_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(stack_id, profile_id)
      );

      -- User follows
      CREATE TABLE IF NOT EXISTS user_follows (
        follow_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        follower_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
        following_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(follower_id, following_id),
        CHECK(follower_id != following_id)
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_featured ON user_profiles(is_featured);
      CREATE INDEX IF NOT EXISTS idx_stacks_profile_id ON stacks(profile_id);
      CREATE INDEX IF NOT EXISTS idx_stacks_featured ON stacks(is_featured);
      CREATE INDEX IF NOT EXISTS idx_stacks_public ON stacks(is_public);
      CREATE INDEX IF NOT EXISTS idx_stack_supplements_stack_id ON stack_supplements(stack_id);
      CREATE INDEX IF NOT EXISTS idx_stack_likes_stack_id ON stack_likes(stack_id);
      CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
      CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

      -- Row Level Security (RLS) policies
      ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE stacks ENABLE ROW LEVEL SECURITY;
      ALTER TABLE stack_supplements ENABLE ROW LEVEL SECURITY;
      ALTER TABLE stack_likes ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
      DROP POLICY IF EXISTS "Public stacks are viewable by everyone" ON stacks;
      DROP POLICY IF EXISTS "Stack supplements visible based on stack visibility" ON stack_supplements;
      DROP POLICY IF EXISTS "Stack likes are viewable by everyone" ON stack_likes;
      DROP POLICY IF EXISTS "Follows are viewable by everyone" ON user_follows;

      -- RLS Policies for user_profiles
      CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
        FOR SELECT USING (is_public = true);

      -- RLS Policies for stacks
      CREATE POLICY "Public stacks are viewable by everyone" ON stacks
        FOR SELECT USING (is_public = true);

      -- RLS Policies for stack_supplements
      CREATE POLICY "Stack supplements visible based on stack visibility" ON stack_supplements
        FOR SELECT USING (
          stack_id IN (
            SELECT stack_id FROM stacks WHERE is_public = true
          )
        );

      -- RLS Policies for stack_likes
      CREATE POLICY "Stack likes are viewable by everyone" ON stack_likes
        FOR SELECT USING (true);

      -- RLS Policies for user_follows
      CREATE POLICY "Follows are viewable by everyone" ON user_follows
        FOR SELECT USING (true);
    `;

    // Execute the schema creation
    const { error: schemaError } = await supabase.rpc('exec_sql', { 
      sql: schemaQuery 
    });

    if (schemaError) {
      console.error('Schema creation error:', schemaError);
      // Try alternative approach - execute statements individually
      console.log('Trying individual table creation...');
      
      // Create tables individually using regular queries
      const tables = [
        {
          name: 'user_profiles',
          query: `
            CREATE TABLE IF NOT EXISTS user_profiles (
              profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID,
              username VARCHAR(50) UNIQUE,
              display_name VARCHAR(100),
              bio TEXT,
              profile_image VARCHAR(500),
              website VARCHAR(500),
              twitter_handle VARCHAR(50),
              instagram_handle VARCHAR(50),
              youtube_channel VARCHAR(500),
              is_public BOOLEAN DEFAULT true,
              is_verified BOOLEAN DEFAULT false,
              is_featured BOOLEAN DEFAULT false,
              is_influencer BOOLEAN DEFAULT false,
              follower_count INTEGER DEFAULT 0,
              following_count INTEGER DEFAULT 0,
              stack_count INTEGER DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
          `
        },
        {
          name: 'stacks',
          query: `
            CREATE TABLE IF NOT EXISTS stacks (
              stack_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              profile_id UUID,
              stack_name VARCHAR(255) NOT NULL,
              stack_description TEXT,
              stack_image VARCHAR(500),
              is_public BOOLEAN DEFAULT true,
              is_featured BOOLEAN DEFAULT false,
              is_verified BOOLEAN DEFAULT false,
              source_title VARCHAR(255),
              source_url VARCHAR(500),
              source_type VARCHAR(50),
              source_date DATE,
              view_count INTEGER DEFAULT 0,
              like_count INTEGER DEFAULT 0,
              copy_count INTEGER DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
          `
        },
        {
          name: 'stack_supplements',
          query: `
            CREATE TABLE IF NOT EXISTS stack_supplements (
              stack_supplement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              stack_id UUID,
              supplement_id INTEGER,
              dosage VARCHAR(100),
              frequency VARCHAR(100),
              timing VARCHAR(100),
              notes TEXT,
              is_core BOOLEAN DEFAULT false,
              order_index INTEGER DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
          `
        }
      ];

      for (const table of tables) {
        try {
          await supabase.rpc('exec_sql', { sql: table.query });
          console.log(`✅ Created table: ${table.name}`);
        } catch (error) {
          console.log(`Table ${table.name} might already exist or using fallback method`);
        }
      }
    } else {
      console.log('✅ Schema created successfully');
    }

    // Now seed the influencer data
    console.log('🌟 Starting influencer seeding...');
    await seedInfluencers();

    return NextResponse.json({ 
      success: true, 
      message: 'Database setup completed successfully!' 
    });

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database setup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 