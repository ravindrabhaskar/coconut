"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { StateProfile } from "@/domain/types";
import { scoreLocation } from "@/lib/calc/scoring";
import { IndiaMap } from "@/components/viz/india-map";
import { ScoreBar } from "@/components/viz/charts";
import { Badge, Callout, cx } from "@/components/ui/primitives";

/** Scenario weight presets (EXPERT JUDGMENT) — each emphasises different dimensions. */
const SCENARIOS: Record<string, { label: string; note: string; weights: Record<string, number> }> = {
  farms: { label: "Factory near farms", note: "Weights raw-material availability, land and processing ecosystem.", weights: { "Raw-material availability": 0.35, Land: 0.12, "Processing ecosystem": 0.15, Water: 0.1 } },
  market: { label: "Near large consumer market", note: "Weights market access, road, labour and electricity.", weights: { "Market access": 0.3, Road: 0.12, Labour: 0.12, Electricity: 0.1, "Raw-material availability": 0.08 } },
  hyderabad: { label: "Near Hyderabad", note: "Market and logistics weighted; raw-material haul penalised via lower supply weight only where AP/KA supply is reachable.", weights: { "Market access": 0.25, Road: 0.15, Rail: 0.08, "Raw-material availability": 0.15, "Export connectivity": 0.03 } },
  port: { label: "Near port", note: "Weights port access and export connectivity.", weights: { "Port access": 0.3, "Export connectivity": 0.15, "Raw-material availability": 0.15 } },
  hybrid: { label: "Hybrid procurement/processing", note: "Primary processing near farms, finishing near market — balanced weights.", weights: { "Raw-material availability": 0.2, "Market access": 0.18, "Processing ecosystem": 0.12, Road: 0.1 } },
  default: { label: "Default weights", note: "Weights as stored on each dimension.", weights: {} },
};

export function IndiaAnalysis({ states }: { states: StateProfile[] }) {
  const [scenario, setScenario] = useState<keyof typeof SCENARIOS>("default");
  const [active, setActive] = useState<string | null>(states[0]?.id ?? null);
  const scored = useMemo(() => states.map((s) => ({ s, r: scoreLocation(s.dimensions, SCENARIOS[scenario].weights) })).sort((a, b) => b.r.total - a.r.total), [states, scenario]);
  const sel = scored.find((x) => x.s.id === active);
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2" role="radiogroup" aria-label="Scenario">{Object.entries(SCENARIOS).map(([k, v]) => <button key={k} role="radio" aria-checked={scenario === k} onClick={() => setScenario(k)} className={cx("tap rounded-full border px-3.5 py-1.5 text-[0.8rem] font-semibold", scenario === k ? "bg-coconut-950 text-ivory-50 border-coconut-950" : "border-neutral-300 hover:border-coconut-800")}>{v.label}</button>)}</div>
      <p className="t-caption mb-8">{SCENARIOS[scenario].note} Weights override stored dimension weights (EXPERT JUDGMENT). No state is declared &quot;best&quot; — trade-offs are shown.</p>
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <IndiaMap states={scored.map(({ s, r }) => ({ id: s.id, name: s.name, slug: s.slug, code: s.code, score: r.total }))} activeId={active} onSelect={setActive} />
          <ol className="mt-6 space-y-2">{scored.map(({ s, r }, i) => <li key={s.id}><button onClick={() => setActive(s.id)} className={cx("tap w-full text-left grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-[var(--radius-control)] px-2 py-1.5", active === s.id ? "bg-neutral-100" : "hover:bg-neutral-50")}><span className="t-data text-neutral-400">{i + 1}</span><span className="text-[0.9rem] font-medium">{s.name}</span><span className="w-40"><ScoreBar value={r.total} label={`${s.name} score`} /></span></button></li>)}</ol>
        </div>
        <div aria-live="polite">
          {sel && (
            <div key={sel.s.id} className="anim-rise">
              <div className="flex flex-wrap items-center gap-3"><h3 className="t-h2">{sel.s.name}</h3><Badge tone="green">{sel.r.total}/100 in this scenario</Badge></div>
              <p className="mt-3 text-[0.95rem] text-neutral-700 max-w-[62ch]">{sel.s.summary}</p>
              <div className="mt-6 overflow-x-auto"><table className="table-data"><thead><tr><th>Dimension</th><th>Score</th><th>Weight</th><th>Reason</th></tr></thead><tbody>{sel.s.dimensions.map((d) => { const w = sel.r.normalisedWeights.find((x) => x.criterion === d.dimension); return <tr key={d.dimension}><td className="font-medium">{d.dimension}</td><td className="t-data">{d.score}/10</td><td className="t-data">{w ? `${Math.round(w.weight * 100)}%` : "—"}</td><td className="text-[0.82rem] text-neutral-700">{d.reason || "—"} <span className="t-badge text-neutral-400">{d.evidence.replace("_", " ")}</span></td></tr>; })}</tbody></table></div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 text-[0.88rem]">
                <div><p className="t-overline text-neutral-500 mb-1">Processing ecosystem</p><ul className="list-disc pl-4">{sel.s.processingEcosystem.map((e) => <li key={e}>{e}</li>)}</ul></div>
                <div><p className="t-overline text-neutral-500 mb-1">Ports</p><ul className="list-disc pl-4">{sel.s.ports.length ? sel.s.ports.map((e) => <li key={e}>{e}</li>) : <li>None</li>}</ul><p className="t-overline text-neutral-500 mt-3 mb-1">Government support</p><ul className="list-disc pl-4">{sel.s.governmentSupport.length ? sel.s.governmentSupport.map((e) => <li key={e}>{e}</li>) : <li>RESEARCH REQUIRED</li>}</ul></div>
              </div>
              <div className="mt-4"><Callout tone="neutral" title="Trade-offs">{sel.s.notes.join(" ")}</Callout></div>
              <p className="mt-4"><Link href={`/india/${sel.s.slug}`} className="t-nav underline underline-offset-4">Full state profile →</Link></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
