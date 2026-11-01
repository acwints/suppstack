import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/composite/Seo';

const ZINC_SHEET = 'https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/';
const MAGNESIUM_SHEET = 'https://ods.od.nih.gov/factsheets/Magnesium-Consumer/';

export const metadata: Metadata = {
  title: 'Supplement Overlap Notes with Sources | SuppStack',
  description:
    'Two sourced notes: high-dose zinc and copper absorption, and supplemental magnesium totals. SuppStack does not rate combinations. Ask a doctor or pharmacist.',
  alternates: { canonical: '/supplement-interaction-checker' },
  openGraph: {
    title: 'Supplement overlap notes | SuppStack',
    description: 'Cited notes from NIH fact sheets, plus what SuppStack can flag on a label.',
    url: '/supplement-interaction-checker',
  },
};

export default function SupplementInteractionCheckerPage() {
  return (
    <SeoLandingPage
      path="/supplement-interaction-checker"
      eyebrow="Supplement overlaps"
      title="Supplement overlap notes, with the source next to each one"
      intro="SuppStack is not an interaction checker and does not rate any combination. The notes below are only what a NIH fact sheet states, with the link in the same paragraph. If a pairing is not listed, that means this page has no data on it."
      notice="Not medical advice. Ask your doctor or pharmacist."
      sections={[
        {
          heading: 'Zinc and copper',
          body: [
            {
              parts: [
                'The NIH Office of Dietary Supplements says that if zinc is used for weeks, doses of 50 mg or more, typically from supplements, can interfere with copper absorption, which can cause low copper status. ',
                { href: ZINC_SHEET, label: 'Zinc: Fact Sheet for Health Professionals' },
                '. This page does not add a severity rating or say who that applies to.',
              ],
            },
          ],
        },
        {
          heading: 'Magnesium from more than one product',
          body: [
            {
              parts: [
                'No data: this page has no source that describes a special interaction between two magnesium products. The NIH Office of Dietary Supplements does say that high intakes of magnesium from dietary supplements and medications can cause diarrhea, nausea, and abdominal cramping, and that the daily upper limit for adults from supplements and medications is 350 mg. That limit does not include magnesium from food. ',
                { href: MAGNESIUM_SHEET, label: 'Magnesium: Fact Sheet for Consumers' },
                '.',
              ],
            },
          ],
        },
        {
          heading: 'What SuppStack can show',
          body: [
            'On the Stack screen, SuppStack can flag an ingredient listed on more than one product and keep milligrams and IU in separate totals. That is a reading of the labels in your stack. It is not a check for drug interactions, and it does not judge the overlap.',
          ],
        },
      ]}
      sources={[
        { label: 'NIH ODS. Zinc: Fact Sheet for Health Professionals.', href: ZINC_SHEET },
        { label: 'NIH ODS. Magnesium: Fact Sheet for Consumers.', href: MAGNESIUM_SHEET },
      ]}
      ctaLabel="See overlaps in your stack"
    />
  );
}
