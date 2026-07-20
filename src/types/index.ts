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
  image_url?: string;
  category?: string;
  aliases?: string[];
  evidence_rating?: 'emerging' | 'moderate' | 'strong';
  primary_goals?: string[];
  typical_forms?: string[];
  common_dosage?: string;
  product_count?: number;
  average_price?: number;
  /** Cheapest curated product price; drives "From $X" on family tiles. */
  lowest_price?: number;
  /**
   * Knowledge-base entry with no purchasable products (e.g. research
   * peptides). These render as wiki pages with a research-use disclaimer
   * instead of a shopping surface — no price, product count, or checkout.
   */
  research_only?: boolean;
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
  supplements?: { supplement_id: number; supplement_name: string };
  // Extended fields for API data
  amazon_asin?: string;
  amazon_rating?: number;
  amazon_review_count?: number;
  shopify_product_gid?: string;
  shopify_variant_gid?: string;
  shopify_store_domain?: string;
  shopify_checkout_url?: string;
  commerce_channel?: 'shopify' | 'amazon' | 'official' | 'marketplace';
  ucp_enabled?: boolean;
  inventory_status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder';
  quality_badges?: string[];
  subscriptions_available?: boolean;
  /** Ingredient composition (2-tier: each edge references a catalog supplement). */
  ingredients?: IngredientComposition;
  last_api_sync?: string;
  data_source?:
    | 'manual'
    | 'amazon_api'
    | 'openfda'
    | 'shopify_ucp'
    | 'official_page'
    | 'official_api'
    | 'catalog_fallback';
}

// ============================================================================
// Ingredient Composition Types (2-tier model)
// ============================================================================
//
// A product composes many ingredients. Ingredient identity reuses the catalog
// `supplements` table (`supplement_id`), so each edge points at a catalog
// supplement with a per-serving amount + unit. `amount: null` means the
// ingredient is present but unquantified (no fabricated amount).

export type IngredientUnit =
  | 'mg'
  | 'mcg'
  | 'g'
  | 'IU'
  | 'billion CFU'
  | 'ml'
  | 'mcg DFE'
  | 'mg NE';

export interface ProductIngredient {
  supplement_id: number; // ingredient identity = a catalog supplement (2-tier)
  supplement_name: string;
  amount: number | null; // per serving; null = present but unquantified
  unit: IngredientUnit | null;
  is_primary?: boolean;
  order_index?: number;
  notes?: string;
}

export type IngredientComposition = ProductIngredient[];

export interface ProductContainingIngredient {
  product: Product;
  amount: number | null;
  unit: IngredientUnit | null;
  is_primary?: boolean;
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
  settings?: {
    servings_per_day: number;
    schedule_days?: number[];
    status: SupplementStatus;
    custom_dosage?: string;
  };
}

// ============================================================================
// Supplement Logging & Tracking Types
// ============================================================================

export type SupplementStatus = 'active' | 'paused' | 'stopped';

export interface SupplementLog {
  log_id: string;
  user_id: string;
  product_id: string;
  logged_at: string;
  log_date: string;
  servings_taken: number;
  created_at: string;
  // Relations
  products?: Product;
}

export interface SupplementLogInput {
  product_id: string;
  servings_taken?: number;
}

export interface UserSupplementSettings {
  setting_id: string;
  user_id: string;
  product_id: string;
  custom_dosage?: string;
  servings_per_day: number;
  schedule_days?: number[];
  status: SupplementStatus;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  // Relations
  products?: Product;
}

export interface UserSupplementSettingsInput {
  product_id: string;
  custom_dosage?: string;
  servings_per_day?: number;
  schedule_days?: number[];
  status?: SupplementStatus;
}

export interface DailyTrackingSummary {
  summary_id: string;
  user_id: string;
  summary_date: string;
  supplements_planned: number;
  supplements_taken: number;
  completion_percentage: number;
  current_streak: number;
  created_at: string;
  updated_at: string;
}

export interface TrackingStats {
  currentStreak: number;
  longestStreak: number;
  totalLogsThisWeek: number;
  totalLogsThisMonth: number;
  averageCompletion: number;
  perfectDays: number;
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
  notes?: string;
  is_core: boolean;
  order_index: number;
}

export interface StackLike {
  like_id: string;
  stack_id: string;
  profile_id: string;
  created_at: string;
}

export interface UserFollow {
  follow_id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
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

export interface StackInput {
  stack_name: string;
  stack_description: string;
  stack_image?: string;
  is_public?: boolean;
  source_title?: string;
  source_url?: string;
  source_type?: Stack['source_type'];
  source_date?: string;
  supplements: StackSupplementInput[];
}

export interface StackSupplementInput {
  supplement_id: number;
  dosage?: string;
  frequency?: string;
  notes?: string;
  is_core?: boolean;
  order_index: number;
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
  { id: 'all', name: 'All Supplements', icon: 'all', keywords: [] },
  { id: 'protein', name: 'Protein', icon: 'protein', keywords: ['protein', 'whey', 'casein', 'mass gainer', 'plant protein'] },
  { id: 'performance', name: 'Sports Nutrition', icon: 'performance', keywords: ['creatine', 'pre-workout', 'bcaa', 'beta-alanine', 'citrulline', 'hmb', 'beetroot', 'eaa', 'l-arginine', 'l-citrulline', 'taurine'] },
  { id: 'recovery', name: 'Recovery & Hydration', icon: 'recovery', keywords: ['electrolytes', 'magnesium', 'omega', 'fish oil', 'krill', 'algal', 'cod liver', 'dha', 'epa', 'recovery', 'hydration'] },
  { id: 'amino', name: 'Amino Acids', icon: 'amino', keywords: ['l-theanine', 'l-glutamine', 'l-carnitine', 'l-tyrosine', 'glycine', 'gaba', '5-htp', 'nac', 'n-acetyl', 'eaa', 'bcaa'] },
  { id: 'vitamins', name: 'Vitamins', icon: 'vitamins', keywords: ['vitamin', 'multivitamin', 'biotin', 'folate', 'folic', 'niacin'] },
  { id: 'minerals', name: 'Minerals', icon: 'minerals', keywords: ['magnesium', 'zinc', 'calcium', 'iron', 'potassium', 'selenium', 'chromium', 'copper', 'iodine', 'boron', 'manganese', 'electrolytes'] },
  { id: 'herbs', name: 'Herbs & Adaptogens', icon: 'herbs', keywords: ['ashwagandha', 'turmeric', 'curcumin', 'ginseng', 'rhodiola', 'maca', 'ginkgo', 'bacopa', 'holy basil', 'tulsi', 'milk thistle', 'elderberry', 'echinacea', 'valerian', 'st. john', 'saw palmetto', 'black seed', 'berberine', 'tongkat', 'fenugreek', 'lion\'s mane', 'reishi', 'cordyceps', 'mushroom', 'passionflower', 'lemon balm', 'chamomile', 'hawthorn', 'moringa', 'sea moss'] },
  { id: 'omega', name: 'Omega & Fish Oil', icon: 'omega', keywords: ['omega', 'fish oil', 'krill', 'algal', 'cod liver', 'dha', 'epa'] },
  { id: 'probiotics', name: 'Gut Health', icon: 'gut', keywords: ['probiotic', 'prebiotic', 'gut', 'digestive enzyme', 'psyllium', 'apple cider', 'ginger'] },
  { id: 'cognitive', name: 'Brain & Focus', icon: 'focus', keywords: ['alpha-gpc', 'phosphatidylserine', 'acetyl-l-carnitine', 'cdp-choline', 'nootropic'] },
  { id: 'sleep', name: 'Sleep & Relaxation', icon: 'sleep', keywords: ['melatonin', 'sleep', 'magnesium glycinate', 'apigenin'] },
  { id: 'heart', name: 'Heart Health', icon: 'heart', keywords: ['coq10', 'nattokinase', 'garlic', 'red yeast', 'resveratrol'] },
  { id: 'joints', name: 'Joint & Bone', icon: 'joints', keywords: ['glucosamine', 'chondroitin', 'msm', 'hyaluronic'] },
  { id: 'beauty', name: 'Beauty', icon: 'beauty', keywords: ['collagen', 'biotin', 'hyaluronic', 'keratin', 'silica'] },
  { id: 'longevity', name: 'Longevity', icon: 'longevity', keywords: ['resveratrol', 'nad', 'nmn', 'nr', 'spermidine', 'coq10', 'pqq'] },
  { id: 'metabolic', name: 'Metabolic', icon: 'metabolic', keywords: ['berberine', 'chromium', 'cinnamon', 'inositol', 'fiber', 'psyllium', 'glucomannan'] },
  { id: 'peptides', name: 'Peptides', icon: 'peptides', keywords: ['bpc-157', 'bpc157', 'tb-500', 'thymosin', 'retatrutide', 'tirzepatide', 'semaglutide', 'ipamorelin', 'cjc-1295', 'ghk-cu', 'ghk copper', 'glp-1', 'secretagogue'] },
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

export const SUPPLEMENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Currently Taking', color: 'green' },
  { value: 'paused', label: 'Paused', color: 'yellow' },
  { value: 'stopped', label: 'Stopped', color: 'gray' },
] as const;

export const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
  { value: 7, label: 'Sunday', short: 'Sun' },
] as const;
