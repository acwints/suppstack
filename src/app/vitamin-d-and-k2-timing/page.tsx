import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/composite/Seo';

export const metadata: Metadata = {
  title: 'Vitamin D and K2 Timing: What NIH Sources Say | SuppStack',
  description:
    'A sourced note on vitamin D and vitamin K2: both are fat-soluble, labels vary, and NIH fact sheets do not prescribe a clock time. Plus how to log the products you actually take.',
  alternates: { canonical: '/vitamin-d-and-k2-timing' },
  openGraph: {
    title: 'Vitamin D and K2 timing | SuppStack',
    description: 'What NIH fact sheets say about vitamin D, vitamin K, and taking them together.',
    url: '/vitamin-d-and-k2-timing',
  },
};

export default function VitaminDAndK2TimingPage() {
  return (
    <SeoLandingPage
      path="/vitamin-d-and-k2-timing"
      eyebrow="Guide"
      title="Vitamin D and K2 timing"
      intro="People often ask whether vitamin D and vitamin K2 must be taken together, and at what time. Here is what NIH fact sheets actually say, then how to log the products you use."
      sections={[
        {
          heading: 'Vitamin D is fat-soluble',
          body: [
            'The NIH Office of Dietary Supplements (ODS) describes vitamin D as a fat-soluble vitamin. In food and supplements it is mainly vitamin D2 (ergocalciferol) or vitamin D3 (cholecalciferol). ODS says both forms are well absorbed in the small intestine [1].',
            'ODS also says the concurrent presence of fat in the gut enhances vitamin D absorption, and that some vitamin D is absorbed even without dietary fat [1]. That is a description of absorption, not an instruction to take it at a particular hour.',
            'ODS lists a tolerable upper intake level for vitamin D that depends on age, and says toxicity is almost always from excessive supplement intakes. Taking calcium supplements together with vitamin D supplements may increase the risk of some adverse effects [1].',
          ],
        },
        {
          heading: 'Vitamin K2 is one part of the vitamin K family',
          body: [
            'ODS uses “vitamin K” for a family of compounds. Phylloquinone is vitamin K1. Menaquinones are vitamin K2, written MK-4 through MK-13. MK-4, MK-7, and MK-9 are the most studied menaquinones [2].',
            'Supplements may use vitamin K1 or vitamin K2 as MK-4 or MK-7. ODS says data on the relative bioavailability of these forms are limited. One study found that both phytonadione and MK-7 were well absorbed, and that MK-7 had a longer half-life [2].',
            'Vitamin K products are sold alone or combined with other nutrients, including calcium, magnesium, or vitamin D [2]. ODS does not prescribe a clock time for taking vitamin D and vitamin K together, and it does not say that combining them is required.',
          ],
        },
        {
          heading: 'A real interaction: anticoagulants',
          body: [
            'ODS says vitamin K can have a serious interaction with warfarin (Coumadin) and similar anticoagulants. People taking those drugs need a consistent vitamin K intake from food and supplements, because a sudden change can increase or decrease the anticoagulant effect [2]. If you take a blood thinner, ask the prescriber before you add, stop, or change a vitamin K product. Do not use this page to adjust a dose.',
          ],
        },
        {
          heading: 'Logging vitamin D and vitamin K in SuppStack',
          body: [
            {
              list: [
                'Add the exact vitamin D and vitamin K products you use, including a combination product if that is what is on the bottle.',
                'Set planned servings and which days of the week each one is scheduled.',
                'Check them off on the Stack tab. SuppStack does not remind you at a time of day and does not tell you whether to take them together.',
                'If a multivitamin also contains vitamin D or vitamin K, the Stack screen shows that overlap and a daily total for each unit. Milligrams and IU are never added together.',
              ],
            },
          ],
        },
      ]}
      sources={[
        {
          label: '[1] NIH Office of Dietary Supplements. Vitamin D: Fact Sheet for Health Professionals.',
          href: 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/',
        },
        {
          label: '[2] NIH Office of Dietary Supplements. Vitamin K: Fact Sheet for Health Professionals.',
          href: 'https://ods.od.nih.gov/factsheets/VitaminK-HealthProfessional/',
        },
      ]}
    />
  );
}
