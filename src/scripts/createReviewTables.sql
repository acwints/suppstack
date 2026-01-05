-- ============================================================================
-- Review System Database Schema
-- Run this migration to add user-generated review functionality
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Product Reviews Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_reviews (
  review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,

  -- Rating breakdown (1-5 stars)
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),

  -- Review content
  review_title VARCHAR(200),
  review_body TEXT NOT NULL,
  pros TEXT[], -- Array of pros
  cons TEXT[], -- Array of cons

  -- Usage context
  usage_duration VARCHAR(50), -- 'less_than_month', '1-3_months', '3-6_months', '6-12_months', 'over_year'
  would_recommend BOOLEAN DEFAULT true,
  verified_purchase BOOLEAN DEFAULT false,

  -- Moderation
  is_approved BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One review per user per product
  UNIQUE(product_id, user_id)
);

-- ============================================================================
-- Review Helpfulness Votes
-- ============================================================================
CREATE TABLE IF NOT EXISTS review_votes (
  vote_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES product_reviews(review_id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One vote per user per review
  UNIQUE(review_id, user_id)
);

-- ============================================================================
-- Review Images (optional user-uploaded images)
-- ============================================================================
CREATE TABLE IF NOT EXISTS review_images (
  image_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES product_reviews(review_id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Product Rating Aggregates (denormalized for performance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_rating_stats (
  product_id UUID PRIMARY KEY REFERENCES products(product_id) ON DELETE CASCADE,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  rating_1_count INTEGER DEFAULT 0,
  rating_2_count INTEGER DEFAULT 0,
  rating_3_count INTEGER DEFAULT 0,
  rating_4_count INTEGER DEFAULT 0,
  rating_5_count INTEGER DEFAULT 0,
  recommendation_percentage DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(overall_rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON product_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_helpful ON product_reviews(helpful_count DESC);
CREATE INDEX IF NOT EXISTS idx_review_votes_review ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_images_review ON review_images(review_id);

-- ============================================================================
-- Trigger Function to Update Rating Stats
-- ============================================================================
CREATE OR REPLACE FUNCTION update_product_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert the rating stats for the affected product
  INSERT INTO product_rating_stats (
    product_id,
    average_rating,
    total_reviews,
    rating_1_count,
    rating_2_count,
    rating_3_count,
    rating_4_count,
    rating_5_count,
    recommendation_percentage,
    updated_at
  )
  SELECT
    COALESCE(NEW.product_id, OLD.product_id),
    COALESCE(AVG(overall_rating), 0),
    COUNT(*),
    COUNT(*) FILTER (WHERE overall_rating = 1),
    COUNT(*) FILTER (WHERE overall_rating = 2),
    COUNT(*) FILTER (WHERE overall_rating = 3),
    COUNT(*) FILTER (WHERE overall_rating = 4),
    COUNT(*) FILTER (WHERE overall_rating = 5),
    COALESCE(AVG(CASE WHEN would_recommend THEN 100 ELSE 0 END), 0),
    NOW()
  FROM product_reviews
  WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    AND is_approved = true
  ON CONFLICT (product_id) DO UPDATE SET
    average_rating = EXCLUDED.average_rating,
    total_reviews = EXCLUDED.total_reviews,
    rating_1_count = EXCLUDED.rating_1_count,
    rating_2_count = EXCLUDED.rating_2_count,
    rating_3_count = EXCLUDED.rating_3_count,
    rating_4_count = EXCLUDED.rating_4_count,
    rating_5_count = EXCLUDED.rating_5_count,
    recommendation_percentage = EXCLUDED.recommendation_percentage,
    updated_at = EXCLUDED.updated_at;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Create Trigger for Rating Stats Updates
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_update_rating_stats ON product_reviews;
CREATE TRIGGER trigger_update_rating_stats
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating_stats();

-- ============================================================================
-- Trigger Function to Update Helpful Count
-- ============================================================================
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the helpful count for the affected review
  UPDATE product_reviews
  SET helpful_count = (
    SELECT COUNT(*)
    FROM review_votes
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id)
      AND is_helpful = true
  )
  WHERE review_id = COALESCE(NEW.review_id, OLD.review_id);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Create Trigger for Helpful Count Updates
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_update_helpful_count ON review_votes;
CREATE TRIGGER trigger_update_helpful_count
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- ============================================================================
-- Row Level Security Policies
-- ============================================================================

-- Enable RLS on review tables
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_rating_stats ENABLE ROW LEVEL SECURITY;

-- Reviews: Anyone can read approved reviews, users can manage their own
CREATE POLICY "Anyone can read approved reviews" ON product_reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can insert own reviews" ON product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON product_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Votes: Anyone can read, users can manage their own
CREATE POLICY "Anyone can read votes" ON review_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own votes" ON review_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes" ON review_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON review_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Images: Anyone can read, users can manage their own (via review ownership)
CREATE POLICY "Anyone can read review images" ON review_images
  FOR SELECT USING (true);

-- Rating stats: Anyone can read
CREATE POLICY "Anyone can read rating stats" ON product_rating_stats
  FOR SELECT USING (true);

-- ============================================================================
-- Products Table Extension (if not already added)
-- ============================================================================
DO $$
BEGIN
  -- Add supplement_facts column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'supplement_facts'
  ) THEN
    ALTER TABLE products ADD COLUMN supplement_facts JSONB;
  END IF;

  -- Add amazon_asin column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'amazon_asin'
  ) THEN
    ALTER TABLE products ADD COLUMN amazon_asin VARCHAR(20);
  END IF;

  -- Add amazon_rating column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'amazon_rating'
  ) THEN
    ALTER TABLE products ADD COLUMN amazon_rating DECIMAL(3,2);
  END IF;

  -- Add amazon_review_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'amazon_review_count'
  ) THEN
    ALTER TABLE products ADD COLUMN amazon_review_count INTEGER;
  END IF;

  -- Add last_api_sync column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'last_api_sync'
  ) THEN
    ALTER TABLE products ADD COLUMN last_api_sync TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add data_source column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'data_source'
  ) THEN
    ALTER TABLE products ADD COLUMN data_source VARCHAR(50) DEFAULT 'manual';
  END IF;
END $$;

-- ============================================================================
-- Success Message
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'Review system tables created successfully!';
END $$;
