"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { StateProfile } from "@/domain/types";
import { rankLocations, weightsForNeeds, DEFAULT_NEEDS, type Intensity, type LocationNeeds } from "@/lib/calc/location";
import { Badge, Callout, cx } from "@/components/ui/primitives";
import { ScoreBar } from "@/components/viz/charts";
import { IndiaMap } from "@/components/viz/india-map";

const SEL = "tap w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 py-2.5 text-[0.95rem]";
const NEED_FIELDS: { k: keyof LocationNeeds; label: string; hint: string }[] = [
  { k: "rawMaterialDependence", label: "Raw-material dependence", hint: "Must the plant sit inside the coconut belt (perishable nuts, husk bulk)?" },
  { k: "exportShare", label: "Export share", hint: "How much output goes through a port?" },
  { k: "powerIntensity", label: "Power intensity", hint: "Dryers, mills, kilns, activation" },
  { k: "waterIntensity", label: "Water intensity", hint: "Retting, washing, wet milling" },
  { k: "labourIntensity", label: "Labour intensity", hint: "Manual dehusking, grading, handicrafts" },
  { k: "ecosystemDependence", label: "Ecosystem dependence", hint: "Reliance on nearby fabricators and co-processors" },
  { k: "domesticMarketFocus", label: "Domestic market focus", hint: "Proximity to urban demand" },
];

export interface ProductPreset { id: string; name: string; slug: string; needs: LocationNeeds }

export function LocationFinder({ states, presets }: { states: StateProfile[]; presets: ProductPreset[] }) {
  const [presetId, setPresetId] = useState<string>("");
  const [needs, setNeeds] = useState<LocationNeeds>(DEFAULT_NEEDS);
  const [active, setActive] = useState<string | null>(null);
  const ranked = useMemo(() => rankLocations(states, needs), [states, needs]);
  const weights = useMemo(() => weightsForNeeds(needs), [needs]);
  const wSum = Object.values(weights).reduce((a, b) => a + b, 0);
  const sel = ranked.find((r) => r.stateId === (active ?? ranked[0]?.stateId));

  const applyPreset = (id: string) => {
    setPresetId(id);
    const p = presets.find((x) => x.id === id);
    setNeeds(p ? p.needs : DEFAULT_NEEDS);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
      <div>
        <label className="block"><span className="t-overline text-neutral-500 block mb-1.5">Start from a product (optional)</span>
          <select className={SEL} value={presetId} onChange={(e) => applyPreset(e.target.value)}>
            <option value="">Custom need profile</option>
            {presets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <span className="t-caption block mt-1">Presets are inferred from the product&apos;s typed raw-material, utility, manpower and market fields — adjust freely.</span>
        </label>
        <div className="mt-6 space-y-4">
          {NEED_FIELDS.map((f) => (
            <label key={f.k} className="block"><span className="t-overline text-neutral-500 block mb-1.5">{f.label}</span>
              <select className={SEL} value={needs[f.k]} onChange={(e) => { setPresetId(""); setNeeds({ ...needs, [f.k]: e.target.value as Intensity }); }}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
              <span className="t-caption block mt-1">{f.hint}</span>
            </label>
          ))}
        </div>
        <div className="mt-8">
          <p className="t-overline text-neutral-500 mb-2">Resulting dimension weights</p>
          <ul className="space-y-1 t-data text-[0.78rem]">
            {Object.entries(weights).sort((a, b) => b[1] - a[1]).map(([k, v]) => <li key={k} className="flex justify-between gap-3"><span>{k}</span><span>{Math.round((v / wSum) * 100)}%</span></li>)}
          </ul>
        </div>
      </div>
      <div>
        <Callout tone="warning" title="Screening heuristic — not a site decision">State dimension scores are EXPERT JUDGMENT (0–10) with written reasons; your need profile only changes their weights. Validate any shortlist with district-level land, power tariff, raw-material price and logistics quotes before committing.</Callout>
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_1fr] md:items-start">
          <IndiaMap states={ranked.map((r) => ({ id: r.stateId, name: r.name, slug: r.slug, code: r.code, score: r.total }))} activeId={sel?.stateId ?? null} onSelect={setActive} />
          <ol className="space-y-2">
            {ranked.map((r, i) => (
              <li key={r.stateId}>
                <button onClick={() => setActive(r.stateId)} className={cx("tap w-full rounded-[var(--radius-control)] border px-4 py-3 text-left", sel?.stateId === r.stateId ? "border-coconut-950 bg-cocos" : "hairline bg-cocos/60 hover:border-coconut-800")}>
                  <div className="flex items-center justify-between gap-3"><span className="t-h4">{i + 1}. {r.name}</span><span className="t-metric text-2xl">{r.total}</span></div>
                  <ScoreBar value={r.total} label={`${r.name} fit`} />
                </button>
              </li>
            ))}
          </ol>
        </div>
        {sel && (
          <div key={sel.stateId} className="anim-rise mt-8 rounded-[var(--radius-media)] border border-leaf-500 bg-cocos p-6">
            <div className="flex flex-wrap items-center gap-2"><Badge tone="green">Fit {sel.total}/100</Badge><Badge>EXPERT JUDGMENT</Badge>{sel.ports.length > 0 && <Badge>Ports: {sel.ports.join(", ")}</Badge>}</div>
            <h3 className="t-h3 mt-3">{sel.name}</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-[0.88rem]">
              <div><p className="t-overline text-leaf-500 mb-1">Strengths on what you weighted</p><ul className="list-disc pl-4 space-y-1">{sel.strengths.length ? sel.strengths.map((s) => <li key={s.dimension}><strong>{s.dimension}</strong> {s.score}/10 — {s.reason}</li>) : <li>No decisive dimension scores ≥7.</li>}</ul></div>
              <div><p className="t-overline text-danger mb-1">Weaknesses on what you weighted</p><ul className="list-disc pl-4 space-y-1">{sel.weaknesses.length ? sel.weaknesses.map((s) => <li key={s.dimension}><strong>{s.dimension}</strong> {s.score}/10 — {s.reason}</li>) : <li>No decisive dimension scores ≤5.</li>}</ul></div>
            </div>
            <details className="mt-4"><summary className="t-nav cursor-pointer">Full weighted breakdown</summary>
              <table className="mt-3 w-full text-[0.82rem]"><thead><tr className="text-left t-overline text-neutral-500"><th className="py-1">Dimension</th><th>Score</th><th>Weight</th><th>Contribution</th></tr></thead>
                <tbody>{sel.breakdown.normalisedWeights.map((w) => <tr key={w.criterion} className="border-t hairline"><td className="py-1">{w.criterion}</td><td>{w.score}/10</td><td>{Math.round(w.weight * 100)}%</td><td>{w.contribution.toFixed(1)}</td></tr>)}</tbody></table>
            </details>
            <div className="mt-5 flex flex-wrap gap-3"><Link href={`/india/${sel.slug}`} className="t-cta inline-flex rounded-[var(--radius-control)] bg-coconut-950 px-5 py-3 text-ivory-50 tap">State profile →</Link><Link href="/india" className="t-nav inline-flex items-center underline underline-offset-4">Full India analysis with custom weights</Link></div>
          </div>
        )}
      </div>
    </div>
  );
}
