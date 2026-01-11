'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import Image from 'next/image';
import { cn, getInitials } from '@/lib/design-system';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /** Image source URL */
  src?: string | null;
  /** Alt text / name for fallback initials */
  alt: string;
  /** Size preset */
  size?: AvatarSize;
  /** Show verification badge */
  verified?: boolean;
  /** Show influencer badge instead of verified */
  influencer?: boolean;
  /** Square shape instead of circle */
  square?: boolean;
}

const sizeConfig: Record<AvatarSize, { container: string; image: number; badge: string; badgeIcon: string }> = {
  xs: { container: 'w-6 h-6', image: 24, badge: 'w-3 h-3 -bottom-0.5 -right-0.5', badgeIcon: 'w-2 h-2' },
  sm: { container: 'w-8 h-8', image: 32, badge: 'w-4 h-4 -bottom-0.5 -right-0.5', badgeIcon: 'w-2.5 h-2.5' },
  md: { container: 'w-10 h-10', image: 40, badge: 'w-5 h-5 -bottom-0.5 -right-0.5', badgeIcon: 'w-3 h-3' },
  lg: { container: 'w-12 h-12', image: 48, badge: 'w-6 h-6 -bottom-1 -right-1', badgeIcon: 'w-3.5 h-3.5' },
  xl: { container: 'w-16 h-16', image: 64, badge: 'w-7 h-7 -bottom-1 -right-1', badgeIcon: 'w-4 h-4' },
  '2xl': { container: 'w-24 h-24', image: 96, badge: 'w-8 h-8 -bottom-1 -right-1', badgeIcon: 'w-5 h-5' },
  '3xl': { container: 'w-32 h-32', image: 128, badge: 'w-10 h-10 -bottom-1 -right-1', badgeIcon: 'w-6 h-6' },
};

const fontSizeMap: Record<AvatarSize, string> = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
};

/**
 * Avatar component with image, fallback, and optional verification badge
 *
 * @example
 * <Avatar src="/user.jpg" alt="John Doe" size="lg" verified />
 * <Avatar alt="Jane Smith" size="md" /> // Shows initials "JS"
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, size = 'md', verified, influencer, square = false, className, ...props }, ref) => {
    const config = sizeConfig[size];
    const initials = getInitials(alt);
    const showBadge = verified || influencer;

    return (
      <div ref={ref} className={cn('relative inline-block shrink-0', className)} {...props}>
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={config.image}
            height={config.image}
            className={cn(
              config.container,
              square ? 'rounded-lg' : 'rounded-full',
              'object-cover border-2 border-gray-200'
            )}
          />
        ) : (
          <div
            className={cn(
              config.container,
              square ? 'rounded-lg' : 'rounded-full',
              'flex items-center justify-center',
              'bg-gradient-to-br from-orange-400 to-pink-500',
              'text-white font-semibold',
              'border-2 border-gray-200',
              fontSizeMap[size]
            )}
            aria-label={alt}
          >
            {initials}
          </div>
        )}

        {showBadge && (
          <div
            className={cn(
              'absolute',
              config.badge,
              'bg-white rounded-full',
              'flex items-center justify-center',
              'border-2 border-white shadow-sm'
            )}
          >
            {verified ? (
              <VerifiedIcon className={cn(config.badgeIcon, 'text-blue-500')} />
            ) : (
              <InfluencerIcon className={cn(config.badgeIcon, 'text-purple-500')} />
            )}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Icons
function VerifiedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function InfluencerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default Avatar;
