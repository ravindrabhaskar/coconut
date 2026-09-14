/**
 * Strategic Assessment (0–100) — transparent weighted scoring.
 * Score = Σ(criterion.score/10 × weight) × 100, weights normalised to 1.
 * This is a screening heuristic, NOT objective truth or investment advice.
 */

import type { LocationDimensionScore, Opportunity, OpportunityCriterion } from "@/domain/types";

export interface ScoreBreakdown {
  total: number;
  normalisedWeights: { criterion: string; weight: number; score: number; contribution: number }[];
  evidenceCoverage: number; // fraction of criteria not RESEARCH_REQUIRED
}

export function scoreCriteria(criteria: OpportunityCriterion[]): ScoreBreakdown {
  const wSum = criteria.reduce((s, c) => s + c.weight, 0) || 1;
  const rows = criteria.map((c) => {
    const w = c.weight / wSum;
    const clamped = Math.max(0, Math.min(10, c.score));
    return { criterion: c.criterion, weight: w, score: clamped, contribution: (clamped / 10) * w * 100 };
  });
  const total = Math.round(rows.reduce((s, r) => s + r.contribution, 0));
  const covered = criteria.filter((c) => c.evidence !== "RESEARCH_REQUIRED").length;
  return { total, normalisedWeights: rows, evidenceCoverage: criteria.length ? covered / criteria.length : 0 };
}

export function scoreOpportunity(o: Opportunity): ScoreBreakdown {
  return scoreCriteria(o.criteria);
}

export function scoreLocation(dims: LocationDimensionScore[], weightOverrides: Record<string, number> = {}): ScoreBreakdown {
  return scoreCriteria(
    dims.map((d) => ({
      criterion: d.dimension,
      score: d.score,
      weight: weightOverrides[d.dimension] ?? d.weight,
      reason: d.reason,
      evidence: d.evidence,
    })),
  );
}

// ---------------------------------------------------------------------------
// Opportunity finder — "Which coconut business is right for me?"
// ---------------------------------------------------------------------------

export interface FinderProfile {
  capitalInr: number;
  location: "near_farms" | "urban" | "port" | "hyderabad" | "other";
  rawMaterialAccess: "strong" | "moderate" | "weak";
  market: "B2B" | "B2C" | "Export" | "Hybrid";
  preference: "food" | "industrial" | "either";
  technicalCapability: "low" | "medium" | "high";
  riskTolerance: "low" | "medium" | "high";
  desiredScale: "micro" | "small" | "medium" | "large";
  marketingCapability: "low" | "medium" | "high";
  timeHorizon: "short" | "medium" | "long";
}

export interface FinderMatch {
  opportunityId: string;
  fit: number; // 0..100
  reasons: string[];
  cautions: string[];
}

const LVL = { low: 1, medium: 2, high: 3 } as const;

export function matchOpportunity(o: Opportunity, p: FinderProfile, industryKind: "food" | "industrial" | "other"): FinderMatch {
  const reasons: string[] = [];
  const cautions: string[] = [];
  let fit = 50;

  // Capital fit
  const capex = o.capex.value;
  if (capex === undefined) {
    cautions.push("CAPEX for this opportunity is RESEARCH REQUIRED — capital fit could not be scored.");
  } else if (p.capitalInr >= capex * 1.3) {
    fit += 15; reasons.push("Your capital covers the indicative CAPEX with a working-capital buffer.");
  } else if (p.capitalInr >= capex) {
    fit += 5; reasons.push("Your capital roughly matches indicative CAPEX; working capital may be tight.");
  } else {
    fit -= 25; cautions.push("Indicative CAPEX exceeds your capital — consider contract manufacturing or a smaller entry route.");
  }

  // Market alignment
  const tags = o.routeToMarket.join(" ").toLowerCase();
  if (p.market === "Export" && o.exportPotential === "high") { fit += 10; reasons.push("High export potential matches your export focus."); }
  if (p.market === "Export" && o.exportPotential === "low") { fit -= 10; cautions.push("Low export potential conflicts with an export-first plan."); }
  if (p.market === "B2C" && o.brandPotential === "high") { fit += 8; reasons.push("Strong brand potential suits a B2C route."); }
  if (p.market === "B2C" && p.marketingCapability === "low") { fit -= 8; cautions.push("B2C needs marketing capability you rated as low."); }
  if (p.market === "B2B" && tags.includes("b2b")) { fit += 6; reasons.push("Route to market is B2B-native."); }

  // Preference
  if (p.preference !== "either") {
    if (industryKind === p.preference) { fit += 6; reasons.push(`Matches your ${p.preference} preference.`); }
    else if (industryKind !== "other") { fit -= 6; }
  }

  // Technical capability vs difficulty
  const diff = o.difficulty === "very_high" ? 4 : o.difficulty === "high" ? 3 : o.difficulty === "medium" ? 2 : 1;
  const tech = LVL[p.technicalCapability];
  if (diff > tech + 1) { fit -= 15; cautions.push("Technical difficulty is well above your stated capability — plan for hired expertise."); }
  else if (diff <= tech) { fit += 6; reasons.push("Technical difficulty is within your capability."); }

  // Risk tolerance
  if (LVL[o.riskLevel] > LVL[p.riskTolerance]) { fit -= 10; cautions.push("Risk level exceeds your risk tolerance."); }
  else { fit += 4; }

  // Raw material
  if (p.rawMaterialAccess === "weak" && o.componentIds.length > 0 && o.capitalIntensity !== "low") {
    fit -= 8; cautions.push("Weak raw-material access is a serious constraint for processing businesses.");
  }
  if (p.rawMaterialAccess === "strong") { fit += 5; reasons.push("Strong raw-material access de-risks procurement."); }

  // Location
  if (p.location === "near_farms" && o.capitalIntensity !== "low") { fit += 4; reasons.push("Near-farm location suits primary processing."); }
  if (p.location === "hyderabad" && o.brandPotential === "high") { fit += 3; reasons.push("Hyderabad suits a sales/brand hub model."); }
  if (p.location === "port" && o.exportPotential === "high") { fit += 4; reasons.push("Port proximity supports export logistics."); }

  // Scale
  const scaleMap = { micro: 1, small: 2, medium: 3, large: 4 } as const;
  if (scaleMap[p.desiredScale] >= 3 && o.scalability === "low") { fit -= 8; cautions.push("Low scalability conflicts with a medium/large ambition."); }
  if (scaleMap[p.desiredScale] <= 2 && o.capitalIntensity === "high") { fit -= 6; cautions.push("High capital intensity is hard to justify at micro/small scale."); }

  // Time horizon vs working capital intensity
  if (p.timeHorizon === "short" && o.workingCapitalIntensity === "high") { fit -= 6; cautions.push("High working-capital intensity slows early returns."); }

  if (o.evidenceQuality === "weak" || o.evidenceQuality === "unrated") cautions.push("Evidence quality for this opportunity is weak — field validation required before commitment.");

  return { opportunityId: o.id, fit: Math.max(0, Math.min(100, Math.round(fit))), reasons, cautions };
}

// ---------------------------------------------------------------------------
// Business builder — capital × market → indicative route
// ---------------------------------------------------------------------------

export type EntryRoute =
  | "Contract manufacture" | "Private label" | "Micro processing" | "Small factory" | "B2B ingredient model"
  | "Distribution" | "Export trading" | "Integrated processing";

export interface RouteRecommendation {
  route: EntryRoute;
  validationStage: string;
  capitalAllocation: { item: string; share: number }[];
  workingCapitalNote: string;
  customerValidation: string[];
  mainRisks: string[];
  nextMilestone: string;
  why: string[];
}

export function recommendRoute(capitalInr: number, market: "B2B" | "B2C" | "Export" | "Hybrid", capexIndication?: number): RouteRecommendation {
  const lakh = 100_000;
  const why: string[] = [];
  let route: EntryRoute;

  if (capitalInr <= 1 * lakh) {
    route = market === "B2C" ? "Private label" : "Distribution";
    why.push("Capital under ₹1 lakh cannot fund processing equipment plus working capital; validate demand by selling before making.");
  } else if (capitalInr <= 5 * lakh) {
    route = market === "B2C" ? "Contract manufacture" : "Micro processing";
    why.push("At ₹1–5 lakh, contract manufacturing or a single micro-process keeps capital in customers, not machinery.");
  } else if (capitalInr <= 25 * lakh) {
    route = market === "Export" ? "Export trading" : "Micro processing";
    why.push("₹5–25 lakh supports a single validated product at micro scale, or trading to learn export documentation before manufacturing.");
  } else if (capitalInr <= 1 * 10_000_000) {
    route = market === "B2B" ? "B2B ingredient model" : "Small factory";
    why.push("₹25 lakh–₹1 crore can fund a small single-product plant if customer validation and utilisation are proven.");
  } else {
    route = "Integrated processing";
    why.push("Above ₹1 crore, multi-stream processing becomes possible — but only after one product is operating profitably.");
  }
  if (capexIndication !== undefined && capexIndication > capitalInr && (route === "Small factory" || route === "Integrated processing")) {
    route = "Contract manufacture";
    why.push("Indicative CAPEX for the selected product exceeds available capital — start with contract manufacturing.");
  }

  const allocation: Record<EntryRoute, { item: string; share: number }[]> = {
    "Contract manufacture": [{ item: "Product development & testing", share: 0.2 }, { item: "Initial inventory (contract batches)", share: 0.35 }, { item: "Packaging & compliance", share: 0.15 }, { item: "Marketing & customer validation", share: 0.2 }, { item: "Reserve", share: 0.1 }],
    "Private label": [{ item: "Initial stock", share: 0.4 }, { item: "Brand, packaging, compliance", share: 0.25 }, { item: "Marketing", share: 0.25 }, { item: "Reserve", share: 0.1 }],
    "Micro processing": [{ item: "Core machinery", share: 0.4 }, { item: "Raw-material working capital", share: 0.25 }, { item: "Compliance, testing, packaging", share: 0.15 }, { item: "Customer validation", share: 0.1 }, { item: "Reserve", share: 0.1 }],
    "Small factory": [{ item: "Machinery & installation", share: 0.45 }, { item: "Building / fit-out (leased)", share: 0.15 }, { item: "Working capital", share: 0.25 }, { item: "Compliance & QC", share: 0.05 }, { item: "Reserve", share: 0.1 }],
    "B2B ingredient model": [{ item: "Machinery & QC lab", share: 0.45 }, { item: "Working capital (credit to buyers)", share: 0.35 }, { item: "Certifications", share: 0.1 }, { item: "Reserve", share: 0.1 }],
    Distribution: [{ item: "Inventory", share: 0.5 }, { item: "Logistics & storage", share: 0.2 }, { item: "Sales", share: 0.2 }, { item: "Reserve", share: 0.1 }],
    "Export trading": [{ item: "Inventory & pre-shipment", share: 0.5 }, { item: "Certifications, IEC, documentation", share: 0.15 }, { item: "Samples, buyer visits, trade fairs", share: 0.2 }, { item: "Reserve", share: 0.15 }],
    "Integrated processing": [{ item: "Multi-line machinery", share: 0.5 }, { item: "Land / building", share: 0.15 }, { item: "Working capital", share: 0.25 }, { item: "Reserve", share: 0.1 }],
  };

  const validationStage: Record<EntryRoute, string> = {
    "Contract manufacture": "Customer validation with third-party-made product before any equipment purchase.",
    "Private label": "Brand/market validation with sourced product.",
    "Micro processing": "Process validation at pilot scale with repeat customers.",
    "Small factory": "Utilisation validation — confirmed offtake for ≥60% of capacity.",
    "B2B ingredient model": "Specification validation with 3–5 industrial buyers.",
    Distribution: "Demand and margin validation across channels.",
    "Export trading": "Buyer, documentation and payment-term validation.",
    "Integrated processing": "Proven single-product operation and multi-stream offtake.",
  };

  return {
    route,
    validationStage: validationStage[route],
    capitalAllocation: allocation[route],
    workingCapitalNote: "Working capital is typically 20–35% of total capital need for processing routes and higher for trading routes. Treat this as a planning share (EXPERT JUDGMENT), not a rule.",
    customerValidation: ["Identify 10 target buyers and obtain written specifications", "Sell trial quantities and record repeat orders", "Confirm payment terms and credit days in writing"],
    mainRisks: ["Assumed demand", "Assumed margins", "Machine quote ≠ total project cost", "Working-capital lock-up in receivables"],
    nextMilestone: "Complete the 90-day validation plan before committing to machinery, land or a factory.",
    why,
  };
}
