import type { ReactElement } from 'react';
import { FaYoutube, FaMicrophone, FaNewspaper, FaGlobe } from 'react-icons/fa';

/**
 * Icon for a stack's source type (where the stack was referenced from).
 * Shared so the stack card and stack detail page stay in sync — they
 * previously each maintained their own copy of this map.
 */
export function getStackSourceIcon(sourceType?: string | null, size?: number): ReactElement {
  switch (sourceType) {
    case 'youtube':
      return <FaYoutube className="text-error-500" size={size} />;
    case 'podcast':
      return <FaMicrophone className="text-purple-500" size={size} />;
    case 'article':
      return <FaNewspaper className="text-gray-600" size={size} />;
    case 'interview':
      return <FaMicrophone className="text-accent-500" size={size} />;
    case 'website':
    default:
      return <FaGlobe className="text-gray-500" size={size} />;
  }
}
