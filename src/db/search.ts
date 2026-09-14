import { sql, inArray, and } from "drizzle-orm";
import { getDb } from "./read";
import { searchIndex } from "./schema";

/**
 * Postgres full-text search over `search_index` (tsvector, GIN). Used by src/services/search.ts when
 * DATABASE_URL is set; the service falls back to the in-memory index on any error or empty table.
 * Ranking: ts_rank_cd on weighted tsv (A name, B group+keywords, C summary), prefix matching per term,
 * then a light type bias so components/products surface first (same policy as the in-memory scorer).
 */
export interface DbSearchRow { id: string; type: string; typeLabel: string; name: string; slug: string; href: string; summary: string; keywords: string; group: string; rank: number }

function toTsQuery(q: string): string {
  // "coir pith" → "coir:* & pith:*" — prefix match on every term, safe-quoted
  return q.toLowerCase().split(/\s+/).filter(Boolean).map((t) => `'${t.replace(/['\\:&|!()<>]/g, "")}':*`).filter((t) => t.length > 4).join(" & ");
}

export async function dbSearch(query: string, types?: string[], limit = 50): Promise<DbSearchRow[]> {
  const tsq = toTsQuery(query);
  if (!tsq) return [];
  const db = getDb();
  const match = sql`${searchIndex.tsv} @@ to_tsquery('english', ${tsq})`;
  const where = types?.length ? and(match, inArray(searchIndex.type, types)) : match;
  const rank = sql<number>`ts_rank_cd(${searchIndex.tsv}, to_tsquery('english', ${tsq})) + case ${searchIndex.type} when 'component' then 0.12 when 'product' then 0.10 else 0 end`;
  const rows = await db.select({ id: searchIndex.id, type: searchIndex.type, typeLabel: searchIndex.typeLabel, name: searchIndex.name, slug: searchIndex.slug, href: searchIndex.href, summary: searchIndex.summary, keywords: searchIndex.keywords, group: searchIndex.group, rank }).from(searchIndex).where(where).orderBy(sql`${rank} desc`, searchIndex.name).limit(limit);
  return rows.map((r) => ({ ...r, rank: Number(r.rank) }));
}

export async function dbAutocomplete(prefix: string, limit = 8): Promise<{ name: string; href: string; typeLabel: string }[]> {
  const db = getDb();
  const p = `%${prefix.toLowerCase()}%`;
  const starts = `${prefix.toLowerCase()}%`;
  return db.select({ name: searchIndex.name, href: searchIndex.href, typeLabel: searchIndex.typeLabel }).from(searchIndex)
    .where(sql`lower(${searchIndex.name}) like ${p}`)
    .orderBy(sql`case when lower(${searchIndex.name}) like ${starts} then 0 else 1 end`, searchIndex.name).limit(limit);
}

/** Replace the whole index (idempotent; used by the seed script). */
export async function rebuildSearchIndex(docs: Omit<DbSearchRow, "rank">[]) {
  const db = getDb();
  for (const d of docs) {
    await db.insert(searchIndex).values({ ...d, updatedAt: new Date() }).onConflictDoUpdate({ target: searchIndex.id, set: { ...d, updatedAt: new Date() } });
  }
  const ids = docs.map((d) => d.id);
  if (ids.length) await db.delete(searchIndex).where(sql`${searchIndex.id} not in ${ids}`);
}
