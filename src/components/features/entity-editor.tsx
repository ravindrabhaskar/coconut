"use client";

import { useState, useTransition } from "react";
import { saveEntity, type SaveResult } from "@/app/admin/actions";
import { Badge, Button, cx } from "@/components/ui/primitives";

/** JSON document editor for an entity. Validates base fields client-side; the server action persists to Postgres. */
export function EntityEditor({ table, initial, readOnly }: { table: string; initial: Record<string, unknown> | null; readOnly: boolean }) {
  const [json, setJson] = useState(JSON.stringify(initial ?? { id: `${table.slice(0, 3)}-new`, name: "", slug: "", summary: "", status: "draft" }, null, 2));
  const [result, setResult] = useState<SaveResult | null>(null);
  const [pending, start] = useTransition();
  let parsed: Record<string, unknown> | null = null; let parseError = "";
  try { parsed = JSON.parse(json); } catch (e) { parseError = (e as Error).message; }
  const status = (parsed?.status as string) ?? "published";
  const setStatus = (s: string) => { if (parsed) setJson(JSON.stringify({ ...parsed, status: s }, null, 2)); };
  const setVerified = () => { if (parsed) setJson(JSON.stringify({ ...parsed, lastVerifiedAt: new Date().toISOString().slice(0, 10) }, null, 2)); };
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="t-overline text-neutral-500 mr-2">Status</span>
        {["draft", "published", "archived"].map((s) => <button key={s} onClick={() => setStatus(s)} className={cx("tap rounded-full border px-3 py-1 text-[0.75rem] font-semibold", status === s ? "bg-coconut-950 text-ivory-50 border-coconut-950" : "border-neutral-300")}>{s}</button>)}
        <button onClick={setVerified} className="tap ml-4 rounded-full border border-leaf-500 px-3 py-1 text-[0.75rem] font-semibold text-leaf-500">Set last verified = today</button>
        {parseError && <Badge tone="danger">JSON error: {parseError.slice(0, 60)}</Badge>}
      </div>
      <textarea value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} rows={28} className="t-data w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white p-3 text-[0.78rem] leading-relaxed" aria-label="Entity JSON" />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button disabled={readOnly || !!parseError || pending} onClick={() => start(async () => setResult(await saveEntity(table, json)))}>{pending ? "Saving…" : "Save to database"}</Button>
        {readOnly && <span className="t-caption">Read-only: DATABASE_URL not configured.</span>}
        {result && <span className={cx("text-[0.85rem]", result.ok ? "text-leaf-500" : "text-danger")}>{result.message}</span>}
      </div>
      <p className="t-caption mt-3">Quantities must keep the shape {"{ value?, unit, evidence, sourceIds?, researchedAt?, lastVerifiedAt?, formula?, notes? }"}. Set evidence to VERIFIED_FACT only with a sourceId and a lastVerifiedAt date. Relationship edges (component → product, product → process/machine/customer/certification/regulation/country/risk) are derived from the id arrays in this document.</p>
    </div>
  );
}
