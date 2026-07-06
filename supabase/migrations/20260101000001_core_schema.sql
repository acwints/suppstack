-- ============================================================================
-- 0001 · Core schema
-- Catalog (supplements, brands, products), profiles, stacks, social graph.
--
-- This is the canonical schema. Every statement is idempotent so the file can
-- be re-applied safely (fresh database or existing production database).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Catalog ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS supplements (
  supplement_id SERIAL PRIMARY KEY,
  supplement_name VARCHAR(255) NOT NULL UNIQUE,
  supplement_description TEXT,
  image_url VARCHAR(500),
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brands (
  brand_id SERIAL PRIMARY KEY,
  brand_name VARCHAR(255) NOT NULL UNIQUE,
  brand_description TEXT,
  brand_website VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  product_id SERIAL PRIMARY KEY,
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

-- ── Profiles ─────────────────────────────────────────────────────────────
-- date_of_birth / gender / height / weight are written by the profile editor
-- (src/app/profile/page.tsx) and typed in UserProfile / AccountProfile; they
-- are part of the canonical schema, not an afterthought.
CREATE TABLE IF NOT EXISTS user_profiles (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  bio TEXT,
  profile_image VARCHAR(500),
  website VARCHAR(500),
  twitter_handle VARCHAR(50),
  instagram_handle VARCHAR(50),
  youtube_channel VARCHAR(500),

  -- Personal details (optional, user-supplied)
  date_of_birth DATE,
  gender VARCHAR(30),
  height DECIMAL(5,2),   -- centimeters
  weight DECIMAL(5,2),   -- kilograms

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

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender VARCHAR(30),
  ADD COLUMN IF NOT EXISTS height DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS website VARCHAR(500),
  ADD COLUMN IF NOT EXISTS twitter_handle VARCHAR(50),
  ADD COLUMN IF NOT EXISTS instagram_handle VARCHAR(50),
  ADD COLUMN IF NOT EXISTS youtube_channel VARCHAR(500),
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_influencer BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stack_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ── Stacks & social graph ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stacks (
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

CREATE TABLE IF NOT EXISTS stack_supplements (
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

CREATE TABLE IF NOT EXISTS users_products (
  user_product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(product_id),
  supplement_id INTEGER REFERENCES supplements(supplement_id),
  status VARCHAR(50) DEFAULT 'interested',
  start_date DATE,
  end_date DATE,
  personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 5),
  personal_notes TEXT,
  side_effects TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users_products
  ADD COLUMN IF NOT EXISTS user_product_id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS supplement_id INTEGER REFERENCES supplements(supplement_id),
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'interested',
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 5),
  ADD COLUMN IF NOT EXISTS personal_notes TEXT,
  ADD COLUMN IF NOT EXISTS side_effects TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE users_products up
SET profile_id = p.profile_id
FROM user_profiles p
WHERE up.profile_id IS NULL
  AND up.user_id = p.user_id;

UPDATE users_products up
SET supplement_id = pr.supplement_id
FROM products pr
WHERE up.supplement_id IS NULL
  AND up.product_id = pr.product_id;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_products_profile_product_key'
  ) THEN
    ALTER TABLE users_products
      ADD CONSTRAINT users_products_profile_product_key UNIQUE (profile_id, product_id);
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS stack_likes (
  like_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID REFERENCES stacks(stack_id) ON DELETE CASCADE,
  profile_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stack_id, profile_id)
);

CREATE TABLE IF NOT EXISTS user_follows (
  follow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
  following_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

-- ── Indexes ──────────────────────────────────────────────────────────────
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

-- ── Row Level Security ───────────────────────────────────────────────────
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Policies are dropped first so the file is re-runnable (CREATE POLICY errors
-- if the policy already exists).
DROP POLICY IF EXISTS "Allow public read access to public profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow public insert for influencer profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow public read access to public stacks" ON stacks;
DROP POLICY IF EXISTS "Allow public insert for featured stacks" ON stacks;
DROP POLICY IF EXISTS "Public stacks are viewable by everyone" ON stacks;
CREATE POLICY "Public stacks are viewable by everyone" ON stacks
  FOR SELECT USING (
    is_public = true OR
    profile_id IN (SELECT profile_id FROM user_profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage own stacks" ON stacks;
CREATE POLICY "Users can manage own stacks" ON stacks
  FOR ALL USING (
    profile_id IN (SELECT profile_id FROM user_profiles WHERE user_id = auth.uid())
  ) WITH CHECK (
    profile_id IN (SELECT profile_id FROM user_profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Allow public read access to stack supplements" ON stack_supplements;
DROP POLICY IF EXISTS "Allow public insert for stack supplements" ON stack_supplements;
DROP POLICY IF EXISTS "Stack supplements visible based on stack visibility" ON stack_supplements;
CREATE POLICY "Stack supplements visible based on stack visibility" ON stack_supplements
  FOR SELECT USING (
    stack_id IN (
      SELECT stack_id FROM stacks WHERE
        is_public = true OR
        profile_id IN (SELECT profile_id FROM user_profiles WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage own stack supplements" ON stack_supplements;
CREATE POLICY "Users can manage own stack supplements" ON stack_supplements
  FOR ALL USING (
    stack_id IN (
      SELECT stack_id FROM stacks WHERE
        profile_id IN (SELECT profile_id FROM user_profiles WHERE user_id = auth.uid())
    )
  ) WITH CHECK (
    stack_id IN (
      SELECT stack_id FROM stacks WHERE
        profile_id IN (SELECT profile_id FROM user_profiles WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Allow public read access on users_products" ON users_products;
DROP POLICY IF EXISTS "Allow public insert access on users_products" ON users_products;
DROP POLICY IF EXISTS "Users can only see own product interactions" ON users_products;
CREATE POLICY "Users can only see own product interactions" ON users_products
  FOR ALL USING (
    profile_id IN (SELECT profile_id FROM user_profiles WHERE user_id = auth.uid())
  ) WITH CHECK (
    profile_id IN (SELECT profile_id FROM user_profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Allow public read access to stack likes" ON stack_likes;
DROP POLICY IF EXISTS "Allow public insert for stack likes" ON stack_likes;
DROP POLICY IF EXISTS "Stack likes are viewable by everyone" ON stack_likes;
CREATE POLICY "Stack likes are viewable by everyone" ON stack_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own likes" ON stack_likes;
CREATE POLICY "Users can manage own likes" ON stack_likes
  FOR ALL USING (
    profile_id IN (SELECT profile_id FROM user_profiles WHERE user_id = auth.uid())
  ) WITH CHECK (
    profile_id IN (SELECT profile_id FROM user_profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Allow public read access to user follows" ON user_follows;
DROP POLICY IF EXISTS "Allow public insert for user follows" ON user_follows;
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON user_follows;
CREATE POLICY "Follows are viewable by everyone" ON user_follows
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own follows" ON user_follows;
CREATE POLICY "Users can manage own follows" ON user_follows
  FOR ALL USING (
    follower_id IN (SELECT profile_id FROM user_profiles WHERE user_id = auth.uid())
  ) WITH CHECK (
    follower_id IN (SELECT profile_id FROM user_profiles WHERE user_id = auth.uid())
  );

-- ── Counter triggers ─────────────────────────────────────────────────────
-- follower_count / following_count / like_count are maintained here. Client
-- code must NOT also write these columns (that double-counts).
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_profiles SET follower_count = follower_count + 1 WHERE profile_id = NEW.following_id;
    UPDATE user_profiles SET following_count = following_count + 1 WHERE profile_id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles SET follower_count = GREATEST(0, follower_count - 1) WHERE profile_id = OLD.following_id;
    UPDATE user_profiles SET following_count = GREATEST(0, following_count - 1) WHERE profile_id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_follower_counts ON user_follows;
CREATE TRIGGER trigger_update_follower_counts
  AFTER INSERT OR DELETE ON user_follows
  FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stacks SET like_count = like_count + 1 WHERE stack_id = NEW.stack_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stacks SET like_count = GREATEST(0, like_count - 1) WHERE stack_id = OLD.stack_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_like_counts ON stack_likes;
CREATE TRIGGER trigger_update_like_counts
  AFTER INSERT OR DELETE ON stack_likes
  FOR EACH ROW EXECUTE FUNCTION update_like_counts();
