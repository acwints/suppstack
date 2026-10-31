import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/composite/Seo';

export const metadata: Metadata = {
  title: 'How to Notice Supplement Overlap Across Products | SuppStack',
  description:
    'The same ingredient often hides in a multivitamin and a single-ingredient bottle. SuppStack flags that overlap. It does not remove products for you or check drug interactions.',
  alternates: { canonical: '/how-to-avoid-supplement-overlap' },
  openGraph: {
    title: 'How to notice supplement overlap | SuppStack',
    description: 'See when the same ingredient shows up in more than one product.',
    url: '/how-to-avoid-supplement-overlap',
  },
};

export default function HowToAvoidSupplementOverlapPage() {
  return (
    <SeoLandingPage
      path="/how-to-avoid-supplement-overlap"
      eyebrow="Ingredient overlap"
      title="How to see supplement overlap before it stacks up"
      intro="“Avoid overlap” usually means noticing that two bottles contain the same ingredient. SuppStack can show that. It will not delete a product for you, and it is not an interaction checker."
      sections={[
        {
          heading: 'Why the same ingredient shows up twice',
          body: [
            'A multivitamin plus a separate vitamin D, magnesium, or fish oil is a common stack. Each bottle can list the same nutrient. The NIH Office of Dietary Supplements suggests keeping a record of product names and doses to share with your healthcare providers [1].',
            'The U.S. Food and Drug Administration warns that some dietary supplements can change how medications work, and says to tell your providers about every supplement you take [2]. Overlap on a label is not the same thing as a drug interaction. A pharmacist is the right person to judge the combination.',
          ],
        },
        {
          heading: 'What SuppStack shows',
          body: [
            {
              list: [
                'Build the stack from the products you actually take, so a multivitamin counts as the ingredients listed in it.',
                'The Stack screen flags an ingredient that comes from more than one product and shows a daily total for each unit.',
                'Different units, such as mg and IU, stay in separate totals and are never added together.',
                'Premium includes the full ingredient breakdown, with every ingredient and dose across the stack.',
              ],
            },
            'Seeing an overlap is information. SuppStack does not remove the extra product, recommend a dose, or decide which bottle you should stop.',
          ],
        },
        {
          heading: 'What to do with the list',
          body: [
            'Compare the flagged ingredient with the Supplement Facts panels, then ask a clinician or pharmacist if the combined amount is appropriate for you. SuppStack does not check interactions between supplements and medications.',
          ],
        },
      ]}
      sources={[
        {
          label: '[1] NIH Office of Dietary Supplements. Dietary Supplements: What You Need to Know.',
          href: 'https://ods.od.nih.gov/factsheets/WYNTK-Consumer/',
        },
        {
          label: '[2] U.S. FDA. Mixing Medications and Dietary Supplements Can Endanger Your Health.',
          href: 'https://www.fda.gov/consumers/consumer-updates/mixing-medications-and-dietary-supplements-can-endanger-your-health',
        },
      ]}
      ctaLabel="Check your stack for overlap"
    />
  );
}
