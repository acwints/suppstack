import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/composite/Seo';
import { SupplementLogTemplate } from '@/components/composite/Seo/SupplementLogTemplate';

export const metadata: Metadata = {
  title: 'Supplement Log Template: Copy or Print a Blank Week | SuppStack',
  description:
    'A blank supplement log you can fill, copy, or print. It records products and planned servings. It is not a dose chart.',
  alternates: { canonical: '/supplement-log-template' },
  openGraph: {
    title: 'Supplement log template | SuppStack',
    description: 'Copy or print a blank week. Not medical advice.',
    url: '/supplement-log-template',
  },
};

export default function SupplementLogTemplatePage() {
  return (
    <SeoLandingPage
      path="/supplement-log-template"
      eyebrow="Template"
      title="A blank supplement log you can copy or print"
      intro="Seven empty rows: date, product, the servings you already planned, and whether you checked them off. Nothing here is a recommended dose."
      notice="Not medical advice. Ask your doctor or pharmacist."
      beforeSections={<SupplementLogTemplate />}
      sections={[
        {
          heading: 'Why people keep a paper or copied log',
          body: [
            {
              parts: [
                'The NIH Office of Dietary Supplements suggests keeping a record of the supplements you take, including product names and doses, so you can share it with your healthcare providers. ',
                {
                  href: 'https://ods.od.nih.gov/factsheets/WYNTK-Consumer/',
                  label: 'Dietary Supplements: What You Need to Know',
                },
                '.',
              ],
            },
          ],
        },
        {
          heading: 'The same record inside SuppStack',
          body: [
            'You can add those products to your stack and check them off on the Stack tab instead of retyping the week. SuppStack does not turn this template into a dose plan.',
          ],
        },
      ]}
      ctaLabel="Log your stack in the app"
    />
  );
}
