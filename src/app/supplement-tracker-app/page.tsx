import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/composite/Seo';

export const metadata: Metadata = {
  title: 'Supplement Tracker App - Log Your Daily Stack | SuppStack',
  description:
    'SuppStack is a supplement tracker for the products you actually take: one-tap daily check-off, streaks, ingredient overlap across products, and Premium restock estimates.',
  alternates: { canonical: '/supplement-tracker-app' },
  openGraph: {
    title: 'Supplement Tracker App | SuppStack',
    description: 'Track the real products in your stack, check them off daily, and see ingredient overlap.',
    url: '/supplement-tracker-app',
  },
};

export default function SupplementTrackerAppPage() {
  return (
    <SeoLandingPage
      path="/supplement-tracker-app"
      eyebrow="Supplement tracker app"
      title="A supplement tracker built around the products you actually take"
      intro="SuppStack answers three questions with minimal work: what am I taking, did I take it today, and what does my stack add up to?"
      sections={[
        {
          heading: 'What you can do in SuppStack',
          body: [
            {
              list: [
                'Build a stack from real products in the catalog, with search, brand pages, and per-serving and monthly cost comparisons.',
                'Set planned servings per product, choose which days it is scheduled, and pause or remove products as your routine changes.',
                'Check off each product scheduled for today with one tap on the Stack tab. Tap again to undo.',
                'See weekly completion and your current streak.',
                'See ingredients that show up in more than one product, with a daily total for each unit. Different units, such as mg and IU, stay separate and are never added together.',
                'Premium includes the full ingredient breakdown and an estimate of when a bottle runs out, based on container size, planned servings, and the servings you log. The restock timing is an estimate.',
                'Photograph a bottle to match it in the catalog. The photo is sent to an AI service for recognition and is not stored by SuppStack. Unlimited scans are part of Premium.',
                'On iPhone, connect Apple Health from Profile and see recent averages for sleep, weight, and activity. SuppStack reads them on the device when you ask and does not store them.',
              ],
            },
          ],
        },
        {
          heading: 'Why product-level tracking matters',
          body: [
            'Many people take a multivitamin plus single-ingredient products. Tracking at the product level lets SuppStack show where the same ingredient shows up in more than one bottle, using each product’s listed composition.',
          ],
        },
        {
          heading: 'What SuppStack is not',
          body: [
            'SuppStack does not recommend doses, diagnose conditions, check drug interactions, or tell you what to take. It is a record of what you chose, so you and your clinician can look at it clearly.',
          ],
        },
      ]}
    />
  );
}
