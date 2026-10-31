import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/composite/Seo';

export const metadata: Metadata = {
  title: 'Supplement Schedule App: Plan Days, Not Dose Times | SuppStack',
  description:
    'SuppStack schedules supplements by day of the week and shows today on the Stack tab. It does not send dose-time reminders.',
  alternates: { canonical: '/supplement-schedule-app' },
  openGraph: {
    title: 'Supplement schedule app | SuppStack',
    description: 'A weekday schedule for the products you take, without dose-time notifications.',
    url: '/supplement-schedule-app',
  },
};

export default function SupplementScheduleAppPage() {
  return (
    <SeoLandingPage
      path="/supplement-schedule-app"
      eyebrow="Supplement schedule"
      title="A supplement schedule for the days you take something"
      intro="People looking for a supplement schedule app usually want two things: a plan for what is due, and a nudge at a clock time. SuppStack does the first. It does not do the second."
      sections={[
        {
          heading: 'What a useful schedule records',
          body: [
            'The NIH Office of Dietary Supplements suggests keeping a record of the supplements you take, including product names and doses, so you can share it with your healthcare providers [1]. A schedule is that record plus the days you intend to take each product.',
            'The U.S. Food and Drug Administration also advises telling your healthcare providers about every supplement you take, because some supplements can change how medications work [2]. A clear day-by-day list makes that conversation shorter.',
          ],
        },
        {
          heading: 'What SuppStack schedules',
          body: [
            {
              list: [
                'Add the exact product, not just the ingredient name.',
                'Set planned servings per day, and choose which days of the week that product is scheduled.',
                'The Stack tab lists the products scheduled for today. Tap once to check one off, and tap again to undo.',
                'Weekly completion and your streak follow those check-offs.',
                'Pause a product to keep it in the stack without counting it today, or remove it when you stop taking it.',
              ],
            },
          ],
        },
        {
          heading: 'What SuppStack does not schedule',
          body: [
            'SuppStack does not send a notification at a time of day, and it does not tell you to take something in the morning or at night. If you need an alarm, use your phone clock alongside the Stack tab. SuppStack also does not check drug interactions or recommend a dose.',
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
      ctaLabel="Set up your weekday schedule"
    />
  );
}
