import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Terms of Service</h1>
      <div className="prose max-w-none">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
        <p>By accessing or using SuppStack, you agree to be bound by these Terms of Service.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">2. Description of Service</h2>
        <p>SuppStack is a supplement tracking application that allows users to monitor their supplement intake and analyze their data.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">3. User Responsibilities</h2>
        <p>Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">4. Privacy Policy</h2>
        <p>Your use of SuppStack is also governed by our Privacy Policy, which can be found <Link href="/privacy" className="text-blue-500 hover:underline">here</Link>.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">5. Disclaimer of Warranties</h2>
        <p>SuppStack is provided &ldquo;as is&rdquo; without warranty of any kind, either express or implied.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">6. Limitation of Liability</h2>
        <p>SuppStack shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the service.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">7. Changes to Terms</h2>
        <p>We may update these &ldquo;Terms&rdquo; from time to time.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">8. Contact Information</h2>
        <p>If you have any questions about these Terms, please contact us at support@suppstack.com.</p>
      </div>
      <div className="mt-8">
        <Link href="/" className="text-blue-500 hover:underline">Back to Home</Link>
      </div>
    </main>
  );
}