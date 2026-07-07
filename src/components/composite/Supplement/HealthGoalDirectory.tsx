'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { FiArrowRight, FiActivity, FiMoon, FiTrendingUp, FiZap } from 'react-icons/fi';
import { TbScaleOutline } from 'react-icons/tb';
import {
  buildHealthGoalDirectory,
  healthGoalHref,
  type HealthGoalId,
} from '@/lib/catalog/health-goal-directory';
import type { Supplement } from '@/types';
import { formatPrice } from '@/lib/utils';

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
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
      {goals.map((goal) => {
        return (
          <Link
            key={goal.id}
            href={healthGoalHref(goal.id)}
            className="group flex min-h-[250px] flex-col rounded border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded border border-gray-200 bg-white text-gray-700">
                {goalIcons[goal.id]}
              </span>
              <FiArrowRight className="mt-1 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
            </div>

            <h3 className="text-base font-semibold text-gray-900">{goal.title}</h3>
            <p className="mt-1 line-clamp-3 text-sm leading-5 text-gray-500">{goal.description}</p>

            <div className="mt-4 grid grid-cols-4 gap-1.5">
              {goal.supplements.slice(0, 4).map((supplement) => (
                <div
                  key={supplement.supplement_id}
                  className="relative aspect-square overflow-hidden rounded border border-gray-100 bg-white"
                >
                  {supplement.image_url ? (
                    <Image
                      src={supplement.image_url}
                      alt={supplement.supplement_name}
                      fill
                      className="object-contain p-1.5"
                      sizes="80px"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs font-semibold text-gray-300">
                      {supplement.supplement_name.charAt(0)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {goal.signalLabel}
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {goal.productCount} products
                {goal.priceFrom !== null && (
                  <span className="font-semibold text-gray-900">
                    {' '}from ${formatPrice(goal.priceFrom)}
                  </span>
                )}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default HealthGoalDirectory;
