import type { Source } from "@/domain/types";
import { TODAY, base } from "./helpers";

/**
 * Source registry. Only institutions and documents that exist are listed. Where the specific page/section that
 * carries a figure has not yet been confirmed, `relevantSection` says so and the evidence strength is capped.
 * Every quantity in the platform that claims VERIFIED_FACT must reference one of these ids.
 */
export const sources: Source[] = [
  {
    ...base("src-cdb", "Coconut Development Board (CDB)", "coconut-development-board", "Statutory body under the Ministry of Agriculture & Farmers Welfare, Government of India, for integrated development of coconut cultivation and industry."),
    sourceType: "statutory_board", organisation: "Government of India — Ministry of Agriculture & Farmers Welfare", url: "https://www.coconutboard.gov.in",
    researchDate: TODAY, relevantSection: "Statistics; Technology; Schemes. Specific statistical tables must be cited per figure.", geography: "India", evidenceStrength: "strong",
    notes: "Primary authority for Indian coconut area, production, productivity (nuts and tonnes), and processing technology. Year and unit must accompany every figure.", lastReviewedAt: TODAY,
  },
  {
    ...base("src-coir-board", "Coir Board", "coir-board", "Statutory body under the Ministry of MSME, Government of India, for the coir industry."),
    sourceType: "statutory_board", organisation: "Government of India — Ministry of MSME", url: "https://coirboard.gov.in", researchDate: TODAY,
    relevantSection: "Coir industry statistics, export data, Central Coir Research Institute technology notes.", geography: "India", evidenceStrength: "strong",
    notes: "Authority on coir fibre, coir pith, geotextiles, and coir export statistics.", lastReviewedAt: TODAY,
  },
  {
    ...base("src-fssai", "FSSAI — Food Safety and Standards Authority of India", "fssai", "Food regulator. Food Safety and Standards (Food Products Standards and Food Additives) Regulations, 2011 and Licensing & Registration Regulations."),
    sourceType: "government", organisation: "Government of India — Ministry of Health & Family Welfare", url: "https://www.fssai.gov.in", researchDate: TODAY,
    relevantSection: "FSS (Food Products Standards and Food Additives) Regulations 2011 — standards for edible oils (coconut oil, virgin coconut oil), desiccated coconut, coconut milk/cream, coconut sugar; FSS (Licensing & Registration) Regulations 2011.", geography: "India", evidenceStrength: "strong",
    notes: "Parameter values must be cited from the current consolidated regulation; amendments are frequent — verify before relying on any numeric limit.", lastReviewedAt: TODAY,
  },
  {
    ...base("src-apeda", "APEDA — Agricultural and Processed Food Products Export Development Authority", "apeda", "Export promotion body for scheduled agri-food products including coconut products."),
    sourceType: "government", organisation: "Government of India — Ministry of Commerce & Industry", url: "https://apeda.gov.in", researchDate: TODAY,
    relevantSection: "Agri-Exchange export statistics by HS code and destination; registration (RCMC) for exporters.", geography: "India / Export", evidenceStrength: "strong",
    notes: "Export volumes and values by product and destination. Figures are period-specific.", lastReviewedAt: TODAY,
  },
  {
    ...base("src-dgft", "DGFT — Directorate General of Foreign Trade", "dgft", "Foreign trade policy, Importer-Exporter Code (IEC), export procedures."),
    sourceType: "government", organisation: "Government of India — Ministry of Commerce & Industry", url: "https://www.dgft.gov.in", researchDate: TODAY,
    relevantSection: "IEC registration; Foreign Trade Policy; ITC-HS classification.", geography: "India", evidenceStrength: "strong", lastReviewedAt: TODAY,
  },
  {
    ...base("src-mofpi", "Ministry of Food Processing Industries (MoFPI)", "mofpi", "Central ministry for food processing; runs PMFME and PMKSY schemes."),
    sourceType: "government", organisation: "Government of India", url: "https://www.mofpi.gov.in", researchDate: TODAY,
    relevantSection: "PM Formalisation of Micro Food Processing Enterprises (PMFME) scheme guidelines; scheme terms change — verify current guidelines.", geography: "India", evidenceStrength: "strong",
    notes: "Never assume subsidy eligibility or amounts without reading the current guidelines.", lastReviewedAt: TODAY,
  },
  {
    ...base("src-msme", "Ministry of MSME / Udyam Registration", "msme-udyam", "MSME classification and Udyam registration."),
    sourceType: "government", organisation: "Government of India", url: "https://udyamregistration.gov.in", researchDate: TODAY,
    relevantSection: "Udyam registration; MSME investment/turnover thresholds.", geography: "India", evidenceStrength: "strong", lastReviewedAt: TODAY,
  },
  {
    ...base("src-icar-cpcri", "ICAR — Central Plantation Crops Research Institute (CPCRI), Kasaragod", "icar-cpcri", "ICAR institute for coconut, arecanut and cocoa research; source of varietal, agronomic and processing technology data."),
    sourceType: "research_institution", organisation: "Indian Council of Agricultural Research", url: "https://cpcri.icar.gov.in", researchDate: TODAY,
    relevantSection: "Technologies (VCO, coconut chips, neera, coconut sugar), varietal yields, nut composition.", geography: "India", evidenceStrength: "strong", lastReviewedAt: TODAY,
  },
  {
    ...base("src-icar", "ICAR — Indian Council of Agricultural Research", "icar", "Apex agricultural research body."),
    sourceType: "research_institution", organisation: "Government of India", url: "https://icar.org.in", researchDate: TODAY, geography: "India", evidenceStrength: "strong", lastReviewedAt: TODAY,
  },
  {
    ...base("src-fao", "FAO — FAOSTAT", "fao-faostat", "UN Food and Agriculture Organization statistical database — coconut production by country (tonnes)."),
    sourceType: "international_body", organisation: "Food and Agriculture Organization of the United Nations", url: "https://www.fao.org/faostat", researchDate: TODAY,
    relevantSection: "Crops and livestock products — Coconuts, in shell — production quantity (t) by country and year.", geography: "Global", evidenceStrength: "strong",
    notes: "FAOSTAT reports in tonnes; national sources may report million nuts. Never compare across units.", lastReviewedAt: TODAY,
  },
  {
    ...base("src-icc", "International Coconut Community (ICC)", "international-coconut-community", "Intergovernmental organisation of coconut-producing countries (formerly APCC); publishes production, trade and price statistics."),
    sourceType: "international_body", organisation: "International Coconut Community", url: "https://coconutcommunity.org", researchDate: TODAY,
    relevantSection: "Coconut statistical yearbook; monthly market reports (copra, coconut oil, DC, AC prices).", geography: "Global", evidenceStrength: "strong", lastReviewedAt: TODAY,
  },
  {
    ...base("src-bis", "Bureau of Indian Standards (BIS)", "bis", "National standards body — IS standards for coconut oil, coir products, activated carbon, cocopeat."),
    sourceType: "standard", organisation: "Government of India", url: "https://www.bis.gov.in", researchDate: TODAY,
    relevantSection: "Relevant Indian Standards (e.g. IS 542 coconut oil; IS standards for activated carbon; coir geotextile standards) — exact numbers to be cited per parameter.", geography: "India", evidenceStrength: "strong", lastReviewedAt: TODAY,
  },
  {
    ...base("src-cpcb", "Central Pollution Control Board (CPCB)", "cpcb", "Environmental regulator; industry categorisation (red/orange/green/white) and consent requirements."),
    sourceType: "government", organisation: "Government of India — MoEFCC", url: "https://cpcb.nic.in", researchDate: TODAY,
    relevantSection: "Categorisation of industrial sectors; consent to establish/operate via State PCBs.", geography: "India", evidenceStrength: "strong", lastReviewedAt: TODAY,
  },
  {
    ...base("src-codex", "Codex Alimentarius", "codex-alimentarius", "International food standards (FAO/WHO) — e.g. standards for desiccated coconut, aqueous coconut products, edible fats and oils."),
    sourceType: "international_body", organisation: "FAO/WHO", url: "https://www.fao.org/fao-who-codexalimentarius", researchDate: TODAY,
    relevantSection: "CODEX STAN 177 (Desiccated Coconut); CODEX STAN 240 (Aqueous Coconut Products); CODEX STAN 210 (Named Vegetable Oils incl. coconut oil).", geography: "Global", evidenceStrength: "strong", lastReviewedAt: TODAY,
  },
  {
    ...base("src-cfia-tn", "Tamil Nadu Agricultural University (TNAU) — Agritech Portal", "tnau-agritech", "State agricultural university; publishes coconut agronomy and post-harvest technology notes."),
    sourceType: "university", organisation: "TNAU", url: "https://agritech.tnau.ac.in", researchDate: TODAY, geography: "Tamil Nadu / India", evidenceStrength: "moderate", lastReviewedAt: TODAY,
  },
  {
    ...base("src-kau", "Kerala Agricultural University (KAU)", "kau", "State agricultural university with coconut research and extension."),
    sourceType: "university", organisation: "KAU", url: "https://kau.in", researchDate: TODAY, geography: "Kerala / India", evidenceStrength: "moderate", lastReviewedAt: TODAY,
  },
  {
    ...base("src-internal-ej", "Platform expert judgment (cross-functional team)", "internal-expert-judgment", "Internal engineering, food-processing, agribusiness and financial-modelling judgment used where no external source has yet been attached. Always labelled EXPERT_JUDGMENT or ESTIMATE, never VERIFIED."),
    sourceType: "internal_analysis", organisation: "COCONUT platform team", researchDate: TODAY, geography: "India", evidenceStrength: "weak",
    notes: "Must be replaced by an external source before a figure can be promoted to VERIFIED_FACT.", lastReviewedAt: TODAY,
  },
  {
    ...base("src-supplied-research", "Supplied strategic research notes (user-provided)", "supplied-research", "Strategic research supplied to the platform: business levels, procurement models, integrated zero-waste concept, 90-day validation, discipline rules. Stored as research content, not immutable truth."),
    sourceType: "internal_analysis", organisation: "Project sponsor", researchDate: TODAY, geography: "India / Hyderabad", evidenceStrength: "moderate",
    notes: "Historical production/export figures referenced in the notes must be re-verified against CDB/APEDA before display with year and unit.", lastReviewedAt: TODAY,
  },
];

export const sourceById = Object.fromEntries(sources.map((s) => [s.id, s]));
