import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/composite/Seo';
import { CreatineTimingCalculator } from '@/components/composite/Seo/CreatineTimingCalculator';

export const metadata: Metadata = {
  title: 'Creatine Timing Calculator: Plan a Clock Time | SuppStack',
  description:
    'An informational planner that turns your workout time into a clock time for creatine. It does not recommend a dose. Evidence on exact timing is limited.',
  alternates: { canonical: '/creatine-timing-calculator' },
  openGraph: {
    title: 'Creatine timing calculator | SuppStack',
    description: 'Plan a repeating clock time. Not a dose calculator and not medical advice.',
    url: '/creatine-timing-calculator',
  },
};

export default function CreatineTimingCalculatorPage() {
  return (
    <SeoLandingPage
      path="/creatine-timing-calculator"
      eyebrow="Calculator"
      title="Creatine timing calculator"
      intro="Enter the time you train. The planner gives you a clock time to repeat. It does not tell you how much creatine to take."
      notice="Not medical advice. Ask your doctor or pharmacist."
      beforeSections={<CreatineTimingCalculator />}
      sections={[
        {
          heading: 'What this does not do',
          body: [
            'It does not calculate a gram amount, a loading plan, or a medical schedule. SuppStack also does not send a reminder at that time of day.',
            'If you use creatine, you can add the actual product to your stack and check it off on the days you take it.',
          ],
        },
      ]}
      sources={[
        {
          label:
            'Antonio J et al. Common questions and misconceptions about creatine supplementation. JISSN, 2021.',
          href: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-021-00412-w',
        },
      ]}
      ctaLabel="Track your creatine product"
    />
  );
}
