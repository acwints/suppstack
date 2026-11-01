import type { Metadata } from 'next';
import { changelog, shippedFromFeedback } from '@/content/changelog';

export const metadata: Metadata = {
  title: 'Shipped from your feedback - SuppStack',
  description: 'Changes in SuppStack that shipped from notes people sent.',
  alternates: { canonical: '/changelog' },
};

export default function ChangelogPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-3 py-8 sm:px-6">
      <h1 className="text-3xl text-gray-900">Shipped from your feedback</h1>
      <p className="mt-3 text-gray-600">
        When a change ships because of a note, it is listed here with a date and a short credit.
        Email addresses are not published.
      </p>

      {shippedFromFeedback.length === 0 ? (
        <p className="mt-8 text-gray-600">Nothing has been marked as shipping from feedback yet.</p>
      ) : (
        <ol className="mt-8 space-y-6">
          {shippedFromFeedback.map((entry) => (
            <li key={entry.id} className="border-b border-gray-200 pb-6">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{entry.date}</p>
              <p className="mt-2 text-base text-gray-900">{entry.change}</p>
              <p className="mt-1 text-sm text-gray-500">{entry.credit}</p>
            </li>
          ))}
        </ol>
      )}

      {changelog.length > 0 ? (
        <section className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="text-2xl text-gray-900">Also shipped</h2>
          <ol className="mt-4 space-y-6">
            {changelog.map((entry) => (
              <li key={entry.id}>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{entry.date}</p>
                <p className="mt-2 text-base text-gray-900">{entry.title}</p>
                <p className="mt-1 text-sm text-gray-600">{entry.body}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </main>
  );
}
