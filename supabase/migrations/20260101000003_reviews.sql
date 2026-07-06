-- ============================================================================
-- 0003 · Product reviews (ratings, votes, images, aggregate stats)
-- Depends on 0001 (products, user_profiles).
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_reviews (
  review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,

  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),

  review_title VARCHAR(200),
  review_body TEXT NOT NULL,
  pros TEXT[],
  cons TEXT[],

  usage_duration VARCHAR(50),
  would_recommend BOOLEAN DEFAULT true,
  verified_purchase BOOLEAN DEFAULT false,

  is_approved BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(product_id, user_id)
);

CREATE TABLE IF NOT EXISTS review_votes (
  vote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES product_reviews(review_id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

CREATE TABLE IF NOT EXISTS review_images (
  image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES product_reviews(review_id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_rating_stats (
  product_id INTEGER PRIMARY KEY REFERENCES products(product_id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(overall_rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON product_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_helpful ON product_reviews(helpful_count DESC);
CREATE INDEX IF NOT EXISTS idx_review_votes_review ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_images_review ON review_images(review_id);

-- Aggregate stats maintained by trigger.
CREATE OR REPLACE FUNCTION update_product_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO product_rating_stats (
    product_id, average_rating, total_reviews,
    rating_1_count, rating_2_count, rating_3_count, rating_4_count, rating_5_count,
    recommendation_percentage, updated_at
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

DROP TRIGGER IF EXISTS trigger_update_rating_stats ON product_reviews;
CREATE TRIGGER trigger_update_rating_stats
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating_stats();

CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE product_reviews
  SET helpful_count = (
    SELECT COUNT(*) FROM review_votes
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) AND is_helpful = true
  )
  WHERE review_id = COALESCE(NEW.review_id, OLD.review_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_helpful_count ON review_votes;
CREATE TRIGGER trigger_update_helpful_count
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- ── RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_rating_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read approved reviews" ON product_reviews;
CREATE POLICY "Anyone can read approved reviews" ON product_reviews
  FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Users can insert own reviews" ON product_reviews;
CREATE POLICY "Users can insert own reviews" ON product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON product_reviews;
CREATE POLICY "Users can update own reviews" ON product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON product_reviews;
CREATE POLICY "Users can delete own reviews" ON product_reviews
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read votes" ON review_votes;
CREATE POLICY "Anyone can read votes" ON review_votes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own votes" ON review_votes;
CREATE POLICY "Users can insert own votes" ON review_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own votes" ON review_votes;
CREATE POLICY "Users can update own votes" ON review_votes
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own votes" ON review_votes;
CREATE POLICY "Users can delete own votes" ON review_votes
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read review images" ON review_images;
CREATE POLICY "Anyone can read review images" ON review_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read rating stats" ON product_rating_stats;
CREATE POLICY "Anyone can read rating stats" ON product_rating_stats
  FOR SELECT USING (true);
