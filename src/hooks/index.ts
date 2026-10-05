// Data and state hooks — import from '@/hooks', never from individual files.

// Catalog
export { useSupplements } from './useSupplements';
export type { UseSupplementsOptions, UseSupplementsResult } from './useSupplements';
export { useProduct } from './useProduct';
export { useProductsWithIngredient } from './useProductsWithIngredient';
export type { UseProductsWithIngredientResult } from './useProductsWithIngredient';
export { useReviews } from './useReviews';
export type { UseReviewsOptions, UseReviewsResult, ReviewSortBy } from './useReviews';
export { useCommerceCheckout } from './useCommerceCheckout';

// My stack and tracking
export { useMyStack, isScheduledOn, isoWeekday } from './useMyStack';
export type { UseMyStackResult } from './useMyStack';
export { useStackIngredients } from './useStackIngredients';
export type { UseStackIngredientsResult } from './useStackIngredients';
export { useProductInStack } from './useProductInStack';
export type { UseProductInStackResult } from './useProductInStack';
export { useSupplementLogs } from './useSupplementLogs';
export type { UseSupplementLogsResult } from './useSupplementLogs';

// Shared stacks and social
export { useStacks } from './useStacks';
export type { UseStacksOptions, UseStacksResult, StackSortBy, StackFilter } from './useStacks';
export { useStackLikes } from './useStackLikes';
export type { UseStackLikesResult } from './useStackLikes';
export { useUserFollows } from './useUserFollows';
export type { UseUserFollowsResult } from './useUserFollows';

// App-wide shared state (thin hooks over the providers in src/app/context)
export { usePremium } from './usePremium';
export type { UsePremiumResult } from './usePremium';
export { useSavedProducts } from './useSavedProducts';
export type { UseSavedProductsResult } from './useSavedProducts';

// Utilities
export { useDebounce } from './useDebounce';
