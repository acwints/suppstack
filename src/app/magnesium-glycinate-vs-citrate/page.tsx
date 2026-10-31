import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/composite/Seo';

export const metadata: Metadata = {
  title: 'Magnesium Glycinate vs Citrate: What NIH Says | SuppStack',
  description:
    'NIH ODS compares absorption of several magnesium forms, including citrate, with oxide and sulfate. It does not rank magnesium glycinate against citrate. Here is the sourced difference, and how to log the product you take.',
  alternates: { canonical: '/magnesium-glycinate-vs-citrate' },
  openGraph: {
    title: 'Magnesium glycinate vs citrate | SuppStack',
    description: 'What the NIH magnesium fact sheet says about forms, and what it does not rank.',
    url: '/magnesium-glycinate-vs-citrate',
  },
};

export default function MagnesiumGlycinateVsCitratePage() {
  return (
    <SeoLandingPage
      path="/magnesium-glycinate-vs-citrate"
      eyebrow="Guide"
      title="Magnesium glycinate and magnesium citrate"
      intro="Search results often declare a winner between magnesium glycinate and magnesium citrate. The NIH fact sheet does not. Here is the comparison it does make, and how to track whichever product you use."
      sections={[
        {
          heading: 'Forms, and what is actually on the label',
          body: [
            'The NIH Office of Dietary Supplements (ODS) says magnesium supplements come in many forms, including oxide, citrate, and chloride. The Supplement Facts panel declares the amount of elemental magnesium, not the weight of the whole magnesium compound [1].',
            'Two products can look similar on the front of the bottle and still provide different amounts of elemental magnesium. Compare that line, not the marketing name alone.',
          ],
        },
        {
          heading: 'What ODS says about absorption',
          body: [
            'ODS says absorption varies by form. Forms that dissolve well in liquid are more completely absorbed than less soluble forms. Small studies have found that the aspartate, citrate, lactate, and chloride forms are absorbed more completely, and are more bioavailable, than magnesium oxide and magnesium sulfate [1].',
            'That list includes citrate. It does not include magnesium glycinate, and ODS does not rank glycinate against citrate. SuppStack will not fill that gap with a recommendation. If you are choosing a form, use the fact sheet and ask a clinician, especially if you have kidney disease.',
          ],
        },
        {
          heading: 'Upper limit, stomach upset, and medication spacing',
          body: [
            'ODS says high doses of magnesium from supplements or medications can cause diarrhea, nausea, and abdominal cramping. The forms most often reported to cause diarrhea include carbonate, chloride, gluconate, and oxide. The tolerable upper intake level for supplemental magnesium in adults is 350 mg per day from supplements and medications, not from food [1].',
            'ODS also describes interactions. Magnesium-rich supplements can decrease absorption of oral bisphosphonates, and ODS says taking them at least 2 hours apart can minimize that. Magnesium can also bind some tetracycline and quinolone antibiotics. ODS says those antibiotics should be taken at least 2 hours before, or 4 to 6 hours after, a magnesium-containing supplement [1]. Ask a pharmacist how this applies to your prescriptions.',
          ],
        },
        {
          heading: 'Logging either form in SuppStack',
          body: [
            {
              list: [
                'Add the magnesium glycinate or magnesium citrate product you actually take. The catalog tracks products, not a generic “magnesium” bucket that ignores the bottle.',
                'Set planned servings and which days it is scheduled, then check it off on the Stack tab.',
                'If another product also contains magnesium, the Stack screen shows that overlap and a daily total per unit. It does not tell you which form to buy or how much elemental magnesium you need.',
              ],
            },
          ],
        },
      ]}
      sources={[
        {
          label: '[1] NIH Office of Dietary Supplements. Magnesium: Fact Sheet for Health Professionals.',
          href: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
        },
      ]}
    />
  );
}
