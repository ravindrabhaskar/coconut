import { describe, it, expect } from "vitest";
import * as D from "@/data";
import { freshness, inferDataKind } from "@/lib/freshness";
import { productGapReport, aggregateCoverage } from "../gaps";
import { DC_STANDARDS, VCO_STANDARDS, COCONUT_MILK_STANDARDS } from "@/data/standards";

describe("evidence v2", () => {
  it("every VERIFIED_FACT names a verifier, a source that exists, a basis and a verified date", () => {
    const all = [...D.products.flatMap((p) => p.qualityParameters.map((q) => ({ ctx: p.id, q: q.quantity }))), ...D.governmentSchemes.flatMap((s) => [{ ctx: s.id, q: s.subsidy }, { ctx: s.id, q: s.maximumAmount }])];
    const verified = all.filter((x) => x.q.evidence === "VERIFIED_FACT");
    expect(verified.length).toBeGreaterThan(40);
    for (const { ctx, q } of verified) {
      expect(q.verifiedBy, `${ctx} verifiedBy`).toBeTruthy();
      expect(q.lastVerifiedAt, `${ctx} lastVerifiedAt`).toBeTruthy();
      expect(q.basis, `${ctx} basis`).toBeTruthy();
      for (const s of q.sourceIds ?? []) expect(D.sourceById[s], `${ctx} source ${s}`).toBeDefined();
      expect((q.sourceIds ?? []).length).toBeGreaterThan(0);
    }
  });
  it("desk-verified standards carry the values read from the primary documents", () => {
    const dcF = DC_STANDARDS.find((x) => x.parameter.startsWith("Moisture — FSSAI"))!.quantity;
    const dcC = DC_STANDARDS.find((x) => x.parameter.startsWith("Moisture — Codex"))!.quantity;
    expect(dcF.value).toBe(3.0); expect(dcC.value).toBe(4);
    expect(VCO_STANDARDS.find((x) => x.parameter === "Moisture")!.quantity.value).toBe(0.5);
    expect(VCO_STANDARDS.find((x) => x.parameter === "Peroxide value")!.quantity.value).toBe(15);
    expect(COCONUT_MILK_STANDARDS.find((x) => x.parameter === "Fat — coconut milk")!.quantity.value).toBe(10);
    const dc = D.productById["prd-desiccated-coconut"];
    expect(dc.qualityParameters[0].quantity.evidence).toBe("VERIFIED_FACT");
    expect(dc.sourceIds).toContain("src-fssai-ch2-3");
  });
  it("SOURCE_BACKED is distinguished from VERIFIED in gap reports and aggregate", () => {
    const r = productGapReport(D.productById["prd-activated-carbon"]);
    expect(r.fields.some((f) => f.status === "SOURCE_BACKED" || f.status === "VERIFIED" || f.status === "ESTIMATE")).toBe(true);
    const agg = aggregateCoverage(D.products.map(productGapReport));
    expect(agg.sourcedPct).toBeGreaterThanOrEqual(agg.verifiedPct);
    expect(agg.verified).toBeGreaterThan(0);
  });
  it("DATA_VERIFIED requires an approving expert review even at high verified share", () => {
    const p = { ...D.productById["prd-desiccated-coconut"], reviews: [] };
    expect(productGapReport(p).contentStatus).not.toBe("DATA_VERIFIED");
  });
  it("freshness rules depend on data kind", () => {
    const old = "2025-01-01";
    expect(freshness({ unit: "INR/kg", evidence: "ESTIMATE", value: 1, lastVerifiedAt: old }, new Date("2026-09-14")).state).toBe("potentially_stale");
    expect(freshness({ unit: "%", evidence: "VERIFIED_FACT", value: 1, lastVerifiedAt: old, dataKind: "regulation" }, new Date("2026-09-14")).state).toBe("review_suggested");
    expect(freshness({ unit: "%", evidence: "ESTIMATE", value: 1, lastVerifiedAt: old, dataKind: "composition" }, new Date("2026-09-14")).state).toBe("current");
    expect(freshness({ unit: "kg", evidence: "ESTIMATE", value: 1 }).state).toBe("undated");
    expect(inferDataKind({ unit: "INR/kg", evidence: "ESTIMATE" })).toBe("price");
  });
  it("schemes: PMFME verified; unverified schemes carry no subsidy value; prices/quotations are empty by design", () => {
    const pmfme = D.governmentSchemes.find((s) => s.id === "sch-pmfme")!;
    expect(pmfme.subsidy.value).toBe(35); expect(pmfme.maximumAmount.value).toBe(1_000_000); expect(pmfme.subsidy.evidence).toBe("VERIFIED_FACT");
    for (const s of D.governmentSchemes.filter((x) => x.id !== "sch-pmfme")) expect(s.subsidy.value).toBeUndefined();
    expect(D.priceRecords).toEqual([]);
    expect(D.machineQuotations).toEqual([]);
  });
  it("new products are wired: components list them, assets exist, relationships derived", () => {
    for (const id of ["prd-coconut-milk-powder", "prd-cocopeat-grow-bags", "prd-coir-rope-mats", "prd-coconut-vinegar", "prd-nata-de-coco", "prd-shell-handicrafts"]) {
      expect(D.productById[id], id).toBeDefined();
      expect(D.assetById[D.productById[id].heroAssetId]).toBeDefined();
      expect(D.components.some((c) => [...c.primaryOutputProductIds, ...c.secondaryOutputProductIds].includes(id)), `${id} in a component tree`).toBe(true);
      expect(D.relationships.some((r) => r.toId === id && r.relation === "PRODUCES")).toBe(true);
    }
    expect(D.productById["prd-coconut-milk-powder"].qualityParameters.some((q) => q.quantity.evidence === "VERIFIED_FACT" && q.quantity.value === 2.5)).toBe(true);
  });
  it("thin products were enriched without losing base fields", () => {
    const copra = D.productById["prd-copra"];
    expect(copra.whatIsIt.length).toBeGreaterThan(1);
    expect(copra.customers.length).toBeGreaterThanOrEqual(2);
    expect(copra.machineIds).toContain("mch-dehusker");
    const yarn = D.productById["prd-coir-yarn"];
    expect(yarn.risks.length).toBeGreaterThanOrEqual(2);
    expect(yarn.useCases.length + yarn.customers.length + yarn.qualityParameters.length).toBeGreaterThanOrEqual(8);
    expect(productGapReport(yarn).coveragePct).toBeGreaterThanOrEqual(35); // quantitative fields stay RESEARCH REQUIRED until measured — by design
  });
});
