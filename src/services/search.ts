/**
 * Global search — builds a lightweight in-memory index across entity types with weighted relevance,
 * prefix autocomplete and type filters. When DATABASE_URL is set, queries go to Postgres full-text search
 * (search_index.tsv, GIN — see src/db/search.ts) and fall back to the in-memory index on error/empty results.
 */

import { repo, hrefFor } from "./repository";
import type { EntityType } from "@/domain/types";

export interface SearchDoc {
  id: string;
  type: EntityType;
  typeLabel: string;
  name: string;
  slug: string;
  href: string;
  summary: string;
  keywords: string;
  group: string; // display grouping e.g. "Hard Shell → Products"
}

export interface SearchResult extends SearchDoc { score: number; matched: string[] }

const TYPE_LABEL: Partial<Record<EntityType, string>> = {
  component: "Component", product: "Product", process: "Process", machine: "Machine", customer_segment: "Customer", country: "Export market",
  state: "State", regulation: "Regulation", certification: "Certification", risk: "Risk", opportunity: "Opportunity", source: "Source",
  research_document: "Research", industry: "Industry", product_category: "Category",
};

let cache: SearchDoc[] | null = null;

export async function buildIndex(): Promise<SearchDoc[]> {
  if (cache) return cache;
  const [components, products, processes, machines, customers, countries, states, regs, certs, risks, opps, sources, research, industries] = await Promise.all([
    repo.components(), repo.products(), repo.processes(), repo.machines(), repo.customerSegments(), repo.countries(), repo.states(), repo.regulations(),
    repo.certifications(), repo.risks(), repo.opportunities(), repo.sources(), repo.research(), repo.industries(),
  ]);
  const compName = (id: string) => components.find((c) => c.id === id)?.name ?? "";
  const docs: SearchDoc[] = [];
  const push = (type: EntityType, e: { id: string; name: string; slug: string; summary: string }, keywords: string, group: string) =>
    docs.push({ id: e.id, type, typeLabel: TYPE_LABEL[type] ?? type, name: e.name, slug: e.slug, href: hrefFor(type, e.slug), summary: e.summary, keywords: keywords.toLowerCase(), group });

  components.forEach((c) => push("component", c, [c.scientificName, ...c.commonNames, ...c.applications].join(" "), "Coconut"));
  products.forEach((p) => push("product", p, [p.technicalName, ...p.useCases, ...p.sourceComponentIds.map(compName), ...p.marketTags, "economics", "manufacturing", "export"].join(" "), p.sourceComponentIds.map(compName).join(", ")));
  processes.forEach((p) => push("process", p, p.steps.map((s) => s.name).join(" ") + " processing manufacturing", "Manufacturing"));
  machines.forEach((m) => push("machine", m, [m.category, m.processStage, m.rawMaterialInput, m.output, "machinery"].join(" "), "Machinery"));
  customers.forEach((c) => push("customer_segment", c, [c.kind, ...c.whatTheyBuy].join(" "), "Customers"));
  countries.forEach((c) => push("country", c, c.region + " export", "Export"));
  states.forEach((s) => push("state", s, "india location factory " + s.processingEcosystem.join(" "), "India"));
  regs.forEach((r) => push("regulation", r, r.authority + " " + r.scope.join(" "), "Regulation"));
  certs.forEach((c) => push("certification", c, c.issuer + " " + c.typicalFor.join(" "), "Certification"));
  risks.forEach((r) => push("risk", r, r.category, "Risk"));
  opps.forEach((o) => push("opportunity", o, o.businessModel + " business opportunity", "Opportunities"));
  sources.forEach((s) => push("source", s, s.organisation + " " + s.sourceType, "Sources"));
  research.forEach((r) => push("research_document", r, r.tags.join(" "), "Research"));
  industries.forEach((i) => push("industry", i, "industry", "Industries"));
  cache = docs;
  return docs;
}

export async function search(query: string, opts: { types?: EntityType[]; limit?: number } = {}): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  if (process.env.DATABASE_URL) {
    try {
      const { dbSearch } = await import("@/db/search");
      const rows = await dbSearch(q, opts.types, opts.limit ?? 50);
      if (rows.length) return rows.map((r) => ({ id: r.id, type: r.type as EntityType, typeLabel: r.typeLabel, name: r.name, slug: r.slug, href: r.href, summary: r.summary, keywords: r.keywords, group: r.group, score: Math.round(r.rank * 100), matched: ["fulltext"] }));
    } catch { /* fall through to in-memory index */ }
  }
  return searchInMemory(q, opts);
}

export async function searchInMemory(q: string, opts: { types?: EntityType[]; limit?: number } = {}): Promise<SearchResult[]> {
  const terms = q.split(/\s+/).filter(Boolean);
  const docs = await buildIndex();
  const results: SearchResult[] = [];
  for (const d of docs) {
    if (opts.types && !opts.types.includes(d.type)) continue;
    const name = d.name.toLowerCase();
    const summary = d.summary.toLowerCase();
    let score = 0;
    const matched: string[] = [];
    for (const t of terms) {
      if (name === t) { score += 100; matched.push("name"); }
      else if (name.startsWith(t)) { score += 60; matched.push("name"); }
      else if (name.includes(t)) { score += 40; matched.push("name"); }
      if (d.group.toLowerCase().includes(t)) { score += 30; matched.push("component"); }
      if (d.keywords.includes(t)) { score += 15; matched.push("keywords"); }
      if (summary.includes(t)) { score += 8; matched.push("summary"); }
    }
    if (score > 0) {
      // type weighting: components and products surface first
      if (d.type === "component") score += 12;
      if (d.type === "product") score += 10;
      results.push({ ...d, score, matched: [...new Set(matched)] });
    }
  }
  results.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return results.slice(0, opts.limit ?? 50);
}

export async function autocomplete(prefix: string, limit = 8): Promise<{ name: string; href: string; typeLabel: string }[]> {
  const q = prefix.trim().toLowerCase();
  if (q.length < 2) return [];
  if (process.env.DATABASE_URL) {
    try { const { dbAutocomplete } = await import("@/db/search"); const rows = await dbAutocomplete(q, limit); if (rows.length) return rows; } catch { /* fall back */ }
  }
  const docs = await buildIndex();
  return docs.filter((d) => d.name.toLowerCase().includes(q)).sort((a, b) => (a.name.toLowerCase().startsWith(q) ? -1 : 1) - (b.name.toLowerCase().startsWith(q) ? -1 : 1)).slice(0, limit).map((d) => ({ name: d.name, href: d.href, typeLabel: d.typeLabel }));
}
