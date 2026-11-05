import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/composite/Seo';

export const metadata: Metadata = {
  title: 'Longevity Supplement Stack Tracker | SuppStack',
  description:
    'Track a personal stack copied from a public longevity protocol. SuppStack does not endorse any protocol, person, or brand, and it does not recommend what to take.',
  alternates: { canonical: '/longevity-supplement-stack-tracker' },
  openGraph: {
    title: 'Longevity supplement stack tracker | SuppStack',
    description: 'Record a public protocol as your own product list. No endorsement.',
    url: '/longevity-supplement-stack-tracker',
  },
};

export default function LongevitySupplementStackTrackerPage() {
  return (
    <SeoLandingPage
      path="/longevity-supplement-stack-tracker"
      eyebrow="Longevity stack"
      title="Track a longevity stack you copied from a public protocol"
      intro="People sometimes copy a public longevity protocol into their own routine. SuppStack can hold that list of products. It does not endorse the protocol, the person who published it, or any brand in it."
      notice="Not medical advice. Ask your doctor or pharmacist before you start or copy a protocol."
      sections={[
        {
          heading: 'What you can record',
          body: [
            {
              list: [
                'Add the exact products you chose, not a generic protocol name.',
                'Set planned servings and which days of the week each product is scheduled.',
                'Check a product off on the Stack tab, and tap again to undo.',
                'See when the same ingredient is listed on more than one product. Milligrams and IU stay in separate totals.',
              ],
            },
          ],
        },
        {
          heading: 'What this page does not claim',
          body: [
            'Copying a public list does not mean the list is right for you. SuppStack does not recommend a longevity stack, a dose, or a lab test, and it does not claim that tracking changes how long anyone lives. It also does not check drug interactions.',
          ],
        },
      ]}
      ctaLabel="Save your stack"
    />
  );
}
