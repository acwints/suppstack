'use client';

import { FiExternalLink } from 'react-icons/fi';
import type { Supplement } from '@/types';
import type { SupplementKnowledge as Knowledge } from '@/lib/catalog/supplement-knowledge';

export interface SupplementKnowledgeProps {
  supplement: Supplement;
  knowledge: Knowledge | null;
}

/**
 * The "wiki" surface of a supplement page. Renders structured reference
 * content (overview, mechanism, evidence, dosing, safety) from the knowledge
 * base when available, and always falls back to the catalog's own goals,
 * forms, and dosage so every page has useful information.
 */
export function SupplementKnowledge({ supplement, knowledge }: SupplementKnowledgeProps) {
  const hasQuickFacts =
    (supplement.primary_goals?.length ?? 0) > 0 ||
    (supplement.typical_forms?.length ?? 0) > 0 ||
    Boolean(supplement.common_dosage) ||
    Boolean(supplement.evidence_rating);

  if (!knowledge && !hasQuickFacts) return null;

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          About {supplement.supplement_name}
        </h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Educational reference — not medical advice.
        </p>
      </div>

      <div className="space-y-6 px-5 py-5">
        {knowledge?.overview && (
          <p className="text-sm leading-6 text-gray-700">{knowledge.overview}</p>
        )}

        {hasQuickFacts && (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {supplement.evidence_rating && (
              <QuickFact
                term="Evidence"
                value={`${capitalize(supplement.evidence_rating)} evidence`}
              />
            )}
            {supplement.common_dosage && (
              <QuickFact term="Typical dose" value={supplement.common_dosage} />
            )}
            {(supplement.primary_goals?.length ?? 0) > 0 && (
              <QuickFact term="Common uses" value={supplement.primary_goals!.join(', ')} />
            )}
            {(supplement.typical_forms?.length ?? 0) > 0 && (
              <QuickFact term="Forms" value={supplement.typical_forms!.join(', ')} />
            )}
          </dl>
        )}

        {knowledge?.howItWorks && (
          <KnowledgeBlock title="How it works" body={knowledge.howItWorks} />
        )}

        {(knowledge?.benefits?.length ?? 0) > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">What the research looks at</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-gray-700">
              {knowledge!.benefits!.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}

        {knowledge?.dosing && <KnowledgeBlock title="Dosing & usage" body={knowledge.dosing} />}
        {knowledge?.safety && <KnowledgeBlock title="Safety & side effects" body={knowledge.safety} />}
        {knowledge?.legalStatus && (
          <KnowledgeBlock title="Regulatory status" body={knowledge.legalStatus} />
        )}
        {knowledge?.research && (
          <KnowledgeBlock title="State of the research" body={knowledge.research} />
        )}

        {(knowledge?.faqs?.length ?? 0) > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Frequently asked</h3>
            <div className="space-y-3">
              {knowledge!.faqs!.map((faq) => (
                <div key={faq.question}>
                  <p className="text-sm font-medium text-gray-900">{faq.question}</p>
                  <p className="mt-0.5 text-sm leading-6 text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(knowledge?.citations?.length ?? 0) > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              References
            </h3>
            <ul className="space-y-1.5">
              {knowledge!.citations!.map((citation) => (
                <li key={citation.url}>
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-600 underline decoration-gray-300 underline-offset-2 transition-colors hover:text-gray-900"
                  >
                    {citation.label}
                    <FiExternalLink className="shrink-0" size={12} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function KnowledgeBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="mb-1.5 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-sm leading-6 text-gray-700">{body}</p>
    </div>
  );
}

function QuickFact({ term, value }: { term: string; value: string }) {
  return (
    <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{term}</dt>
      <dd className="mt-0.5 text-sm text-gray-800">{value}</dd>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default SupplementKnowledge;
