import Link from 'next/link';
import { FiActivity, FiArrowRight, FiMoon, FiTrendingUp } from 'react-icons/fi';
import { TbScaleOutline } from 'react-icons/tb';
import { AppleHealthCard } from '@/components/composite/Health';

export const metadata = {
  title: 'Apple Health | SuppStack AI',
  description: 'Connect Apple Health to see sleep, weight, and activity next to your stack.',
};

const trackerShelves = [
  {
    href: '/products?goal=sleep-recovery',
    label: 'Sleep & recovery',
    icon: <FiMoon />,
  },
  {
    href: '/products?goal=body-composition',
    label: 'Body composition',
    icon: <TbScaleOutline />,
  },
  {
    href: '/products?goal=training-output',
    label: 'Training output',
    icon: <FiActivity />,
  },
  {
    href: '/products?goal=metabolic-health',
    label: 'Metabolic support',
    icon: <FiTrendingUp />,
  },
] as const;

export default function HealthTrackerPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="container-custom max-w-3xl py-6 sm:py-8">
        <div className="section-header">
          <h1 className="font-serif text-3xl text-gray-900">Apple Health</h1>
        </div>
        <p className="mb-6 text-sm text-gray-500">
          Your sleep, weight, and activity next to your stack.
        </p>

        <AppleHealthCard />

        <div className="mt-8">
          <div className="section-header">
            <h2>Shop by goal</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {trackerShelves.map((shelf) => (
              <Link
                key={shelf.href}
                href={shelf.href}
                className="group flex items-center justify-between gap-3 rounded border border-gray-200 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded border border-gray-200 text-gray-700">
                    {shelf.icon}
                  </span>
                  <span className="font-medium text-gray-900">{shelf.label}</span>
                </span>
                <FiArrowRight className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
