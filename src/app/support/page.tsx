import Link from 'next/link';

export const metadata = {
  title: 'Support - SuppStack',
  description: 'Get help with SuppStack accounts, stacks, Apple Health, and merchant checkout.',
  alternates: {
    canonical: '/support',
  },
};

export default function SupportPage() {
  return (
    <main className="container mx-auto max-w-3xl px-3 py-8 sm:px-6">
      <h1 className="mb-3 text-3xl font-semibold text-gray-900">SuppStack Support</h1>
      <p className="text-gray-600">
        Need help with the app? Email{' '}
        <a className="font-medium text-gray-900 underline" href="mailto:support@suppstack.com">
          support@suppstack.com
        </a>
        . We aim to reply within two business days.
      </p>

      <div className="mt-8 space-y-7 text-gray-600">
        <section>
          <h2 className="text-xl font-semibold text-gray-900">Accounts and sign-in</h2>
          <p className="mt-2">
            You can browse as a guest or sign in with Apple or Google to save stacks and tracking
            history. If sign-in does not complete, close the sign-in window and try again from the
            Profile tab.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Delete your account</h2>
          <p className="mt-2">
            In the app, open Profile, choose Delete account, and type DELETE to confirm. This
            removes your SuppStack account and associated profile data. You can also request
            deletion by email.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Apple Health</h2>
          <p className="mt-2">
            Apple Health access is optional. You control it in iOS Settings under Health access.
            SuppStack reads permitted data on demand and does not upload it to our servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Product orders</h2>
          <p className="mt-2">
            Supplement purchases are completed on the independent merchant&apos;s website. Contact
            that merchant directly for order, shipping, return, or payment help.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Safety</h2>
          <p className="mt-2">
            SuppStack organizes supplement information and is not medical advice. Consult a
            qualified healthcare professional before starting or changing a supplement routine.
          </p>
        </section>
      </div>

      <div className="mt-8 flex gap-5 text-sm">
        <Link className="text-gray-900 underline" href="/privacy">
          Privacy Policy
        </Link>
        <Link className="text-gray-900 underline" href="/terms">
          Terms of Service
        </Link>
      </div>
    </main>
  );
}
