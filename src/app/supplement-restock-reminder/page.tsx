import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/composite/Seo';

export const metadata: Metadata = {
  title: 'Supplement Restock Reminder: What SuppStack Estimates | SuppStack',
  description:
    'SuppStack does not send restock push alerts. Premium includes an on-screen estimate of when a bottle runs out, based on container size and the servings you log.',
  alternates: { canonical: '/supplement-restock-reminder' },
  openGraph: {
    title: 'Supplement restock estimates | SuppStack',
    description: 'An on-screen restock estimate, not a push notification.',
    url: '/supplement-restock-reminder',
  },
};

export default function SupplementRestockReminderPage() {
  return (
    <SeoLandingPage
      path="/supplement-restock-reminder"
      eyebrow="Restock"
      title="Looking for a supplement restock reminder?"
      intro="To be direct: SuppStack does not send a push notification when a bottle is low. Premium includes an estimate on the Stack screen of when a product may run out."
      sections={[
        {
          heading: 'What the estimate uses',
          body: [
            'The estimate starts from the servings listed on the container, the servings you plan per day, and the servings you actually log. It is labeled as an estimate. Missed days, a different bottle size, or buying a refill early can all make the date wrong.',
            'If the product listing does not state how many servings are in the container, SuppStack does not invent a run-out date for that product.',
          ],
        },
        {
          heading: 'What you still do yourself',
          body: [
            {
              list: [
                'Add the exact product so the container size, when the listing has one, is the one you use.',
                'Log servings on the Stack tab. The estimate uses planned servings per day, and it uses your logged daily average when that average is higher.',
                'Paused products are not treated as active restocks.',
                'There is no dose-time alarm and no text or push when the estimate gets close.',
              ],
            },
            'A calendar alarm is still the right tool if you want a notification. The Stack screen is the place to read the estimate.',
          ],
        },
        {
          heading: 'Keeping the record straight',
          body: [
            'The NIH Office of Dietary Supplements suggests recording the product names and doses you take so you can share them with your healthcare providers [1]. A restock estimate is only a planning aid for the bottles in that record. It is not medical advice and it does not tell you to reorder a particular product.',
          ],
        },
      ]}
      sources={[
        {
          label: '[1] NIH Office of Dietary Supplements. Dietary Supplements: What You Need to Know.',
          href: 'https://ods.od.nih.gov/factsheets/WYNTK-Consumer/',
        },
      ]}
      ctaLabel="Track what is left in the bottle"
    />
  );
}
