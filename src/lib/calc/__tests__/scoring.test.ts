import { describe, it, expect } from "vitest";
import { scoreCriteria, matchOpportunity, recommendRoute, scoreLocation } from "../scoring";
import { opportunities } from "@/data/opportunities";
import { states } from "@/data/market";

describe("scoring", () => {
  it("normalises weights and produces 0-100", () => {
    const s = scoreCriteria([
      { criterion: "A", score: 10, weight: 2, reason: "", evidence: "EXPERT_JUDGMENT" },
      { criterion: "B", score: 0, weight: 2, reason: "", evidence: "EXPERT_JUDGMENT" },
    ]);
    expect(s.total).toBe(50);
    expect(s.normalisedWeights[0].weight).toBe(0.5);
  });
  it("clamps scores and computes evidence coverage", () => {
    const s = scoreCriteria([{ criterion: "A", score: 15, weight: 1, reason: "", evidence: "RESEARCH_REQUIRED" }]);
    expect(s.total).toBe(100);
    expect(s.evidenceCoverage).toBe(0);
  });
  it("every seeded opportunity scores within range and weights sum to about 1", () => {
    for (const o of opportunities) {
      const s = scoreCriteria(o.criteria);
      expect(s.total).toBeGreaterThanOrEqual(0);
      expect(s.total).toBeLessThanOrEqual(100);
      const w = o.criteria.reduce((a, c) => a + c.weight, 0);
      expect(w).toBeCloseTo(1, 1);
    }
  });
  it("opportunity finder penalises insufficient capital and rewards fit", () => {
    const ac = opportunities.find((o) => o.id === "opp-activated-carbon")!;
    const low = matchOpportunity(ac, { capitalInr: 100000, location: "urban", rawMaterialAccess: "weak", market: "B2C", preference: "food", technicalCapability: "low", riskTolerance: "low", desiredScale: "micro", marketingCapability: "low", timeHorizon: "short" }, "industrial");
    const high = matchOpportunity(ac, { capitalInr: 1e9, location: "port", rawMaterialAccess: "strong", market: "Export", preference: "industrial", technicalCapability: "high", riskTolerance: "high", desiredScale: "large", marketingCapability: "medium", timeHorizon: "long" }, "industrial");
    expect(high.fit).toBeGreaterThan(low.fit);
    expect(low.cautions.length).toBeGreaterThan(0);
  });
  it("business builder maps capital to route", () => {
    expect(recommendRoute(50000, "B2C").route).toBe("Private label");
    expect(recommendRoute(300000, "B2B").route).toBe("Micro processing");
    expect(recommendRoute(5e7, "B2B").route).toBe("Integrated processing");
    expect(recommendRoute(5e6, "B2C", 2e7).route).toBe("Contract manufacture");
    const r = recommendRoute(1e6, "Export");
    expect(r.capitalAllocation.reduce((s, a) => s + a.share, 0)).toBeCloseTo(1, 6);
  });
  it("location scoring respects weight overrides", () => {
    const tn = states.find((s) => s.id === "st-tn")!;
    const a = scoreLocation(tn.dimensions);
    const b = scoreLocation(tn.dimensions, { "Raw-material availability": 5 });
    expect(a.total).toBeGreaterThan(0);
    expect(b.total).not.toBe(a.total);
  });
});
