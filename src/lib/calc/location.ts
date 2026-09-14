/**
 * Location engine — ranks Indian states for a specific business need profile.
 * Reuses the transparent weighted scoring in scoring.ts; the only thing this module adds is a
 * deterministic mapping from a need profile (or a product) to dimension-weight overrides, plus
 * fit notes derived from the state's own dimension reasons. All state dimension scores are
 * EXPERT JUDGMENT — the output is a screening heuristic, not a site recommendation.
 */

import type { Product, StateProfile } from "@/domain/types";
import { scoreLocation, type ScoreBreakdown } from "./scoring";

export type Intensity = "low" | "medium" | "high";
export interface LocationNeeds {
  rawMaterialDependence: Intensity; // how tightly the plant must sit inside the coconut belt
  exportShare: Intensity;           // share of output expected to be exported
  powerIntensity: Intensity;        // grid dependence (dryers, mills, kilns)
  waterIntensity: Intensity;        // retting, washing, wet milling
  labourIntensity: Intensity;       // manual dehusking, handicrafts, grading
  ecosystemDependence: Intensity;   // reliance on nearby fabricators, contractors, co-processors
  domesticMarketFocus: Intensity;   // proximity to urban demand
}

export const DEFAULT_NEEDS: LocationNeeds = { rawMaterialDependence: "high", exportShare: "medium", powerIntensity: "medium", waterIntensity: "medium", labourIntensity: "medium", ecosystemDependence: "medium", domesticMarketFocus: "medium" };

/** Dimension names exactly as used in src/data/market.ts state profiles. */
export const LOCATION_DIMENSIONS = ["Raw-material availability", "Land", "Labour", "Electricity", "Water", "Road", "Rail", "Port access", "Market access", "Export connectivity", "Government support", "Processing ecosystem", "Suppliers"] as const;
export type LocationDimension = (typeof LOCATION_DIMENSIONS)[number];

const MULT: Record<Intensity, number> = { low: 0.5, medium: 1, high: 1.8 };

/** Base weights mirror the default profile weights; overrides scale them by need intensity. */
const BASE: Record<LocationDimension, number> = { "Raw-material availability": 0.2, Land: 0.08, Labour: 0.1, Electricity: 0.08, Water: 0.08, Road: 0.06, Rail: 0.04, "Port access": 0.08, "Market access": 0.08, "Export connectivity": 0.06, "Government support": 0.06, "Processing ecosystem": 0.05, Suppliers: 0.03 };

export function weightsForNeeds(n: LocationNeeds): Record<string, number> {
  return {
    ...BASE,
    "Raw-material availability": BASE["Raw-material availability"] * MULT[n.rawMaterialDependence],
    "Export connectivity": BASE["Export connectivity"] * MULT[n.exportShare],
    "Port access": BASE["Port access"] * MULT[n.exportShare],
    Electricity: BASE.Electricity * MULT[n.powerIntensity],
    Water: BASE.Water * MULT[n.waterIntensity],
    Labour: BASE.Labour * MULT[n.labourIntensity],
    "Processing ecosystem": BASE["Processing ecosystem"] * MULT[n.ecosystemDependence],
    Suppliers: BASE.Suppliers * MULT[n.ecosystemDependence],
    "Market access": BASE["Market access"] * MULT[n.domesticMarketFocus],
  };
}

/** Derive a need profile from the product's own typed fields (no numbers invented — only categorical inference). */
export function needsForProduct(p: Product): LocationNeeds {
  const tags = new Set(p.marketTags);
  const kw = (p.utilities.notes ?? []).join(" ").toLowerCase() + " " + p.processDescription.join(" ").toLowerCase();
  const perishableInput = p.rawMaterial.coconutType === "tender" || p.rawMaterial.coconutType === "mature";
  const power = p.utilities.power.value;
  const water = p.utilities.water.value;
  return {
    rawMaterialDependence: perishableInput ? "high" : p.rawMaterial.coconutType === "either" ? "medium" : "low",
    exportShare: tags.has("Export") ? (tags.has("B2C") || tags.has("B2B") ? "medium" : "high") : "low",
    powerIntensity: power != null ? (power >= 100 ? "high" : power >= 30 ? "medium" : "low") : /kiln|dryer|drying|mill|activation|furnace/.test(kw) ? "high" : "medium",
    waterIntensity: water != null ? (water >= 20 ? "high" : water >= 5 ? "medium" : "low") : /retting|washing|wash|wet|milk|steam/.test(kw) ? "high" : "medium",
    labourIntensity: p.manpower.value != null ? (p.manpower.value >= 25 ? "high" : p.manpower.value >= 8 ? "medium" : "low") : "medium",
    ecosystemDependence: p.businessLevel === "L1" || p.businessLevel === "L2" ? "medium" : "high",
    domesticMarketFocus: tags.has("B2C") ? "high" : tags.has("B2B") || tags.has("Industrial") ? "medium" : "low",
  };
}

export interface LocationRank {
  stateId: string;
  slug: string;
  name: string;
  code: string;
  total: number;
  breakdown: ScoreBreakdown;
  strengths: { dimension: string; score: number; reason: string }[];
  weaknesses: { dimension: string; score: number; reason: string }[];
  ports: string[];
  evidenceCoverage: number;
}

/** Rank states for a need profile. Ties broken by name for stable output. */
export function rankLocations(states: StateProfile[], needs: LocationNeeds): LocationRank[] {
  const w = weightsForNeeds(needs);
  return states
    .map((s) => {
      const breakdown = scoreLocation(s.dimensions, w);
      // "Decisive" dimensions = those the profile weights most; surface strengths/weaknesses among them
      const weighted = s.dimensions.map((d) => ({ dimension: d.dimension, score: d.score, reason: d.reason, w: w[d.dimension] ?? d.weight })).sort((a, b) => b.w - a.w).slice(0, 6);
      const strengths = weighted.filter((d) => d.score >= 7).sort((a, b) => b.score - a.score).slice(0, 3).map(({ dimension, score, reason }) => ({ dimension, score, reason }));
      const weaknesses = weighted.filter((d) => d.score <= 5).sort((a, b) => a.score - b.score).slice(0, 3).map(({ dimension, score, reason }) => ({ dimension, score, reason }));
      return { stateId: s.id, slug: s.slug, name: s.name, code: s.code, total: breakdown.total, breakdown, strengths, weaknesses, ports: s.ports, evidenceCoverage: breakdown.evidenceCoverage };
    })
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}
