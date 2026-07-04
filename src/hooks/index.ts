// Custom Hooks
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { useSupabaseQuery, useSupabaseRecord } from './useSupabaseQuery';
export type { UseSupabaseQueryOptions, UseSupabaseQueryResult } from './useSupabaseQuery';

export { useSupplements } from './useSupplements';
export type { UseSupplementsOptions, UseSupplementsResult } from './useSupplements';

export { useProductInStack } from './useProductInStack';
export type { UseProductInStackResult } from './useProductInStack';

export { usePriceCalculations, useRegimenCost } from './usePriceCalculations';
export { useCommerceCheckout } from './useCommerceCheckout';

export { useLocalStorage, useUserPreferences } from './useLocalStorage';
export type { UserPreferences } from './useLocalStorage';

export { useReviews } from './useReviews';
export type { UseReviewsOptions, UseReviewsResult, ReviewSortBy } from './useReviews';

// Tracking & Logging Hooks
export { useSupplementLogs } from './useSupplementLogs';
export type { UseSupplementLogsOptions, UseSupplementLogsResult } from './useSupplementLogs';

export { useSupplementSettings } from './useSupplementSettings';
export type { UseSupplementSettingsResult } from './useSupplementSettings';

// Stacks & Social Hooks
export { useStacks } from './useStacks';
export type { UseStacksOptions, UseStacksResult, StackSortBy, StackFilter } from './useStacks';

export { useStackLikes } from './useStackLikes';
export type { UseStackLikesResult } from './useStackLikes';

export { useUserFollows } from './useUserFollows';
export type { UseUserFollowsResult } from './useUserFollows';
