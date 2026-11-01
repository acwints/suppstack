import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/composite/Seo';

export const metadata: Metadata = {
  title: 'Supplement Stack Tracker: Log the Products You Take Together | SuppStack',
  description:
    'Track a supplement stack as a set of real products: what is in it, an estimated monthly cost, ingredient overlap, and whether you took it today. No dose advice or interaction checking.',
  alternates: { canonical: '/supplement-stack-tracker' },
  openGraph: {
    title: 'Supplement stack tracker | SuppStack',
    description: 'Log the products in your stack together, including overlap and today’s check-off.',
    url: '/supplement-stack-tracker',
  },
};

export default function SupplementStackTrackerPage() {
  return (
    <SeoLandingPage
      path="/supplement-stack-tracker"
      eyebrow="Stack tracker"
      title="A tracker for the stack, not just one bottle"
      intro="A stack is the set of products you take together. SuppStack keeps that set in one place: which products are in it, what they add up to, and whether you took them today."
      sections={[
        {
          heading: 'Why the set matters',
          body: [
            'The NIH Office of Dietary Supplements suggests keeping a record of the supplements you take, including product names and doses, so you can share it with your healthcare providers [1]. A stack record is that list kept together, instead of one note per bottle.',
            'The U.S. Food and Drug Administration says some dietary supplements can change how medications work, and advises telling your providers about every supplement you take [2]. SuppStack does not check those interactions. It gives you a product list you can bring to that conversation.',
          ],
        },
        {
          heading: 'What the stack screen keeps together',
          body: [
            {
              list: [
                'Add real products from the catalog, including a multivitamin plus single-ingredient bottles. Search and brand pages can help you find a bottle, and so can a photo of it. A photo is sent to an AI service for recognition and is not stored by SuppStack. Unlimited scans are part of Premium.',
                'Set planned servings and which days of the week each product is scheduled. Pause a product to keep it in the stack without counting it today, or remove it when you stop.',
                'The Stack tab lists what is scheduled today. Tap once to check a product off, and tap again to undo. Weekly completion and your streak follow those check-offs.',
                'See an estimated monthly cost for the active products, from catalog price and the servings listed on each product. It is a list-price estimate, not a receipt or a bill.',
                'See ingredients that appear in more than one product, with a daily total for each unit. Milligrams and IU stay separate and are never added together. The full dose-by-dose breakdown is part of Premium.',
                'Premium also includes an estimate of when a bottle runs out, from container size and planned servings per day. The logged daily average is used when it is higher than the plan. It is an estimate, and SuppStack does not push or text you when it gets close.',
              ],
            },
          ],
        },
        {
          heading: 'What this tracker will not do',
          body: [
            'SuppStack does not recommend a stack, choose a dose, or tell you which product to drop. It does not send a reminder at a time of day, and it does not check drug or supplement interactions.',
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
      ctaLabel="Track your stack free"
    />
  );
}
