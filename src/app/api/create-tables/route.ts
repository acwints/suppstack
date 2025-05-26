import { NextResponse } from 'next/server';
import { supabase } from '../../supabase';

export async function POST() {
  try {
    console.log('🏗️ Creating tables manually...');

    // Drop existing tables if they exist and recreate them
    const tableCreationSQL = [
      // Drop existing tables in correct order
      `DROP TABLE IF EXISTS stack_supplements CASCADE;`,
      `DROP TABLE IF EXISTS stack_likes CASCADE;`,
      `DROP TABLE IF EXISTS user_follows CASCADE;`,
      `DROP TABLE IF EXISTS stacks CASCADE;`,
      `DROP TABLE IF EXISTS user_profiles CASCADE;`,
      
      // Create user_profiles table
      `CREATE TABLE user_profiles (
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
      );`,
      
      // Create stacks table
      `CREATE TABLE stacks (
        stack_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
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
      );`,
      
      // Create stack_supplements junction table
      `CREATE TABLE stack_supplements (
        stack_supplement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stack_id UUID REFERENCES stacks(stack_id) ON DELETE CASCADE,
        supplement_id INTEGER REFERENCES supplements(supplement_id),
        dosage VARCHAR(100),
        frequency VARCHAR(100),
        timing VARCHAR(100),
        notes TEXT,
        is_core BOOLEAN DEFAULT false,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // Create stack_likes table
      `CREATE TABLE stack_likes (
        like_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stack_id UUID REFERENCES stacks(stack_id) ON DELETE CASCADE,
        profile_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(stack_id, profile_id)
      );`,
      
      // Create user_follows table
      `CREATE TABLE user_follows (
        follow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        follower_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
        following_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(follower_id, following_id),
        CHECK(follower_id != following_id)
      );`,
      
      // Create indexes
      `CREATE INDEX idx_user_profiles_username ON user_profiles(username);`,
      `CREATE INDEX idx_user_profiles_featured ON user_profiles(is_featured);`,
      `CREATE INDEX idx_stacks_profile_id ON stacks(profile_id);`,
      `CREATE INDEX idx_stacks_featured ON stacks(is_featured);`,
      `CREATE INDEX idx_stacks_public ON stacks(is_public);`,
      `CREATE INDEX idx_stack_supplements_stack_id ON stack_supplements(stack_id);`,
      
      // Enable RLS
      `ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE stacks ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE stack_supplements ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE stack_likes ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;`,
      
      // Create RLS policies
      `CREATE POLICY "Allow public read access to public profiles" ON user_profiles
        FOR SELECT USING (is_public = true);`,
      
      `CREATE POLICY "Allow public read access to public stacks" ON stacks
        FOR SELECT USING (is_public = true);`,
      
      `CREATE POLICY "Allow public read access to stack supplements" ON stack_supplements
        FOR SELECT USING (
          stack_id IN (SELECT stack_id FROM stacks WHERE is_public = true)
        );`,
      
      `CREATE POLICY "Allow public read access to stack likes" ON stack_likes
        FOR SELECT USING (true);`,
      
      `CREATE POLICY "Allow public read access to user follows" ON user_follows
        FOR SELECT USING (true);`
    ];

    const results = [];

    for (const sql of tableCreationSQL) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql });
        if (error) {
          console.error(`Error executing SQL: ${sql.substring(0, 50)}...`, error);
          results.push({ sql: sql.substring(0, 50), success: false, error: error.message });
        } else {
          console.log(`✅ Executed: ${sql.substring(0, 50)}...`);
          results.push({ sql: sql.substring(0, 50), success: true });
        }
      } catch (err) {
        console.error(`Exception executing SQL: ${sql.substring(0, 50)}...`, err);
        results.push({ sql: sql.substring(0, 50), success: false, error: 'Exception occurred' });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Table creation completed!',
      results 
    });

  } catch (error) {
    console.error('❌ Table creation failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Table creation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 