"use client";

import { useMemo, useState } from "react";
import { useLocalStorage } from "@/lib/hooks";
import type { InterviewQuestion, StakeholderType } from "@/domain/types";
import { Badge, cx } from "@/components/ui/primitives";

interface InterviewRecord { id: string; stakeholder: StakeholderType; date: string; location: string; participantType: string; completed: boolean; notes: string; evidence: string; sourceRef: string; tags: string; answers: Record<string, string> }

const LABEL: Record<StakeholderType, string> = { farmer: "Farmers", trader: "Traders", collection_centre: "Collection centres", factory_owner: "Factory owners", processor: "Processors", customer: "Customers", retailer: "Retailers", distributor: "Distributors", exporter: "Exporters", machinery_supplier: "Machinery suppliers" };
const KEY = "coconut.fieldInterviews.v1";

/**
 * Field validation module. Interview framework from the database; captured interviews persist locally (browser)
 * and can be exported as JSON for import into the admin layer / database. No server round-trip is required.
 */
export function FieldValidation({ questions }: { questions: InterviewQuestion[] }) {
  const [stakeholder, setStakeholder] = useState<StakeholderType>("farmer");
  const [raw, setRaw] = useLocalStorage(KEY, "[]");
  const records = useMemo<InterviewRecord[]>(() => { try { return JSON.parse(raw); } catch { return []; } }, [raw]);
  const [active, setActive] = useState<string | null>(null);
  const persist = (r: InterviewRecord[]) => setRaw(JSON.stringify(r));
  const qs = useMemo(() => questions.filter((q) => q.stakeholder === stakeholder), [questions, stakeholder]);
  const rec = records.find((r) => r.id === active);
  const newRecord = () => { const r: InterviewRecord = { id: `int-${Date.now()}`, stakeholder, date: new Date().toISOString().slice(0, 10), location: "", participantType: LABEL[stakeholder], completed: false, notes: "", evidence: "", sourceRef: "", tags: "", answers: {} }; persist([r, ...records]); setActive(r.id); };
  const update = (patch: Partial<InterviewRecord>) => { if (!rec) return; persist(records.map((r) => (r.id === rec.id ? { ...r, ...patch } : r))); };
  const exportJson = () => { const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "field-interviews.json"; a.click(); };
  const counts = Object.fromEntries((Object.keys(LABEL) as StakeholderType[]).map((k) => [k, questions.filter((q) => q.stakeholder === k).length]));
  const inp = "tap w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 py-2 text-[0.9rem]";
  return (
    <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
      <aside>
        <p className="t-overline text-neutral-500 mb-2">Stakeholders ({questions.length} questions)</p>
        <ul className="space-y-1">{(Object.keys(LABEL) as StakeholderType[]).map((k) => <li key={k}><button onClick={() => { setStakeholder(k); setActive(null); }} aria-pressed={stakeholder === k} className={cx("tap flex w-full items-center justify-between rounded-[var(--radius-control)] px-3 py-2 text-left text-[0.9rem]", stakeholder === k ? "bg-coconut-950 text-ivory-50" : "hover:bg-neutral-100")}><span>{LABEL[k]}</span><span className="t-data opacity-70">{counts[k]} · {records.filter((r) => r.stakeholder === k && r.completed).length}✓</span></button></li>)}</ul>
        <div className="mt-6 flex flex-col gap-2"><button onClick={newRecord} className="tap rounded-[var(--radius-control)] bg-leaf-500 px-4 py-2.5 text-cocos t-cta text-xs">New {LABEL[stakeholder].replace(/s$/, "")} interview</button><button onClick={exportJson} disabled={!records.length} className="tap rounded-[var(--radius-control)] border border-neutral-300 px-4 py-2.5 t-cta text-xs disabled:opacity-40">Export {records.length} records (JSON)</button></div>
        <p className="t-caption mt-3">Captured interviews are stored in this browser only until exported and imported via the admin layer.</p>
        {records.filter((r) => r.stakeholder === stakeholder).length > 0 && <ul className="mt-6 space-y-1">{records.filter((r) => r.stakeholder === stakeholder).map((r) => <li key={r.id}><button onClick={() => setActive(r.id)} className={cx("tap w-full rounded px-2 py-1.5 text-left text-[0.82rem]", active === r.id ? "bg-neutral-100" : "hover:bg-neutral-50")}>{r.completed ? "✓" : "○"} {r.date} {r.location || "(no location)"}</button></li>)}</ul>}
      </aside>
      <div>
        {rec ? (
          <div>
            <div className="grid gap-3 sm:grid-cols-4"><label className="block"><span className="t-caption">Date</span><input type="date" className={inp} value={rec.date} onChange={(e) => update({ date: e.target.value })} /></label><label className="block"><span className="t-caption">Location</span><input className={inp} value={rec.location} onChange={(e) => update({ location: e.target.value })} /></label><label className="block"><span className="t-caption">Participant type</span><input className={inp} value={rec.participantType} onChange={(e) => update({ participantType: e.target.value })} /></label><label className="flex items-end gap-2 pb-2"><input type="checkbox" checked={rec.completed} onChange={(e) => update({ completed: e.target.checked })} className="h-5 w-5" /><span className="text-[0.9rem]">Mark complete</span></label></div>
            <ol className="mt-6 space-y-4">{qs.map((q, i) => <li key={q.id} className="border-t hairline pt-3"><p className="text-[0.92rem]"><span className="t-data text-neutral-400 mr-2">{String(i + 1).padStart(2, "0")}</span><Badge className="mr-2">{q.topic}</Badge>{q.question}</p><p className="t-caption mt-1">Evidence to capture: {q.evidenceToCapture}</p><textarea rows={2} className={cx(inp, "mt-2")} placeholder="Answer / observation" value={rec.answers[q.id] ?? ""} onChange={(e) => update({ answers: { ...rec.answers, [q.id]: e.target.value } })} /></li>)}</ol>
            <div className="mt-6 grid gap-3 sm:grid-cols-2"><label className="block"><span className="t-caption">Notes</span><textarea rows={3} className={inp} value={rec.notes} onChange={(e) => update({ notes: e.target.value })} /></label><label className="block"><span className="t-caption">Evidence captured (photos, documents, quotes)</span><textarea rows={3} className={inp} value={rec.evidence} onChange={(e) => update({ evidence: e.target.value })} /></label><label className="block"><span className="t-caption">Research source / reference</span><input className={inp} value={rec.sourceRef} onChange={(e) => update({ sourceRef: e.target.value })} /></label><label className="block"><span className="t-caption">Tags (comma-separated findings)</span><input className={inp} value={rec.tags} onChange={(e) => update({ tags: e.target.value })} /></label></div>
            <button onClick={() => { persist(records.filter((r) => r.id !== rec.id)); setActive(null); }} className="mt-6 tap text-[0.8rem] text-danger underline">Delete this interview</button>
          </div>
        ) : (
          <div>
            <p className="t-overline text-neutral-500 mb-3">{LABEL[stakeholder]} — interview framework</p>
            <ol className="space-y-3">{qs.map((q, i) => <li key={q.id} className="border-t hairline pt-3"><p className="text-[0.92rem]"><span className="t-data text-neutral-400 mr-2">{String(i + 1).padStart(2, "0")}</span><Badge className="mr-2">{q.topic}</Badge>{q.question}</p><p className="t-caption mt-1">Evidence to capture: {q.evidenceToCapture}</p></li>)}</ol>
          </div>
        )}
      </div>
    </div>
  );
}
