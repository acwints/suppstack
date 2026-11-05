import type { Metadata } from 'next';
import Link from 'next/link';
import { SeoLandingPage } from '@/components/composite/Seo';

export const metadata: Metadata = {
  title: 'Supplement Reminder App: Today’s List, No Push Alerts | SuppStack',
  description:
    'SuppStack does not send push, text, or email reminders. It shows the products scheduled for today on the Stack tab, and you check them off there.',
  alternates: { canonical: '/supplement-reminder-app' },
  openGraph: {
    title: 'Supplement reminder app | SuppStack',
    description: 'Today’s scheduled products on screen. No push reminder is built.',
    url: '/supplement-reminder-app',
  },
};

export default function SupplementReminderAppPage() {
  return (
    <SeoLandingPage
      path="/supplement-reminder-app"
      eyebrow="Reminders"
      title="A supplement reminder that stays on the screen"
      intro="To be direct: push reminders are not built. SuppStack does not send a notification, a text, or an email at a clock time. Open the app and today’s products are listed on the Stack tab."
      beforeSections={
        <p className="text-sm text-gray-600">
          The weekday plan itself is on the{' '}
          <Link href="/supplement-schedule-app" className="underline underline-offset-2">
            supplement schedule
          </Link>{' '}
          guide. An on-screen bottle estimate, which is also not a push, is on{' '}
          <Link href="/supplement-restock-reminder" className="underline underline-offset-2">
            restock estimates
          </Link>
          .
        </p>
      }
      sections={[
        {
          heading: 'What you see when you open the app',
          body: [
            {
              list: [
                'Add the exact product, then set planned servings and which days of the week it is scheduled.',
                'The Stack tab lists the products scheduled for today.',
                'Tap a product to check it off, and tap again to undo.',
                'Weekly completion and your streak follow those check-offs.',
                'Pause a product to keep it in the stack without counting it today, or remove it when you stop taking it.',
              ],
            },
            'Nothing in that list fires while the app is closed. If you want an alarm at 8 a.m., use your phone clock and then check the product off in SuppStack.',
          ],
        },
        {
          heading: 'What “reminder” does not mean here',
          body: [
            'There is no dose-time alarm, no morning or evening prompt, and no message when you miss a day. Premium can show an estimate of when a bottle may run out, from the container size and the servings you log. That estimate stays on the Stack screen. SuppStack does not push or text you when it gets close, and it does not tell you which product to reorder.',
          ],
        },
      ]}
      ctaLabel="See today’s list"
    />
  );
}
