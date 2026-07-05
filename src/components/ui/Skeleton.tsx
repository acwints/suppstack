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

export function SkeletonProductCard() {
  return (
    <Card className="animate-pulse">
      <Skeleton variant="rounded" className="h-64 rounded-t-xl rounded-b-none" />
      <CardBody>
        <Skeleton height={12} width={100} className="mb-2" />
        <Skeleton height={20} className="mb-3" />
        <div className="flex items-center gap-2 mb-4">
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton height={12} width={80} className="ml-2" />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Skeleton variant="rounded" height={60} />
          <Skeleton variant="rounded" height={60} />
        </div>
        <Skeleton height={12} className="mb-4" />
        <Skeleton variant="rounded" height={44} />
        <div className="flex gap-2 mt-3">
          <Skeleton variant="rounded" height={36} className="flex-1" />
          <Skeleton variant="rounded" height={36} className="flex-1" />
        </div>
      </CardBody>
    </Card>
  );
}

export function SkeletonStackCard() {
  return (
    <Card className="animate-pulse">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start gap-4">
          <Skeleton variant="circular" width={60} height={60} />
          <div className="flex-1">
            <Skeleton height={16} width={120} className="mb-2" />
            <Skeleton height={12} width={180} className="mb-2" />
            <div className="flex gap-2">
              <Skeleton variant="rounded" height={20} width={60} />
              <Skeleton variant="rounded" height={20} width={70} />
            </div>
          </div>
        </div>
      </div>
      <CardBody>
        <Skeleton height={20} className="mb-2" />
        <Skeleton height={12} className="mb-4" />
        <Skeleton height={12} className="mb-1" />
        <Skeleton height={12} className="mb-1" />
        <Skeleton height={12} className="mb-4 w-3/4" />
        <Skeleton variant="rounded" height={60} className="mb-4" />
        <div className="flex gap-4">
          <Skeleton height={12} width={50} />
          <Skeleton height={12} width={50} />
          <Skeleton height={12} width={50} />
        </div>
      </CardBody>
    </Card>
  );
}

export function SkeletonGrid({
  count = 12,
  CardComponent = SkeletonCard,
}: {
  count?: number;
  CardComponent?: React.ComponentType;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <CardComponent key={i} />
      ))}
    </div>
  );
}

export default Skeleton;
