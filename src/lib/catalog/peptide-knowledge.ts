import type { SupplementKnowledge } from './supplement-knowledge';

// Original summaries informed by the supplied Superpower research sheet, checked
// against the linked papers and regulators. These dates are not clinician review.
export const PEPTIDE_KNOWLEDGE: Record<string, SupplementKnowledge> = {
  "bpc-157": {
    "overview": "BPC-157 is a synthetic 15-amino-acid peptide based on a sequence found in gastric juice. It is discussed for tendon, muscle and gut repair, but the research is overwhelmingly in animals and cells.",
    "howItWorks": "Animal and cell experiments suggest effects on blood-vessel growth, nitric-oxide signaling and tissue repair. A proposed mechanism does not establish that a treatment works in people.",
    "benefits": [
      "Tissue repair",
      "Digestive health"
    ],
    "dosing": "There is no approved consumer dosing protocol for this use. Study regimens are not instructions for personal use.",
    "safety": "Human safety is poorly characterized. FDA identifies potential immune reactions and peptide-impurity concerns, with insufficient information to determine safety for the proposed routes.",
    "legalStatus": "Not FDA-approved. Compounding review is a separate process from drug approval. SuppStack provides reference information and does not sell BPC-157.",
    "research": "A 2025 systematic review included 36 studies: 35 preclinical studies and one clinical report. That retrospective knee-pain series involved 12 patients and had no control group. It cannot establish whether BPC-157 caused improvement or whether it is safe.",
    "peptide": {
      "areas": [
        "Tissue repair",
        "Digestive health"
      ],
      "regulatoryStatus": "Not FDA-approved",
      "humanEvidence": "Limited human evidence",
      "routes": [
        "Injection",
        "Oral"
      ],
      "scope": "Tendon, muscle and gut repair; human evidence is mainly an uncontrolled knee-pain report.",
      "limitations": "Controlled human evidence for healing and long-term safety is missing. Animal findings and personal reports cannot establish a clinical benefit.",
      "sourcesCheckedOn": "2026-10-27",
      "sourceUpdatedOn": "2026-10-05",
      "sourceUrl": "https://superpower.com/guides/peptides/bpc-157"
    },
    "citations": [
      {
        "label": "2025 systematic review: BPC-157 in orthopedic sports medicine",
        "url": "https://doi.org/10.1177/15563316251355551"
      },
      {
        "label": "FDA: peptide compounding safety concerns",
        "url": "https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks"
      }
    ]
  },
  "tb-500": {
    "overview": "TB-500 is marketed as a fragment of thymosin beta-4 for injury recovery. It is distinct from the full-length protein, whose research is often used to support claims about the fragment.",
    "howItWorks": "Claims about cell migration, actin regulation and blood-vessel growth largely come from full-length thymosin beta-4 research. They should not be treated as demonstrated actions of TB-500 in people.",
    "benefits": [
      "Tissue repair"
    ],
    "dosing": "There is no approved consumer dosing protocol for this use. Study regimens are not instructions for personal use.",
    "safety": "FDA reports a lack of human exposure data for thymosin beta-4 fragment and flags possible immune reactions and peptide impurities.",
    "legalStatus": "Not FDA-approved. An advisory recommendation about compounding is not approval of a drug. SuppStack does not sell TB-500.",
    "research": "No controlled human efficacy study of the fragment was identified in the source review. Studies of full-length thymosin beta-4 in wounds or eye disease do not establish that injected TB-500 improves recovery.",
    "peptide": {
      "areas": [
        "Tissue repair"
      ],
      "regulatoryStatus": "Not FDA-approved",
      "humanEvidence": "Preclinical only",
      "routes": [
        "Injection"
      ],
      "scope": "The TB-500 fragment, rather than full-length thymosin beta-4 or its eye-drop formulations.",
      "limitations": "Neither efficacy nor a human safety profile is established for the fragment. Different sequences and formulations must not be treated as interchangeable.",
      "sourcesCheckedOn": "2026-10-27",
      "sourceUpdatedOn": "2026-10-05",
      "sourceUrl": "https://superpower.com/guides/peptides/tb-500"
    },
    "citations": [
      {
        "label": "Full-length thymosin beta-4 venous-ulcer study (2007)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/17495250/"
      },
      {
        "label": "FDA: thymosin beta-4 fragment safety concerns",
        "url": "https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks"
      }
    ]
  },
  "retatrutide": {
    "overview": "Retatrutide (LY3437943) is an investigational peptide that activates GLP-1, GIP and glucagon receptors. Human trials study obesity and metabolic disease; positive trial results do not make it an approved medicine.",
    "howItWorks": "It combines three hormone-receptor signals involved in appetite, glucose regulation and energy metabolism.",
    "benefits": [
      "Weight management",
      "Metabolic health"
    ],
    "dosing": "There is no approved consumer dosing protocol for this use. Study regimens are not instructions for personal use.",
    "safety": "Gastrointestinal adverse effects are common in trials. Safety findings from monitored trial participants do not validate unapproved products sold as research chemicals.",
    "legalStatus": "Investigational and not FDA-approved as of the source check. FDA warns against unapproved retatrutide products. SuppStack does not sell it or provide purchase paths.",
    "research": "The 2023 phase 2 obesity trial reported substantial weight reduction over 48 weeks. The published 2026 TRIUMPH-1 and TRIUMPH-2 phase 3 trials extend the evidence to 80 weeks in people without and with type 2 diabetes, respectively. These controlled studies support a weight-loss effect within the populations and regimens tested.",
    "peptide": {
      "areas": [
        "Weight management",
        "Metabolic health"
      ],
      "regulatoryStatus": "In clinical trials",
      "humanEvidence": "Controlled human trials",
      "routes": [
        "Injection"
      ],
      "scope": "Weight reduction in trial populations with obesity, with and without type 2 diabetes.",
      "limitations": "Trials do not establish the contents or safety of products sold online. Broader long-term outcomes and regulatory evaluation remain distinct from weight-loss efficacy.",
      "sourcesCheckedOn": "2026-10-27",
      "sourceUpdatedOn": "2026-10-05",
      "sourceUrl": "https://superpower.com/guides/peptides/retatrutide"
    },
    "citations": [
      {
        "label": "Phase 2 obesity trial (NEJM, 2023)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/37366315/"
      },
      {
        "label": "TRIUMPH-1 phase 3 obesity trial (NEJM, 2026)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/42814954/"
      },
      {
        "label": "TRIUMPH-2 phase 3 trial in type 2 diabetes (Lancet, 2026)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/42810372/"
      },
      {
        "label": "FDA: unapproved GLP-1 products",
        "url": "https://www.fda.gov/drugs/drug-alerts-and-statements/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss"
      }
    ]
  },
  "tirzepatide": {
    "overview": "Tirzepatide is a dual GIP and GLP-1 receptor agonist sold as prescription medicines Mounjaro and Zepbound. It is a medication, not a dietary supplement.",
    "howItWorks": "It increases glucose-dependent insulin release and affects appetite and stomach emptying through GIP and GLP-1 receptor activation.",
    "benefits": [
      "Weight management",
      "Metabolic health"
    ],
    "dosing": "Prescription-only; the formulation and schedule must be selected by a licensed prescriber.",
    "safety": "Common effects include nausea, diarrhea, vomiting and constipation. Prescribing information includes a boxed warning about thyroid C-cell tumors in rodents, plus warnings about pancreatitis, gallbladder disease, dehydration-related kidney injury and hypoglycemia with some diabetes medicines.",
    "legalStatus": "FDA-approved prescription products have indication-specific labels. Zepbound also has an approved use for moderate-to-severe obstructive sleep apnea in adults with obesity. Approval does not extend to products marketed as research tirzepatide. SuppStack does not sell it.",
    "research": "In SURMOUNT-1, 2,539 adults with obesity or overweight and a weight-related condition, without diabetes, were studied for 72 weeks. Average weight reduction ranged from 15.0% to 20.9% across tirzepatide groups, compared with 3.1% with placebo, alongside lifestyle intervention.",
    "peptide": {
      "areas": [
        "Weight management",
        "Metabolic health"
      ],
      "regulatoryStatus": "FDA-approved prescription",
      "humanEvidence": "Controlled human trials",
      "routes": [
        "Injection"
      ],
      "scope": "Blood-glucose control and weight management; approval depends on the branded product, indication and eligible population.",
      "limitations": "Averages are not an individual forecast. Results do not apply automatically to people outside the studied population or to unapproved products. Separate trials address diabetes and other indications.",
      "sourcesCheckedOn": "2026-10-27",
      "sourceUpdatedOn": "2026-10-05",
      "sourceUrl": "https://superpower.com/guides/peptides/tirzepatide"
    },
    "citations": [
      {
        "label": "SURMOUNT-1 randomized trial (NEJM, 2022)",
        "url": "https://doi.org/10.1056/NEJMoa2206038"
      },
      {
        "label": "FDA: Mounjaro approval history and labeling",
        "url": "https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=215866"
      },
      {
        "label": "FDA: Zepbound approval history and labeling",
        "url": "https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=217806"
      },
      {
        "label": "FDA: unapproved GLP-1 products",
        "url": "https://www.fda.gov/drugs/drug-alerts-and-statements/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss"
      }
    ]
  },
  "semaglutide": {
    "overview": "Semaglutide is a GLP-1 receptor agonist used in prescription medicines including Ozempic, Rybelsus and Wegovy. Formulations and approved indications differ; it is not a dietary supplement.",
    "howItWorks": "It acts on GLP-1 receptors to influence glucose-dependent insulin release, glucagon, appetite and stomach emptying.",
    "benefits": [
      "Weight management",
      "Metabolic health",
      "Cardiovascular health"
    ],
    "dosing": "Prescription-only; the formulation and schedule must be selected by a licensed prescriber.",
    "safety": "Gastrointestinal effects are common. Product labels include a boxed warning about thyroid C-cell tumors in rodents and warnings about pancreatitis, gallbladder disease and dehydration-related kidney injury. Other risks depend on medical history and accompanying medicines.",
    "legalStatus": "FDA-approved prescription products have formulation- and indication-specific labels. Cosmetic or wellness claims are not blanket approved uses. SuppStack does not sell semaglutide.",
    "research": "STEP 1 studied 1,961 adults with overweight or obesity without diabetes for 68 weeks: average weight change was -14.9% with semaglutide versus -2.4% with placebo, alongside lifestyle intervention. In SELECT, 17,604 adults with established cardiovascular disease and overweight or obesity, without diabetes, had major cardiovascular events in 6.5% of the semaglutide group versus 8.0% with placebo over a mean 39.8-month follow-up.",
    "peptide": {
      "areas": [
        "Weight management",
        "Metabolic health",
        "Cardiovascular health"
      ],
      "regulatoryStatus": "FDA-approved prescription",
      "humanEvidence": "Controlled human trials",
      "routes": [
        "Injection",
        "Oral"
      ],
      "scope": "Weight management, type 2 diabetes and cardiovascular outcomes in specific populations and formulations.",
      "limitations": "The SELECT result applies to a defined high-risk population, not everyone seeking weight loss. Injectable trial results should not be assigned automatically to every oral formulation or unapproved product.",
      "sourcesCheckedOn": "2026-10-27",
      "sourceUpdatedOn": "2026-10-05",
      "sourceUrl": "https://superpower.com/guides/peptides/semaglutide"
    },
    "citations": [
      {
        "label": "STEP 1 randomized trial (NEJM, 2021)",
        "url": "https://doi.org/10.1056/NEJMoa2032183"
      },
      {
        "label": "SELECT cardiovascular outcomes trial (NEJM, 2023)",
        "url": "https://doi.org/10.1056/NEJMoa2307563"
      },
      {
        "label": "FDA: semaglutide medicines and safety information",
        "url": "https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/medications-containing-semaglutide-marketed-type-2-diabetes-or-weight-loss"
      },
      {
        "label": "FDA: unapproved GLP-1 products",
        "url": "https://www.fda.gov/drugs/drug-alerts-and-statements/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss"
      }
    ]
  },
  "ipamorelin": {
    "overview": "Ipamorelin is a synthetic peptide that activates the ghrelin receptor and stimulates growth-hormone release. Evidence that it changes a hormone level is different from evidence that it improves recovery or body composition.",
    "howItWorks": "It stimulates the growth-hormone secretagogue receptor. Claims about selective hormone release originate in pharmacology research and do not establish wellness benefits.",
    "benefits": [
      "Hormone signaling",
      "Digestive health"
    ],
    "dosing": "There is no approved consumer dosing protocol for this use. Study regimens are not instructions for personal use.",
    "safety": "FDA identifies immune-reaction and impurity concerns, reports serious events in intravenous research, and notes insufficient safety information for other injectable routes. An event occurring during a study does not by itself prove causation.",
    "legalStatus": "Not FDA-approved. SuppStack provides an educational reference and does not sell ipamorelin.",
    "research": "A randomized phase 2 trial analyzed 114 bowel-resection patients. Median time to a tolerated meal was 25.3 hours with intravenous ipamorelin versus 32.6 hours with placebo; the difference was not statistically significant (p = 0.15). Secondary efficacy analyses also found no significant differences.",
    "peptide": {
      "areas": [
        "Hormone signaling",
        "Digestive health"
      ],
      "regulatoryStatus": "Not FDA-approved",
      "humanEvidence": "Limited human evidence",
      "routes": [
        "Injection"
      ],
      "scope": "Short hormone-release studies and an intravenous postoperative bowel-recovery trial; not proven recovery or muscle-building benefits.",
      "limitations": "The bowel-surgery trial did not establish efficacy. Neither hormone-release studies nor animal findings establish benefits for muscle, fat loss or injury recovery. Results from intravenous use do not establish safety through other routes.",
      "sourcesCheckedOn": "2026-10-27",
      "sourceUpdatedOn": "2026-10-05",
      "sourceUrl": "https://superpower.com/guides/peptides/ipamorelin"
    },
    "citations": [
      {
        "label": "Postoperative ileus phase 2 randomized trial (2014)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/25331030/"
      },
      {
        "label": "Human pharmacokinetic and hormone-release study",
        "url": "https://pubmed.ncbi.nlm.nih.gov/10496658/"
      },
      {
        "label": "FDA: ipamorelin safety concerns",
        "url": "https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks"
      }
    ]
  },
  "cjc-1295": {
    "overview": "CJC-1295 is a synthetic growth-hormone-releasing hormone analog. Small human studies demonstrate hormone changes; they do not demonstrate better recovery, muscle growth or anti-aging outcomes.",
    "howItWorks": "It activates the pituitary GHRH receptor. The long-acting DAC modification studied in humans extends exposure; products called no-DAC or modified GRF 1-29 should not inherit those findings.",
    "benefits": [
      "Hormone signaling"
    ],
    "dosing": "There is no approved consumer dosing protocol for this use. Study regimens are not instructions for personal use.",
    "safety": "Short studies reported tolerability, but FDA separately identifies reports of serious reactions including increased heart rate and systemic vasodilation. Long-term safety remains uncertain.",
    "legalStatus": "Not FDA-approved. SuppStack does not sell CJC-1295 or provide dosing protocols.",
    "research": "Two randomized, placebo-controlled studies lasted 28 and 49 days in healthy adults aged 21–61. CJC-1295 raised growth hormone and IGF-1, but the measured outcomes were pharmacology and hormone levels, not recovery, strength or longevity.",
    "peptide": {
      "areas": [
        "Hormone signaling"
      ],
      "regulatoryStatus": "Not FDA-approved",
      "humanEvidence": "Limited human evidence",
      "routes": [
        "Injection"
      ],
      "scope": "Growth-hormone and IGF-1 measurements in short trials of long-acting CJC-1295 in healthy adults.",
      "limitations": "Short biomarker studies do not establish clinical benefit or long-term safety. The commonly marketed combination with ipamorelin has not been established by a published randomized human trial in the source review.",
      "sourcesCheckedOn": "2026-10-27",
      "sourceUpdatedOn": "2026-10-05",
      "sourceUrl": "https://superpower.com/guides/peptides/cjc-1295"
    },
    "citations": [
      {
        "label": "CJC-1295 randomized hormone-release studies (2006)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/16352683/"
      },
      {
        "label": "FDA: CJC-1295 safety concerns",
        "url": "https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks"
      }
    ]
  },
  "ghk-cu": {
    "overview": "GHK-Cu, also called copper tripeptide-1, is a copper-bound peptide used in skincare and investigated for tissue remodeling. Topical cosmetic research and claims about injected GHK-Cu must be considered separately.",
    "howItWorks": "Cell and animal experiments suggest effects on extracellular-matrix production and repair signaling. Those findings do not establish systemic benefits in humans.",
    "benefits": [
      "Skin health",
      "Tissue repair"
    ],
    "dosing": "There is no approved consumer dosing protocol for this use. Study regimens are not instructions for personal use.",
    "safety": "Topical products can irritate sensitive skin. Injectable use has a different risk profile: FDA flags potential immune reactions, peptide impurities and limited human safety data.",
    "legalStatus": "Topical copper tripeptide-1 is a cosmetic ingredient; that is not FDA drug approval. Systemic or injectable GHK-Cu is not an FDA-approved treatment. SuppStack does not sell it.",
    "research": "In a randomized study of 13 people after CO2 laser resurfacing, blinded assessments found no significant improvement in redness or skin quality from GHK-Cu skincare, although patient satisfaction was higher. Animal injection studies do not establish efficacy or safety of systemic GHK-Cu in people.",
    "peptide": {
      "areas": [
        "Skin health",
        "Tissue repair"
      ],
      "regulatoryStatus": "Topical cosmetic / unapproved systemic",
      "humanEvidence": "Limited human evidence",
      "routes": [
        "Topical",
        "Injection"
      ],
      "scope": "Limited topical human research; systemic and injectable claims remain preclinical.",
      "limitations": "The small topical study cannot support broad anti-aging claims, and topical results cannot be carried over to injections. Controlled human evidence for injected skin, hair or tissue-repair benefits is missing.",
      "sourcesCheckedOn": "2026-10-27",
      "sourceUpdatedOn": "2026-10-05",
      "sourceUrl": "https://superpower.com/guides/peptides/ghk-cu"
    },
    "citations": [
      {
        "label": "Randomized topical trial after laser resurfacing (2006)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/16847171/"
      },
      {
        "label": "Animal ligament-healing study; not a human trial",
        "url": "https://doi.org/10.1002/jor.22831"
      },
      {
        "label": "FDA: injectable GHK-Cu safety concerns",
        "url": "https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks"
      }
    ]
  }
};
