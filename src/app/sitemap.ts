import type { MetadataRoute } from 'next';

/**
 * There was no sitemap in the app. This one publishes the homepage and the
 * public guides. It is a hint for crawlers, not an in-app screen.
 */
const PATHS = [
  '/',
  '/changelog',
  '/supplement-tracker-app',
  '/supplement-stack-tracker',
  '/supplement-stack-checker',
  '/longevity-supplement-stack-tracker',
  '/supplement-schedule-app',
  '/supplement-schedule-planner',
  '/vitamin-tracker-app',
  '/supplement-log-template',
  '/how-to-track-supplements',
  '/how-to-avoid-supplement-overlap',
  '/supplement-restock-reminder',
  '/creatine-and-magnesium-timing',
  '/creatine-timing-calculator',
  '/vitamin-d-and-k2-timing',
  '/magnesium-glycinate-vs-citrate',
  '/supplement-interaction-checker',
  '/best-supplement-stack-app',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-10-31T00:00:00.000Z');

  return PATHS.map((path) => ({
    url: new URL(path, 'https://www.suppstack.app').toString(),
    lastModified:
      path === '/supplement-stack-checker' ||
      path === '/longevity-supplement-stack-tracker'
        ? new Date('2026-11-05T00:00:00.000Z')
        : path === '/supplement-schedule-planner' ||
            path === '/vitamin-tracker-app' ||
            path === '/supplement-log-template'
          ? new Date('2026-11-04T00:00:00.000Z')
          : path === '/supplement-stack-tracker' ||
              path === '/changelog' ||
              path === '/creatine-timing-calculator'
            ? new Date('2026-11-01T00:00:00.000Z')
            : lastModified,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
