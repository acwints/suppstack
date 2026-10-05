import type { ReactElement } from 'react';
import { FaYoutube, FaMicrophone, FaNewspaper, FaGlobe } from 'react-icons/fa';
import type { Stack } from '@/types';

export interface StackSourceIconProps {
  sourceType?: Stack['source_type'] | null;
  size?: number;
}

/**
 * Icon for a stack's source type (where the stack was referenced from).
 * Shared so the stack card and stack detail page stay in sync. Monochrome ink
 * with the accent reserved for interviews — no semantic colors here.
 */
export function StackSourceIcon({ sourceType, size }: StackSourceIconProps): ReactElement {
  switch (sourceType) {
    case 'youtube':
      return <FaYoutube className="text-gray-700" size={size} />;
    case 'podcast':
      return <FaMicrophone className="text-gray-700" size={size} />;
    case 'article':
      return <FaNewspaper className="text-gray-600" size={size} />;
    case 'interview':
      return <FaMicrophone className="text-accent-500" size={size} />;
    case 'website':
    default:
      return <FaGlobe className="text-gray-500" size={size} />;
  }
}
