'use client';

import { FiTrendingUp, FiCalendar, FiTarget, FiAward, FiActivity, FiZap } from 'react-icons/fi';
import { Card } from '@/components/ui';
import type { TrackingStats as TrackingStatsType, DailyTrackingSummary } from '@/types';

export interface TrackingStatsProps {
  stats: TrackingStatsType | null;
  dailySummary: DailyTrackingSummary | null;
  className?: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}

function StatCard({ icon, label, value, subtext, color }: StatCardProps) {
  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${color} transition-transform hover:scale-105`}>
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 rounded-lg bg-white/20">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/80">{label}</p>
      {subtext && <p className="text-xs text-white/60 mt-1">{subtext}</p>}
    </div>
  );
}

export function TrackingStats({ stats, dailySummary, className = '' }: TrackingStatsProps) {
  const currentStreak = stats?.currentStreak || dailySummary?.current_streak || 0;
  const todayCompletion = dailySummary?.completion_percentage || 0;
  const weeklyLogs = stats?.totalLogsThisWeek || 0;
  const perfectDays = stats?.perfectDays || 0;
  const avgCompletion = stats?.averageCompletion || 0;
  const monthlyLogs = stats?.totalLogsThisMonth || 0;

  // Streak message
  const getStreakMessage = (streak: number): string => {
    if (streak === 0) return "Start your streak today!";
    if (streak === 1) return "Great start!";
    if (streak < 7) return "Keep it going!";
    if (streak < 30) return "Impressive!";
    if (streak < 100) return "Amazing dedication!";
    return "Legendary!";
  };

  // Streak icon based on length
  const getStreakEmoji = (streak: number): string => {
    if (streak === 0) return "🎯";
    if (streak < 3) return "🔥";
    if (streak < 7) return "🔥🔥";
    if (streak < 30) return "💪";
    if (streak < 100) return "🏆";
    return "👑";
  };

  return (
    <div className={className}>
      {/* Main Streak Card */}
      <Card variant="modern" className="p-6 mb-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm font-medium mb-1">Current Streak</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{currentStreak}</span>
              <span className="text-xl text-orange-100">day{currentStreak !== 1 ? 's' : ''}</span>
              <span className="text-3xl ml-2">{getStreakEmoji(currentStreak)}</span>
            </div>
            <p className="text-orange-100 text-sm mt-2">{getStreakMessage(currentStreak)}</p>
          </div>
          <div className="hidden sm:block">
            <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold">{Math.round(todayCompletion)}%</p>
                <p className="text-xs text-orange-100">Today</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<FiActivity className="text-white" size={20} />}
          label="This Week"
          value={weeklyLogs}
          subtext="supplements logged"
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={<FiCalendar className="text-white" size={20} />}
          label="This Month"
          value={monthlyLogs}
          subtext="supplements logged"
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          icon={<FiTarget className="text-white" size={20} />}
          label="Avg Completion"
          value={`${avgCompletion}%`}
          subtext="daily average"
          color="from-teal-500 to-teal-600"
        />
        <StatCard
          icon={<FiAward className="text-white" size={20} />}
          label="Perfect Days"
          value={perfectDays}
          subtext="100% completion"
          color="from-amber-500 to-amber-600"
        />
        <StatCard
          icon={<FiTrendingUp className="text-white" size={20} />}
          label="Longest Streak"
          value={stats?.longestStreak || currentStreak}
          subtext="consecutive days"
          color="from-green-500 to-green-600"
        />
        <StatCard
          icon={<FiZap className="text-white" size={20} />}
          label="Today's Progress"
          value={`${Math.round(todayCompletion)}%`}
          subtext={`${dailySummary?.supplements_taken || 0}/${dailySummary?.supplements_planned || 0} logged`}
          color="from-rose-500 to-rose-600"
        />
      </div>
    </div>
  );
}

export default TrackingStats;
