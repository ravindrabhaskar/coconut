import { describe, it, expect } from "vitest";
import { rankLocations, weightsForNeeds, needsForProduct, DEFAULT_NEEDS, LOCATION_DIMENSIONS } from "../location";
import { states } from "@/data/market";
import { products } from "@/data";

describe("location engine", () => {
  it("state profiles use exactly the documented dimension names", () => {
    for (const s of states) for (const d of s.dimensions) expect(LOCATION_DIMENSIONS).toContain(d.dimension);
  });
  it("weights scale with need intensity", () => {
    const low = weightsForNeeds({ ...DEFAULT_NEEDS, rawMaterialDependence: "low" });
    const high = weightsForNeeds({ ...DEFAULT_NEEDS, rawMaterialDependence: "high" });
    expect(high["Raw-material availability"]).toBeGreaterThan(low["Raw-material availability"]);
    expect(high.Land).toBe(low.Land);
  });
  it("ranks all states within 0-100 and sorts descending", () => {
    const r = rankLocations(states, DEFAULT_NEEDS);
    expect(r).toHaveLength(states.length);
    for (let i = 1; i < r.length; i++) expect(r[i - 1].total).toBeGreaterThanOrEqual(r[i].total);
    for (const x of r) { expect(x.total).toBeGreaterThanOrEqual(0); expect(x.total).toBeLessThanOrEqual(100); }
  });
  it("a raw-material-critical profile ranks Telangana below the coconut-belt states", () => {
    const r = rankLocations(states, { ...DEFAULT_NEEDS, rawMaterialDependence: "high", domesticMarketFocus: "low" });
    const ts = r.findIndex((x) => x.stateId === "st-ts");
    const tn = r.findIndex((x) => x.stateId === "st-tn");
    expect(tn).toBeLessThan(ts);
  });
  it("a domestic-market, low-raw-material profile lifts Telangana relative to the default", () => {
    const base = rankLocations(states, DEFAULT_NEEDS).find((x) => x.stateId === "st-ts")!.total;
    const hq = rankLocations(states, { ...DEFAULT_NEEDS, rawMaterialDependence: "low", domesticMarketFocus: "high", exportShare: "low" }).find((x) => x.stateId === "st-ts")!.total;
    expect(hq).toBeGreaterThan(base);
  });
  it("derives a need profile for every product without throwing", () => {
    for (const p of products) {
      const n = needsForProduct(p);
      expect(["low", "medium", "high"]).toContain(n.rawMaterialDependence);
      expect(["low", "medium", "high"]).toContain(n.exportShare);
    }
  });
});
