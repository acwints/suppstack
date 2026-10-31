import Link from 'next/link';
import { SignupCounter } from '@/components/composite/Growth/SignupCounter';

export interface SeoSection {
  heading: string;
  /** Paragraphs or bullet lists. Plain strings render as paragraphs. */
  body: Array<string | { list: string[] }>;
}

export interface SeoSource {
  label: string;
  href: string;
}

export interface SeoLandingPageProps {
  /** Route of this page, used to omit it from the related-guide links. */
  path: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: SeoSection[];
  sources?: SeoSource[];
  /** Path the user lands on after sign-in. Defaults to the Stack tab. */
  nextPath?: string;
  ctaLabel?: string;
}

const GUIDES: Array<{ href: string; label: string }> = [
  { href: '/supplement-tracker-app', label: 'Supplement tracker app' },
  { href: '/how-to-track-supplements', label: 'How to track supplements' },
  { href: '/creatine-and-magnesium-timing', label: 'Creatine and magnesium timing' },
  { href: '/supplement-interaction-checker', label: 'Supplement interaction checker' },
  { href: '/best-supplement-stack-app', label: 'What to look for in a stack app' },
];

const ctaClassName =
  'inline-flex min-h-11 items-center justify-center rounded bg-gray-900 px-6 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2';

/**
 * Static, server-rendered marketing page. Copy may only describe features
 * that exist today, and it never gives dosing or medical advice.
 */
export function SeoLandingPage({
  path,
  eyebrow,
  title,
  intro,
  sections,
  sources,
  nextPath = '/stack',
  ctaLabel = 'Start your stack free',
}: SeoLandingPageProps) {
  const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;
  const related = GUIDES.filter((guide) => guide.href !== path);

  return (
    <main className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-6 sm:py-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{eyebrow}</p>
      <h1 className="mt-3 text-3xl sm:text-4xl">{title}</h1>
      <p className="mt-4 text-lg text-gray-600">{intro}</p>

      <div className="mt-6">
        <Link href={loginHref} className={ctaClassName}>
          {ctaLabel}
        </Link>
        <SignupCounter className="mt-4" />
      </div>

      <div className="mt-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-2 mt-10 text-2xl">{section.heading}</h2>
            {section.body.map((block, index) =>
              typeof block === 'string' ? (
                <p key={`${section.heading}-${index}`} className="mt-4">
                  {block}
                </p>
              ) : (
                <ul key={`${section.heading}-${index}`} className="mt-4 list-disc space-y-2 pl-6">
                  {block.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )
            )}
          </section>
        ))}

        <p className="mt-10 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
          SuppStack organizes, compares, and tracks supplements. It does not diagnose, treat, or
          prescribe, and nothing on this page is medical advice. Talk to a clinician or pharmacist
          before starting, stopping, or combining supplements, especially if you take medication,
          are pregnant, or have a medical condition.
        </p>

        {sources && sources.length > 0 ? (
          <section>
            <h2 className="mb-2 mt-10 text-2xl">Sources</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm">
              {sources.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <section>
          <h2 className="mb-2 mt-10 text-2xl">Related guides</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {related.map((guide) => (
              <li key={guide.href}>
                <Link
                  href={guide.href}
                  className="underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                >
                  {guide.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-10 border-t border-gray-200 pt-6">
        <Link href={loginHref} className={ctaClassName}>
          {ctaLabel}
        </Link>
        <p className="mt-2 text-sm text-gray-500">
          Sign in with Apple or Google. Core tracking is free.
        </p>
      </div>
    </main>
  );
}
