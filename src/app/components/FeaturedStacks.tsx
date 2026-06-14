'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaExternalLinkAlt, FaEye, FaHeart, FaCopy, FaYoutube, FaGlobe, FaMicrophone, FaNewspaper, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { supabase } from '../supabase';
import type { Stack } from '@/types';
import { formatCompactNumber } from '@/lib/utils/format';
import { Badge } from '@/components/ui';
import { SkeletonStackCard } from '@/components/ui/Skeleton';

export default function FeaturedStacks() {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedStacks();
  }, []);

  const fetchFeaturedStacks = async () => {
    try {
      const { data, error } = await supabase
        .from('stacks')
        .select(`
          *,
          profile:user_profiles(
            profile_id, username, display_name, bio,
            profile_image, is_verified, is_influencer, follower_count
          ),
          supplements:stack_supplements(
            supplement_id, dosage, frequency, timing, notes, is_core, order_index,
            supplement:supplements(supplement_id, supplement_name)
          )
        `)
        .eq('is_featured', true)
        .eq('is_public', true)
        .order('like_count', { ascending: false })
        .limit(6);

      if (error) throw error;

      const transformedStacks = data?.map(stack => ({
        ...stack,
        supplements: stack.supplements
          .map((ss: any) => ({
            supplement_id: ss.supplement.supplement_id,
            supplement_name: ss.supplement.supplement_name,
            dosage: ss.dosage,
            frequency: ss.frequency,
            timing: ss.timing,
            notes: ss.notes,
            is_core: ss.is_core,
            order_index: ss.order_index,
          }))
          .sort((a: any, b: any) => a.order_index - b.order_index)
      })) || [];

      setStacks(transformedStacks);
    } catch (error) {
      console.error('Error fetching featured stacks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-16">
        <SectionHeader />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => <SkeletonStackCard key={i} />)}
        </div>
      </div>
    );
  }

  if (stacks.length === 0) return null;

  return (
    <div className="mb-16">
      <SectionHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stacks.map((stack, index) => (
          <StackCard key={stack.stack_id} stack={stack} index={index} />
        ))}
      </div>
      <div className="text-center mt-12">
        <Link
          href="/stacks"
          className="btn btn-outline hover:bg-orange-50 hover:border-orange-400 hover:text-orange-700 transition-all duration-300"
        >
          View All Featured Stacks
        </Link>
      </div>
    </div>
  );
}

function SectionHeader() {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
        Featured <span className="text-gradient">Stacks</span>
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        See training stacks from creators, athletes, and gym-heavy routines.
        <span className="text-yellow-600 text-sm block mt-1">
          These profiles are not authenticated on our platform
        </span>
      </p>
    </div>
  );
}

function StackCard({ stack, index }: { stack: Stack; index: number }) {
  const getSourceIcon = (sourceType: string) => {
    const icons: Record<string, JSX.Element> = {
      youtube: <FaYoutube className="text-red-500" />,
      podcast: <FaMicrophone className="text-purple-500" />,
      article: <FaNewspaper className="text-gray-600" />,
      interview: <FaMicrophone className="text-orange-500" />,
    };
    return icons[sourceType] || <FaGlobe className="text-gray-500" />;
  };

  return (
    <div
      className="modern-card group airbnb-hover animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Image
              src={stack.profile.profile_image || '/placeholder-avatar.jpg'}
              alt={stack.profile.display_name}
              width={60}
              height={60}
              className="rounded-full border-2 border-gray-300 group-hover:border-secondary-400 transition-colors duration-300"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-gray-300 shadow-sm">
              {stack.profile.is_verified ? (
                <FaCheckCircle className="w-3 h-3 text-gray-600" title="Verified" />
              ) : (
                <FaShieldAlt className="w-3 h-3 text-yellow-500" title="Not authenticated" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
              {stack.profile.display_name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              @{stack.profile.username} • {formatCompactNumber(stack.profile.follower_count)} followers
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={stack.profile.is_verified ? 'primary' : 'warning'} size="sm">
                {stack.profile.is_verified ? '✓ Verified' : '⚠️ Unverified'}
              </Badge>
              {stack.profile.is_influencer && (
                <Badge variant="secondary" size="sm">Influencer</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card-body">
        <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
          {stack.stack_name}
        </h4>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {stack.stack_description}
        </p>

        {/* Core Stack Picks */}
        <div className="mb-4">
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Core Stack Picks:</h5>
          <div className="space-y-1">
            {stack.supplements.filter(s => s.is_core).slice(0, 3).map(supplement => (
              <div key={supplement.supplement_id} className="flex items-center justify-between text-xs">
                <span className="text-gray-700">{supplement.supplement_name}</span>
                {supplement.dosage && <span className="text-gray-500">{supplement.dosage}</span>}
              </div>
            ))}
            {stack.supplements.filter(s => s.is_core).length > 3 && (
              <div className="text-xs text-gray-500">
                +{stack.supplements.filter(s => s.is_core).length - 3} more
              </div>
            )}
          </div>
        </div>

        {/* Source */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            {getSourceIcon(stack.source_type)}
            <span className="text-xs font-medium text-gray-700">Source</span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-1 mb-2">{stack.source_title}</p>
          <a
            href={stack.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
          >
            View Source <FaExternalLinkAlt className="w-2 h-2" />
          </a>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <FaEye className="w-3 h-3" /> {stack.view_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <FaHeart className="w-3 h-3" /> {stack.like_count}
          </span>
          <span className="flex items-center gap-1">
            <FaCopy className="w-3 h-3" /> {stack.copy_count}
          </span>
        </div>
      </div>
    </div>
  );
}
