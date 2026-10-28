import { PEPTIDE_KNOWLEDGE } from './peptide-knowledge';

/**
 * Supplement knowledge base — the "wiki" half of the marketplace + wiki
 * experience. Every catalog entry can carry structured, plain-language
 * reference content that renders on its detail page alongside (or, for
 * research-only compounds, instead of) the shopping surface.
 *
 * Content here is educational only. It is deliberately hedged and cites
 * public, authoritative sources. Nothing in this file is medical advice, and
 * research-only compounds carry an explicit "not a dietary supplement"
 * disclaimer in the UI.
 */

export interface KnowledgeFaq {
  question: string;
  answer: string;
}

export interface KnowledgeCitation {
  label: string;
  url: string;
}

export interface PeptideResearch {
  areas: string[];
  regulatoryStatus: 'FDA-approved prescription' | 'In clinical trials' | 'Not FDA-approved' | 'Topical cosmetic / unapproved systemic';
  humanEvidence: 'Controlled human trials' | 'Limited human evidence' | 'Preclinical only';
  routes: string[];
  scope: string;
  limitations: string;
  sourcesCheckedOn: string;
  sourceUpdatedOn: string;
  sourceUrl: string;
}

export interface SupplementKnowledge {
  peptide?: PeptideResearch;
  /** One-paragraph plain-language summary. */
  overview: string;
  /** Mechanism / how it is thought to work. */
  howItWorks?: string;
  /** Evidence-linked uses or areas of study. */
  benefits?: string[];
  /** Dosing and usage notes (or research-status note for research compounds). */
  dosing?: string;
  /** Safety, side effects, interactions, and cautions. */
  safety?: string;
  /** Regulatory / legal status — important for research compounds. */
  legalStatus?: string;
  /** Summary of the state of the research. */
  research?: string;
  faqs?: KnowledgeFaq[];
  citations?: KnowledgeCitation[];
}

const PUBMED = 'https://pubmed.ncbi.nlm.nih.gov/';

/**
 * Keyed by lower-cased supplement name. Lookup also falls back to the
 * catalog's aliases via {@link getSupplementKnowledge}.
 */
const KNOWLEDGE: Record<string, SupplementKnowledge> = {
  ...PEPTIDE_KNOWLEDGE,

  // ── Flagship marketplace supplements ───────────────────────────────
  'creatine monohydrate': {
    overview:
      'Creatine monohydrate is one of the most researched sports-nutrition ingredients available. It helps regenerate ATP, the cell\'s rapid energy currency, which supports strength, power, and high-intensity performance. It is inexpensive, well tolerated, and backed by decades of human trials.',
    howItWorks:
      'Supplementing raises muscle phosphocreatine stores, allowing faster ATP resynthesis during short, intense efforts. This can increase training volume over time, indirectly supporting gains in strength and lean mass.',
    benefits: [
      'Improved strength and power output',
      'Greater training volume and lean-mass gains over time',
      'Emerging research into cognitive and recovery benefits',
    ],
    dosing:
      '3–5 g daily is the standard maintenance dose. An optional loading phase (~20 g/day split over 4 doses for 5–7 days) saturates muscles faster but is not required. Consistency matters most.',
    safety:
      'Creatine has an excellent safety record in healthy adults. Mild water retention is common early on. People with kidney disease should consult a clinician first. Monohydrate is the best-studied and most cost-effective form.',
    faqs: [
      {
        question: 'Do I need to load creatine?',
        answer:
          'No. Loading saturates muscles faster, but 3–5 g daily reaches the same saturation within a few weeks with less GI discomfort.',
      },
      {
        question: 'Is creatine only for men or bodybuilders?',
        answer:
          'No. Creatine is studied and effective across sexes and ages, and its benefits extend beyond bodybuilding to general strength, healthy aging, and cognitive research.',
      },
    ],
    citations: [
      { label: 'ISSN Position Stand: Creatine supplementation', url: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0173-z' },
    ],
  },
  'vitamin d3': {
    overview:
      'Vitamin D3 (cholecalciferol) supports bone health, immune function, and muscle performance. Because it is made in the skin from sunlight, deficiency is common in people with limited sun exposure, darker skin, or higher latitudes.',
    howItWorks:
      'D3 is converted in the liver and kidneys to its active hormone form, which regulates calcium and phosphate absorption and influences immune and muscle-cell signaling.',
    benefits: [
      'Supports bone mineralization and calcium absorption',
      'Contributes to normal immune function',
      'May support mood and muscle function when levels are low',
    ],
    dosing:
      '1,000–5,000 IU daily is a common range; the right dose depends on your blood level (25-hydroxyvitamin D). Taking it with a fat-containing meal improves absorption. Pairing with vitamin K2 is popular for bone and vascular support.',
    safety:
      'Vitamin D is fat-soluble and can accumulate, so avoid very high doses without testing. Toxicity is rare but possible with chronic megadoses. Testing your level is the best way to personalize intake.',
    citations: [
      { label: 'NIH Office of Dietary Supplements — Vitamin D', url: 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/' },
    ],
  },
  'magnesium glycinate': {
    overview:
      'Magnesium glycinate is a gentle, well-absorbed form of magnesium bound to the amino acid glycine. It is popular for sleep, relaxation, and muscle function, and is less likely to cause the digestive upset associated with some other magnesium forms.',
    howItWorks:
      'Magnesium is a cofactor in hundreds of enzymatic reactions, including energy production, muscle and nerve function, and neurotransmitter regulation. The glycinate form is chelated for good absorption and is easy on the gut.',
    benefits: [
      'Supports sleep quality and relaxation',
      'Contributes to normal muscle and nerve function',
      'Helps meet magnesium needs when dietary intake is low',
    ],
    dosing:
      '100–400 mg of elemental magnesium daily. Start low and increase as tolerated.',
    safety:
      'Generally well tolerated. Very high doses can cause loose stools. People with kidney impairment should consult a clinician before supplementing.',
    citations: [
      { label: 'NIH Office of Dietary Supplements — Magnesium', url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/' },
    ],
  },
  'omega-3 fish oil': {
    overview:
      'Omega-3 fish oil provides the long-chain fatty acids EPA and DHA, which support heart, brain, eye, and inflammatory balance. Most people who do not eat oily fish regularly fall short of recommended intakes.',
    howItWorks:
      'EPA and DHA incorporate into cell membranes and serve as precursors to signaling molecules that help regulate inflammation, while supporting cardiovascular and neural function.',
    benefits: [
      'Supports cardiovascular health',
      'Contributes to normal brain and eye function',
      'Helps maintain a healthy inflammatory balance',
    ],
    dosing:
      '1,000–2,000 mg combined EPA/DHA daily for general health. Check the label for the actual EPA/DHA content, not just total fish-oil weight.',
    safety:
      'Well tolerated; some people notice fishy aftertaste or mild GI effects. At high doses it can have a mild blood-thinning effect, so discuss with a clinician if you take anticoagulants.',
    citations: [
      { label: 'NIH Office of Dietary Supplements — Omega-3 Fatty Acids', url: 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/' },
    ],
  },
  'whey protein': {
    overview:
      'Whey protein is a fast-digesting, complete dairy protein that provides all essential amino acids and is rich in leucine, a key trigger for muscle protein synthesis. It is a convenient way to hit daily protein targets and support recovery.',
    howItWorks:
      'Whey is rapidly absorbed and delivers a high dose of leucine, which stimulates muscle protein synthesis. It supports muscle repair and helps close the gap when whole-food protein is inconvenient.',
    benefits: [
      'Supports muscle repair and growth alongside training',
      'Convenient way to meet daily protein targets',
      'High in leucine for muscle protein synthesis',
    ],
    dosing:
      '20–30 g of protein per serving, typically once or twice daily as needed to reach your protein goal (roughly 1.6–2.2 g/kg/day for active individuals).',
    safety:
      'Safe for most people. Those with lactose intolerance may prefer whey isolate or a plant protein. Not suitable for people with a dairy allergy.',
    citations: [
      { label: 'ISSN Position Stand: Protein and exercise', url: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8' },
    ],
  },
  ashwagandha: {
    overview:
      'Ashwagandha (Withania somnifera) is an adaptogenic herb used in traditional Ayurvedic practice and studied today for stress, sleep quality, and resilience. Standardized root extracts (such as KSM-66 and Sensoril) are the most researched.',
    howItWorks:
      'Ashwagandha is thought to modulate the stress response, including cortisol regulation, though the exact mechanisms are still being characterized.',
    benefits: [
      'May reduce perceived stress and anxiety in some trials',
      'Studied for sleep quality',
      'Explored for exercise recovery and hormonal support',
    ],
    dosing:
      '300–600 mg of a standardized root extract daily, often split into two doses.',
    safety:
      'Generally well tolerated short-term. It may not be appropriate during pregnancy, or for people with thyroid conditions or on immunosuppressants — check with a clinician. Rare reports of liver issues exist, so choose reputable brands.',
    citations: [
      { label: 'PubMed — Ashwagandha stress and anxiety trials', url: `${PUBMED}?term=ashwagandha+stress` },
    ],
  },
  'l-theanine': {
    overview:
      'L-theanine is an amino acid found naturally in tea leaves, used for calm, focused alertness. It is frequently paired with caffeine to smooth out jitters while preserving the focus benefits.',
    howItWorks:
      'L-theanine promotes alpha brain-wave activity associated with relaxed attention and modulates neurotransmitters such as GABA, without causing sedation.',
    benefits: [
      'Supports calm, focused attention',
      'Takes the edge off caffeine jitters when combined',
      'May support relaxation without drowsiness',
    ],
    dosing:
      '100–200 mg as needed; commonly stacked with caffeine at roughly a 2:1 theanine-to-caffeine ratio.',
    safety:
      'Very well tolerated with a strong safety profile. No significant interactions are commonly reported at typical doses.',
    citations: [
      { label: 'PubMed — L-theanine and attention', url: `${PUBMED}?term=l-theanine+attention` },
    ],
  },
};

/**
 * Look up knowledge for a supplement by name, checking any aliases too so
 * "creatine" resolves to the Creatine Monohydrate article, etc.
 */
export function getSupplementKnowledge(
  name?: string | null,
  aliases?: string[] | null
): SupplementKnowledge | null {
  if (!name) return null;
  const direct = KNOWLEDGE[name.toLowerCase()];
  if (direct) return direct;

  for (const alias of aliases ?? []) {
    const match = KNOWLEDGE[alias.toLowerCase()];
    if (match) return match;
  }
  return null;
}
