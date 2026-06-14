'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiCalendar,
  FiLink,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiGrid,
  FiUsers,
  FiUserCheck,
} from 'react-icons/fi';
import { useAuth } from '@/app/context/AuthContext';
import { useStacks, useUserFollows } from '@/hooks';
import { supabase } from '@/app/supabase';
import {
  Button,
  Badge,
  Spinner,
  Card,
  Avatar,
  EmptyState,
  Tabs,
  Stack,
  Inline,
  Grid,
  useToast,
} from '@/components/ui';
import { StackCard } from '@/components/composite/Stack';
import type { UserProfile, Stack as StackType } from '@/types';

interface ExtendedUserProfile extends UserProfile {
  website?: string;
  twitter_handle?: string;
  instagram_handle?: string;
  youtube_channel?: string;
  created_at?: string;
  following_count?: number;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const username = params.username as string;

  const { user } = useAuth();
  const [profile, setProfile] = useState<ExtendedUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stacks' | 'followers' | 'following'>('stacks');

  const { getUserStacks } = useStacks({ enabled: false });
  const [userStacks, setUserStacks] = useState<StackType[]>([]);
  const [stacksLoading, setStacksLoading] = useState(false);

  const {
    isFollowing,
    followerCount,
    followingCount,
    toggleFollow,
    isLoading: followLoading,
    followers,
    following,
    fetchFollowers,
    fetchFollowing,
  } = useUserFollows(profile?.profile_id);

  // Fetch profile
  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        setProfile(null);
      } else {
        setProfile(data);
      }

      setIsLoading(false);
    }

    if (username) {
      fetchProfile();
    }
  }, [username]);

  // Fetch stacks when profile loads
  useEffect(() => {
    async function fetchStacks() {
      if (!profile?.profile_id) return;

      setStacksLoading(true);
      const stacks = await getUserStacks(profile.profile_id);
      setUserStacks(stacks);
      setStacksLoading(false);
    }

    fetchStacks();
  }, [profile?.profile_id, getUserStacks]);

  // Fetch followers/following when tab changes
  useEffect(() => {
    if (!profile?.profile_id) return;

    if (activeTab === 'followers') {
      fetchFollowers(profile.profile_id);
    } else if (activeTab === 'following') {
      fetchFollowing(profile.profile_id);
    }
  }, [activeTab, profile?.profile_id, fetchFollowers, fetchFollowing]);

  const handleFollow = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      await toggleFollow();
      toast.success(isFollowing ? 'Unfollowed' : 'Following!');
    } catch (err) {
      toast.error('Failed to update follow');
    }
  };

  const isOwnProfile = user && profile?.user_id === user.id;

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <EmptyState
          icon="404"
          title="User not found"
          description="This user doesn't exist or has been removed."
          action={
            <Link href="/stacks">
              <Button variant="primary">Browse Stacks</Button>
            </Link>
          }
          size="lg"
        />
      </main>
    );
  }

  const tabItems = [
    { id: 'stacks', label: 'Stacks', icon: <FiGrid size={16} />, count: userStacks.length },
    { id: 'followers', label: 'Followers', icon: <FiUsers size={16} />, count: followerCount },
    { id: 'following', label: 'Following', icon: <FiUserCheck size={16} />, count: followingCount },
  ] as const;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/stacks"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <FiArrowLeft />
        <span>Back to Stacks</span>
      </Link>

      <Stack gap={8}>
        {/* Profile Header */}
        <Card padding="lg">
          <Inline gap={6} align="start" wrap>
            {/* Avatar */}
            <Avatar
              src={profile.profile_image}
              alt={profile.display_name}
              size="3xl"
              verified={profile.is_verified}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Inline justify="between" align="start" wrap gap={4}>
                <Stack gap={2}>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {profile.display_name}
                  </h1>
                  <p className="text-gray-500">@{profile.username}</p>

                  <Inline gap={2}>
                    {profile.is_verified && (
                      <Badge variant="primary" size="sm">Verified</Badge>
                    )}
                    {profile.is_influencer && (
                      <Badge variant="secondary" size="sm">Influencer</Badge>
                    )}
                  </Inline>
                </Stack>

                {/* Action Buttons */}
                {!isOwnProfile && (
                  <Button
                    variant={isFollowing ? 'secondary' : 'primary'}
                    onClick={handleFollow}
                    isLoading={followLoading}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
                {isOwnProfile && (
                  <Link href="/profile">
                    <Button variant="outline">Edit Profile</Button>
                  </Link>
                )}
              </Inline>

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-600 mt-4 max-w-2xl">{profile.bio}</p>
              )}

              {/* Tab-like Stats */}
              <Inline gap={6} className="mt-4">
                {tabItems.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'text-gray-900 font-semibold'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.count.toLocaleString()} {tab.label.toLowerCase()}</span>
                  </button>
                ))}
              </Inline>

              {/* Social Links */}
              <Inline gap={4} wrap className="mt-4">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    <FiLink size={14} />
                    <span className="truncate max-w-[150px]">
                      {profile.website.replace(/^https?:\/\//, '')}
                    </span>
                  </a>
                )}
                {profile.twitter_handle && (
                  <a
                    href={`https://twitter.com/${profile.twitter_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-500 transition-colors"
                  >
                    <FiTwitter size={14} />
                    <span>@{profile.twitter_handle}</span>
                  </a>
                )}
                {profile.instagram_handle && (
                  <a
                    href={`https://instagram.com/${profile.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    <FiInstagram size={14} />
                    <span>@{profile.instagram_handle}</span>
                  </a>
                )}
                {profile.youtube_channel && (
                  <a
                    href={`https://youtube.com/${profile.youtube_channel}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <FiYoutube size={14} />
                    <span>YouTube</span>
                  </a>
                )}
                {profile.created_at && (
                  <Inline gap={1} className="text-sm text-gray-500">
                    <FiCalendar size={14} />
                    <span>
                      Joined{' '}
                      {new Date(profile.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </Inline>
                )}
              </Inline>
            </div>
          </Inline>
        </Card>

        {/* Tabs Content */}
        <Stack gap={4}>
          {activeTab === 'stacks' && (
            <>
              <h2 className="text-xl font-bold text-gray-900">Public Stacks</h2>
              {stacksLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : userStacks.length === 0 ? (
                <EmptyState
                  icon="📚"
                  title="No stacks yet"
                  description={
                    isOwnProfile
                      ? "You haven't created any public stacks yet."
                      : "This user hasn't shared any stacks yet."
                  }
                  action={
                    isOwnProfile && (
                      <Link href="/stacks/create">
                        <Button variant="primary">Create Your First Stack</Button>
                      </Link>
                    )
                  }
                  variant="card"
                />
              ) : (
                <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={6}>
                  {userStacks.map((stack, index) => (
                    <StackCard
                      key={stack.stack_id}
                      stack={stack}
                      index={index}
                      showCreator={false}
                    />
                  ))}
                </Grid>
              )}
            </>
          )}

          {activeTab === 'followers' && (
            <>
              <h2 className="text-xl font-bold text-gray-900">Followers</h2>
              {followers.length === 0 ? (
                <EmptyState
                  icon="👥"
                  title="No followers yet"
                  description={
                    isOwnProfile
                      ? 'Share your stacks to get followers!'
                      : 'Be the first to follow this user!'
                  }
                  variant="card"
                />
              ) : (
                <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={4}>
                  {followers.map((follower) => (
                    <Link
                      key={follower.profile_id}
                      href={`/users/${follower.username}`}
                    >
                      <Card
                        variant="outlined"
                        padding="md"
                        className="hover:border-orange-300 transition-colors"
                      >
                        <Inline gap={3} align="center">
                          <Avatar
                            src={follower.profile_image}
                            alt={follower.display_name}
                            size="md"
                            verified={follower.is_verified}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {follower.display_name}
                            </h4>
                            <p className="text-sm text-gray-500 truncate">
                              @{follower.username}
                            </p>
                          </div>
                        </Inline>
                      </Card>
                    </Link>
                  ))}
                </Grid>
              )}
            </>
          )}

          {activeTab === 'following' && (
            <>
              <h2 className="text-xl font-bold text-gray-900">Following</h2>
              {following.length === 0 ? (
                <EmptyState
                  icon="👥"
                  title="Not following anyone"
                  description={
                    isOwnProfile
                      ? 'Discover stacks and follow creators you like!'
                      : "This user isn't following anyone yet."
                  }
                  action={
                    isOwnProfile && (
                      <Link href="/stacks">
                        <Button variant="primary">Discover Stacks</Button>
                      </Link>
                    )
                  }
                  variant="card"
                />
              ) : (
                <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={4}>
                  {following.map((followed) => (
                    <Link
                      key={followed.profile_id}
                      href={`/users/${followed.username}`}
                    >
                      <Card
                        variant="outlined"
                        padding="md"
                        className="hover:border-orange-300 transition-colors"
                      >
                        <Inline gap={3} align="center">
                          <Avatar
                            src={followed.profile_image}
                            alt={followed.display_name}
                            size="md"
                            verified={followed.is_verified}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {followed.display_name}
                            </h4>
                            <p className="text-sm text-gray-500 truncate">
                              @{followed.username}
                            </p>
                          </div>
                        </Inline>
                      </Card>
                    </Link>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Stack>
      </Stack>
    </main>
  );
}
