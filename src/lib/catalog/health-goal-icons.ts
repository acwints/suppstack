import type { IconType } from 'react-icons';
import { FiActivity, FiMoon, FiTrendingUp, FiZap } from 'react-icons/fi';
import { TbScaleOutline } from 'react-icons/tb';
import type { HealthGoalId } from './health-goal-directory';

/** One icon per health goal, shared by every goal list in the app. */
export const HEALTH_GOAL_ICONS: Record<HealthGoalId, IconType> = {
  'sleep-recovery': FiMoon,
  'body-composition': TbScaleOutline,
  'training-output': FiZap,
  'metabolic-health': FiTrendingUp,
  'daily-foundation': FiActivity,
};
