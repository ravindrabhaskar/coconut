"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { expectedToken } from "@/proxy";

export async function login(formData: FormData) {
  const pw = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  const expected = await expectedToken();
  if (!expected || !process.env.ADMIN_PASSWORD || pw !== process.env.ADMIN_PASSWORD) redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  const store = await cookies();
  store.set("coconut_admin", expected, { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 12 });
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete("coconut_admin");
  redirect("/admin/login");
}

export type SaveResult = { ok: true; message: string } | { ok: false; message: string };

/** Persist an entity document. Requires DATABASE_URL; otherwise reports read-only mode honestly. */
export async function saveEntity(table: string, json: string, actor = "admin"): Promise<SaveResult> {
  if (!process.env.DATABASE_URL) return { ok: false, message: "Static content mode — set DATABASE_URL, run `pnpm db:push` and `pnpm seed` to enable editing. Nothing was written." };
  let doc: Record<string, unknown>;
  try { doc = JSON.parse(json); } catch { return { ok: false, message: "Invalid JSON." }; }
  for (const k of ["id", "name", "slug", "summary"]) if (typeof doc[k] !== "string") return { ok: false, message: `Field "${k}" is required and must be a string.` };
  try {
    const { upsertEntity } = await import("@/db/read");
    const { ENTITY_TABLES } = await import("@/db/schema");
    if (!(table in ENTITY_TABLES)) return { ok: false, message: `Unknown table ${table}` };
    await upsertEntity(table as keyof typeof ENTITY_TABLES, doc as never, actor);
    return { ok: true, message: `Saved ${doc.id} to ${table} (updated_at now; status ${doc.status ?? "published"}).` };
  } catch (e) { return { ok: false, message: (e as Error).message }; }
}
