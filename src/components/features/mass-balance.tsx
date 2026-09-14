"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MassBalanceModel, Source } from "@/domain/types";
import { computeMassBalance, validateModel, economicsOverlay, type MassBalanceResult } from "@/lib/calc/massBalance";
import { EvidenceBadge } from "@/components/ui/evidence";
import { Badge, Callout, cx } from "@/components/ui/primitives";
import { num, inr } from "@/lib/format";
import { EVIDENCE_COLOR } from "@/lib/format";
import { useScenario, ScenarioBar } from "./scenario";

const PRESETS = [100, 1000, 10000, 100000];

export function MassBalanceTool({ models, sources, initialModelId, productNames }: { models: MassBalanceModel[]; sources: Source[]; initialModelId?: string; productNames: Record<string, { name: string; slug: string }> }) {
  const [scenario, updateScenario] = useScenario();
  const [modelId, setModelId] = useState(initialModelId ?? scenario.massBalanceModelId ?? models[0].id);
  const model = models.find((m) => m.id === modelId) ?? models[0];
  const [mode, setMode] = useState<"nuts" | "kg">(model.baseUnit);
  const [amount, setAmount] = useState(model.baseUnit === "nuts" ? 1000 : 1000);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState<Record<string, number | undefined>>({});
  const [processCost, setProcessCost] = useState<number | undefined>(undefined);

  const summary = useMemo(() => {
    try { return computeMassBalance(model, mode === "nuts" ? { nuts: amount } : { kg: amount }, overrides); } catch { return null; }
  }, [model, mode, amount, overrides]);
  const issues = useMemo(() => validateModel(model, 0.05), [model]);
  const econ = summary ? economicsOverlay(summary, prices, processCost) : null;

  const pick = (m: MassBalanceModel) => { setModelId(m.id); setMode(m.baseUnit); setOverrides({}); setPrices({}); };
  /** Push the current balance into the shared Scenario (product, input, main-product yield) - user-triggered, never silent. */
  const saveToScenario = () => {
    if (!summary) return;
    const main = summary.results.filter((r) => r.kind === "product" && r.massKg !== undefined).sort((a, b) => (b.massKg ?? 0) - (a.massKg ?? 0))[0];
    const pid = main?.productId ?? model.productId;
    updateScenario({ massBalanceModelId: model.id, productId: pid, productName: pid ? productNames[pid]?.name : undefined, rawInputPerDay: amount, rawInputUnit: mode, yieldRatio: main && main.massKg !== undefined ? main.massKg / (mode === "nuts" ? amount : summary.inputKg) : undefined, yieldEvidence: main?.evidence.toLowerCase().replace("_", " "), capacityPerDay: main?.massKg, capacityUnit: "kg" });
  };
  const kindTone = (k: MassBalanceResult["kind"]) => k === "product" ? "green" : k === "byproduct" ? "fibre" : k === "loss" ? "neutral" : "dark";

  return (
    <div>
      <ScenarioBar current="mass" />
      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr]">
        <label className="block"><span className="t-overline text-neutral-500 block mb-1.5">Model (coconut type · maturity · process)</span>
          <select className="tap w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 py-2.5" value={modelId} onChange={(e) => pick(models.find((m) => m.id === e.target.value)!)}>{models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
          <span className="t-caption block mt-1">{model.maturityNote}{model.geography ? ` · ${model.geography}` : ""}</span>
        </label>
        <div><span className="t-overline text-neutral-500 block mb-1.5">Input basis</span>
          <div className="flex gap-2">{(["nuts", "kg"] as const).map((m) => <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m} className={cx("tap rounded-full border px-4 py-2 text-[0.85rem] font-semibold", mode === m ? "bg-coconut-950 text-ivory-50 border-coconut-950" : "border-neutral-300")}>{m === "nuts" ? "Nuts" : "kg"}</button>)}</div>
          {mode === "nuts" && <span className="t-caption block mt-2">Avg nut mass: {model.avgNutMass.value ?? "—"} {model.avgNutMass.unit} <EvidenceBadge q={model.avgNutMass} sources={sources} compact /></span>}
        </div>
        <label className="block"><span className="t-overline text-neutral-500 block mb-1.5">Quantity ({mode})</span>
          <input type="number" inputMode="numeric" className="tap w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 py-2.5 t-data" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          <span className="mt-2 flex flex-wrap gap-1.5">{PRESETS.map((p) => <button key={p} onClick={() => setAmount(p)} className="tap rounded-full border border-neutral-300 px-2.5 py-1 text-[0.72rem] font-semibold">{num(p)}</button>)}</span>
        </label>
      </div>

      {issues.length > 0 && <div className="mt-4"><Callout tone="warning" title="Model closure">{issues.join(" · ")}</Callout></div>}

      {summary && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            <Stat label="Input" value={`${num(summary.inputKg)} kg`} /><Stat label="Products" value={`${num(summary.totalsByKind.product)} kg`} sub={`${num((summary.totalsByKind.product / summary.inputKg) * 100, 1)}% recovery`} /><Stat label="By-products" value={`${num(summary.totalsByKind.byproduct)} kg`} /><Stat label="Losses (moisture, volatiles, fines)" value={`${num(summary.totalsByKind.loss)} kg`} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3"><button onClick={saveToScenario} className="tap rounded-[var(--radius-control)] bg-coconut-950 px-4 py-2 text-ivory-50 t-cta text-xs">Use this balance in my scenario</button><span className="t-caption">Sets product, daily input and main-product yield (per {mode}) for the Factory planner and Financial model.</span></div>
          <p className="t-caption mt-2">Unaccounted mass: {num(summary.unaccountedKg)} kg ({num((summary.unaccountedKg / summary.inputKg) * 100, 1)}%) — if large, the model needs a loss stage (RESEARCH REQUIRED).</p>

          {/* Flow visualisation: proportional bars per depth */}
          <div className="mt-8">
            <p className="t-overline text-neutral-500 mb-3">Mass flow (bar width ∝ share of input)</p>
            <ol className="space-y-1.5">
              {summary.results.map((r) => {
                const w = r.fractionOfInput === undefined ? 0 : Math.max(0.5, r.fractionOfInput * 100);
                return (
                  <li key={r.stageId} className="grid grid-cols-[minmax(0,200px)_1fr] items-center gap-3 md:grid-cols-[260px_1fr]" style={{ paddingLeft: r.depth * 14 }}>
                    <span className="truncate text-[0.85rem]">{r.productId && productNames[r.productId] ? <Link href={`/products/${productNames[r.productId].slug}`} className="underline underline-offset-4">{r.name}</Link> : r.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="h-5 rounded-[2px]" style={{ width: `${w}%`, background: r.kind === "loss" ? "var(--color-neutral-300)" : r.kind === "product" ? "var(--color-leaf-500)" : r.kind === "byproduct" ? "var(--color-fibre-500)" : "var(--color-charcoal-700)", opacity: r.researchRequired ? 0.3 : 1, transition: "width 500ms var(--ease-narrative)" }} aria-hidden="true" />
                      <span className="t-data whitespace-nowrap">{r.massKg === undefined ? "research required" : `${num(r.massKg)} kg`}</span>
                      <span className="t-badge hidden sm:inline" style={{ color: EVIDENCE_COLOR[r.evidence] }}>{r.evidence.replace("_", " ")}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Sensitivity */}
          <details className="mt-8 rounded-[var(--radius-control)] border hairline p-4">
            <summary className="t-nav cursor-pointer tap">Sensitivity — override any fraction (becomes an ASSUMPTION)</summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {model.stages.map((s) => (
                <label key={s.id} className="block text-[0.82rem]">
                  <span className="flex items-center justify-between"><span className="truncate">{s.name}</span><Badge tone={kindTone(s.kind)}>{s.kind}</Badge></span>
                  <span className="mt-1 flex items-center gap-2">
                    <input type="range" min={0} max={1} step={0.005} value={overrides[s.id] ?? s.fraction.value ?? 0} onChange={(e) => setOverrides({ ...overrides, [s.id]: Number(e.target.value) })} className="w-full" aria-label={`${s.name} fraction`} />
                    <span className="t-data w-14 text-right">{num(((overrides[s.id] ?? s.fraction.value ?? 0) * 100), 1)}%</span>
                    <EvidenceBadge q={s.fraction} sources={sources} compact />
                  </span>
                  {s.fraction.min !== undefined && <span className="t-caption block">range {num(s.fraction.min * 100)}–{num((s.fraction.max ?? 0) * 100)}%</span>}
                </label>
              ))}
            </div>
            {Object.keys(overrides).length > 0 && <button onClick={() => setOverrides({})} className="mt-4 tap rounded-[var(--radius-control)] border border-neutral-300 px-3 py-1.5 text-[0.8rem]">Reset overrides</button>}
          </details>

          {/* Economics overlay */}
          <details className="mt-4 rounded-[var(--radius-control)] border hairline p-4">
            <summary className="t-nav cursor-pointer tap">Economics overlay — enter your prices (₹/kg); nothing is assumed</summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {summary.results.filter((r) => r.kind === "product" || r.kind === "byproduct").map((r) => (
                <label key={r.stageId} className="block text-[0.82rem]"><span>{r.name}</span><input type="number" inputMode="decimal" placeholder="₹ per kg — research required" className="tap mt-1 w-full rounded-[var(--radius-control)] border border-dashed border-neutral-400 bg-white px-3 py-2 t-data" value={prices[r.stageId] ?? ""} onChange={(e) => setPrices({ ...prices, [r.stageId]: e.target.value === "" ? undefined : Number(e.target.value) })} /></label>
              ))}
              <label className="block text-[0.82rem]"><span>Process cost per kg input</span><input type="number" inputMode="decimal" placeholder="₹ per kg input" className="tap mt-1 w-full rounded-[var(--radius-control)] border border-dashed border-neutral-400 bg-white px-3 py-2 t-data" value={processCost ?? ""} onChange={(e) => setProcessCost(e.target.value === "" ? undefined : Number(e.target.value))} /></label>
            </div>
            {econ && <div className="mt-4 grid gap-4 sm:grid-cols-3"><Stat label="Potential revenue" value={inr(econ.potentialRevenue)} sub={`${econ.pricedStreams} priced · ${econ.unpricedStreams} unpriced streams`} /><Stat label="Process cost" value={econ.processCost === undefined ? "research required" : inr(econ.processCost)} /><Stat label="Contribution" value={econ.contribution === undefined ? "—" : inr(econ.contribution)} /></div>}
          </details>
          <p className="t-caption mt-4">Model sources: {model.sourceIds.map((id) => sources.find((s) => s.id === id)?.name).filter(Boolean).join("; ")}.</p>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (<div className="border-t hairline pt-3"><p className="t-overline text-neutral-500">{label}</p><p className="t-metric mt-1 text-xl">{value}</p>{sub && <p className="t-caption">{sub}</p>}</div>);
}
