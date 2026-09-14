/**
 * Repository — the ONLY module page code imports data from.
 *
 * Data source selection:
 *  - DATABASE_URL set  → Postgres via Drizzle (src/db) — reads published rows; falls back to static per-entity
 *    when a table is empty (so the site never renders blank while the DB is being populated).
 *  - otherwise         → typed static content modules in src/data (identical shapes).
 *
 * All functions are async so the source can be swapped without touching callers.
 */

import * as D from "@/data";
import type {
  Component, Product, Process, Machine, CustomerSegment, Country, StateProfile, Regulation, Certification, Risk, Opportunity,
  Source, ResearchDocument, VisualAsset, FactoryScaleModel, MassBalanceModel, Technology, ValueChainNode, Industry, ProductCategory,
  BusinessLevel, InterviewQuestion, RoadmapTask, ManpowerRole, Relationship, EntityType, GovernmentScheme, PriceRecord, MachineQuotation,
} from "@/domain/types";

export const dataSourceMode = (): "postgres" | "static" => (process.env.DATABASE_URL ? "postgres" : "static");

async function fromDb<T>(table: string, fallback: T[]): Promise<T[]> {
  if (!process.env.DATABASE_URL) return fallback;
  try {
    const { readEntities } = await import("@/db/read");
    const rows = await readEntities<T>(table);
    return rows.length ? rows : fallback;
  } catch {
    return fallback;
  }
}

const published = <T extends { status?: string }>(list: T[]) => list.filter((x) => x.status !== "archived");

export const repo = {
  components: async (): Promise<Component[]> => published(await fromDb("components", D.components)),
  componentBySlug: async (slug: string) => (await repo.components()).find((c) => c.slug === slug) ?? null,
  componentById: async (id: string) => (await repo.components()).find((c) => c.id === id) ?? null,

  products: async (): Promise<Product[]> => published(await fromDb("products", D.products)),
  productBySlug: async (slug: string) => (await repo.products()).find((p) => p.slug === slug) ?? null,
  productById: async (id: string) => (await repo.products()).find((p) => p.id === id) ?? null,
  productsByComponent: async (componentId: string) => (await repo.products()).filter((p) => p.sourceComponentIds.includes(componentId)),
  productsByCategory: async (categoryId: string) => (await repo.products()).filter((p) => p.categoryId === categoryId),

  processes: async (): Promise<Process[]> => published(await fromDb("processes", D.processes)),
  processBySlug: async (slug: string) => (await repo.processes()).find((p) => p.slug === slug) ?? null,
  processById: async (id: string) => (await repo.processes()).find((p) => p.id === id) ?? null,

  machines: async (): Promise<Machine[]> => published(await fromDb("machines", D.machines)),
  machineBySlug: async (slug: string) => (await repo.machines()).find((m) => m.slug === slug) ?? null,
  machineById: async (id: string) => (await repo.machines()).find((m) => m.id === id) ?? null,

  customerSegments: async (): Promise<CustomerSegment[]> => published(await fromDb("customer_segments", D.customerSegments)),
  customerBySlug: async (slug: string) => (await repo.customerSegments()).find((c) => c.slug === slug) ?? null,
  countries: async (): Promise<Country[]> => published(await fromDb("countries", D.countries)),
  countryBySlug: async (slug: string) => (await repo.countries()).find((c) => c.slug === slug) ?? null,
  states: async (): Promise<StateProfile[]> => published(await fromDb("states", D.states)),
  stateBySlug: async (slug: string) => (await repo.states()).find((s) => s.slug === slug) ?? null,
  regulations: async (): Promise<Regulation[]> => published(await fromDb("regulations", D.regulations)),
  certifications: async (): Promise<Certification[]> => published(await fromDb("certifications", D.certifications)),
  risks: async (): Promise<Risk[]> => published(await fromDb("risks", D.risks)),
  opportunities: async (): Promise<Opportunity[]> => published(await fromDb("opportunities", D.opportunities)),
  opportunityBySlug: async (slug: string) => (await repo.opportunities()).find((o) => o.slug === slug) ?? null,
  opportunityById: async (id: string) => (await repo.opportunities()).find((o) => o.id === id) ?? null,
  sources: async (): Promise<Source[]> => published(await fromDb("sources", D.sources)),
  sourceBySlug: async (slug: string) => (await repo.sources()).find((s) => s.slug === slug) ?? null,
  research: async (): Promise<ResearchDocument[]> => published(await fromDb("research_documents", D.researchDocuments)),
  researchBySlug: async (slug: string) => (await repo.research()).find((r) => r.slug === slug) ?? null,
  assets: async (): Promise<VisualAsset[]> => await fromDb("visual_assets", D.visualAssets),
  assetById: async (id: string) => (await repo.assets()).find((a) => a.id === id) ?? null,
  scaleModels: async (): Promise<FactoryScaleModel[]> => await fromDb("factory_scale_models", D.factoryScaleModels),
  scaleModelsForProduct: async (productId: string) => (await repo.scaleModels()).filter((m) => m.productId === productId),
  scaleModelById: async (id: string) => (await repo.scaleModels()).find((m) => m.id === id) ?? null,
  massBalanceModels: async (): Promise<MassBalanceModel[]> => await fromDb("mass_balance_models", D.massBalanceModels),
  technologies: async (): Promise<Technology[]> => await fromDb("technologies", D.technologies),
  schemes: async (): Promise<GovernmentScheme[]> => published(await fromDb("government_schemes", D.governmentSchemes)),
  schemeBySlug: async (slug: string) => (await repo.schemes()).find((s) => s.slug === slug) ?? null,
  prices: async (): Promise<PriceRecord[]> => await fromDb("price_records", D.priceRecords),
  quotations: async (): Promise<MachineQuotation[]> => await fromDb("machine_quotations", D.machineQuotations),
  quotationsForMachine: async (machineId: string) => (await repo.quotations()).filter((q) => q.machineId === machineId),
  valueChain: async (): Promise<ValueChainNode[]> => D.valueChainNodes,
  industries: async (): Promise<Industry[]> => D.industries,
  categories: async (): Promise<ProductCategory[]> => D.productCategories,
  businessLevels: async (): Promise<BusinessLevel[]> => D.businessLevels,
  interviewQuestions: async (): Promise<InterviewQuestion[]> => D.interviewQuestions,
  roadmapTasks: async (): Promise<RoadmapTask[]> => D.roadmapTasks,
  manpowerRoles: async (): Promise<ManpowerRole[]> => D.manpowerRoles,
  relationships: async (): Promise<Relationship[]> => D.relationships,

  /** Generic lookup used by related-entity blocks and search. */
  entity: async (type: EntityType, id: string): Promise<{ name: string; slug: string; href: string; summary: string } | null> => {
    const map: Partial<Record<EntityType, () => Promise<{ id: string; name: string; slug: string; summary: string }[]>>> = {
      component: repo.components, product: repo.products, process: repo.processes, machine: repo.machines, customer_segment: repo.customerSegments,
      country: repo.countries, state: repo.states, regulation: repo.regulations, certification: repo.certifications, risk: repo.risks,
      opportunity: repo.opportunities, source: repo.sources, research_document: repo.research, industry: repo.industries, product_category: repo.categories,
      government_scheme: repo.schemes,
    };
    const list = await map[type]?.();
    const e = list?.find((x) => x.id === id);
    if (!e) return null;
    return { name: e.name, slug: e.slug, summary: e.summary, href: hrefFor(type, e.slug) };
  },
};

export function hrefFor(type: EntityType | string, slug: string): string {
  switch (type) {
    case "component": return `/explore/${slug}`;
    case "product": return `/products/${slug}`;
    case "process": return `/processing/${slug}`;
    case "machine": return `/machinery/${slug}`;
    case "customer_segment": return `/customers/${slug}`;
    case "country": return `/export/${slug}`;
    case "state": return `/india/${slug}`;
    case "regulation": return `/research/regulations#${slug}`;
    case "certification": return `/research/certifications#${slug}`;
    case "risk": return `/research/risks#${slug}`;
    case "opportunity": return `/opportunities/${slug}`;
    case "source": return `/sources/${slug}`;
    case "research_document": return `/research/${slug}`;
    case "industry": return `/industries/${slug}`;
    case "product_category": return `/products/category/${slug}`;
    case "government_scheme": return `/business/schemes#${slug}`;
    default: return "/";
  }
}
