import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/composite/Seo';
import { SchedulePlanner } from '@/components/composite/Seo/SchedulePlanner';

export const metadata: Metadata = {
  title: 'Supplement Schedule Planner: Plan Days of the Week | SuppStack',
  description:
    'Plan which days you intend to take each product. SuppStack saves a weekday schedule and does not send a time-of-day reminder.',
  alternates: { canonical: '/supplement-schedule-planner' },
  openGraph: {
    title: 'Supplement schedule planner | SuppStack',
    description: 'A weekday planner. Not a dose plan and not a clock-time alarm.',
    url: '/supplement-schedule-planner',
  },
};

export default function SupplementSchedulePlannerPage() {
  return (
    <SeoLandingPage
      earlyAccess
      path="/supplement-schedule-planner"
      eyebrow="Planner"
      title="Plan the days, then keep the list in one place"
      intro="Use the grid to mark weekdays. It does not tell you a dose or a time of day."
      notice="Not medical advice. Ask your doctor or pharmacist before you change what you take."
      beforeSections={<SchedulePlanner />}
      sections={[
        {
          heading: 'Why a written week helps',
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
          heading: 'What SuppStack saves',
          body: [
            {
              list: [
                'Add the exact product, then choose which days of the week it is scheduled.',
                'The Stack tab lists what is scheduled for today. Tap to check it off, and tap again to undo.',
                'Pause a product to keep it listed without counting it today.',
                'SuppStack does not send a notification at a clock time.',
              ],
            },
          ],
        },
      ]}
      ctaLabel="Save this schedule in your stack"
    />
  );
}
