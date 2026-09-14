import type { Product, Relationship } from "@/domain/types";
import { kernelProducts } from "./products-kernel";
import { huskShellProducts } from "./products-husk-shell";
import { extendedProducts } from "./products-extended";
import { PRODUCT_ENRICHMENT } from "./products-enrichment";
import { DC_STANDARDS, VCO_STANDARDS, COCONUT_OIL_STANDARDS, COCONUT_MILK_STANDARDS, COCONUT_CREAM_STANDARDS, standardSources } from "./standards";
import { sources as baseSources } from "./sources";
import { fieldSources } from "./field-records";
import type { QualityParameter } from "@/domain/types";

export { components, componentById, componentBySlug, explodedComponents } from "./components";
export const sources = [...baseSources, ...standardSources, ...fieldSources];
export const sourceById = Object.fromEntries(sources.map((s) => [s.id, s]));
export { industries, productCategories, businessLevels, valueChainNodes } from "./taxonomy";
export { customerSegments, customerSegmentById, regulations, certifications, risks, riskById, countries, countryById, states, stateById } from "./market";
export { machines, machineById, manpowerRoles, manpowerRoleById } from "./machines";
export { processes, processById } from "./processes";
export { massBalanceModels, massBalanceById, factoryScaleModels, factoryScaleModelById, scaleModelsForProduct } from "./models";
export { opportunities, opportunityById, CRITERIA_WEIGHTS } from "./opportunities";
export { researchDocuments, researchById, technologies } from "./research";
export { interviewQuestions, interviewCount, roadmapTasks } from "./validation";
export { visualAssets, assetById } from "./assets";
export { governmentSchemes, priceRecords, machineQuotations } from "./field-records";

/** Verified regulatory standards (research/standards) supersede estimated rows for the same parameter. */
const STANDARD_OVERRIDES: Record<string, QualityParameter[]> = {
  "prd-desiccated-coconut": DC_STANDARDS, "prd-virgin-coconut-oil": VCO_STANDARDS, "prd-coconut-oil": COCONUT_OIL_STANDARDS,
  "prd-coconut-milk": COCONUT_MILK_STANDARDS, "prd-coconut-cream": COCONUT_CREAM_STANDARDS,
};
const key = (p: string) => p.toLowerCase().split(/[\s(—-]/)[0];
function applyStandards(p: Product): Product {
  const verified = STANDARD_OVERRIDES[p.id];
  if (!verified) return p;
  const covered = new Set(verified.map((v) => key(v.parameter)));
  const kept = p.qualityParameters.filter((q) => !covered.has(key(q.parameter)));
  const regs = new Set([...p.regulationIds, "reg-fss-product-standards"]);
  return { ...p, qualityParameters: [...verified, ...kept], regulationIds: [...regs], sourceIds: [...new Set([...p.sourceIds, ...verified.flatMap((v) => v.quantity.sourceIds ?? [])])] };
}

/** Merge enrichment: arrays appended (de-duplicated by JSON identity), scalars/objects replaced. */
function enrich(p: Product): Product {
  const e = PRODUCT_ENRICHMENT[p.id];
  if (!e) return p;
  const out: Record<string, unknown> = { ...p };
  for (const [k, v] of Object.entries(e)) {
    const cur = (p as unknown as Record<string, unknown>)[k];
    if (Array.isArray(v) && Array.isArray(cur)) {
      const seen = new Set(cur.map((x) => JSON.stringify(x)));
      out[k] = [...cur, ...v.filter((x) => !seen.has(JSON.stringify(x)))];
    } else out[k] = v;
  }
  return out as unknown as Product;
}

export const products: Product[] = [...kernelProducts, ...huskShellProducts, ...extendedProducts].map(enrich).map(applyStandards);
export const productById: Record<string, Product> = Object.fromEntries(products.map((p) => [p.id, p]));
export const productBySlug: Record<string, Product> = Object.fromEntries(products.map((p) => [p.slug, p]));

/**
 * Relationship graph — derived from entity fields so that UI never hard-codes edges.
 * Adding a product with sourceComponentIds/processIds/customers etc. automatically creates edges.
 */
export function buildRelationships(): Relationship[] {
  const rels: Relationship[] = [];
  let i = 0;
  const add = (r: Omit<Relationship, "id">) => rels.push({ id: `rel-${++i}`, ...r });
  for (const p of products) {
    p.sourceComponentIds.forEach((c, order) => add({ fromType: "component", fromId: c, relation: "PRODUCES", toType: "product", toId: p.id, order }));
    (p.intermediateProductIds ?? []).forEach((ip) => add({ fromType: "product", fromId: ip, relation: "PRODUCES", toType: "product", toId: p.id }));
    p.processIds.forEach((pr) => add({ fromType: "product", fromId: p.id, relation: "REQUIRES_PROCESS", toType: "process", toId: pr }));
    p.machineIds.forEach((m) => add({ fromType: "product", fromId: p.id, relation: "REQUIRES_MACHINE", toType: "machine", toId: m }));
    p.customers.forEach((c) => add({ fromType: "product", fromId: p.id, relation: "SOLD_TO", toType: "customer_segment", toId: c.customerSegmentId }));
    p.certificationIds.forEach((c) => add({ fromType: "product", fromId: p.id, relation: "REQUIRES_CERT", toType: "certification", toId: c }));
    p.regulationIds.forEach((r) => add({ fromType: "product", fromId: p.id, relation: "GOVERNED_BY", toType: "regulation", toId: r }));
    p.exportCountryIds.forEach((c) => add({ fromType: "product", fromId: p.id, relation: "EXPORTED_TO", toType: "country", toId: c }));
    p.risks.forEach((r) => add({ fromType: "product", fromId: p.id, relation: "HAS_RISK", toType: "risk", toId: r.riskId }));
    p.industryIds.forEach((ind) => add({ fromType: "product", fromId: p.id, relation: "BELONGS_TO_INDUSTRY", toType: "industry", toId: ind }));
    add({ fromType: "product", fromId: p.id, relation: "IN_CATEGORY", toType: "product_category", toId: p.categoryId });
    if (p.opportunityId) add({ fromType: "product", fromId: p.id, relation: "HAS_OPPORTUNITY", toType: "opportunity", toId: p.opportunityId });
    p.researchDocumentIds.forEach((rd) => add({ fromType: "product", fromId: p.id, relation: "RELATED_RESEARCH", toType: "research_document", toId: rd }));
    p.sourceIds.forEach((s) => add({ fromType: "product", fromId: p.id, relation: "CITED_BY", toType: "source", toId: s }));
    p.byProducts.forEach((b) => { if (b.productId) add({ fromType: "product", fromId: p.id, relation: "YIELDS_BYPRODUCT", toType: "product", toId: b.productId }); });
  }
  return rels;
}

export const relationships = buildRelationships();
