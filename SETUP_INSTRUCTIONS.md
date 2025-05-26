# Database Setup Instructions for Featured Stacks

Since Supabase doesn't allow executing complex SQL via the API, you need to manually run the following SQL in your Supabase dashboard.

## Step 1: Run SQL in Supabase Dashboard

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: `ftjnxqyvqhpawsipfkay`
3. Go to "SQL Editor" in the left sidebar
4. Paste and run the following SQL:

```sql
-- Drop existing user_profiles table and recreate with proper structure
DROP TABLE IF EXISTS stack_supplements CASCADE;
DROP TABLE IF EXISTS stack_likes CASCADE;
DROP TABLE IF EXISTS user_follows CASCADE;
DROP TABLE IF EXISTS stacks CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles table with all required columns
CREATE TABLE user_profiles (
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
);

-- Create stacks table
CREATE TABLE stacks (
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
);

-- Create stack_supplements junction table
CREATE TABLE stack_supplements (
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
);

-- Create stack_likes table
CREATE TABLE stack_likes (
  like_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID REFERENCES stacks(stack_id) ON DELETE CASCADE,
  profile_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stack_id, profile_id)
);

-- Create user_follows table
CREATE TABLE user_follows (
  follow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
  following_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_featured ON user_profiles(is_featured);
CREATE INDEX idx_stacks_profile_id ON stacks(profile_id);
CREATE INDEX idx_stacks_featured ON stacks(is_featured);
CREATE INDEX idx_stacks_public ON stacks(is_public);
CREATE INDEX idx_stack_supplements_stack_id ON stack_supplements(stack_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (IMPORTANT: Allow both SELECT and INSERT for seeding)
-- User Profiles Policies
CREATE POLICY "Allow public read access to public profiles" ON user_profiles
  FOR SELECT USING (is_public = true);

CREATE POLICY "Allow public insert for influencer profiles" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Stacks Policies  
CREATE POLICY "Allow public read access to public stacks" ON stacks
  FOR SELECT USING (is_public = true);

CREATE POLICY "Allow public insert for featured stacks" ON stacks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for stack owners" ON stacks
  FOR UPDATE USING (
    profile_id IN (
      SELECT profile_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Stack Supplements Policies
CREATE POLICY "Allow public read access to stack supplements" ON stack_supplements
  FOR SELECT USING (
    stack_id IN (SELECT stack_id FROM stacks WHERE is_public = true)
  );

CREATE POLICY "Allow public insert for stack supplements" ON stack_supplements
  FOR INSERT WITH CHECK (true);

-- Stack Likes Policies
CREATE POLICY "Allow public read access to stack likes" ON stack_likes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert for stack likes" ON stack_likes
  FOR INSERT WITH CHECK (true);

-- User Follows Policies
CREATE POLICY "Allow public read access to user follows" ON user_follows
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert for user follows" ON user_follows
  FOR INSERT WITH CHECK (true);
```

## Step 2: Seed the Data

After running the SQL above, you can seed the influencer data by calling:

```bash
curl -X POST http://localhost:3000/api/simple-setup
```

## Step 3: Verify Setup

Check that everything worked by calling:

```bash
curl http://localhost:3000/api/test-stacks
```

You should see data for Joe Rogan, Tim Ferriss, and Andrew Huberman with their featured stacks.

## What This Creates

- **Joe Rogan**: Daily supplement stack with Vitamin D3, Omega-3, B-Complex, Creatine
- **Tim Ferriss**: Morning productivity stack with Magnesium, Vitamin C, Zinc, Ashwagandha  
- **Andrew Huberman**: Sleep optimization stack with Magnesium, Omega-3, Vitamin D3

Each profile includes:
- ⚠️ **Unverified status** (not authenticated on platform)
- **Source attribution** (YouTube, podcast, article links)
- **Follower counts** and **engagement metrics**
- **Dosage and timing information** for each supplement

The homepage will then display these as **Featured Stacks** with proper authentication warnings and source links.

## Security Note

The policies allow public INSERT operations for seeding influencer data. In production, you may want to restrict these to admin users only. For now, this allows the seeding API to work properly. 