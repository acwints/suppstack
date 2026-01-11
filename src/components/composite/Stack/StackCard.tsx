'use client';

import Link from 'next/link';
import {
  FaExternalLinkAlt,
  FaEye,
  FaHeart,
  FaCopy,
  FaYoutube,
  FaGlobe,
  FaMicrophone,
  FaNewspaper,
} from 'react-icons/fa';
import type { Stack } from '@/types';
import { formatCompactNumber } from '@/lib/utils/format';
import { Badge, Card, Avatar, Stack as StackLayout, Inline } from '@/components/ui';

export interface StackCardProps {
  stack: Stack;
  index?: number;
  showCreator?: boolean;
  compact?: boolean;
}

const sourceIcons: Record<string, JSX.Element> = {
  youtube: <FaYoutube className="text-red-500" />,
  podcast: <FaMicrophone className="text-purple-500" />,
  article: <FaNewspaper className="text-gray-600" />,
  interview: <FaMicrophone className="text-orange-500" />,
  website: <FaGlobe className="text-gray-500" />,
};

export function StackCard({
  stack,
  index = 0,
  showCreator = true,
  compact = false,
}: StackCardProps) {
  const getSourceIcon = (sourceType: string) => {
    return sourceIcons[sourceType] || <FaGlobe className="text-gray-500" />;
  };

  if (compact) {
    return (
      <Link href={`/stacks/${stack.stack_id}`} className="block">
        <Card
          variant="outlined"
          padding="md"
          className="hover:border-orange-300 hover:shadow-md transition-all"
        >
          <Inline gap={3} align="center">
            {showCreator && stack.profile && (
              <Avatar
                src={stack.profile.profile_image}
                alt={stack.profile.display_name}
                size="md"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{stack.stack_name}</h4>
              {showCreator && stack.profile && (
                <p className="text-sm text-gray-500 truncate">by {stack.profile.display_name}</p>
              )}
            </div>
            <Inline gap={1} className="text-xs text-gray-500">
              <FaHeart className="w-3 h-3" /> {stack.like_count}
            </Inline>
          </Inline>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/stacks/${stack.stack_id}`} className="block h-full">
      <Card
        className="group h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in"
        style={{ animationDelay: `${index * 0.1}s` }}
        padding="none"
      >
        {/* Header with Creator */}
        {showCreator && stack.profile && (
          <div className="p-6 border-b border-gray-200">
            <Inline gap={4} align="start">
              <Avatar
                src={stack.profile.profile_image}
                alt={stack.profile.display_name}
                size="lg"
                verified={stack.profile.is_verified}
                influencer={stack.profile.is_influencer}
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {stack.profile.display_name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  @{stack.profile.username}
                  {stack.profile.follower_count > 0 &&
                    ` • ${formatCompactNumber(stack.profile.follower_count)} followers`}
                </p>
                <Inline gap={2}>
                  <Badge
                    variant={stack.profile.is_verified ? 'primary' : 'warning'}
                    size="sm"
                  >
                    {stack.profile.is_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                  {stack.profile.is_influencer && (
                    <Badge variant="secondary" size="sm">
                      Influencer
                    </Badge>
                  )}
                </Inline>
              </div>
            </Inline>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <StackLayout gap={4}>
            <div>
              <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                {stack.stack_name}
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2">{stack.stack_description}</p>
            </div>

            {/* Core Supplements */}
            {stack.supplements && stack.supplements.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Core Supplements:</h5>
                <StackLayout gap={1}>
                  {stack.supplements
                    .filter((s) => s.is_core)
                    .slice(0, 3)
                    .map((supplement) => (
                      <Inline
                        key={supplement.supplement_id}
                        justify="between"
                        className="text-xs"
                      >
                        <span className="text-gray-700">{supplement.supplement_name}</span>
                        {supplement.dosage && (
                          <span className="text-gray-500">{supplement.dosage}</span>
                        )}
                      </Inline>
                    ))}
                  {stack.supplements.filter((s) => s.is_core).length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{stack.supplements.filter((s) => s.is_core).length - 3} more
                    </span>
                  )}
                </StackLayout>
              </div>
            )}

            {/* Source */}
            {stack.source_title && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Inline gap={2} align="center" className="mb-1">
                  {getSourceIcon(stack.source_type)}
                  <span className="text-xs font-medium text-gray-700">Source</span>
                </Inline>
                <p className="text-xs text-gray-600 line-clamp-1 mb-2">{stack.source_title}</p>
                {stack.source_url && (
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(stack.source_url, '_blank');
                    }}
                    className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    View Source <FaExternalLinkAlt className="w-2 h-2" />
                  </span>
                )}
              </div>
            )}

            {/* Stats */}
            <Inline
              gap={4}
              className="text-xs text-gray-500 pt-4 border-t border-gray-100 mt-auto"
            >
              <Inline gap={1}>
                <FaEye className="w-3 h-3" /> {stack.view_count?.toLocaleString() || 0}
              </Inline>
              <Inline gap={1}>
                <FaHeart className="w-3 h-3" /> {stack.like_count || 0}
              </Inline>
              <Inline gap={1}>
                <FaCopy className="w-3 h-3" /> {stack.copy_count || 0}
              </Inline>
            </Inline>
          </StackLayout>
        </div>
      </Card>
    </Link>
  );
}

export default StackCard;
