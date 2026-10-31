import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/composite/Seo';

export const metadata: Metadata = {
  title: 'Creatine and Magnesium Timing: What the Research Says | SuppStack',
  description:
    'A sourced, non-medical overview of what research says about when to take creatine and magnesium, plus a simple way to log both consistently.',
  alternates: { canonical: '/creatine-and-magnesium-timing' },
  openGraph: {
    title: 'Creatine and Magnesium Timing | SuppStack',
    description: 'What the evidence says about timing, and how to track consistency.',
    url: '/creatine-and-magnesium-timing',
  },
};

export default function CreatineMagnesiumTimingPage() {
  return (
    <SeoLandingPage
      path="/creatine-and-magnesium-timing"
      eyebrow="Guide"
      title="Creatine and magnesium timing"
      intro="People often ask whether creatine and magnesium need to be taken at specific times. Here is what published sources say, with links, followed by how to keep a consistent log."
      sections={[
        {
          heading: 'Creatine: consistency is the main theme',
          body: [
            'The International Society of Sports Nutrition (ISSN) position stand describes creatine monohydrate as the most extensively studied form of creatine, and describes increases in muscle creatine stores with daily supplementation over time [1].',
            'A 2021 ISSN review of common questions concluded that the evidence on taking creatine before versus after exercise is limited and mixed, and that daily intake appears to matter more than precise timing [2].',
          ],
        },
        {
          heading: 'Magnesium: forms and absorption',
          body: [
            'The NIH Office of Dietary Supplements (ODS) notes that magnesium supplements come in many forms (such as oxide, citrate, and chloride) and that some forms are absorbed more completely than others in small studies [3].',
            'ODS also lists interactions: magnesium can reduce absorption of some antibiotics and bisphosphonates, so spacing is commonly advised for people taking those medications [3]. High-dose supplemental magnesium can cause diarrhea, and ODS lists an upper limit for supplemental magnesium in adults [3].',
            'If you take medication, ask a pharmacist how to time magnesium around it.',
          ],
        },
        {
          heading: 'Can you take them together?',
          body: [
            'We did not find an authoritative source that identifies a direct interaction between creatine and magnesium. That is not the same as proof that the combination suits everyone, so check with a clinician if you have kidney disease or take medication.',
          ],
        },
        {
          heading: 'Logging both in SuppStack',
          body: [
            {
              list: [
                'Add the exact creatine and magnesium products you use to your stack.',
                'Set the servings you plan to take per day, and which days they are scheduled.',
                'Check each one off on the Stack tab when you take it, and watch your streak and weekly completion.',
                'If a multivitamin also contains magnesium, the Stack screen shows that overlap and a daily total for each unit. Milligrams and IU are never added together.',
              ],
            },
          ],
        },
      ]}
      sources={[
        {
          label:
            '[1] Kreider RB et al. ISSN position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine. JISSN, 2017.',
          href: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0173-z',
        },
        {
          label:
            '[2] Antonio J et al. Common questions and misconceptions about creatine supplementation: what does the scientific evidence really show? JISSN, 2021.',
          href: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-021-00412-w',
        },
        {
          label: '[3] NIH Office of Dietary Supplements. Magnesium: Fact Sheet for Health Professionals.',
          href: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
        },
      ]}
    />
  );
}
