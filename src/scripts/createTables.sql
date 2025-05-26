-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create supplements table
CREATE TABLE IF NOT EXISTS supplements (
  supplement_id SERIAL PRIMARY KEY,
  supplement_name VARCHAR(255) NOT NULL UNIQUE,
  supplement_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  brand_id SERIAL PRIMARY KEY,
  brand_name VARCHAR(255) NOT NULL UNIQUE,
  brand_description TEXT,
  brand_website VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name VARCHAR(255) NOT NULL,
  product_description TEXT,
  product_price DECIMAL(10,2),
  product_url VARCHAR(500),
  amazon_url VARCHAR(500),
  product_image VARCHAR(500),
  servings_per_container INTEGER,
  servings_per_day INTEGER,
  supplement_id INTEGER REFERENCES supplements(supplement_id),
  brand_id INTEGER REFERENCES brands(brand_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- User interactions with products/supplements
CREATE TABLE IF NOT EXISTS users_products (
  user_product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(product_id),
  supplement_id INTEGER REFERENCES supplements(supplement_id),
  
  -- Usage tracking
  status VARCHAR(50) DEFAULT 'interested', -- 'interested', 'taking', 'stopped', 'completed'
  start_date DATE,
  end_date DATE,
  
  -- Personal notes and ratings
  personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 5),
  personal_notes TEXT,
  side_effects TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_featured ON user_profiles(is_featured);
CREATE INDEX IF NOT EXISTS idx_stacks_profile_id ON stacks(profile_id);
CREATE INDEX IF NOT EXISTS idx_stacks_featured ON stacks(is_featured);
CREATE INDEX IF NOT EXISTS idx_stacks_public ON stacks(is_public);
CREATE INDEX IF NOT EXISTS idx_stack_supplements_stack_id ON stack_supplements(stack_id);
CREATE INDEX IF NOT EXISTS idx_users_products_profile_id ON users_products(profile_id);
CREATE INDEX IF NOT EXISTS idx_stack_likes_stack_id ON stack_likes(stack_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for stacks
CREATE POLICY "Public stacks are viewable by everyone" ON stacks
  FOR SELECT USING (
    is_public = true OR 
    profile_id IN (
      SELECT profile_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own stacks" ON stacks
  FOR ALL USING (
    profile_id IN (
      SELECT profile_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for stack_supplements
CREATE POLICY "Stack supplements visible based on stack visibility" ON stack_supplements
  FOR SELECT USING (
    stack_id IN (
      SELECT stack_id FROM stacks WHERE 
        is_public = true OR 
        profile_id IN (
          SELECT profile_id FROM user_profiles WHERE user_id = auth.uid()
        )
    )
  );

CREATE POLICY "Users can manage own stack supplements" ON stack_supplements
  FOR ALL USING (
    stack_id IN (
      SELECT stack_id FROM stacks WHERE 
        profile_id IN (
          SELECT profile_id FROM user_profiles WHERE user_id = auth.uid()
        )
    )
  );

-- RLS Policies for users_products
CREATE POLICY "Users can only see own product interactions" ON users_products
  FOR ALL USING (
    profile_id IN (
      SELECT profile_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for stack_likes
CREATE POLICY "Stack likes are viewable by everyone" ON stack_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes" ON stack_likes
  FOR ALL USING (
    profile_id IN (
      SELECT profile_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for user_follows
CREATE POLICY "Follows are viewable by everyone" ON user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own follows" ON user_follows
  FOR ALL USING (
    follower_id IN (
      SELECT profile_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Functions to update counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower count
    UPDATE user_profiles 
    SET follower_count = follower_count + 1 
    WHERE profile_id = NEW.following_id;
    
    -- Increment following count
    UPDATE user_profiles 
    SET following_count = following_count + 1 
    WHERE profile_id = NEW.follower_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower count
    UPDATE user_profiles 
    SET follower_count = follower_count - 1 
    WHERE profile_id = OLD.following_id;
    
    -- Decrement following count
    UPDATE user_profiles 
    SET following_count = following_count - 1 
    WHERE profile_id = OLD.follower_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follower_counts
  AFTER INSERT OR DELETE ON user_follows
  FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

-- Function to update like counts
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stacks 
    SET like_count = like_count + 1 
    WHERE stack_id = NEW.stack_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stacks 
    SET like_count = like_count - 1 
    WHERE stack_id = OLD.stack_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_like_counts
  AFTER INSERT OR DELETE ON stack_likes
  FOR EACH ROW EXECUTE FUNCTION update_like_counts(); 