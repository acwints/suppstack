'use client';

import Link from 'next/link';
import { FiActivity, FiMoon, FiZap } from 'react-icons/fi';
import type { Supplement } from '@/types';

export interface FeaturedCategoriesProps {
  supplements: Supplement[];
}

export function FeaturedCategories({ supplements }: FeaturedCategoriesProps) {
  const featuredCategories = [
    {
      name: 'Daily Essentials',
      description: 'Core micronutrients with clear use cases',
      supplements: supplements
        .filter(s => ['Vitamins', 'Minerals'].includes(s.category || ''))
        .slice(0, 4),
      icon: <FiActivity className="h-5 w-5" />
    },
    {
      name: 'Performance',
      description: 'Training, recovery, and hydration support',
      supplements: supplements
        .filter(s => ['Performance', 'Protein', 'Omega & Fish Oil'].includes(s.category || ''))
        .slice(0, 4),
      icon: <FiZap className="h-5 w-5" />
    },
    {
      name: 'Sleep & Calm',
      description: 'Evening routines and stress support',
      supplements: supplements
        .filter(s => ['Sleep & Relaxation', 'Herbs & Adaptogens', 'Amino Acids'].includes(s.category || ''))
        .slice(0, 4),
      icon: <FiMoon className="h-5 w-5" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
      {featuredCategories.map((category, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-100 bg-white p-6 text-gray-900 transition-colors duration-150 hover:border-gray-300"
          style={{ animationDelay: `${index * 0.2}s` }}
        >
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-gray-700">
            {category.icon}
          </div>
          <h3 className="mb-2 font-serif text-2xl text-gray-900">{category.name}</h3>
          <p className="mb-5 text-sm leading-6 text-gray-600">{category.description}</p>
          <div className="space-y-1">
            {category.supplements.slice(0, 3).map(supplement => (
              <Link
                key={supplement.supplement_id}
                href={`/supplement/${supplement.supplement_id}`}
                className="flex items-center justify-between rounded px-2 py-2 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-900"
              >
                <span>{supplement.supplement_name}</span>
                <span className="text-gray-400">View</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default FeaturedCategories;
