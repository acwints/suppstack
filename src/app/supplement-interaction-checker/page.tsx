import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/composite/Seo';

// SuppStack does not have a drug or supplement interaction checker. This page
// targets the query by saying so, and describes ingredient overlap instead.
export const metadata: Metadata = {
  title: 'Supplement Interaction Checker: Where to Look and What SuppStack Shows | SuppStack',
  description:
    'SuppStack is not an interaction checker. Learn where reliable supplement interaction information comes from, and how SuppStack shows ingredient overlap across your products.',
  alternates: { canonical: '/supplement-interaction-checker' },
  openGraph: {
    title: 'Supplement interaction checker | SuppStack',
    description: 'Reliable sources for interactions, plus ingredient-overlap tracking for your stack.',
    url: '/supplement-interaction-checker',
  },
};

export default function SupplementInteractionCheckerPage() {
  return (
    <SeoLandingPage
      path="/supplement-interaction-checker"
      eyebrow="Supplement interactions"
      title="Looking for a supplement interaction checker?"
      intro="To be upfront: SuppStack does not check for drug or supplement interactions. Here is where that information should come from, and the related thing SuppStack does do well."
      sections={[
        {
          heading: 'Why interactions matter',
          body: [
            'The U.S. Food and Drug Administration warns that some dietary supplements can change how medications work, and advises telling your healthcare providers about every supplement you take [1].',
            'The National Center for Complementary and Integrative Health (NCCIH) similarly recommends discussing supplements with your providers and notes that "natural" does not always mean safe [2].',
          ],
        },
        {
          heading: 'Where to get interaction information',
          body: [
            {
              list: [
                'Your pharmacist, who can see your full medication list.',
                'Your prescribing clinician.',
                'NIH Office of Dietary Supplements fact sheets, which include interactions-with-medications sections for many nutrients [3].',
              ],
            },
          ],
        },
        {
          heading: 'What SuppStack does: ingredient overlap',
          body: [
            'A common, quieter issue is taking the same ingredient in several products. SuppStack flags ingredients that appear in more than one product in your stack and shows a daily total for each unit, using each product’s listed composition. Milligrams and IU stay separate and are never added together. The full dose-by-dose breakdown of every ingredient is part of Premium.',
            'Bring that list to your pharmacist: a clear record of exactly what you take makes an interaction review faster and more accurate.',
          ],
        },
      ]}
      sources={[
        {
          label: '[1] U.S. FDA. Mixing Medications and Dietary Supplements Can Endanger Your Health.',
          href: 'https://www.fda.gov/consumers/consumer-updates/mixing-medications-and-dietary-supplements-can-endanger-your-health',
        },
        {
          label: '[2] NCCIH. Using Dietary Supplements Wisely.',
          href: 'https://www.nccih.nih.gov/health/using-dietary-supplements-wisely',
        },
        {
          label: '[3] NIH Office of Dietary Supplements. Dietary Supplements: What You Need to Know.',
          href: 'https://ods.od.nih.gov/factsheets/WYNTK-Consumer/',
        },
      ]}
      ctaLabel="Build your stack list free"
    />
  );
}
