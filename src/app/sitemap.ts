import type { MetadataRoute } from 'next';

/**
 * There was no sitemap in the app. This one publishes the homepage and the
 * public guides. It is a hint for crawlers, not an in-app screen.
 */
const PATHS = [
  '/',
  '/supplement-tracker-app',
  '/how-to-track-supplements',
  '/creatine-and-magnesium-timing',
  '/supplement-interaction-checker',
  '/best-supplement-stack-app',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-10-31T00:00:00.000Z');

  return PATHS.map((path) => ({
    url: new URL(path, 'https://www.suppstack.app').toString(),
    lastModified,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
