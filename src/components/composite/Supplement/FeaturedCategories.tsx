'use client';

import Link from 'next/link';
import { FaRocket, FaBolt, FaAtom } from 'react-icons/fa';
import type { Supplement } from '@/types';

export interface FeaturedCategoriesProps {
  supplements: Supplement[];
}

export function FeaturedCategories({ supplements }: FeaturedCategoriesProps) {
  const featuredCategories = [
    {
      name: 'Daily Essentials',
      description: 'Core vitamins for optimal health',
      supplements: supplements.filter(s =>
        ['vitamin d3', 'vitamin c', 'vitamin b12', 'b-complex'].some(v =>
          s.supplement_name.toLowerCase().includes(v)
        )
      ).slice(0, 4),
      gradient: 'from-gray-50 to-gray-100',
      borderColor: 'border-gray-200',
      icon: <FaAtom className="text-4xl mb-4 text-gray-600 group-hover:scale-110 transition-transform duration-300" />
    },
    {
      name: 'Performance',
      description: 'Peak physical performance enhancers',
      supplements: supplements.filter(s =>
        ['protein', 'creatine', 'omega-3'].some(v =>
          s.supplement_name.toLowerCase().includes(v)
        )
      ).slice(0, 4),
      gradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      icon: <FaBolt className="text-4xl mb-4 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
    },
    {
      name: 'Cognitive',
      description: 'Brain health and mental clarity',
      supplements: supplements.filter(s =>
        ['ashwagandha', 'magnesium', 'omega-3'].some(v =>
          s.supplement_name.toLowerCase().includes(v)
        )
      ).slice(0, 4),
      gradient: 'from-yellow-50 to-yellow-100',
      borderColor: 'border-yellow-200',
      icon: <FaRocket className="text-4xl mb-4 text-yellow-600 group-hover:translate-y-[-4px] transition-transform duration-300" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      {featuredCategories.map((category, index) => (
        <div
          key={index}
          className={`feature-highlight bg-gradient-to-br ${category.gradient} border ${category.borderColor} rounded-xl p-8 text-gray-900 group cursor-pointer airbnb-hover`}
          style={{ animationDelay: `${index * 0.2}s` }}
        >
          <div className="flex justify-center">
            {category.icon}
          </div>
          <h3 className="text-2xl font-bold mb-3 text-center text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed text-center">{category.description}</p>
          <div className="space-y-2">
            {category.supplements.slice(0, 3).map(supplement => (
              <Link
                key={supplement.supplement_id}
                href={`/supplement/${supplement.supplement_id}`}
                className="block text-sm text-gray-700 hover:text-orange-600 transition-all duration-200 px-2 py-1 rounded hover:bg-white/60"
              >
                → {supplement.supplement_name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default FeaturedCategories;
