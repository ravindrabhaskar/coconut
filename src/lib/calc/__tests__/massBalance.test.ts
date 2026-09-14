import { describe, it, expect } from "vitest";
import { computeMassBalance, validateModel, economicsOverlay } from "../massBalance";
import { massBalanceModels } from "@/data/models";

const whole = massBalanceModels.find((m) => m.id === "mb-mature-whole")!;

describe("mass balance", () => {
  it("computes masses from nuts using avg nut mass", () => {
    const r = computeMassBalance(whole, { nuts: 1000 });
    expect(r.inputKg).toBeCloseTo(1000 * whole.avgNutMass.value!, 6);
    const husk = r.results.find((x) => x.stageId === "husk")!;
    expect(husk.massKg).toBeCloseTo(r.inputKg * whole.stages.find((s) => s.id === "husk")!.fraction.value!, 6);
    const dc = r.results.find((x) => x.stageId === "dc")!;
    expect(dc.kind).toBe("product");
    expect(dc.massKg).toBeGreaterThan(0);
  });
  it("applies sensitivity overrides and marks them as assumptions", () => {
    const base = computeMassBalance(whole, { kg: 1000 });
    const over = computeMassBalance(whole, { kg: 1000 }, { husk: 0.5 });
    const h0 = base.results.find((x) => x.stageId === "husk")!.massKg!;
    const h1 = over.results.find((x) => x.stageId === "husk")!.massKg!;
    expect(h1).toBe(500);
    expect(h1).not.toBe(h0);
    expect(over.results.find((x) => x.stageId === "husk")!.evidence).toBe("ASSUMPTION");
  });
  it("closure error is small for a closed model", () => {
    const r = computeMassBalance(whole, { kg: 1000 });
    expect(Math.abs(r.closureError)).toBeLessThan(1000 * 0.1);
  });
  it("validates child fractions sum to about 1", () => {
    const errs = validateModel(whole, 0.05);
    expect(errs).toEqual([]);
  });
  it("economics overlay prices only supplied streams", () => {
    const r = computeMassBalance(whole, { kg: 1000 });
    const e = economicsOverlay(r, { dc: 100 }, 5);
    const dc = r.results.find((x) => x.stageId === "dc")!.massKg!;
    expect(e.potentialRevenue).toBeCloseTo(dc * 100, 6);
    expect(e.processCost).toBe(5000);
    expect(e.unpricedStreams).toBeGreaterThan(0);
  });
  it("propagates RESEARCH REQUIRED fractions as undefined mass", () => {
    const model2 = {
      ...whole,
      stages: [
        { id: "a", name: "A", kind: "material" as const, fraction: { unit: "ratio" as const, evidence: "RESEARCH_REQUIRED" as const } },
        { id: "b", name: "B", kind: "product" as const, fromStageId: "a", fraction: { unit: "ratio" as const, evidence: "RESEARCH_REQUIRED" as const } },
      ],
    };
    const r2 = computeMassBalance(model2, { kg: 100 });
    expect(r2.results.find((x) => x.stageId === "a")!.massKg).toBe(100);
    expect(r2.results.find((x) => x.stageId === "b")!.massKg).toBeUndefined();
    expect(r2.results.find((x) => x.stageId === "b")!.researchRequired).toBe(true);
  });
});
