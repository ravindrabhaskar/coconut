import { describe, it, expect } from "vitest";
import { planFactory, layoutZones } from "../factoryPlanner";
import { factoryScaleModels } from "@/data/models";

const dc = factoryScaleModels.find((m) => m.id === "fsm-dc-1tpd")!;
const ac = factoryScaleModels.find((m) => m.id === "fsm-ac-2tpd")!;

describe("factory planner", () => {
  it("derives areas from processing floor and ratios", () => {
    const r = planFactory(dc, { automation: "semi_automatic", shifts: 1, location: "near_farms", targetMarket: "B2B" });
    expect(r.processingFloorSqm).toBeCloseTo(dc.processingFloorArea.value!, 6);
    expect(r.builtUpSqm!).toBeGreaterThan(r.processingFloorSqm!);
    expect(r.siteSqm!).toBeGreaterThan(r.builtUpSqm!);
    expect(r.siteAcres!).toBeCloseTo(r.siteSqm! / 4046.8564224, 6);
  });
  it("automation and market change outputs", () => {
    const a = planFactory(dc, { automation: "manual", shifts: 1, location: "near_farms", targetMarket: "B2B" });
    const b = planFactory(dc, { automation: "automatic", shifts: 1, location: "near_farms", targetMarket: "Export" });
    expect(a.manpower!).toBeGreaterThan(b.manpower!);
    const fgA = a.zones.find((z) => z.kind === "storage_fg")!.areaSqm!;
    const fgB = b.zones.find((z) => z.kind === "storage_fg")!.areaSqm!;
    expect(fgB).toBeGreaterThan(fgA);
  });
  it("different products produce different layouts", () => {
    const l1 = layoutZones(planFactory(dc, { automation: "semi_automatic", shifts: 1, location: "near_farms", targetMarket: "B2B" }).zones, dc.flowSequence);
    const l2 = layoutZones(planFactory(ac, { automation: "semi_automatic", shifts: 3, location: "near_farms", targetMarket: "Export" }).zones, ac.flowSequence);
    expect(l1.map((z) => z.kind).join()).not.toBe(l2.map((z) => z.kind).join());
    expect(l1.every((r) => r.w > 0 && r.h > 0)).toBe(true);
  });
  it("flags research-required capex and urban thermal constraints", () => {
    const r = planFactory(ac, { automation: "semi_automatic", shifts: 3, location: "urban", targetMarket: "Export" });
    expect(r.capexInr).toBeUndefined();
    expect(r.warnings.some((w) => w.includes("CAPEX"))).toBe(true);
    expect(r.warnings.some((w) => w.toLowerCase().includes("thermal"))).toBe(true);
  });
});
