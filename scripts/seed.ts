/**
 * Seed Postgres from the typed static content in src/data.
 * Usage: DATABASE_URL=postgres://... pnpm seed
 * Idempotent (upsert by id). Run `pnpm db:push` first to create tables.
 */
import "dotenv/config";
import * as D from "../src/data";
import { upsertEntity, getDb } from "../src/db/read";
import { rebuildSearchIndex } from "../src/db/search";
import { buildIndex } from "../src/services/search";
import { relationships as relTable, opportunityScores, evidenceRecords, processSteps, machineProductLinks } from "../src/db/schema";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL");
  const db = getDb();
  const run = async <T extends { id: string; name: string; slug: string; summary: string }>(table: Parameters<typeof upsertEntity>[0], list: T[]) => {
    for (const e of list) await upsertEntity(table, e, "seed");
    console.log(`✓ ${table}: ${list.length}`);
  };
  await run("components", D.components);
  await run("products", D.products);
  await run("product_categories", D.productCategories);
  await run("industries", D.industries);
  await run("processes", D.processes);
  await run("machines", D.machines);
  await run("factory_scale_models", D.factoryScaleModels);
  await run("customer_segments", D.customerSegments);
  await run("countries", D.countries);
  await run("states", D.states);
  await run("regulations", D.regulations);
  await run("certifications", D.certifications);
  await run("manpower_roles", D.manpowerRoles);
  await run("mass_balance_models", D.massBalanceModels);
  await run("risks", D.risks);
  await run("opportunities", D.opportunities);
  await run("sources", D.sources);
  await run("research_documents", D.researchDocuments);
  await run("visual_assets", D.visualAssets);
  await run("technologies", D.technologies);
  await run("value_chain_nodes", D.valueChainNodes);
  await run("government_schemes", D.governmentSchemes);
  await run("price_records", D.priceRecords);
  await run("machine_quotations", D.machineQuotations);

  for (const p of D.processes) for (const s of p.steps) await db.insert(processSteps).values({ id: s.id, processId: p.id, order: s.order, name: s.name, data: s as unknown as Record<string, unknown> }).onConflictDoNothing();
  for (const m of D.machines) for (const pid of m.productIds) await db.insert(machineProductLinks).values({ id: `${m.id}__${pid}`, machineId: m.id, productId: pid, processStage: m.processStage }).onConflictDoNothing();
  for (const o of D.opportunities) for (const c of o.criteria) await db.insert(opportunityScores).values({ id: `${o.id}__${c.criterion}`, opportunityId: o.id, criterion: c.criterion, score: c.score, weight: c.weight, reason: c.reason, evidence: c.evidence }).onConflictDoNothing();
  for (const r of D.relationships) await db.insert(relTable).values({ id: r.id, fromType: r.fromType, fromId: r.fromId, relation: r.relation, toType: r.toType, toId: r.toId, note: r.note, evidence: r.evidence, order: r.order }).onConflictDoNothing();
  // Evidence records for product quantities (flattened for querying)
  for (const p of D.products) {
    const entries: [string, typeof p.capex][] = [["capex", p.capex], ["workingCapital", p.workingCapital], ["manpower", p.manpower], ["land", p.land], ["building", p.building], ["shelfLife", p.shelfLife], ["power", p.utilities.power], ["water", p.utilities.water], ...p.yieldQuantities.map((q, i) => [`yield_${i}`, q] as [string, typeof q]), ...p.pricing.map((q, i) => [`price_${i}`, q] as [string, typeof q])];
    for (const [field, q] of entries) {
      await db.insert(evidenceRecords).values({ id: `${p.id}__${field}`, entityType: "product", entityId: p.id, field, value: q.value ?? null, unit: q.unit, min: q.min ?? null, max: q.max ?? null, currency: q.currency ?? null, geography: q.geography ?? null, scale: q.scale ?? null, basis: q.basis ?? null, evidence: q.evidence, sourceIds: q.sourceIds ?? [], researchedAt: q.researchedAt ? new Date(q.researchedAt) : null, lastVerifiedAt: q.lastVerifiedAt ? new Date(q.lastVerifiedAt) : null, formula: q.formula ?? null, notes: q.notes ?? null, confidence: q.confidence ?? null, year: q.year ?? null }).onConflictDoNothing();
    }
  }
  console.log("✓ relationships, steps, links, scores, evidence");
  const docs = await buildIndex();
  await rebuildSearchIndex(docs);
  console.log(`✓ search_index: ${docs.length} documents (tsvector)`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
