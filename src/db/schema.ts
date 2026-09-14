/**
 * Drizzle schema (PostgreSQL).
 *
 * Design: every entity table carries the common BaseEntity columns as first-class relational columns
 * (id, name, slug, summary, status, timestamps, last_verified_at) plus a typed JSONB `data` document that
 * holds the full entity shape defined in src/domain/types.ts. Edges live in `relationships`; evidence in
 * `evidence_records`; full-text search in `search_index`. This keeps the graph relational and queryable
 * while allowing the rich nested content (quantities with provenance) to evolve without migrations.
 */

import { pgTable, text, timestamp, jsonb, integer, index, uniqueIndex, pgEnum, real, customType } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/** Postgres tsvector column (Drizzle has no built-in type). */
const tsvector = customType<{ data: string }>({ dataType() { return "tsvector"; } });

export const entityStatus = pgEnum("entity_status", ["draft", "published", "archived"]);
export const evidenceType = pgEnum("evidence_type", ["VERIFIED_FACT", "SOURCE_BACKED", "ESTIMATE", "ASSUMPTION", "CALCULATED", "EXPERT_JUDGMENT", "RESEARCH_REQUIRED"]);

const baseColumns = {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  summary: text("summary").notNull().default(""),
  status: entityStatus("status").notNull().default("published"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  data: jsonb("data").notNull().$type<Record<string, unknown>>(),
  updatedBy: text("updated_by"),
};

function entityTable(name: string) {
  return pgTable(name, baseColumns, (t) => [uniqueIndex(`${name}_slug_idx`).on(t.slug), index(`${name}_status_idx`).on(t.status)]);
}

export const components = entityTable("components");
export const products = entityTable("products");
export const productCategories = entityTable("product_categories");
export const industries = entityTable("industries");
export const processes = entityTable("processes");
export const processSteps = pgTable("process_steps", {
  id: text("id").primaryKey(), processId: text("process_id").notNull().references(() => processes.id, { onDelete: "cascade" }),
  order: integer("order").notNull(), name: text("name").notNull(), data: jsonb("data").notNull().$type<Record<string, unknown>>(),
}, (t) => [index("process_steps_process_idx").on(t.processId)]);
export const machines = entityTable("machines");
export const machineProductLinks = pgTable("machine_product_links", {
  id: text("id").primaryKey(), machineId: text("machine_id").notNull().references(() => machines.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }), processStage: text("process_stage"),
}, (t) => [index("mpl_machine_idx").on(t.machineId), index("mpl_product_idx").on(t.productId)]);
export const factories = entityTable("factories");
export const factoryZones = entityTable("factory_zones");
export const factoryScaleModels = entityTable("factory_scale_models");
export const rawMaterials = entityTable("raw_materials");
export const supplierCategories = entityTable("supplier_categories");
export const customers = entityTable("customers");
export const customerSegments = entityTable("customer_segments");
export const markets = entityTable("markets");
export const countries = entityTable("countries");
export const states = entityTable("states");
export const locations = entityTable("locations");
export const exports_ = entityTable("exports");
export const regulations = entityTable("regulations");
export const certifications = entityTable("certifications");
export const qualityParameters = entityTable("quality_parameters");
export const packaging = entityTable("packaging");
export const storageRequirements = entityTable("storage_requirements");
export const utilities = entityTable("utilities");
export const manpowerRoles = entityTable("manpower_roles");
export const financialModels = entityTable("financial_models");
export const financialAssumptions = entityTable("financial_assumptions");
export const massBalanceModels = entityTable("mass_balance_models");
export const risks = entityTable("risks");
export const opportunities = entityTable("opportunities");
export const opportunityScores = pgTable("opportunity_scores", {
  id: text("id").primaryKey(), opportunityId: text("opportunity_id").notNull().references(() => opportunities.id, { onDelete: "cascade" }),
  criterion: text("criterion").notNull(), score: real("score").notNull(), weight: real("weight").notNull(), reason: text("reason"), evidence: evidenceType("evidence").notNull(),
}, (t) => [index("opp_scores_idx").on(t.opportunityId)]);
export const competitors = entityTable("competitors");
export const sources = entityTable("sources");
export const evidenceRecords = pgTable("evidence_records", {
  id: text("id").primaryKey(), entityType: text("entity_type").notNull(), entityId: text("entity_id").notNull(), field: text("field").notNull(),
  value: real("value"), unit: text("unit").notNull(), min: real("min"), max: real("max"), currency: text("currency"), geography: text("geography"), scale: text("scale"),
  basis: text("basis"), evidence: evidenceType("evidence").notNull(), sourceIds: jsonb("source_ids").$type<string[]>(), publishedAt: timestamp("published_at"),
  researchedAt: timestamp("researched_at"), lastVerifiedAt: timestamp("last_verified_at"), formula: text("formula"), notes: text("notes"), confidence: text("confidence"), year: integer("year"),
}, (t) => [index("evidence_entity_idx").on(t.entityType, t.entityId)]);
export const researchDocuments = entityTable("research_documents");
export const researchNotes = entityTable("research_notes");
export const visualAssets = entityTable("visual_assets");
export const fieldInterviews = pgTable("field_interviews", {
  id: text("id").primaryKey(), stakeholder: text("stakeholder").notNull(), participantType: text("participant_type"), date: timestamp("date"), location: text("location"),
  completed: integer("completed").notNull().default(0), notes: text("notes"), tags: jsonb("tags").$type<string[]>(), answers: jsonb("answers").$type<Record<string, string>>(),
  sourceReference: text("source_reference"), createdAt: timestamp("created_at").defaultNow(), createdBy: text("created_by"),
});
export const roadmapTasks = entityTable("roadmap_tasks");
export const technologies = entityTable("technologies");
export const valueChainNodes = entityTable("value_chain_nodes");
export const machineQuotations = entityTable("machine_quotations");
export const governmentSchemes = entityTable("government_schemes");
export const priceRecords = entityTable("price_records");
export const relationships = pgTable("relationships", {
  id: text("id").primaryKey(), fromType: text("from_type").notNull(), fromId: text("from_id").notNull(), relation: text("relation").notNull(),
  toType: text("to_type").notNull(), toId: text("to_id").notNull(), note: text("note"), evidence: evidenceType("evidence"), order: integer("order"),
}, (t) => [index("rel_from_idx").on(t.fromType, t.fromId), index("rel_to_idx").on(t.toType, t.toId), index("rel_relation_idx").on(t.relation)]);
/**
 * Full-text search index — one row per searchable entity, mirrored from the in-memory SearchDoc shape
 * (src/services/search.ts). `tsv` is a stored generated column (english config) with weights:
 * A = name, B = group/keywords, C = summary. Rebuilt by `pnpm seed`; queried via src/db/search.ts.
 */
export const searchIndex = pgTable("search_index", {
  id: text("id").primaryKey(), type: text("type").notNull(), typeLabel: text("type_label").notNull(), name: text("name").notNull(), slug: text("slug").notNull(),
  href: text("href").notNull(), summary: text("summary").notNull().default(""), keywords: text("keywords").notNull().default(""), group: text("group").notNull().default(""),
  tsv: tsvector("tsv").generatedAlwaysAs(sql`setweight(to_tsvector('english', coalesce(name, '')), 'A') || setweight(to_tsvector('english', coalesce("group", '') || ' ' || coalesce(keywords, '')), 'B') || setweight(to_tsvector('english', coalesce(summary, '')), 'C')`),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [index("search_tsv_idx").using("gin", t.tsv), index("search_type_idx").on(t.type)]);

export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey(), table: text("table").notNull(), entityId: text("entity_id").notNull(), action: text("action").notNull(),
  actor: text("actor"), at: timestamp("at").defaultNow(), diff: jsonb("diff"),
});

export const ENTITY_TABLES = {
  components, products, product_categories: productCategories, industries, processes, machines, factories, factory_zones: factoryZones,
  factory_scale_models: factoryScaleModels, raw_materials: rawMaterials, supplier_categories: supplierCategories, customers, customer_segments: customerSegments,
  markets, countries, states, locations, exports: exports_, regulations, certifications, quality_parameters: qualityParameters, packaging,
  storage_requirements: storageRequirements, utilities, manpower_roles: manpowerRoles, financial_models: financialModels, financial_assumptions: financialAssumptions,
  mass_balance_models: massBalanceModels, risks, opportunities, competitors, sources, research_documents: researchDocuments, research_notes: researchNotes,
  visual_assets: visualAssets, roadmap_tasks: roadmapTasks, technologies, value_chain_nodes: valueChainNodes,
  machine_quotations: machineQuotations, government_schemes: governmentSchemes, price_records: priceRecords,
} as const;

export type EntityTableName = keyof typeof ENTITY_TABLES;
