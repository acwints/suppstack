'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiHeart,
  FiCopy,
  FiEye,
  FiExternalLink,
  FiClock,
  FiCheck,
  FiShare2,
} from 'react-icons/fi';
import { useAuth } from '@/app/context/AuthContext';
import { useStacks, useStackLikes, useUserFollows } from '@/hooks';
import {
  Button,
  Badge,
  Spinner,
  Card,
  Avatar,
  EmptyState,
  Stack,
  Inline,
  useToast,
} from '@/components/ui';
import { StackCard, BuyStackPanel, getStackSourceIcon } from '@/components/composite/Stack';
import type { Stack as StackType } from '@/types';

export default function StackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const stackId = params.id as string;

  const { user } = useAuth();
  const { getStack, copyStack, getUserStacks } = useStacks({ enabled: false });
  const { isLiked, likeCount, toggleLike, isLoading: likeLoading } = useStackLikes(stackId);
  const [stack, setStack] = useState<StackType | null>(null);
  const [relatedStacks, setRelatedStacks] = useState<StackType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const {
    isFollowing,
    followerCount,
    toggleFollow,
    isLoading: followLoading,
  } = useUserFollows(stack?.profile?.profile_id);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const stackData = await getStack(stackId);
      setStack(stackData);

      if (stackData?.profile?.profile_id) {
        const userStacks = await getUserStacks(stackData.profile.profile_id);
        setRelatedStacks(userStacks.filter(s => s.stack_id !== stackId).slice(0, 3));
      }

      setIsLoading(false);
    }

    if (stackId) {
      fetchData();
    }
  }, [stackId, getStack, getUserStacks]);

  const handleCopyStack = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsCopying(true);
    try {
      const newStack = await copyStack(stackId);
      setCopySuccess(true);
      toast.success('Stack copied!', 'Redirecting to your new stack...');
      setTimeout(() => {
        router.push(`/stacks/${newStack.stack_id}`);
      }, 1500);
    } catch (err) {
      toast.error('Failed to copy stack', 'Please try again');
    } finally {
      setIsCopying(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      await toggleLike();
    } catch (err) {
      toast.error('Failed to update like');
    }
  };

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: stack?.stack_name,
          text: stack?.stack_description,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const getSourceIcon = (sourceType: string) => getStackSourceIcon(sourceType, 20);

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </main>
    );
  }

  if (!stack) {
    return (
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-8">
        <EmptyState
          icon="404"
          title="Stack not found"
          description="This stack may have been deleted or made private."
          action={
            <Link href="/">
              <Button variant="primary">Back to Shop</Button>
            </Link>
          }
          size="lg"
        />
      </main>
    );
  }

  const coreSupplements = stack.supplements?.filter(s => s.is_core) || [];
  const optionalSupplements = stack.supplements?.filter(s => !s.is_core) || [];

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 py-8">
      {/* Back Button */}
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <FiArrowLeft />
        <span>Back to My Stack</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Stack gap={6}>
            {/* Stack Header */}
            <Card padding="md">
              <Inline justify="between" align="start" className="mb-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {stack.stack_name}
                  </h1>
                  <Inline gap={4} className="text-sm text-gray-500">
                    <Inline gap={1}>
                      <FiEye /> {stack.view_count?.toLocaleString() || 0} views
                    </Inline>
                    <Inline gap={1}>
                      <FiHeart /> {likeCount} likes
                    </Inline>
                    <Inline gap={1}>
                      <FiCopy /> {stack.copy_count || 0} copies
                    </Inline>
                  </Inline>
                </div>

                <Inline gap={2}>
                  {stack.is_featured && <Badge variant="primary">Featured</Badge>}
                  {stack.is_verified && <Badge variant="success">Verified</Badge>}
                </Inline>
              </Inline>

              <p className="text-gray-600 mb-6">{stack.stack_description}</p>

              {/* Action Buttons */}
              <Inline gap={3} wrap>
                <Button
                  variant={isLiked ? 'primary' : 'outline'}
                  leftIcon={<FiHeart className={isLiked ? 'fill-current' : ''} />}
                  onClick={handleLike}
                  isLoading={likeLoading}
                >
                  {isLiked ? 'Liked' : 'Like'}
                </Button>
                <Button
                  variant="outline"
                  leftIcon={copySuccess ? <FiCheck /> : <FiCopy />}
                  onClick={handleCopyStack}
                  isLoading={isCopying}
                  disabled={copySuccess}
                >
                  {copySuccess ? 'Copied!' : 'Copy Stack'}
                </Button>
                <Button variant="ghost" leftIcon={<FiShare2 />} onClick={handleShare}>
                  Share
                </Button>
              </Inline>
            </Card>

            {/* Source Attribution */}
            {stack.source_title && (
              <Card padding="md">
                <h3 className="font-semibold text-gray-900 mb-4">Source</h3>
                <Inline gap={4} align="start">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    {getSourceIcon(stack.source_type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{stack.source_title}</p>
                    {stack.source_date && (
                      <Inline gap={1} className="text-sm text-gray-500 mt-1">
                        <FiClock size={14} />
                        {new Date(stack.source_date).toLocaleDateString()}
                      </Inline>
                    )}
                    {stack.source_url && (
                      <a
                        href={stack.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 mt-2"
                      >
                        View Original <FiExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </Inline>
              </Card>
            )}

            {/* Core Stack Picks */}
            {coreSupplements.length > 0 && (
              <Card padding="md">
                <Inline gap={2} className="mb-4">
                  <h3 className="font-semibold text-gray-900">Core Stack Picks</h3>
                  <Badge variant="primary">{coreSupplements.length}</Badge>
                </Inline>
                <Stack gap={3}>
                  {coreSupplements.map((supplement, idx) => (
                    <div
                      key={supplement.supplement_id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <Inline gap={3} align="start">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-semibold text-orange-600">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{supplement.supplement_name}</h4>
                          <Inline gap={2} wrap className="mt-1">
                            {supplement.dosage && (
                              <span className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                                {supplement.dosage}
                              </span>
                            )}
                            {supplement.frequency && (
                              <span className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                                {supplement.frequency}
                              </span>
                            )}
                            {supplement.timing && (
                              <span className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                                {supplement.timing}
                              </span>
                            )}
                          </Inline>
                          {supplement.notes && (
                            <p className="text-sm text-gray-500 mt-2">{supplement.notes}</p>
                          )}
                        </div>
                      </Inline>
                    </div>
                  ))}
                </Stack>
              </Card>
            )}

            {/* Optional Stack Picks */}
            {optionalSupplements.length > 0 && (
              <Card padding="md">
                <Inline gap={2} className="mb-4">
                  <h3 className="font-semibold text-gray-900">Optional Stack Picks</h3>
                  <Badge variant="secondary">{optionalSupplements.length}</Badge>
                </Inline>
                <Stack gap={3}>
                  {optionalSupplements.map((supplement) => (
                    <div
                      key={supplement.supplement_id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <h4 className="font-medium text-gray-900">{supplement.supplement_name}</h4>
                      <Inline gap={2} wrap className="mt-1">
                        {supplement.dosage && (
                          <span className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                            {supplement.dosage}
                          </span>
                        )}
                        {supplement.frequency && (
                          <span className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                            {supplement.frequency}
                          </span>
                        )}
                        {supplement.timing && (
                          <span className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                            {supplement.timing}
                          </span>
                        )}
                      </Inline>
                      {supplement.notes && (
                        <p className="text-sm text-gray-500 mt-2">{supplement.notes}</p>
                      )}
                    </div>
                  ))}
                </Stack>
              </Card>
            )}
          </Stack>
        </div>

        {/* Sidebar */}
        <Stack gap={6}>
          {/* Buy Stack Panel */}
          {stack.supplements && stack.supplements.length > 0 && (
            <BuyStackPanel
              stackId={stackId}
              supplements={stack.supplements}
            />
          )}

          {/* Creator Profile */}
          {stack.profile && (
            <Card padding="md">
              <h3 className="font-semibold text-gray-900 mb-4">Created by</h3>
              <Inline gap={4} align="start">
                <Avatar
                  src={stack.profile.profile_image}
                  alt={stack.profile.display_name}
                  size="xl"
                  verified={stack.profile.is_verified}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{stack.profile.display_name}</h4>
                  <p className="text-sm text-gray-500 mb-2">@{stack.profile.username}</p>
                  <Inline gap={2} className="mb-3">
                    {stack.profile.is_verified && <Badge variant="primary" size="sm">Verified</Badge>}
                    {stack.profile.is_influencer && <Badge variant="secondary" size="sm">Influencer</Badge>}
                  </Inline>
                  <p className="text-sm text-gray-600">
                    {followerCount.toLocaleString()} followers
                  </p>
                </div>
              </Inline>

              {stack.profile.bio && (
                <p className="text-sm text-gray-600 mt-4 line-clamp-3">{stack.profile.bio}</p>
              )}

              <Inline gap={2} className="mt-4">
                <Button
                  variant={isFollowing ? 'secondary' : 'primary'}
                  onClick={handleFollow}
                  isLoading={followLoading}
                  fullWidth
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </Inline>
            </Card>
          )}

          {/* Related Stacks */}
          {relatedStacks.length > 0 && (
            <Card padding="md">
              <h3 className="font-semibold text-gray-900 mb-4">
                More from {stack.profile?.display_name}
              </h3>
              <Stack gap={4}>
                {relatedStacks.map((relatedStack) => (
                  <StackCard
                    key={relatedStack.stack_id}
                    stack={relatedStack}
                    showCreator={false}
                    compact
                  />
                ))}
              </Stack>
            </Card>
          )}

          {/* CTA for non-logged in users */}
          {!user && (
            <div className="rounded border border-orange-200 bg-orange-50 p-6">
              <h3 className="font-bold mb-2 text-gray-900">Want to save this stack?</h3>
              <p className="text-sm text-gray-700 mb-4">
                Sign in to copy this stack, track refill cost, and keep your supplements organized.
              </p>
              <Link href="/login">
                <Button variant="primary" fullWidth>
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </Stack>
      </div>
    </main>
  );
}
