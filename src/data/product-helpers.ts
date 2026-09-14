import type { Product, RiskLink, ScaleOption, EvidenceType } from "@/domain/types";
import { base, rr, asm } from "./helpers";

export const EJ = ["src-internal-ej"];

export type ProductInput = Partial<Product> & {
  id: string; name: string; slug: string; summary: string; technicalName: string; categoryId: string; industryIds: string[];
  sourceComponentIds: string[]; marketTags: Product["marketTags"]; businessLevel: Product["businessLevel"]; processIds: string[]; machineIds: string[];
};

export const product = (p: ProductInput): Product => ({
  ...base(p.id, p.name, p.slug, p.summary),
  heroAssetId: `ast-${p.id}`,
  whatIsIt: [], whyItExists: [],
  rawMaterial: { description: [], specification: [], quality: [], procurement: [], coconutType: "mature" },
  processDescription: [], inputs: [], outputs: [], byProducts: [], yieldQuantities: [], qualityParameters: [],
  utilities: { power: rr("kWh/kg", "Measure at pilot or obtain from supplier."), water: rr("l/kg", "Measure at pilot.") },
  manpower: rr("persons", "See factory scale model."), land: rr("sqm", "See factory planner."), building: rr("sqm", "See factory planner."), areas: [],
  packaging: [], storage: [], shelfLife: rr("months", "Depends on packaging and storage; verify with accelerated shelf-life study."), logistics: [],
  customers: [], useCases: [], competitors: [], pricing: [rr("INR/kg", "RESEARCH REQUIRED — current market price; capture in field validation with date and grade.")],
  costStructure: [], unitEconomics: [], capex: rr("INR", "RESEARCH REQUIRED — CURRENT SUPPLIER QUOTATION + building estimate."), workingCapital: rr("INR", "Use the Financial Model with your prices."),
  regulationIds: [], certificationIds: [], exportRequirements: [], exportCountryIds: [], risks: [],
  swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] }, scalability: [], scaleOptions: [], technology: [], futurePotential: [],
  researchDocumentIds: [], sourceIds: EJ, seoTitle: `${p.name} Manufacturing — Process, Machinery & Factory Requirements`, seoDescription: p.summary,
  ...p,
});

export const risk = (riskId: string, probability: RiskLink["probability"], impact: RiskLink["impact"], mitigation: string, earlyWarning: string, backupPlan: string, evidence: EvidenceType = "EXPERT_JUDGMENT"): RiskLink => ({ riskId, probability, impact, mitigation, earlyWarning, backupPlan, evidence });

export const scale = (id: string, label: string, value: number, unit: "kg/day" | "l/day" | "t/day", supported: boolean, note?: string, scaleModelId?: string): ScaleOption => ({
  id, label, capacity: asm(value, unit, `Target ${label}.`), supported, note, scaleModelId,
});

export const cust = (customerSegmentId: string, whyTheyBuy: string, specsTheyCareAbout: string[], note?: string) => ({ customerSegmentId, whyTheyBuy, specsTheyCareAbout, note });
