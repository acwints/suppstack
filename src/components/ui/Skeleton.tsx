'use client';

import { Card, CardBody } from './Card';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'none';
}

const variantClasses = {
  text: 'rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-none',
  rounded: 'rounded-xl',
};

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const animationClass = animation === 'pulse' ? 'animate-pulse' : '';

  return (
    <div
      className={`
        bg-gray-200
        ${variantClasses[variant]}
        ${animationClass}
        ${className}
      `}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// Pre-built skeleton patterns
export function SkeletonCard() {
  return (
    <Card className="animate-pulse">
      <Skeleton variant="rounded" className="h-48 rounded-t-xl rounded-b-none" />
      <CardBody>
        <Skeleton height={16} className="mb-3" />
        <Skeleton height={12} className="mb-2" />
        <Skeleton height={12} className="mb-4 w-3/4" />
        <div className="flex justify-between items-center">
          <Skeleton height={12} width={80} />
          <Skeleton height={12} width={64} />
        </div>
      </CardBody>
    </Card>
  );
}

export function SkeletonGrid({
  count = 12,
  CardComponent = SkeletonCard,
  className,
}: {
  count?: number;
  CardComponent?: React.ComponentType;
  className?: string;
}) {
  return (
    // Default layout mirrors SupplementGrid so the page doesn't reflow when
    // real content replaces the skeleton.
    <div
      className={
        className ?? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4'
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardComponent key={i} />
      ))}
    </div>
  );
}
