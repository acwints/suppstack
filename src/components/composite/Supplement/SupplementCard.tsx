'use client';

import Link from 'next/link';
import { FaStar } from 'react-icons/fa';
import type { Supplement } from '@/types';
import { Badge } from '@/components/ui';

export interface SupplementCardProps {
  supplement: Supplement;
  index?: number;
}

export function SupplementCard({ supplement, index = 0 }: SupplementCardProps) {
  return (
    <Link href={`/supplement/${supplement.supplement_id}`}>
      <div
        className="modern-card group animate-fade-in airbnb-hover"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Image placeholder with gradient */}
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden rounded-t-xl border-b border-gray-200">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-all duration-300">
            <span className="text-2xl font-bold text-white">
              {supplement.supplement_name.charAt(0)}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="primary">Verified</Badge>
          </div>
        </div>

        <div className="card-body">
          <h3 className="font-bold text-lg mb-3 text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {supplement.supplement_name}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {supplement.supplement_description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="w-3 h-3 text-yellow-400" />
              ))}
              <span className="text-xs text-gray-500 ml-1 font-medium">4.8</span>
            </div>
            <div className="text-sm font-semibold text-orange-600 flex items-center gap-1 group-hover:text-orange-700">
              Learn more
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default SupplementCard;
