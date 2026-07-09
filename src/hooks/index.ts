// Custom Hooks

export { useSupplements } from './useSupplements';
export type { UseSupplementsOptions, UseSupplementsResult } from './useSupplements';

export { useProductInStack } from './useProductInStack';
export type { UseProductInStackResult } from './useProductInStack';

export { usePriceCalculations, useRegimenCost } from './usePriceCalculations';
export { useCommerceCheckout } from './useCommerceCheckout';
export { useDebounce } from './useDebounce';
export { useRegimen } from './useRegimen';
export { useProduct } from './useProduct';
export { useProductRatingStats } from './useProductRatingStats';


export { useReviews } from './useReviews';
export type { UseReviewsOptions, UseReviewsResult, ReviewSortBy } from './useReviews';

// Billing
export { usePremium } from './usePremium';
export type { UsePremiumResult } from './usePremium';

// Tracking & Logging Hooks
export { useSupplementLogs } from './useSupplementLogs';
export type { UseSupplementLogsOptions, UseSupplementLogsResult } from './useSupplementLogs';

export { useSupplementSettings } from './useSupplementSettings';
export type { UseSupplementSettingsResult } from './useSupplementSettings';

export { useHealthSnapshots } from './useHealthSnapshots';
export type {
  SavedHealthSnapshot,
  UseHealthSnapshotsOptions,
  UseHealthSnapshotsResult,
} from './useHealthSnapshots';

export { useHealthExperiments } from './useHealthExperiments';
export type {
  CompleteHealthExperimentInput,
  CreateHealthExperimentInput,
  HealthExperiment,
  HealthExperimentStatus,
  UseHealthExperimentsOptions,
  UseHealthExperimentsResult,
} from './useHealthExperiments';

// Stacks & Social Hooks
export { useStacks } from './useStacks';
export type { UseStacksOptions, UseStacksResult, StackSortBy, StackFilter } from './useStacks';

export { useStackLikes } from './useStackLikes';
export type { UseStackLikesResult } from './useStackLikes';

export { useUserFollows } from './useUserFollows';
export type { UseUserFollowsResult } from './useUserFollows';
