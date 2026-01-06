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
// Supplement Logging & Tracking Types
// ============================================================================

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type SupplementStatus = 'active' | 'paused' | 'stopped';

export interface SupplementLog {
  log_id: string;
  user_id: string;
  product_id: string;
  logged_at: string;
  log_date: string;
  time_of_day: TimeOfDay;
  servings_taken: number;
  notes?: string;
  mood_before?: number;
  mood_after?: number;
  energy_level?: number;
  side_effects?: string;
  created_at: string;
  // Relations
  products?: Product;
}

export interface SupplementLogInput {
  product_id: string;
  time_of_day?: TimeOfDay;
  servings_taken?: number;
  notes?: string;
  mood_before?: number;
  mood_after?: number;
  energy_level?: number;
  side_effects?: string;
}

export interface UserSupplementSettings {
  setting_id: string;
  user_id: string;
  product_id: string;
  custom_dosage?: string;
  servings_per_day: number;
  schedule_times?: string[];
  schedule_days?: number[];
  take_with_food: boolean;
  timing_notes?: string;
  status: SupplementStatus;
  start_date: string;
  end_date?: string;
  goal?: string;
  target_duration_days?: number;
  reminders_enabled: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  products?: Product;
}

export interface UserSupplementSettingsInput {
  product_id: string;
  custom_dosage?: string;
  servings_per_day?: number;
  schedule_times?: string[];
  schedule_days?: number[];
  take_with_food?: boolean;
  timing_notes?: string;
  status?: SupplementStatus;
  goal?: string;
  target_duration_days?: number;
  reminders_enabled?: boolean;
}

export interface DailyTrackingSummary {
  summary_id: string;
  user_id: string;
  summary_date: string;
  supplements_planned: number;
  supplements_taken: number;
  completion_percentage: number;
  current_streak: number;
  overall_energy?: number;
  overall_mood?: number;
  sleep_quality?: number;
  sleep_hours?: number;
  daily_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyWellnessInput {
  overall_energy?: number;
  overall_mood?: number;
  sleep_quality?: number;
  sleep_hours?: number;
  daily_notes?: string;
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
  { id: 'vitamins', name: 'Vitamins', icon: '💊', keywords: ['vitamin', 'multivitamin', 'biotin', 'folate', 'folic', 'niacin'] },
  { id: 'minerals', name: 'Minerals', icon: '⚡', keywords: ['magnesium', 'zinc', 'calcium', 'iron', 'potassium', 'selenium', 'chromium', 'copper', 'iodine', 'boron', 'manganese', 'electrolytes'] },
  { id: 'protein', name: 'Protein', icon: '💪', keywords: ['protein', 'whey', 'casein', 'collagen', 'keratin'] },
  { id: 'herbs', name: 'Herbs & Adaptogens', icon: '🌿', keywords: ['ashwagandha', 'turmeric', 'curcumin', 'ginseng', 'rhodiola', 'maca', 'ginkgo', 'bacopa', 'holy basil', 'tulsi', 'milk thistle', 'elderberry', 'echinacea', 'valerian', 'st. john', 'saw palmetto', 'black seed', 'berberine', 'tongkat', 'fenugreek', 'lion\'s mane', 'reishi', 'cordyceps', 'mushroom', 'passionflower', 'lemon balm', 'chamomile', 'hawthorn', 'moringa', 'sea moss'] },
  { id: 'omega', name: 'Omega & Fish Oil', icon: '🐟', keywords: ['omega', 'fish oil', 'krill', 'algal', 'cod liver', 'dha', 'epa'] },
  { id: 'probiotics', name: 'Gut Health', icon: '🦠', keywords: ['probiotic', 'prebiotic', 'gut', 'digestive enzyme', 'psyllium', 'apple cider', 'ginger'] },
  { id: 'performance', name: 'Performance', icon: '🏃', keywords: ['creatine', 'pre-workout', 'bcaa', 'beta-alanine', 'citrulline', 'hmb', 'beetroot', 'eaa', 'l-arginine', 'l-citrulline', 'taurine'] },
  { id: 'amino', name: 'Amino Acids', icon: '🧬', keywords: ['l-theanine', 'l-glutamine', 'l-carnitine', 'l-tyrosine', 'glycine', 'gaba', '5-htp', 'nac', 'n-acetyl'] },
  { id: 'cognitive', name: 'Brain & Focus', icon: '🧠', keywords: ['alpha-gpc', 'phosphatidylserine', 'acetyl-l-carnitine', 'cdp-choline', 'nootropic'] },
  { id: 'sleep', name: 'Sleep & Relaxation', icon: '😴', keywords: ['melatonin', 'sleep', 'magnesium glycinate', 'apigenin'] },
  { id: 'heart', name: 'Heart Health', icon: '❤️', keywords: ['coq10', 'nattokinase', 'garlic', 'red yeast', 'resveratrol'] },
  { id: 'joints', name: 'Joint & Bone', icon: '🦴', keywords: ['glucosamine', 'chondroitin', 'msm', 'hyaluronic'] },
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

export const TIME_OF_DAY_OPTIONS = [
  { value: 'morning', label: 'Morning', icon: '🌅', timeRange: '6am - 12pm' },
  { value: 'afternoon', label: 'Afternoon', icon: '☀️', timeRange: '12pm - 5pm' },
  { value: 'evening', label: 'Evening', icon: '🌆', timeRange: '5pm - 9pm' },
  { value: 'night', label: 'Night', icon: '🌙', timeRange: '9pm - 6am' },
] as const;

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
