import type { Metadata } from 'next';
import { ImprovementsBox } from '@/components/composite/Feedback';
import { changelog, shippedFromFeedback } from '@/content/changelog';

export const metadata: Metadata = {
  title: "What’s New - SuppStack",
  description: 'Changes in SuppStack that shipped from notes people sent.',
  alternates: { canonical: '/changelog' },
};

export default function ChangelogPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-3 py-8 sm:px-6">
      <h1 className="text-3xl text-gray-900">What’s New</h1>
      {changelog.length > 0 ? (
        <section className="mt-6">
          <ol className="space-y-6">
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
      {shippedFromFeedback.length > 0 ? (
        <section className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl text-gray-900">Shipped from your feedback</h2>
          <ol className="mt-4 space-y-6">
            {shippedFromFeedback.map((entry) => (
              <li key={entry.id}>
                <p className="text-xs font-medium text-gray-500">{entry.date}</p>
                <p className="mt-2 text-base text-gray-900">{entry.change}</p>
                <p className="mt-1 text-sm text-gray-500">{entry.credit}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      <ImprovementsBox />
    </main>
  );
}
