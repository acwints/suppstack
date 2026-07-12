import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - SuppStack',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto max-w-3xl px-3 sm:px-6 py-8">
      <h1 className="mb-6 text-3xl font-semibold text-gray-900">Privacy Policy</h1>
      <div className="prose max-w-none text-gray-600">
        <p>Last updated: July 5, 2026</p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-900">
          1. What This Policy Covers
        </h2>
        <p>
          This policy describes how SuppStack collects, uses, and protects your information when
          you use our website or iOS app to browse supplements, build a personal supplement
          routine, and check out with independent merchants.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-900">
          2. Information We Collect
        </h2>
        <ul className="list-disc pl-6">
          <li>
            <strong>Account information.</strong> If you sign in with Google, we receive your name,
            email address, and profile photo from Google. We use this only to create and operate
            your account.
          </li>
          <li>
            <strong>Your supplement data.</strong> Supplement routines, stacks, and tracking
            entries you create are stored so the product can work. They are private to your account
            and are not shared publicly.
          </li>
          <li>
            <strong>Health data you choose to connect.</strong> In the iOS app, you may grant access
            to Apple Health data such as sleep, weight, body fat, calories burned, and activity
            summaries. This access is optional and controlled by Apple Health permissions.
          </li>
          <li>
            <strong>Usage data.</strong> Standard server logs (IP address, browser type, pages
            requested) used for security and reliability.
          </li>
        </ul>

        <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-900">
          3. What We Do Not Do
        </h2>
        <ul className="list-disc pl-6">
          <li>We do not sell your personal information.</li>
          <li>We do not share your supplement data with merchants or advertisers.</li>
          <li>We do not use Apple Health data for advertising or merchant targeting.</li>
          <li>We do not process payments; purchases are completed on the merchant&apos;s own site.</li>
        </ul>

        <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-900">
          4. Apple Health and AI Summaries
        </h2>
        <p>
          Apple Health data is used to create wellness trends, supplement opportunity rankings, and
          optional coach summaries inside SuppStack. If an AI coach summary is enabled, the summary
          request may process the health snapshot and related opportunity rankings with our AI
          provider. Health data is not sent to merchants, used to target ads, or sold.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-900">
          5. Checkout and Third Parties
        </h2>
        <p>
          When you buy a product, checkout happens directly with the merchant, for example a
          supplement brand&apos;s own store. The merchant&apos;s privacy policy governs the
          information you provide during checkout, such as your shipping address and payment
          details. We never see your payment information.
        </p>
        <p>
          We use Supabase to store account and app data, and Vercel to host the service. Both act
          as processors on our behalf.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-900">
          6. Data Retention and Deletion
        </h2>
        <p>
          Your data is retained while your account is active. You can delete your account in the
          app from Profile Settings, or request deletion by contacting us at the address below.
          Email deletion requests are completed within 30 days.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-900">
          7. Health Disclaimer
        </h2>
        <p>
          SuppStack is a shopping and organization tool, not a medical service. Supplement
          information on this site is not medical advice. Consult a healthcare professional before
          starting any supplement.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-900">
          8. Changes to This Policy
        </h2>
        <p>
          If we make material changes to this policy, we will update this page and revise the
          &quot;Last updated&quot; date above.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-900">9. Contact</h2>
        <p>
          Questions or deletion requests:{' '}
          <a href="mailto:support@suppstack.com" className="text-gray-900 underline">
            support@suppstack.com
          </a>
        </p>
      </div>
      <div className="mt-8 hidden md:block">
        <Link href="/" className="text-gray-900 underline">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
