'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { FiActivity, FiArrowRight, FiMoon, FiTrendingUp, FiZap } from 'react-icons/fi';
import { TbScaleOutline } from 'react-icons/tb';
import {
  buildHealthGoalDirectory,
  healthGoalHref,
  type HealthGoalId,
} from '@/lib/catalog/health-goal-directory';
import { isRemoteImageSrc } from '@/lib/catalog/product-image';
import type { Supplement } from '@/types';

export interface HealthGoalDirectoryProps {
  supplements: Supplement[];
}

const goalIcons: Record<HealthGoalId, ReactNode> = {
  'sleep-recovery': <FiMoon size={18} />,
  'body-composition': <TbScaleOutline size={19} />,
  'training-output': <FiZap size={18} />,
  'metabolic-health': <FiTrendingUp size={18} />,
  'daily-foundation': <FiActivity size={18} />,
};

export function HealthGoalDirectory({ supplements }: HealthGoalDirectoryProps) {
  const goals = buildHealthGoalDirectory(supplements);

  return (
    <div className="scrollbar-hide -mx-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-3 pb-2 sm:-mx-6 sm:px-6 lg:gap-5">
      {goals.map((goal) => {
        return (
          <Link
            key={goal.id}
            href={healthGoalHref(goal.id)}
            className="group flex min-h-[210px] w-[min(86vw,28rem)] shrink-0 snap-start flex-col rounded border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:w-[28rem] xl:w-[30rem]"
          >
            {/* One header row: icon, title, count + arrow. */}
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-gray-200 bg-white text-gray-700">
                {goalIcons[goal.id]}
              </span>
              <h3 className="min-w-0 flex-1 text-lg font-semibold leading-6 text-gray-900">
                {goal.title}
              </h3>
              <span className="flex shrink-0 items-center gap-1.5 text-sm text-gray-500">
                {goal.productCount}
                <FiArrowRight className="text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
              </span>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2.5">
              {goal.supplements.slice(0, 4).map((supplement) => (
                <div key={supplement.supplement_id} className="min-w-0">
                  <div className="relative aspect-square overflow-hidden rounded border border-gray-100 bg-white">
                    {supplement.image_url ? (
                      <Image
                        src={supplement.image_url}
                        alt=""
                        fill
                        className="object-contain p-2"
                        sizes="112px"
                        unoptimized={isRemoteImageSrc(supplement.image_url)}
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs font-semibold text-gray-300">
                        {supplement.supplement_name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-center text-xs text-gray-500">
                    {supplement.supplement_name}
                  </p>
                </div>
              ))}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default HealthGoalDirectory;
