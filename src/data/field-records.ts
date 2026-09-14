import type { GovernmentScheme, MachineQuotation, PriceRecord, Source } from "@/domain/types";
import { base, rr, TODAY } from "./helpers";

/**
 * Field-data records. NOTHING here is fabricated:
 * - Schemes list real programmes with official URLs; amounts are VERIFIED only where read from an official document on file.
 * - Price records and machine quotations are EMPTY until dated, sourced records are captured (admin / field validation).
 */

export const fieldSources: Source[] = [
  { ...base("src-pib-pmfme-2025", "PIB Backgrounder — PM Formalisation of Micro Food Processing Enterprises (PMFME), September 2025", "pib-pmfme-2025", "Official Press Information Bureau explainer on PMFME: components, subsidy terms, outlay, progress as of June/July 2025."), sourceType: "government", organisation: "Press Information Bureau, Government of India / MoFPI", url: "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/sep/doc202592626401.pdf", publicationDate: "2025-09-01", researchDate: TODAY, relevantSection: "Key components: Support for individual units; FPOs; SHGs; Branding & marketing; DPR support", geography: "India", evidenceStrength: "strong", notes: "Primary document read; stored at research/schemes/PIB_PMFME_2025-09.pdf. Scheme runs 2020-21 to 2025-26 — check extension status before relying on it.", lastReviewedAt: TODAY },
];

const VB = "Platform desk research — primary document read";

export const governmentSchemes: GovernmentScheme[] = [
  {
    ...base("sch-pmfme", "PM Formalisation of Micro Food Processing Enterprises (PMFME)", "pmfme", "Centrally sponsored scheme (2020-21 to 2025-26, outlay ₹10,000 crore) supporting micro food processing units with credit-linked capital subsidy, SHG seed capital, FPO grants and branding support."),
    authority: "Ministry of Food Processing Industries (MoFPI)", level: "central", geography: ["India"],
    applicableProductIds: ["prd-desiccated-coconut", "prd-virgin-coconut-oil", "prd-coconut-milk", "prd-coconut-flour", "prd-coconut-chips", "prd-coconut-flakes", "prd-coconut-water", "prd-coconut-sugar", "prd-coconut-oil"],
    eligibility: ["Individual micro food processing units (new or upgrading)", "Groups: FPOs, producer cooperatives, SHGs, SPVs of micro units", "Minimum 10% beneficiary contribution; balance through bank loan (individual units)", "Priority for ODOP (One District One Product) products"],
    benefit: ["Individual units: credit-linked capital subsidy of 35% of project cost, maximum ₹10 lakh per unit", "FPOs / producer cooperatives: grant support at 35% with credit linkage", "SHGs: seed capital ₹40,000 per member for working capital and small tools (disbursed via federation as repayable loan)", "Branding & marketing support for groups following the ODOP approach; DPR preparation support up to ₹5 lakh via State Nodal Agency", "Fully funded marketing training"],
    subsidy: { value: 35, unit: "%", evidence: "VERIFIED_FACT", sourceIds: ["src-pib-pmfme-2025"], basis: "PIB backgrounder Sep 2025 — 'Credit-linked capital subsidy of 35% of the project cost'", researchedAt: TODAY, lastVerifiedAt: TODAY, verifiedBy: VB, confidence: "high", dataKind: "scheme" },
    maximumAmount: { value: 1_000_000, unit: "INR", evidence: "VERIFIED_FACT", sourceIds: ["src-pib-pmfme-2025"], basis: "PIB backgrounder Sep 2025 — 'Maximum ceiling of ₹10 lakh per unit' (individual units)", researchedAt: TODAY, lastVerifiedAt: TODAY, verifiedBy: VB, confidence: "high", dataKind: "scheme" },
    officialUrl: "https://pmfme.mofpi.gov.in/", effectiveFrom: "2020-06-29", effectiveTo: "2026-03-31",
    sourceIds: ["src-pib-pmfme-2025", "src-mofpi"],
    notes: "Scheme period ends FY 2025-26 as published; verify extension/successor scheme before planning. Central:State expenditure 60:40 (90:10 NE/Himalayan).",
  },
  {
    ...base("sch-cdb-technology-mission", "Coconut Development Board — Technology Mission on Coconut (TMOC) / processing support", "cdb-technology-mission", "CDB programmes supporting coconut processing units, product diversification and technology adoption."),
    authority: "Coconut Development Board", level: "board", geography: ["India"],
    applicableProductIds: ["prd-desiccated-coconut", "prd-virgin-coconut-oil", "prd-coconut-milk", "prd-coconut-chips", "prd-coconut-water", "prd-coconut-sugar", "prd-activated-carbon", "prd-shell-charcoal"],
    eligibility: ["RESEARCH REQUIRED — read current CDB scheme guidelines (component-wise eligibility for processing units, FPOs, entrepreneurs)"],
    benefit: ["RESEARCH REQUIRED — subsidy component and ceilings per current CDB guidelines"],
    subsidy: rr("%", "Read from current CDB scheme document; do not assume.", { dataKind: "scheme" }),
    maximumAmount: rr("INR", "Read from current CDB scheme document.", { dataKind: "scheme" }),
    officialUrl: "https://www.coconutboard.gov.in", sourceIds: ["src-cdb"],
    notes: "CDB schemes are revised periodically; capture guideline PDF, effective date and component table in the admin layer before promoting any value.",
  },
  {
    ...base("sch-coir-board", "Coir Board — Coir Vikas Yojana / Coir Udyami Yojana (as applicable)", "coir-board-schemes", "Coir Board programmes for coir units: establishment support, skill development, market promotion, export market development."),
    authority: "Coir Board (Ministry of MSME)", level: "board", geography: ["India"],
    applicableProductIds: ["prd-cocopeat", "prd-coir-fibre", "prd-coir-yarn", "prd-coir-geotextile"],
    eligibility: ["RESEARCH REQUIRED — current Coir Board scheme guidelines"], benefit: ["RESEARCH REQUIRED — component-wise assistance"],
    subsidy: rr("%", "Read from current Coir Board guidelines.", { dataKind: "scheme" }), maximumAmount: rr("INR", "Read from current Coir Board guidelines.", { dataKind: "scheme" }),
    officialUrl: "https://coirboard.gov.in", sourceIds: ["src-coir-board"],
  },
  {
    ...base("sch-pmegp", "Prime Minister's Employment Generation Programme (PMEGP)", "pmegp", "KVIC-implemented credit-linked subsidy programme for new micro enterprises in manufacturing and services."),
    authority: "Ministry of MSME / KVIC", level: "central", geography: ["India"],
    applicableProductIds: [], eligibility: ["RESEARCH REQUIRED — read current PMEGP guidelines (project cost ceilings, category-wise subsidy rates, urban/rural rates)"], benefit: ["RESEARCH REQUIRED"],
    subsidy: rr("%", "Category- and location-dependent; read current guidelines.", { dataKind: "scheme" }), maximumAmount: rr("INR", "Project cost ceiling per current guidelines.", { dataKind: "scheme" }),
    officialUrl: "https://www.kviconline.gov.in/pmegpeportal/", sourceIds: ["src-msme"],
  },
  {
    ...base("sch-state-tn", "Tamil Nadu — state industrial / food processing incentives", "tamil-nadu-incentives", "State-level incentives applicable to coconut processing units in Tamil Nadu (capital subsidy, interest subvention, MSME incentives)."),
    authority: "Government of Tamil Nadu", level: "state", geography: ["st-tn"], applicableProductIds: [],
    eligibility: ["RESEARCH REQUIRED — current TN MSME / food processing policy"], benefit: ["RESEARCH REQUIRED"],
    subsidy: rr("%", "Read current policy.", { dataKind: "scheme" }), maximumAmount: rr("INR", "Read current policy.", { dataKind: "scheme" }),
    sourceIds: ["src-internal-ej"], notes: "Placeholder entry so the state page can link to a scheme record; nothing is asserted until verified.",
  },
  {
    ...base("sch-state-ap", "Andhra Pradesh — food processing policy incentives", "andhra-pradesh-incentives", "State-level incentives for food processing units in Andhra Pradesh."),
    authority: "Government of Andhra Pradesh", level: "state", geography: ["st-ap"], applicableProductIds: [],
    eligibility: ["RESEARCH REQUIRED"], benefit: ["RESEARCH REQUIRED"],
    subsidy: rr("%", "Read current policy.", { dataKind: "scheme" }), maximumAmount: rr("INR", "Read current policy.", { dataKind: "scheme" }),
    sourceIds: ["src-internal-ej"],
  },
  {
    ...base("sch-state-kl", "Kerala — coconut / coir / food processing support", "kerala-incentives", "Kerala state programmes (e.g. via Kerafed, Coir Board HQ presence, industries department) supporting coconut and coir units."),
    authority: "Government of Kerala", level: "state", geography: ["st-kl"], applicableProductIds: [],
    eligibility: ["RESEARCH REQUIRED"], benefit: ["RESEARCH REQUIRED"],
    subsidy: rr("%", "Read current policy.", { dataKind: "scheme" }), maximumAmount: rr("INR", "Read current policy.", { dataKind: "scheme" }),
    sourceIds: ["src-internal-ej"],
  },
];

/** Dated price records — empty until captured with date, market, unit, grade and source. Never seeded with invented prices. */
export const priceRecords: PriceRecord[] = [];

/** Machine quotations — empty until real, dated supplier quotations are captured (see Field Validation targets). */
export const machineQuotations: MachineQuotation[] = [];
