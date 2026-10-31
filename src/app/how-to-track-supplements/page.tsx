import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/composite/Seo';

export const metadata: Metadata = {
  title: 'How to Track Supplements: A Simple System That Sticks | SuppStack',
  description:
    'A practical way to track your supplements: list exact products, log daily, and review overlap and adherence. Works with a spreadsheet or with SuppStack.',
  alternates: { canonical: '/how-to-track-supplements' },
  openGraph: {
    title: 'How to track supplements | SuppStack',
    description: 'A simple, honest system for tracking a supplement stack.',
    url: '/how-to-track-supplements',
  },
};

export default function HowToTrackSupplementsPage() {
  return (
    <SeoLandingPage
      path="/how-to-track-supplements"
      eyebrow="Guide"
      title="How to track supplements without it becoming a second job"
      intro="Whether you use paper, a spreadsheet, or an app, a good supplement record has the same parts. Here is the system, then how SuppStack handles each step."
      sections={[
        {
          heading: '1. Write down exact products, not just ingredients',
          body: [
            'Record brand, product, and serving size. The NIH Office of Dietary Supplements suggests keeping a record of the supplements you take, including product names and doses, to share with your healthcare providers [1].',
            'In SuppStack: search the catalog or photograph a bottle, then add the product to your stack. A bottle photo is sent to an AI service for recognition and is not stored.',
          ],
        },
        {
          heading: '2. Log once a day, in one place',
          body: [
            'The best log is the one you will open every day. Keep it to a single tap per product.',
            'In SuppStack: the Stack tab lists the products scheduled for today. Tap to check one off, and tap again to undo.',
          ],
        },
        {
          heading: '3. Keep changes findable',
          body: [
            'When you start, pause, or stop something, note the date somewhere you can find later.',
            'In SuppStack: pause a product to keep it in your stack without counting it today, or remove it when you stop taking it. You can change planned servings and scheduled days at any time. Each check-off is stored on the day you log it.',
          ],
        },
        {
          heading: '4. Review overlap and consistency weekly',
          body: [
            'Check whether the same ingredient appears in more than one product, and how consistent you have been.',
            'In SuppStack: the Stack screen shows overlaps with a daily total per unit, weekly completion, and a streak. Milligrams and IU are never added together. Premium includes the full ingredient breakdown and restock estimates, which are labeled as estimates.',
          ],
        },
        {
          heading: 'What SuppStack does not do',
          body: [
            'SuppStack does not send dose-time reminders, log mood or symptoms, check drug or supplement interactions, or export your log to CSV. If you need those, a spreadsheet alongside SuppStack works fine.',
          ],
        },
      ]}
      sources={[
        {
          label: '[1] NIH Office of Dietary Supplements. Dietary Supplements: What You Need to Know.',
          href: 'https://ods.od.nih.gov/factsheets/WYNTK-Consumer/',
        },
      ]}
    />
  );
}
