// ============================================================================
// Core Database Types
// ============================================================================

export interface Brand {
  brand_id: string;
  brand_name: string;
  brand_description?: string;
  brand_website?: string;
}

export interface Supplement {
  supplement_id: number;
  supplement_name: string;
  supplement_description: string;
}

export interface Product {
  product_id: string;
  product_name: string;
  product_description: string;
  product_price: number;
  product_url: string;
  amazon_url: string;
  product_image: string;
  servings_per_container: number;
  servings_per_day: number;
  supplement_id: number;
  brand_id?: string;
  // Relations
  brands?: { brand_name: string };
  supplements?: { supplement_name: string };
  // Extended fields for API data
  amazon_asin?: string;
  amazon_rating?: number;
  amazon_review_count?: number;
  supplement_facts?: SupplementFacts;
  last_api_sync?: string;
  data_source?: 'manual' | 'amazon_api' | 'openfda';
}

export interface SupplementFacts {
  servingSize: string;
  servingsPerContainer: number;
  ingredients: SupplementIngredient[];
  otherIngredients?: string[];
  warnings?: string[];
  manufacturer?: string;
}

export interface SupplementIngredient {
  name: string;
  amount: string;
  unit: string;
  dailyValue?: number;
}

// ============================================================================
// User & Profile Types
// ============================================================================

export interface UserProfile {
  profile_id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio?: string;
  profile_image?: string;
  is_verified: boolean;
  is_influencer: boolean;
  follower_count: number;
  date_of_birth?: string;
  gender?: string;
  height?: number; // in cm
  weight?: number; // in kg
}

export interface RegimenItem {
  product_id: string;
  products: {
    product_name: string;
    product_description: string | null;
    product_price: number;
    servings_per_container: number;
    servings_per_day: number;
    brands: { brand_name: string };
    supplements: { supplement_name: string };
  };
}

// ============================================================================
// Stack Types
// ============================================================================

export interface Stack {
  stack_id: string;
  stack_name: string;
  stack_description: string;
  stack_image?: string;
  is_featured: boolean;
  is_verified: boolean;
  is_public: boolean;
  source_title: string;
  source_url: string;
  source_type: 'youtube' | 'podcast' | 'article' | 'interview' | 'website';
  source_date: string;
  view_count: number;
  like_count: number;
  copy_count: number;
  profile: UserProfile;
  supplements: StackSupplement[];
}

export interface StackSupplement {
  supplement_id: number;
  supplement_name: string;
  dosage?: string;
  frequency?: string;
  timing?: string;
  notes?: string;
  is_core: boolean;
  order_index: number;
}

// ============================================================================
// Review Types
// ============================================================================

export interface Review {
  review_id: string;
  product_id: string;
  user_id: string;
  profile_id: string;
  overall_rating: number; // 1-5
  effectiveness_rating?: number;
  value_rating?: number;
  quality_rating?: number;
  review_title?: string;
  review_body: string;
  pros?: string[];
  cons?: string[];
  usage_duration?: 'less_than_month' | '1-3_months' | '3-6_months' | '6-12_months' | 'over_year';
  would_recommend: boolean;
  verified_purchase: boolean;
  is_approved: boolean;
  is_featured: boolean;
  helpful_count: number;
  report_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  profile?: UserProfile;
  images?: ReviewImage[];
}

export interface ReviewImage {
  image_id: string;
  review_id: string;
  image_url: string;
  image_order: number;
}

export interface ReviewVote {
  vote_id: string;
  review_id: string;
  user_id: string;
  is_helpful: boolean;
}

export interface ProductRatingStats {
  product_id: string;
  average_rating: number;
  total_reviews: number;
  rating_1_count: number;
  rating_2_count: number;
  rating_3_count: number;
  rating_4_count: number;
  rating_5_count: number;
  recommendation_percentage: number;
}

// ============================================================================
// Input Types (for forms and mutations)
// ============================================================================

export interface ReviewInput {
  product_id: string;
  overall_rating: number;
  effectiveness_rating?: number;
  value_rating?: number;
  quality_rating?: number;
  review_title?: string;
  review_body: string;
  pros?: string[];
  cons?: string[];
  usage_duration?: Review['usage_duration'];
  would_recommend: boolean;
}

export interface ProfileInput {
  date_of_birth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  display_name?: string;
  bio?: string;
}

// ============================================================================
// UI Component Types
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';
export type BadgeSize = 'sm' | 'md';

export type CardVariant = 'default' | 'modern' | 'feature';
export type CardHover = 'none' | 'lift' | 'airbnb';

export type InputVariant = 'default' | 'search';
export type InputSize = 'sm' | 'md' | 'lg';

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// Filter & Sort Types
// ============================================================================

export interface ProductFilters {
  supplementId?: number;
  brandId?: string;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export type ProductSortBy = 'name' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';

export interface SupplementCategory {
  id: string;
  name: string;
  icon: string;
  keywords: string[];
}

// ============================================================================
// Constants
// ============================================================================

export const SUPPLEMENT_CATEGORIES: SupplementCategory[] = [
  { id: 'all', name: 'All Supplements', icon: '🌟', keywords: [] },
  { id: 'vitamins', name: 'Vitamins', icon: '💊', keywords: ['vitamin'] },
  { id: 'minerals', name: 'Minerals', icon: '⚡', keywords: ['magnesium', 'zinc', 'calcium', 'iron', 'potassium'] },
  { id: 'protein', name: 'Protein', icon: '💪', keywords: ['protein', 'whey', 'casein', 'collagen'] },
  { id: 'herbs', name: 'Herbs', icon: '🌿', keywords: ['ashwagandha', 'turmeric', 'ginseng', 'rhodiola'] },
  { id: 'omega', name: 'Omega & Fish Oil', icon: '🐟', keywords: ['omega', 'fish oil', 'krill'] },
  { id: 'probiotics', name: 'Probiotics', icon: '🦠', keywords: ['probiotic', 'prebiotic', 'gut'] },
  { id: 'performance', name: 'Performance', icon: '🏃', keywords: ['creatine', 'pre-workout', 'bcaa', 'beta-alanine'] },
];

export const USAGE_DURATION_OPTIONS = [
  { value: 'less_than_month', label: 'Less than a month' },
  { value: '1-3_months', label: '1-3 months' },
  { value: '3-6_months', label: '3-6 months' },
  { value: '6-12_months', label: '6-12 months' },
  { value: 'over_year', label: 'Over a year' },
] as const;

export const DEFAULT_PAGE_SIZE = 20;
export const DAYS_PER_MONTH = 30.437; // Average days per month
