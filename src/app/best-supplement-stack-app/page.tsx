import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/composite/Seo';

export const metadata: Metadata = {
  title: 'Best Supplement Stack App? What to Look For | SuppStack',
  description:
    'What to look for in a supplement stack app (product-level tracking, ingredient overlap, honest estimates, privacy) and how SuppStack approaches each.',
  alternates: { canonical: '/best-supplement-stack-app' },
  openGraph: {
    title: 'Best supplement stack app: what to look for | SuppStack',
    description: 'A checklist for choosing a supplement stack app.',
    url: '/best-supplement-stack-app',
  },
};

export default function BestSupplementStackAppPage() {
  return (
    <SeoLandingPage
      path="/best-supplement-stack-app"
      eyebrow="Choosing an app"
      title="What makes a good supplement stack app?"
      intro="“Best” depends on what you need. Here is a checklist we think matters, and an honest account of where SuppStack fits."
      sections={[
        {
          heading: 'A checklist',
          body: [
            {
              list: [
                'Tracks real products, so a multivitamin counts as everything in it.',
                'Daily logging takes one tap.',
                'Shows ingredient overlap across products without mixing incompatible units.',
                'Labels restock timing as an estimate.',
                'Keeps health data private and does not use it for ads.',
                'Does not pretend to be a doctor.',
              ],
            },
          ],
        },
        {
          heading: 'How SuppStack approaches it',
          body: [
            {
              list: [
                'Product catalog with search, brand pages, and per-serving and monthly cost comparisons.',
                'One-tap daily check-off, with weekly completion and a streak.',
                'Overlap totals across your products. Milligrams and IU are never summed together. The full ingredient breakdown is part of Premium.',
                'Premium restock estimates from container size, planned servings, and logged servings, labeled as estimates.',
                'Optional Apple Health averages on iPhone, read on the device when you ask and not stored by SuppStack.',
                'Sign in with Apple or Google. Core logging is free. Premium on the web and in the iOS app adds restock forecasts, the full ingredient breakdown, and unlimited bottle scans.',
              ],
            },
          ],
        },
        {
          heading: 'Where another app may suit you better',
          body: [
            'If you need dose-time reminders, interaction checking, mood or symptom logs, or a data export, SuppStack does not offer those today. Pick the tool that matches the job.',
          ],
        },
      ]}
    />
  );
}
