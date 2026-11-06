'use client';

import { FiChevronDown, FiUserPlus } from 'react-icons/fi';
import { InviteLink } from './InviteLink';

/**
 * The same UUID invite as the welcome screen. It stays available after
 * onboarding, on the web and in the iOS shell. It has no price. The
 * short-code flag does not hide it.
 */
export function ReferralLink() {
  return (
    <details className="group mb-4 border-y border-gray-200">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 rounded px-1 py-2 text-sm font-medium text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 [&::-webkit-details-marker]:hidden">
        <FiUserPlus size={18} className="shrink-0 text-gray-600" aria-hidden="true" />
        <span className="flex-1">Invite a friend</span>
        <FiChevronDown size={18} className="shrink-0 text-gray-600 group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="pb-4">
        <InviteLink />
      </div>
    </details>
  );
}
