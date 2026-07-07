import Link from 'next/link';
import {
  FiActivity,
  FiArrowRight,
  FiCpu,
  FiMoon,
  FiShoppingBag,
  FiTrendingUp,
} from 'react-icons/fi';
import { TbScaleOutline } from 'react-icons/tb';
import { HealthIntelligencePanel } from '@/components/composite/Health';
import { Badge } from '@/components/ui';
import { buildProductDirectory } from '@/lib/catalog/product-directory';

export const metadata = {
  title: 'Health Tracker | SuppStack AI',
  description:
    'A commerce-enabled health tracker that turns sleep, body, and activity signals into supplement experiments.',
};

const trackerShelves = [
  {
    href: '/products?goal=sleep-recovery',
    label: 'Sleep recovery',
    metric: 'Sleep debt, quality, consistency',
    icon: <FiMoon />,
  },
  {
    href: '/products?goal=body-composition',
    label: 'Body composition',
    metric: 'Weight and body-fat trends',
    icon: <TbScaleOutline />,
  },
  {
    href: '/products?goal=training-output',
    label: 'Training output',
    metric: 'Active calories and steps',
    icon: <FiActivity />,
  },
  {
    href: '/products?goal=metabolic-health',
    label: 'Metabolic support',
    metric: 'Sleep, body trend, meal support',
    icon: <FiTrendingUp />,
  },
] as const;

export default function HealthTrackerPage() {
  const directory = buildProductDirectory();

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-gray-200">
        <div className="container-custom py-8 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="info" icon={<FiCpu />}>
                  AI Health Tracker
                </Badge>
                <Badge variant="secondary">Apple Health ready</Badge>
              </div>
              <h1 className="font-serif text-4xl leading-tight text-gray-900 lg:text-5xl">
                Sleep, body, and activity signals connected to the product shelf.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">
                SuppStack ranks supplement experiments from sleep, weight, body-fat, calories
                burned, and step trends, then connects each signal to a commerce-ready shelf.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded border border-gray-200 p-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {directory.productCount}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Products
                </p>
              </div>
              <div className="rounded border border-gray-200 p-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {directory.healthGoals.length}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Signals
                </p>
              </div>
              <div className="rounded border border-gray-200 p-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {directory.directCheckoutCount}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Checkout
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/products"
              className="inline-flex h-10 items-center justify-center gap-2 rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
            >
              Product directory
              <FiShoppingBag />
            </Link>
            <Link
              href="/health"
              className="inline-flex h-10 items-center justify-center gap-2 rounded border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:border-gray-300 hover:text-gray-900"
            >
              Health shelves
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="container-custom py-8">
        <HealthIntelligencePanel />
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="container-custom py-8">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Commerce Rails
              </p>
              <h2 className="mt-2 font-serif text-3xl text-gray-900">
                Shop the signal behind the score.
              </h2>
            </div>
            <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              View all products
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {trackerShelves.map((shelf) => (
              <Link
                key={shelf.href}
                href={shelf.href}
                className="group rounded border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded border border-gray-200 text-gray-700">
                  {shelf.icon}
                </span>
                <span className="mt-4 flex items-start justify-between gap-3">
                  <span>
                    <span className="block font-medium text-gray-900">{shelf.label}</span>
                    <span className="mt-1 block text-sm leading-6 text-gray-500">
                      {shelf.metric}
                    </span>
                  </span>
                  <FiArrowRight className="mt-1 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
