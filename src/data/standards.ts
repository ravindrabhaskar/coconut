import type { Quantity, QualityParameter, Source, Unit } from "@/domain/types";
import { TODAY, base } from "./helpers";

/**
 * Regulatory standards — values read from the primary documents on file in research/standards/ (desk-verified 2026-09-14).
 * Each quantity is VERIFIED_FACT with verifiedBy, the document version and the section in `basis`.
 */

export const standardSources: Source[] = [
  { ...base("src-codex-177", "Codex Standard for Desiccated Coconut — CODEX STAN 177-1991 (Rev. 2011)", "codex-stan-177", "International standard for desiccated coconut: definition, sizing sieves, composition and quality factors, methods of analysis."), sourceType: "standard", organisation: "FAO/WHO Codex Alimentarius", url: "https://www.fao.org/input/download/standards/261/CXS_177e.pdf", publicationDate: "2011-01-01", researchDate: TODAY, relevantSection: "§2.2 Sizing; §3.2.4 Chemical and physical characteristics; §10 Methods", geography: "Global", evidenceStrength: "strong", notes: "Primary document read and stored at research/standards/CXS_177e.pdf.", lastReviewedAt: TODAY },
  { ...base("src-codex-240", "Codex Standard for Aqueous Coconut Products — CODEX STAN 240-2003", "codex-stan-240", "International standard for coconut milk and coconut cream: styles, composition table (total solids, non-fat solids, fat, moisture, pH), additives."), sourceType: "standard", organisation: "FAO/WHO Codex Alimentarius", url: "https://www.fao.org/input/download/standards/10401/CXS_240e.pdf", publicationDate: "2003-01-01", researchDate: TODAY, relevantSection: "§2.2 Styles; §3.1.3 Other composition; §4 Food additives", geography: "Global", evidenceStrength: "strong", notes: "Primary document read and stored at research/standards/CXS_240e.pdf. Amended 2019/2022/2024 per Codex site.", lastReviewedAt: TODAY },
  { ...base("src-codex-210", "Codex Standard for Named Vegetable Oils — CODEX STAN 210-1999 (2015 consolidation)", "codex-stan-210", "International standard covering coconut oil: fatty-acid composition ranges (GLC), saponification/iodine values, Reichert & Polenske values, quality characteristics for virgin oils."), sourceType: "standard", organisation: "FAO/WHO Codex Alimentarius", url: "https://www.fao.org/input/download/standards/336/CXS_210e_2015.pdf", publicationDate: "2015-01-01", researchDate: TODAY, relevantSection: "Table 1 fatty acids; Table 2 chemical/physical characteristics; Appendix 1–2", geography: "Global", evidenceStrength: "strong", notes: "Primary document read and stored at research/standards/CXS_210e.pdf.", lastReviewedAt: TODAY },
  { ...base("src-fssai-ch2-2", "FSS (Food Products Standards & Food Additives) Regulations — Chapter 2.2 Fats, Oils and Fat Emulsions, Version 5 (01.08.2025)", "fssai-chapter-2-2", "FSSAI compiled chapter containing the standards for coconut oil (2.2.1-1) and virgin coconut oil (2.2.1-1A)."), sourceType: "government", organisation: "FSSAI", url: "https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_2_Fats_oils%20and%20fat%20emulsions.pdf", publicationDate: "2025-08-01", researchDate: TODAY, relevantSection: "2.2.1 (1) Coconut oil; 2.2.1 (1A) Virgin coconut oil", geography: "India", evidenceStrength: "strong", notes: "Primary document read and stored at research/standards/FSSAI_Ch2_2_fats_oils_v5_2025.pdf. FSSAI re-issues chapters frequently — re-check version before contractual use.", lastReviewedAt: TODAY },
  { ...base("src-fssai-ch2-3", "FSS (Food Products Standards & Food Additives) Regulations — Chapter 2.3 Fruit & Vegetable Products, Version 1 (01.09.2023)", "fssai-chapter-2-3", "FSSAI compiled chapter containing standards for desiccated coconut (2.3.45), coconut milk (2.3.51) and coconut milk powder (2.3.63)."), sourceType: "government", organisation: "FSSAI", url: "https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_3%20(Fruit%20&%20Vegetable%20products).pdf", publicationDate: "2023-09-01", researchDate: TODAY, relevantSection: "2.3.45 Desiccated coconut; 2.3.51 Coconut milk (non-dairy); 2.3.63 Coconut milk powder", geography: "India", evidenceStrength: "strong", notes: "Primary document read and stored at research/standards/FSSAI_Ch2_3_fruit_veg_v1_2023.pdf.", lastReviewedAt: TODAY },
];

const VB = "Platform desk research — primary document read";
const v = (value: number | undefined, unit: Unit, sourceId: string, basis: string, extra: Partial<Quantity> = {}): Quantity => ({
  value, unit, evidence: "VERIFIED_FACT", sourceIds: [sourceId], basis, researchedAt: TODAY, lastVerifiedAt: TODAY, verifiedBy: VB, confidence: "high", dataKind: "regulation", ...extra,
});
const range = (min: number, max: number, unit: Unit, sourceId: string, basis: string, extra: Partial<Quantity> = {}) => v(min, unit, sourceId, basis, { min, max, ...extra });

/** Desiccated coconut — FSSAI 2.3.45 (India) and Codex STAN 177 (export). Note the moisture difference. */
export const DC_STANDARDS: QualityParameter[] = [
  { parameter: "Moisture — FSSAI (India)", quantity: v(3.0, "%", "src-fssai-ch2-3", "FSS Regs Ch 2.3 v1 (01.09.2023), 2.3.45(5) item 1 — maximum, % m/m"), standard: "FSSAI 2.3.45", note: "Maximum" },
  { parameter: "Moisture — Codex (export)", quantity: v(4, "%", "src-codex-177", "CODEX STAN 177-1991 Rev 2011, §3.2.4(b) — maximum, % m/m"), standard: "Codex STAN 177", note: "Maximum. FSSAI is stricter (3.0%) than Codex (4%)." },
  { parameter: "Total acidity of extracted oil (as lauric acid)", quantity: v(0.3, "%", "src-fssai-ch2-3", "FSS 2.3.45(5) item 2 (max) — identical limit in CODEX STAN 177 §3.2.4(a)", { notes: "Maximum, % m/m. Same in Codex and FSSAI." }), standard: "FSSAI 2.3.45 / Codex 177", note: "Maximum" },
  { parameter: "Oil content — full-fat (no oil extraction)", quantity: v(60, "%", "src-fssai-ch2-3", "FSS 2.3.45(5) item 3(a) minimum — identical in CODEX STAN 177 §3.2.4(c)"), standard: "FSSAI 2.3.45 / Codex 177", note: "Minimum" },
  { parameter: "Oil content — reduced fat", quantity: range(35, 60, "%", "src-fssai-ch2-3", "FSS 2.3.45(5) item 3(b): 35.0 to 60.0 % (label 'Reduced Fat Desiccated Coconut'); Codex ≥35 <60", { value: 35 }), standard: "FSSAI 2.3.45 / Codex 177" },
  { parameter: "Total ash", quantity: v(2.5, "%", "src-fssai-ch2-3", "FSS 2.3.45(5) item 4 (max) — identical in CODEX STAN 177 §3.2.4(d)"), standard: "FSSAI 2.3.45 / Codex 177", note: "Maximum" },
  { parameter: "Extraneous vegetable material", quantity: v(15, "count", "src-fssai-ch2-3", "FSS 2.3.45(5) item 5 — fragments per 100 g (max); identical in Codex §3.2.4(e)"), standard: "FSSAI 2.3.45 / Codex 177", note: "Maximum fragments per 100 g" },
  { parameter: "Foreign matter", quantity: { unit: "text", evidence: "VERIFIED_FACT", sourceIds: ["src-fssai-ch2-3"], basis: "FSS 2.3.45(5) item 6", notes: "Absent in 100 g.", researchedAt: TODAY, lastVerifiedAt: TODAY, verifiedBy: VB, dataKind: "regulation" }, standard: "FSSAI 2.3.45 / Codex 177" },
  { parameter: "Sizing — Extra-fine (Codex)", quantity: { unit: "mm", value: 0.85, evidence: "VERIFIED_FACT", sourceIds: ["src-codex-177"], basis: "CODEX STAN 177 §2.2(a)", notes: "≥90% passes 0.85 mm square aperture; ≤25% passes 0.50 mm.", researchedAt: TODAY, lastVerifiedAt: TODAY, verifiedBy: VB, dataKind: "regulation" }, standard: "Codex STAN 177 §2.2" },
  { parameter: "Sizing — Fine (Codex)", quantity: { unit: "mm", value: 1.4, evidence: "VERIFIED_FACT", sourceIds: ["src-codex-177"], basis: "CODEX STAN 177 §2.2(b)", notes: "≥80% passes 1.40 mm; ≤20% passes 0.71 mm.", researchedAt: TODAY, lastVerifiedAt: TODAY, verifiedBy: VB, dataKind: "regulation" }, standard: "Codex STAN 177 §2.2" },
  { parameter: "Sizing — Medium (Codex)", quantity: { unit: "mm", value: 2.8, evidence: "VERIFIED_FACT", sourceIds: ["src-codex-177"], basis: "CODEX STAN 177 §2.2(c)", notes: "≥90% passes 2.80 mm; ≤20% passes 1.40 mm.", researchedAt: TODAY, lastVerifiedAt: TODAY, verifiedBy: VB, dataKind: "regulation" }, standard: "Codex STAN 177 §2.2" },
  { parameter: "Colour", quantity: { unit: "text", evidence: "VERIFIED_FACT", sourceIds: ["src-fssai-ch2-3"], basis: "FSS 2.3.45(2); Codex §3.2.1", notes: "White to light creamy white; free from foreign matter, insects, mould.", researchedAt: TODAY, lastVerifiedAt: TODAY, verifiedBy: VB, dataKind: "regulation" } },
  { parameter: "Methods (Codex §10)", quantity: { unit: "text", evidence: "VERIFIED_FACT", sourceIds: ["src-codex-177"], basis: "CODEX STAN 177 §10", notes: "Moisture AOAC 925.40; oil AOAC 948.22; ash AOAC 950.49; acidity ISO 660:2009 / AOCS Cd 3d-63.", researchedAt: TODAY, lastVerifiedAt: TODAY, verifiedBy: VB, dataKind: "regulation" } },
];

/** Virgin coconut oil — FSSAI 2.2.1(1A) v5 2025; Codex STAN 210 Appendix for virgin oils. */
export const VCO_STANDARDS: QualityParameter[] = [
  { parameter: "Refractive index at 40 °C", quantity: range(1.448, 1.4492, "ratio", "src-fssai-ch2-2", "FSS Ch 2.2 v5 (01.08.2025) 2.2.1(1A) item 1", { value: 1.448 }), standard: "FSSAI 2.2.1(1A)" },
  { parameter: "Moisture", quantity: v(0.5, "%", "src-fssai-ch2-2", "FSS 2.2.1(1A) item 2 — not more than, % by weight"), standard: "FSSAI 2.2.1(1A)", note: "Maximum" },
  { parameter: "Insoluble impurities", quantity: v(0.05, "%", "src-fssai-ch2-2", "FSS 2.2.1(1A) item 3 — not more than, % by weight"), standard: "FSSAI 2.2.1(1A)", note: "Maximum" },
  { parameter: "Saponification value", quantity: v(250, "ratio", "src-fssai-ch2-2", "FSS 2.2.1(1A) item 4 — not less than (mg KOH/g)"), standard: "FSSAI 2.2.1(1A)", note: "Minimum" },
  { parameter: "Iodine value", quantity: range(4.0, 11.0, "ratio", "src-fssai-ch2-2", "FSS 2.2.1(1A) item 5", { value: 4 }), standard: "FSSAI 2.2.1(1A)" },
  { parameter: "Unsaponifiable matter", quantity: v(0.5, "%", "src-fssai-ch2-2", "FSS 2.2.1(1A) item 6 — not more than, % by weight"), standard: "FSSAI 2.2.1(1A)", note: "Maximum" },
  { parameter: "Acid value", quantity: v(4.0, "ratio", "src-fssai-ch2-2", "FSS 2.2.1(1A) item 7 — not more than (mg KOH/g); Codex STAN 210 Appendix: cold pressed & virgin oils ≤4.0"), standard: "FSSAI 2.2.1(1A) / Codex 210", note: "Maximum" },
  { parameter: "Polenske value", quantity: v(13, "ratio", "src-fssai-ch2-2", "FSS 2.2.1(1A) item 8 — not less than; Codex STAN 210 Appendix: coconut oil 13–18"), standard: "FSSAI 2.2.1(1A) / Codex 210", note: "Minimum" },
  { parameter: "Peroxide value", quantity: v(15, "ratio", "src-fssai-ch2-2", "FSS 2.2.1(1A) item 9 — not more than 15 meq O2/kg; Codex STAN 210 Appendix: cold pressed & virgin oils up to 15"), standard: "FSSAI 2.2.1(1A) / Codex 210", note: "Maximum, meq/kg" },
  { parameter: "Lauric acid (C12:0)", quantity: range(45.1, 53.2, "%", "src-codex-210", "CODEX STAN 210 Table 1 — coconut oil, % of total fatty acids", { value: 45.1 }), standard: "Codex STAN 210 Table 1" },
  { parameter: "Food additives", quantity: { unit: "text", evidence: "VERIFIED_FACT", sourceIds: ["src-fssai-ch2-2"], basis: "FSS 2.2.1(1A)(i)", notes: "Not permitted in virgin coconut oil.", researchedAt: TODAY, lastVerifiedAt: TODAY, verifiedBy: VB, dataKind: "regulation" }, standard: "FSSAI 2.2.1(1A)" },
];

/** Coconut oil (copra oil) — FSSAI 2.2.1(1); Codex STAN 210 Table 1/2. */
export const COCONUT_OIL_STANDARDS: QualityParameter[] = [
  { parameter: "Butyro-refractometer reading at 40 °C", quantity: range(34.0, 35.5, "ratio", "src-fssai-ch2-2", "FSS 2.2.1(1) — or refractive index 1.4480–1.4500", { value: 34 }), standard: "FSSAI 2.2.1(1)" },
  { parameter: "Saponification value", quantity: v(250, "ratio", "src-fssai-ch2-2", "FSS 2.2.1(1) — not less than; Codex STAN 210 Table 2: 248–265"), standard: "FSSAI 2.2.1(1) / Codex 210", note: "Minimum" },
  { parameter: "Iodine value", quantity: range(7.5, 10, "ratio", "src-fssai-ch2-2", "FSS 2.2.1(1); Codex STAN 210 Table 2: 6.3–10.6", { value: 7.5 }), standard: "FSSAI 2.2.1(1) / Codex 210" },
  { parameter: "Polenske value", quantity: v(13, "ratio", "src-fssai-ch2-2", "FSS 2.2.1(1) — not less than; Codex Appendix 13–18"), standard: "FSSAI 2.2.1(1) / Codex 210", note: "Minimum" },
  { parameter: "Unsaponifiable matter", quantity: v(1.0, "%", "src-fssai-ch2-2", "FSS 2.2.1(1) — not more than"), standard: "FSSAI 2.2.1(1)", note: "Maximum" },
  { parameter: "Acid value", quantity: v(6.0, "ratio", "src-fssai-ch2-2", "FSS 2.2.1(1) — not more than (mg KOH/g)"), standard: "FSSAI 2.2.1(1)", note: "Maximum" },
  { parameter: "Argemone oil test", quantity: { unit: "text", evidence: "VERIFIED_FACT", sourceIds: ["src-fssai-ch2-2"], basis: "FSS 2.2.1(1)", notes: "Shall be negative.", researchedAt: TODAY, lastVerifiedAt: TODAY, verifiedBy: VB, dataKind: "regulation" }, standard: "FSSAI 2.2.1(1)" },
  { parameter: "Lauric acid (C12:0)", quantity: range(45.1, 53.2, "%", "src-codex-210", "CODEX STAN 210 Table 1", { value: 45.1 }), standard: "Codex STAN 210" },
  { parameter: "Myristic acid (C14:0)", quantity: range(16.8, 21.0, "%", "src-codex-210", "CODEX STAN 210 Table 1", { value: 16.8 }), standard: "Codex STAN 210" },
  { parameter: "Caprylic (C8:0) / Capric (C10:0)", quantity: { unit: "text", evidence: "VERIFIED_FACT", sourceIds: ["src-codex-210"], basis: "CODEX STAN 210 Table 1", notes: "C8:0 4.6–10.0%; C10:0 5.0–8.0%; C16:0 7.5–10.2%; C18:0 2.0–4.0%; C18:1 5.0–10.0%; C18:2 1.0–2.5%.", researchedAt: TODAY, lastVerifiedAt: TODAY, verifiedBy: VB, dataKind: "regulation" }, standard: "Codex STAN 210" },
  { parameter: "Reichert value", quantity: range(6, 8.5, "ratio", "src-codex-210", "CODEX STAN 210 Appendix §2", { value: 6 }), standard: "Codex STAN 210" },
  { parameter: "Relative density (40 °C/water 20 °C)", quantity: range(0.908, 0.921, "ratio", "src-codex-210", "CODEX STAN 210 Table 2", { value: 0.908 }), standard: "Codex STAN 210" },
];

/** Coconut milk — FSSAI 2.3.51 and Codex STAN 240 §3.1.3. */
export const COCONUT_MILK_STANDARDS: QualityParameter[] = [
  { parameter: "Fat — coconut milk", quantity: v(10.0, "%", "src-fssai-ch2-3", "FSS 2.3.51(2)(b) item 4 minimum, % w/w; identical in CODEX STAN 240 §3.1.3(b)"), standard: "FSSAI 2.3.51 / Codex 240", note: "Minimum" },
  { parameter: "Fat — light coconut milk", quantity: v(5.0, "%", "src-fssai-ch2-3", "FSS 2.3.51(2)(b) item 4 minimum; CODEX STAN 240 §3.1.3(a)"), standard: "FSSAI 2.3.51 / Codex 240", note: "Minimum" },
  { parameter: "Total solids — coconut milk", quantity: range(12.7, 25.3, "%", "src-fssai-ch2-3", "FSS 2.3.51(2)(b) item 2; CODEX STAN 240 §3.1.3(b)", { value: 12.7 }), standard: "FSSAI 2.3.51 / Codex 240" },
  { parameter: "Total solids — light coconut milk", quantity: range(6.6, 12.6, "%", "src-fssai-ch2-3", "FSS 2.3.51(2)(b) item 2; CODEX STAN 240 §3.1.3(a)", { value: 6.6 }), standard: "FSSAI 2.3.51 / Codex 240" },
  { parameter: "Solids-not-fat — coconut milk", quantity: v(2.7, "%", "src-fssai-ch2-3", "FSS 2.3.51(2)(b) item 3 minimum; Codex 240 (b)"), standard: "FSSAI 2.3.51 / Codex 240", note: "Minimum (light: 1.6)" },
  { parameter: "Moisture — coconut milk", quantity: v(87.3, "%", "src-fssai-ch2-3", "FSS 2.3.51(2)(b) item 1 maximum; Codex 240 (b)"), standard: "FSSAI 2.3.51 / Codex 240", note: "Maximum (light: 93.4)" },
  { parameter: "pH", quantity: v(5.9, "ratio", "src-fssai-ch2-3", "FSS 2.3.51(2)(b) item 5 minimum; CODEX STAN 240 §3.1.3 all styles"), standard: "FSSAI 2.3.51 / Codex 240", note: "Minimum" },
  { parameter: "Container fill", quantity: v(90, "%", "src-fssai-ch2-3", "FSS 2.3.51(2)(c) — not less than 90% v/v of water capacity"), standard: "FSSAI 2.3.51", note: "Minimum" },
  { parameter: "Permitted other ingredients", quantity: { unit: "text", evidence: "VERIFIED_FACT", sourceIds: ["src-codex-240"], basis: "CODEX STAN 240 §3.1.2; FSS 2.3.51(1)(e)", notes: "Coconut water, maltodextrin, sodium caseinate.", researchedAt: TODAY, lastVerifiedAt: TODAY, verifiedBy: VB, dataKind: "regulation" } },
  { parameter: "Preservative (pasteurised only)", quantity: v(1000, "count", "src-codex-240", "CODEX STAN 240 §4.3 — sodium benzoate max 1000 mg/kg, pasteurised coconut milk only", { notes: "mg/kg" }), standard: "Codex STAN 240 §4.3", note: "Maximum, mg/kg" },
];

/** Coconut cream — Codex STAN 240 §3.1.3(c)/(d). FSSAI 2.3.51 covers milk styles only (as read). */
export const COCONUT_CREAM_STANDARDS: QualityParameter[] = [
  { parameter: "Fat — coconut cream", quantity: v(20.0, "%", "src-codex-240", "CODEX STAN 240 §3.1.3(c) minimum, % m/m"), standard: "Codex STAN 240", note: "Minimum" },
  { parameter: "Total solids — coconut cream", quantity: range(25.4, 37.3, "%", "src-codex-240", "CODEX STAN 240 §3.1.3(c)", { value: 25.4 }), standard: "Codex STAN 240" },
  { parameter: "Non-fat solids — coconut cream", quantity: v(5.4, "%", "src-codex-240", "CODEX STAN 240 §3.1.3(c) minimum"), standard: "Codex STAN 240", note: "Minimum" },
  { parameter: "Moisture — coconut cream", quantity: v(74.6, "%", "src-codex-240", "CODEX STAN 240 §3.1.3(c) maximum"), standard: "Codex STAN 240", note: "Maximum" },
  { parameter: "Fat — coconut cream concentrate", quantity: v(29.0, "%", "src-codex-240", "CODEX STAN 240 §3.1.3(d) minimum; total solids ≥37.4%; NFS ≥8.4%; moisture ≤62.6%"), standard: "Codex STAN 240", note: "Minimum" },
  { parameter: "pH", quantity: v(5.9, "ratio", "src-codex-240", "CODEX STAN 240 §3.1.3 minimum, all styles"), standard: "Codex STAN 240", note: "Minimum" },
];

/** Coconut milk powder — FSSAI 2.3.63. */
export const COCONUT_MILK_POWDER_STANDARDS: QualityParameter[] = [
  { parameter: "Moisture", quantity: v(2.5, "%", "src-fssai-ch2-3", "FSS 2.3.63(4)(i) — not more than, % m/m"), standard: "FSSAI 2.3.63", note: "Maximum" },
  { parameter: "Fat (dry basis)", quantity: v(60.0, "%", "src-fssai-ch2-3", "FSS 2.3.63(4)(ii) — not less than, % m/m on dry basis"), standard: "FSSAI 2.3.63", note: "Minimum" },
  { parameter: "FFA of extracted fat (as lauric)", quantity: v(0.2, "%", "src-fssai-ch2-3", "FSS 2.3.63(4)(iii) — not more than, % m/m"), standard: "FSSAI 2.3.63", note: "Maximum" },
  { parameter: "Bulk density", quantity: range(0.3, 0.45, "ratio", "src-fssai-ch2-3", "FSS 2.3.63(4)(iv) g/ml", { value: 0.3 }), standard: "FSSAI 2.3.63", note: "g/ml" },
  { parameter: "Permitted additions", quantity: { unit: "text", evidence: "VERIFIED_FACT", sourceIds: ["src-fssai-ch2-3"], basis: "FSS 2.3.63(1)–(3)", notes: "Maltodextrin and sodium caseinate may be added; no added colour or flavour; creamish to white, free-flowing.", researchedAt: TODAY, lastVerifiedAt: TODAY, verifiedBy: VB, dataKind: "regulation" }, standard: "FSSAI 2.3.63" },
];
