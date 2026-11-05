import type { Metadata } from 'next';
import Link from 'next/link';
import { SeoLandingPage } from '@/components/composite/Seo';

export const metadata: Metadata = {
  title: 'Supplement Stack Checker: Find Duplicate Ingredients | SuppStack',
  description:
    'Check a stack for the same ingredient on more than one product. SuppStack flags that label overlap. It does not rate combinations. See the sourced overlap notes.',
  alternates: { canonical: '/supplement-stack-checker' },
  openGraph: {
    title: 'Supplement stack checker | SuppStack',
    description: 'Duplicate ingredients across products, plus sourced notes on a separate page.',
    url: '/supplement-stack-checker',
  },
};

export default function SupplementStackCheckerPage() {
  return (
    <SeoLandingPage
      path="/supplement-stack-checker"
      eyebrow="Stack checker"
      title="Check a stack for the same ingredient twice"
      intro="A stack check here means reading the products you already take and noticing when one ingredient shows up on more than one label. It is not a verdict on the combination."
      notice="Not medical advice. Ask your doctor or pharmacist."
      beforeSections={
        <p className="text-sm text-gray-600">
          For two published notes, one on high-dose zinc and copper absorption and one on magnesium
          from supplements and medications, see{' '}
          <Link href="/supplement-interaction-checker" className="underline underline-offset-2">
            supplement overlap notes
          </Link>
          . Each note there has its NIH fact sheet in the same paragraph. If a pairing is not on
          that page, this site has no data on it.
        </p>
      }
      sections={[
        {
          heading: 'What the Stack screen flags',
          body: [
            {
              list: [
                'Add the products you take. A multivitamin counts as the ingredients listed on it.',
                'An ingredient that comes from more than one product is flagged, with a daily total for each unit.',
                'Milligrams and IU are kept separate and are never added together.',
                'The flag is a reading of those labels. It does not judge the overlap or check medicines.',
              ],
            },
          ],
        },
        {
          heading: 'What to do with the list',
          body: [
            'Bring the product names to a pharmacist or clinician. SuppStack does not tell you which bottle to stop.',
          ],
        },
      ]}
      ctaLabel="Check your stack"
    />
  );
}
