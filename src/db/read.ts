import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { ENTITY_TABLES, type EntityTableName } from "./schema";

let client: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  if (!client) client = postgres(process.env.DATABASE_URL, { max: 5, prepare: false });
  return drizzle(client);
}

/** Reads published entity documents from a table; the JSONB `data` holds the full typed entity. */
export async function readEntities<T>(table: string): Promise<T[]> {
  const t = ENTITY_TABLES[table as EntityTableName];
  if (!t) return [];
  const db = getDb();
  const rows = await db.select().from(t).where(eq(t.status, "published"));
  return rows.map((r) => ({ ...(r.data as object), id: r.id, name: r.name, slug: r.slug, summary: r.summary, status: r.status, lastVerifiedAt: r.lastVerifiedAt?.toISOString().slice(0, 10) }) as T);
}

export async function upsertEntity(table: EntityTableName, entity: { id: string; name: string; slug: string; summary: string; status?: "draft" | "published" | "archived"; lastVerifiedAt?: string }, actor?: string) {
  const t = ENTITY_TABLES[table];
  const db = getDb();
  const { id, name, slug, summary, status = "published", lastVerifiedAt, ...rest } = entity as Record<string, unknown> & typeof entity;
  await db.insert(t).values({ id, name, slug, summary, status, lastVerifiedAt: lastVerifiedAt ? new Date(lastVerifiedAt) : null, data: rest, updatedBy: actor ?? null })
    .onConflictDoUpdate({ target: t.id, set: { name, slug, summary, status, lastVerifiedAt: lastVerifiedAt ? new Date(lastVerifiedAt) : null, data: rest, updatedAt: new Date(), updatedBy: actor ?? null } });
}
