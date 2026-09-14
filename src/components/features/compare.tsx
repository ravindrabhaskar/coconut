"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Quantity, Source } from "@/domain/types";
import { EvidenceBadge } from "@/components/ui/evidence";
import { Badge, cx } from "@/components/ui/primitives";
import { formatQuantity } from "@/lib/format";

export interface CompareRow { id: string; name: string; slug: string; component: string; complexity: string; capex: Quantity; workingCapital: Quantity; marginPotential: string; demand: string; competition: string; shelfLife: Quantity; exportPotential: string; regulatoryComplexity: string; technology: string; scalability: string; moat: string; riskLevel: string; evidenceStrength: string; score?: number; coveragePct: number; level: string }

const LEVEL_TONE: Record<string, string> = { low: "text-leaf-500", medium: "text-fibre-500", high: "text-danger", very_high: "text-danger", research_required: "text-neutral-500", strong: "text-leaf-500", moderate: "text-fibre-500", weak: "text-danger", unrated: "text-neutral-500", long: "text-leaf-500", short: "text-danger" };

export function CompareTool({ rows, sources }: { rows: CompareRow[]; sources: Source[] }) {
  const sp = useSearchParams();
  const router = useRouter();
  const initial = (sp.get("ids") ?? "").split(",").filter((id) => rows.some((r) => r.id === id));
  const [ids, setIds] = useState<string[]>(initial.length ? initial.slice(0, 4) : rows.slice(0, 3).map((r) => r.id));
  const sel = useMemo(() => ids.map((id) => rows.find((r) => r.id === id)!).filter(Boolean), [ids, rows]);
  const toggle = (id: string) => {
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : ids.length >= 4 ? ids : [...ids, id];
    setIds(next); router.replace(`/tools/compare?ids=${next.join(",")}`, { scroll: false });
  };
  const attr = (label: string, render: (r: CompareRow) => React.ReactNode) => ({ label, render });
  const attrs = [
    attr("Raw material (component)", (r) => r.component), attr("Business level", (r) => `Level ${r.level.slice(1)}`),
    attr("Technical complexity", (r) => <Lvl v={r.complexity} />), attr("CAPEX", (r) => <Q q={r.capex} sources={sources} />), attr("Working capital", (r) => <Q q={r.workingCapital} sources={sources} />),
    attr("Margin potential", (r) => <Lvl v={r.marginPotential} />), attr("Demand", (r) => <Lvl v={r.demand} />), attr("Competition", (r) => <Lvl v={r.competition} invert />),
    attr("Shelf life", (r) => <Q q={r.shelfLife} sources={sources} />), attr("Export potential", (r) => <Lvl v={r.exportPotential} />), attr("Regulatory complexity", (r) => <Lvl v={r.regulatoryComplexity} invert />),
    attr("Technology accessibility", (r) => r.technology), attr("Scalability", (r) => <Lvl v={r.scalability} />), attr("Moat / defensibility", (r) => <Lvl v={r.moat} />), attr("Risk", (r) => <Lvl v={r.riskLevel} invert />),
    attr("Evidence strength", (r) => <Lvl v={r.evidenceStrength} />), attr("Strategic score (0–100)", (r) => r.score === undefined ? <span className="t-caption">research required</span> : <span className="t-metric text-xl">{r.score}</span>),
    attr("Evidence coverage", (r) => `${r.coveragePct}%`),
  ];
  return (
    <div>
      <p className="t-overline text-neutral-500 mb-3">Select 2–4 products ({ids.length} selected)</p>
      <div className="flex flex-wrap gap-2 mb-8">{rows.map((r) => <button key={r.id} onClick={() => toggle(r.id)} aria-pressed={ids.includes(r.id)} disabled={!ids.includes(r.id) && ids.length >= 4} className={cx("tap rounded-full border px-3.5 py-1.5 text-[0.85rem] font-medium disabled:opacity-40", ids.includes(r.id) ? "bg-coconut-950 text-ivory-50 border-coconut-950" : "border-neutral-300 hover:border-coconut-800")}>{r.name}</button>)}</div>
      {sel.length < 2 ? <p className="t-caption">Select at least two products to compare.</p> : (
        <div className="overflow-x-auto">
          <table className="table-data min-w-[640px]">
            <thead><tr><th className="w-[200px]">Attribute</th>{sel.map((r) => <th key={r.id}><Link href={`/products/${r.slug}`} className="underline-offset-4 hover:underline">{r.name}</Link></th>)}</tr></thead>
            <tbody>{attrs.map((a) => <tr key={a.label}><th scope="row" className="text-left font-medium normal-case tracking-normal text-[0.85rem] text-neutral-800">{a.label}</th>{sel.map((r) => <td key={r.id} className="text-[0.9rem]">{a.render(r)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
      {/* Mobile: expandable per product */}
      <div className="mt-8 md:hidden space-y-3">{sel.map((r) => <details key={r.id} className="rounded-[var(--radius-control)] border hairline p-3"><summary className="tap t-h4 cursor-pointer">{r.name}</summary><dl className="mt-3 divide-y hairline">{attrs.map((a) => <div key={a.label} className="grid grid-cols-2 gap-2 py-2 text-[0.85rem]"><dt className="t-caption">{a.label}</dt><dd>{a.render(r)}</dd></div>)}</dl></details>)}</div>
    </div>
  );
}

function Lvl({ v, invert }: { v: string; invert?: boolean }) {
  const tone = invert ? (v === "high" ? "text-danger" : v === "low" ? "text-leaf-500" : "text-fibre-500") : (LEVEL_TONE[v] ?? "");
  return <Badge className={tone}>{v.replace("_", " ")}</Badge>;
}
function Q({ q, sources }: { q: Quantity; sources: Source[] }) {
  return <span className="inline-flex flex-wrap items-center gap-1.5"><span className="t-data">{q.value === undefined ? "—" : formatQuantity(q)}</span><EvidenceBadge q={q} sources={sources} compact /></span>;
}
