import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/composite/Seo';

export const metadata: Metadata = {
  title: 'Vitamin Tracker App: Log the Vitamin Products You Take | SuppStack',
  description:
    'Track vitamin products in your stack: a multivitamin plus single vitamins, daily check-off, and label overlap. SuppStack does not recommend a vitamin dose.',
  alternates: { canonical: '/vitamin-tracker-app' },
  openGraph: {
    title: 'Vitamin tracker app | SuppStack',
    description: 'Log the vitamin products you take. Not a dose calculator.',
    url: '/vitamin-tracker-app',
  },
};

export default function VitaminTrackerAppPage() {
  return (
    <SeoLandingPage
      path="/vitamin-tracker-app"
      eyebrow="Vitamin tracker"
      title="A tracker for the vitamin products on your shelf"
      intro="A vitamin tracker is a record of products, such as a multivitamin plus a separate vitamin D or vitamin C. SuppStack keeps that record. It does not tell you which vitamin to start."
      notice="Not medical advice. Ask your doctor or pharmacist."
      sections={[
        {
          heading: 'What you can record',
          body: [
            {
              list: [
                'Search the catalog for the vitamin product you use and add that product to your stack.',
                'Set planned servings and which days of the week it is scheduled.',
                'Check it off on the Stack tab, and tap again to undo.',
                'If the same vitamin is listed on more than one product, the Stack screen can flag that overlap and keep milligrams and IU in separate totals.',
              ],
            },
          ],
        },
        {
          heading: 'What this page does not do',
          body: [
            'It does not recommend a vitamin, a dose, or a lab test. It does not claim that tracking changes a health outcome. SuppStack does not check drug interactions.',
          ],
        },
      ]}
      ctaLabel="Start a vitamin stack"
    />
  );
}
