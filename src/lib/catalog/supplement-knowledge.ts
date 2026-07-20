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

export interface SupplementKnowledge {
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
  // ── Research peptides ──────────────────────────────────────────────
  'bpc-157': {
    overview:
      'BPC-157 (Body Protection Compound-157) is a synthetic peptide made of 15 amino acids, derived from a partial sequence of a protective protein found in human gastric juice. It is widely discussed in fitness and recovery circles, but it is a research chemical — not an approved medicine or dietary supplement — and essentially all supportive data comes from animal and cell studies.',
    howItWorks:
      'In animal models, BPC-157 appears to promote angiogenesis (the growth of new blood vessels) and to modulate growth-factor and nitric-oxide pathways involved in tissue healing. These mechanisms are proposed to underlie the tendon, ligament, muscle, and gastrointestinal healing effects reported in rodents.',
    benefits: [
      'Studied in rats for accelerated tendon, ligament, and muscle healing',
      'Investigated for protective effects on the gut lining and gastric ulcers in animals',
      'Explored for angiogenesis and blood-vessel repair in preclinical models',
    ],
    dosing:
      'There is no established, evidence-based human dose. BPC-157 has not completed human clinical trials for any indication, so any dosing figures circulated online are extrapolated from animal studies and are not validated for safety.',
    safety:
      'Human safety has not been established in controlled trials. Product purity is a major concern: peptides sold "for research use only" are not manufactured to pharmaceutical standards and may be contaminated or mislabeled. Do not use without the guidance of a qualified medical professional.',
    legalStatus:
      'BPC-157 is not approved by the FDA for any use and is not a lawful dietary supplement ingredient — in 2023 the FDA flagged it as a substance that does not qualify for inclusion in compounded drugs. It is banned in sport by the World Anti-Doping Agency (WADA). This page is educational only; SuppStack does not sell BPC-157.',
    research:
      'The evidence base is almost entirely preclinical (rodent and in-vitro). Promising animal results have not been confirmed by rigorous human trials, so real-world efficacy and safety in people remain unknown.',
    faqs: [
      {
        question: 'Is BPC-157 a dietary supplement?',
        answer:
          'No. It is an unapproved synthetic peptide. The FDA has stated it does not meet the criteria for a dietary ingredient, and it is not legally marketable as a supplement in the U.S.',
      },
      {
        question: 'Is there human evidence it works?',
        answer:
          'Not from controlled clinical trials. The healing effects reported for BPC-157 come from animal and laboratory studies, which do not reliably predict outcomes in humans.',
      },
    ],
    citations: [
      { label: 'FDA — Bulk drug substances nominated for compounding (BPC-157 review)', url: 'https://www.fda.gov/drugs/human-drug-compounding/list-bulk-drug-substances-which-there-clinical-need-under-section-503b-fdc-act' },
      { label: 'PubMed — BPC-157 research literature', url: `${PUBMED}?term=BPC+157` },
    ],
  },
  'tb-500': {
    overview:
      'TB-500 is a synthetic version of a fragment of thymosin beta-4, a naturally occurring protein involved in cell building and repair. Like BPC-157, it is a research compound popular in recovery communities, but it is not an approved drug or dietary supplement and lacks human clinical validation.',
    howItWorks:
      'Thymosin beta-4 regulates actin, a protein central to cell structure and movement. In laboratory and animal studies this is proposed to support cell migration, blood-vessel formation, and tissue regeneration after injury.',
    benefits: [
      'Studied in animals for wound healing and tissue repair',
      'Investigated for cardiac and corneal repair in preclinical models',
      'Explored for reducing inflammation and scar formation in animal studies',
    ],
    dosing:
      'No validated human dose exists. TB-500 has not been through human efficacy and safety trials, so circulated protocols are unverified.',
    safety:
      'Human safety data are lacking. Research-grade material carries purity and contamination risks. Use only under qualified medical supervision.',
    legalStatus:
      'TB-500 is not FDA-approved and is not a lawful dietary supplement. It is prohibited in sport by WADA. SuppStack does not sell TB-500; this entry is for reference only.',
    research:
      'Evidence is preclinical. Human clinical outcomes are unknown.',
    citations: [
      { label: 'WADA — Prohibited List (peptide hormones & growth factors)', url: 'https://www.wada-ama.org/en/prohibited-list' },
      { label: 'PubMed — Thymosin beta-4 research literature', url: `${PUBMED}?term=thymosin+beta+4+repair` },
    ],
  },
  retatrutide: {
    overview:
      'Retatrutide (development code LY3437943) is an investigational "triple agonist" that activates the GIP, GLP-1, and glucagon receptors. It is being studied in clinical trials for obesity and type 2 diabetes and has shown large weight reductions in early trials, but it is not FDA-approved and is not available as a supplement.',
    howItWorks:
      'By activating three incretin/metabolic receptors at once, retatrutide is designed to reduce appetite, slow gastric emptying, improve blood-sugar control, and increase energy expenditure — combining the mechanisms of GLP-1 drugs with additional glucagon-driven metabolic effects.',
    benefits: [
      'Substantial weight loss in phase 2 obesity trials',
      'Improvements in blood glucose in type 2 diabetes studies',
      'Under investigation for metabolic dysfunction–associated steatotic liver disease (MASLD)',
    ],
    dosing:
      'Investigational only. Doses have been evaluated exclusively within clinical trial protocols under medical supervision; there is no approved consumer dose.',
    safety:
      'Reported trial side effects are mainly gastrointestinal (nausea, diarrhea, vomiting), consistent with the incretin drug class. Because it is investigational, its full long-term safety profile is not yet established. Compounded or "research" retatrutide sold online is unregulated and potentially unsafe.',
    legalStatus:
      'Retatrutide is an investigational drug, not approved by the FDA and not a dietary supplement. It should only ever be used within a supervised clinical trial. SuppStack does not sell it; this page is educational.',
    research:
      'Phase 2 results (published in the New England Journal of Medicine, 2023) were notable for the degree of weight loss. Phase 3 trials are ongoing to confirm efficacy and safety.',
    faqs: [
      {
        question: 'Can I buy retatrutide?',
        answer:
          'Not legally as a consumer product. It is an investigational drug available only through clinical trials. Products sold online as "research" retatrutide are unregulated and their contents cannot be verified.',
      },
    ],
    citations: [
      { label: 'NEJM — Triple–Hormone-Receptor Agonist Retatrutide for Obesity (2023)', url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2301972' },
      { label: 'ClinicalTrials.gov — Retatrutide studies', url: 'https://clinicaltrials.gov/search?term=retatrutide' },
    ],
  },
  tirzepatide: {
    overview:
      'Tirzepatide is a dual GIP and GLP-1 receptor agonist prescription medication, sold under the brand names Mounjaro (type 2 diabetes) and Zepbound (chronic weight management). It is a prescription drug administered by injection — not a dietary supplement — and is included here for reference and safety context.',
    howItWorks:
      'Tirzepatide activates both the GIP and GLP-1 incretin receptors, which increases insulin secretion in response to meals, reduces appetite, and slows gastric emptying, leading to improved blood-sugar control and weight loss.',
    benefits: [
      'FDA-approved to improve blood sugar in type 2 diabetes (Mounjaro)',
      'FDA-approved for chronic weight management (Zepbound)',
      'Significant average weight reduction in the SURMOUNT trials',
    ],
    dosing:
      'Prescription-only. A licensed clinician titrates the dose (typically a weekly subcutaneous injection). Never self-dose from non-pharmacy sources.',
    safety:
      'Common side effects are gastrointestinal (nausea, diarrhea, constipation). It carries a boxed warning for thyroid C-cell tumors seen in rodents and should be discussed thoroughly with a prescriber. Compounded or counterfeit versions have prompted FDA warnings.',
    legalStatus:
      'Tirzepatide is an FDA-approved prescription medication, not a supplement. It requires a prescription and clinical oversight. SuppStack does not sell it.',
    citations: [
      { label: 'FDA — Zepbound (tirzepatide) approval', url: 'https://www.fda.gov/news-events/press-announcements/fda-approves-new-medication-chronic-weight-management' },
      { label: 'NEJM — SURMOUNT-1 tirzepatide trial (2022)', url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2206038' },
    ],
  },
  semaglutide: {
    overview:
      'Semaglutide is a GLP-1 receptor agonist prescription medication marketed as Ozempic and Rybelsus (type 2 diabetes) and Wegovy (weight management). It is a prescription drug, not a supplement, and is documented here for reference and to warn against unregulated "research" or compounded versions.',
    howItWorks:
      'Semaglutide mimics the incretin hormone GLP-1, enhancing meal-triggered insulin release, suppressing glucagon, slowing gastric emptying, and reducing appetite via the brain\'s satiety centers.',
    benefits: [
      'FDA-approved for type 2 diabetes blood-sugar control (Ozempic, Rybelsus)',
      'FDA-approved for chronic weight management (Wegovy)',
      'Shown to reduce major cardiovascular events in high-risk patients (SELECT trial)',
    ],
    dosing:
      'Prescription-only, titrated by a clinician (weekly injection, or a daily tablet for Rybelsus). Do not use products from non-pharmacy or "research" sources.',
    safety:
      'Common side effects are gastrointestinal. It carries a boxed warning for thyroid C-cell tumors observed in rodents. The FDA has repeatedly warned about counterfeit and illegally compounded semaglutide.',
    legalStatus:
      'Semaglutide is an FDA-approved prescription medication, not a dietary supplement. SuppStack does not sell it; this entry is educational.',
    citations: [
      { label: 'FDA — Medications containing semaglutide / counterfeit warnings', url: 'https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/medications-containing-semaglutide-marketed-type-2-diabetes-or-weight-loss' },
      { label: 'NEJM — SELECT cardiovascular outcomes trial (2023)', url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2307563' },
    ],
  },
  ipamorelin: {
    overview:
      'Ipamorelin is a synthetic pentapeptide and selective growth-hormone secretagogue (a ghrelin-receptor agonist) that has been studied for stimulating the body\'s own growth-hormone release. It is a research compound — not an approved drug or dietary supplement.',
    howItWorks:
      'Ipamorelin binds the ghrelin/growth-hormone-secretagogue receptor in the pituitary, prompting a pulse of growth hormone release with relatively little effect on cortisol or prolactin compared with older secretagogues.',
    benefits: [
      'Studied for stimulating endogenous growth hormone secretion',
      'Explored in research settings for recovery and body-composition endpoints',
    ],
    dosing:
      'No validated human dose exists outside of limited research contexts; it is not approved for general use.',
    safety:
      'Human safety in unsupervised use is not established. Research-grade material carries purity and contamination risks. Growth-hormone manipulation can have metabolic and endocrine consequences and should never be attempted without medical supervision.',
    legalStatus:
      'Ipamorelin is not FDA-approved and is not a lawful dietary supplement. It is prohibited in sport by WADA. SuppStack does not sell it.',
    citations: [
      { label: 'WADA — Prohibited List (peptide hormones & secretagogues)', url: 'https://www.wada-ama.org/en/prohibited-list' },
      { label: 'PubMed — Ipamorelin research literature', url: `${PUBMED}?term=ipamorelin` },
    ],
  },
  'cjc-1295': {
    overview:
      'CJC-1295 is a synthetic analog of growth-hormone-releasing hormone (GHRH) studied for extending growth-hormone release. It is frequently discussed alongside ipamorelin, but like other peptides in this category it is a research compound rather than an approved medicine or supplement.',
    howItWorks:
      'CJC-1295 stimulates the pituitary\'s GHRH receptor to increase growth-hormone and IGF-1 output. Some versions include a "DAC" (drug affinity complex) modification designed to prolong its half-life.',
    benefits: [
      'Studied for increasing growth-hormone and IGF-1 levels',
      'Explored in research contexts for recovery and body composition',
    ],
    dosing:
      'No validated human dose for general use. It has not completed the clinical trials needed to establish safe, effective consumer dosing.',
    safety:
      'Unsupervised use carries unknown risks; endocrine manipulation can have significant metabolic effects. Purity of research-grade material is not guaranteed.',
    legalStatus:
      'CJC-1295 is not FDA-approved and is not a lawful dietary supplement. It is banned in sport by WADA. SuppStack does not sell it.',
    citations: [
      { label: 'WADA — Prohibited List', url: 'https://www.wada-ama.org/en/prohibited-list' },
      { label: 'PubMed — CJC-1295 / GHRH analog literature', url: `${PUBMED}?term=CJC-1295` },
    ],
  },
  'ghk-cu': {
    overview:
      'GHK-Cu is a naturally occurring copper-binding tripeptide (glycyl-L-histidyl-L-lysine plus copper) present in human plasma that declines with age. It is best known from topical skincare research for collagen synthesis and wound healing, and is included here as a reference entry — it is not sold as an ingestible supplement on SuppStack.',
    howItWorks:
      'GHK-Cu delivers copper to cells and is thought to modulate genes involved in tissue remodeling, stimulate collagen and elastin production, and support wound repair and antioxidant activity, primarily when applied topically.',
    benefits: [
      'Studied in topical formulations for skin firmness and collagen synthesis',
      'Investigated for wound healing and anti-inflammatory effects',
      'Explored for hair and scalp applications in cosmetic research',
    ],
    dosing:
      'Used mainly in topical cosmetic formulations. There is no established oral dose, and ingesting copper peptides is not a validated use.',
    safety:
      'Topical use in cosmetic concentrations is generally well tolerated, but excess copper intake is harmful, so oral or injectable use is not advised without medical guidance.',
    legalStatus:
      'GHK-Cu appears in cosmetic skincare products (topical), which are regulated differently from ingestible supplements. It is not an approved oral supplement or drug. SuppStack does not sell GHK-Cu.',
    citations: [
      { label: 'PubMed — GHK-Cu skin and wound-healing research', url: `${PUBMED}?term=GHK-Cu+skin` },
    ],
  },

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

export function hasSupplementKnowledge(name?: string | null, aliases?: string[] | null): boolean {
  return getSupplementKnowledge(name, aliases) !== null;
}
