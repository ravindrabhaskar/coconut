import { describe, it, expect } from "vitest";
import * as D from "@/data";
import { productGapReport, componentGapReport, aggregateCoverage } from "../gaps";

describe("data integrity (database relationships)", () => {
  it("every product references existing components, processes, machines, customers, regs, certs, countries, risks", () => {
    for (const p of D.products) {
      p.sourceComponentIds.forEach((c) => expect(D.componentById[c], `${p.id} component ${c}`).toBeDefined());
      p.processIds.forEach((x) => expect(D.processById[x], `${p.id} process ${x}`).toBeDefined());
      p.machineIds.forEach((x) => expect(D.machineById[x], `${p.id} machine ${x}`).toBeDefined());
      p.customers.forEach((x) => expect(D.customerSegmentById[x.customerSegmentId], `${p.id} customer ${x.customerSegmentId}`).toBeDefined());
      p.regulationIds.forEach((x) => expect(D.regulations.find((r) => r.id === x), `${p.id} reg ${x}`).toBeDefined());
      p.certificationIds.forEach((x) => expect(D.certifications.find((r) => r.id === x), `${p.id} cert ${x}`).toBeDefined());
      p.exportCountryIds.forEach((x) => expect(D.countryById[x], `${p.id} country ${x}`).toBeDefined());
      p.risks.forEach((x) => expect(D.riskById[x.riskId], `${p.id} risk ${x.riskId}`).toBeDefined());
      p.sourceIds.forEach((x) => expect(D.sourceById[x], `${p.id} source ${x}`).toBeDefined());
      p.researchDocumentIds.forEach((x) => expect(D.researchById[x], `${p.id} research ${x}`).toBeDefined());
      if (p.opportunityId) expect(D.opportunityById[p.opportunityId]).toBeDefined();
      p.scaleOptions.forEach((s) => { if (s.scaleModelId) expect(D.factoryScaleModelById[s.scaleModelId], `${p.id} scale ${s.scaleModelId}`).toBeDefined(); });
      expect(D.productCategories.find((c) => c.id === p.categoryId)).toBeDefined();
      expect(D.assetById[p.heroAssetId], `${p.id} asset`).toBeDefined();
    }
  });
  it("components reference existing products and assets", () => {
    for (const c of D.components) {
      [...c.primaryOutputProductIds, ...c.secondaryOutputProductIds].forEach((p) => expect(D.productById[p], `${c.id} -> ${p}`).toBeDefined());
      expect(D.assetById[c.heroAssetId]).toBeDefined();
    }
  });
  it("processes reference existing machines and products; steps are ordered", () => {
    for (const p of D.processes) {
      p.productIds.forEach((x) => expect(D.productById[x]).toBeDefined());
      p.steps.forEach((s, i) => { expect(s.order).toBe(i + 1); s.machineIds.forEach((m) => expect(D.machineById[m], `${p.id} step machine ${m}`).toBeDefined()); });
    }
  });
  it("scale models reference products and roles; flow sequences reference zones", () => {
    for (const m of D.factoryScaleModels) {
      expect(D.productById[m.productId]).toBeDefined();
      m.manpower.forEach((h) => expect(D.manpowerRoleById[h.roleId]).toBeDefined());
      const zoneIds = new Set(m.zones.map((z) => z.id));
      m.flowSequence.forEach((z) => expect(zoneIds.has(z), `${m.id} flow ${z}`).toBe(true));
    }
  });
  it("slugs are unique per entity type", () => {
    const uniq = (list: { slug: string }[]) => expect(new Set(list.map((x) => x.slug)).size).toBe(list.length);
    uniq(D.products); uniq(D.components); uniq(D.processes); uniq(D.machines); uniq(D.customerSegments); uniq(D.states); uniq(D.countries); uniq(D.opportunities); uniq(D.researchDocuments); uniq(D.sources);
  });
  it("relationship graph derives a shell -> charcoal -> activated carbon chain", () => {
    const r = D.relationships;
    expect(r.some((x) => x.fromId === "cmp-hard-shell" && x.relation === "PRODUCES" && x.toId === "prd-shell-charcoal")).toBe(true);
    expect(r.some((x) => x.fromId === "prd-shell-charcoal" && x.relation === "PRODUCES" && x.toId === "prd-activated-carbon")).toBe(true);
    expect(r.some((x) => x.fromId === "prd-activated-carbon" && x.relation === "SOLD_TO" && x.toId === "cus-water-treatment")).toBe(true);
  });
  it("verified facts always cite a source; research-required never carries a value", () => {
    const walk = (q: { evidence: string; value?: number; sourceIds?: string[] }, ctx: string) => {
      if (q.evidence === "VERIFIED_FACT") expect(q.sourceIds?.length, `${ctx} verified without source`).toBeTruthy();
      if (q.evidence === "RESEARCH_REQUIRED") expect(q.value, `${ctx} research-required with value`).toBeUndefined();
    };
    for (const p of D.products) {
      [p.capex, p.workingCapital, p.manpower, p.land, p.building, p.shelfLife, p.utilities.power, p.utilities.water, ...p.yieldQuantities, ...p.pricing, ...p.qualityParameters.map((x) => x.quantity)].forEach((q) => walk(q, p.id));
    }
    for (const c of D.components) c.composition.forEach((x) => walk(x.quantity, c.id));
  });
  it("interview framework has at least 100 questions across all stakeholder types", () => {
    expect(D.interviewQuestions.length).toBeGreaterThanOrEqual(100);
    expect(new Set(D.interviewQuestions.map((q) => q.stakeholder)).size).toBe(10);
  });
  it("gap engine produces coverage numbers", () => {
    const reports = [...D.products.map(productGapReport), ...D.components.map(componentGapReport)];
    const agg = aggregateCoverage(reports);
    expect(agg.totalFields).toBeGreaterThan(0);
    expect(agg.coveragePct).toBeGreaterThan(0);
    expect(agg.coveragePct).toBeLessThanOrEqual(100);
    const dc = productGapReport(D.productById["prd-desiccated-coconut"]);
    expect(dc.requiringQuotation).toContain("CAPEX (current machinery quotation)");
    expect(dc.fields.find((f) => f.field === "Selling price")!.status).toBe("RESEARCH_REQUIRED");
  });
});
