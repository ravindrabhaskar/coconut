"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { FactoryScaleModel, ManpowerRole, Source } from "@/domain/types";
import { planFactory, layoutZones, type PlannerChoices } from "@/lib/calc/factoryPlanner";
import { FactoryBlueprint } from "@/components/viz/factory-blueprint";
import { EvidenceBadge } from "@/components/ui/evidence";
import { Badge, Callout, cx } from "@/components/ui/primitives";
import { inr, num } from "@/lib/format";
import { useScenario, ScenarioBar } from "./scenario";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (<label className="block"><span className="t-overline text-neutral-500 block mb-1.5">{label}</span>{children}</label>);

export interface PlannerProduct { id: string; name: string; slug: string; models: FactoryScaleModel[] }

export function FactoryPlanner({ products, roles, sources, initialProductId, initialModelId, embedded }: { products: PlannerProduct[]; roles: ManpowerRole[]; sources: Source[]; initialProductId?: string; initialModelId?: string; embedded?: boolean }) {
  const [scenario, updateScenario] = useScenario();
  const [productId, setProductId] = useState<string | undefined>(initialProductId ?? (scenario.productId && products.some((p) => p.id === scenario.productId) ? scenario.productId : undefined) ?? products[0]?.id);
  const product = products.find((p) => p.id === productId) ?? products[0];
  const [modelId, setModelId] = useState<string | undefined>(initialModelId ?? (scenario.scaleModelId && product?.models.some((m) => m.id === scenario.scaleModelId) ? scenario.scaleModelId : undefined) ?? product?.models[0]?.id);
  const model = product?.models.find((m) => m.id === modelId) ?? product?.models[0];
  const [choices, setChoices] = useState<PlannerChoices>({ automation: scenario.automation ?? "semi_automatic", shifts: scenario.shifts ?? 1, location: scenario.location ?? "near_farms", targetMarket: scenario.targetMarket ?? "B2B" });
  const [step, setStep] = useState(0); // mobile wizard step
  const [layers, setLayers] = useState({ flow: true, hygiene: true, fire: true });

  const result = useMemo(() => (model ? planFactory(model, choices) : null), [model, choices]);
  const rects = useMemo(() => (result && model ? layoutZones(result.zones, model.flowSequence) : []), [result, model]);
  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? id;

  const onProduct = (id: string) => { setProductId(id); const p = products.find((x) => x.id === id); setModelId(p?.models[0]?.id); };
  const saveToScenario = () => {
    if (!model || !result || !product) return;
    updateScenario({ productId: product.id, productName: product.name, scaleModelId: model.id, capacityPerDay: model.capacity.value, capacityUnit: model.capacity.unit, rawInputPerDay: model.rawMaterialPerDay.value, rawInputUnit: model.rawMaterialPerDay.unit.startsWith("nuts") ? "nuts" : "kg", ...choices, manpower: result.manpower, powerKw: result.powerKw, waterKlPerDay: result.waterKlPerDay, capexInr: result.capexInr, capexEvidence: result.capexInr === undefined ? "research required" : "calculated from scale model" });
  };

  const sel = "tap w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 py-2.5 text-[0.95rem]";

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {!embedded && <Field label="Product"><select className={sel} value={productId} onChange={(e) => onProduct(e.target.value)}>{products.map((p) => <option key={p.id} value={p.id}>{p.name}{p.models.length ? "" : " (no scale model yet)"}</option>)}</select></Field>}
      <Field label="Scale (engineering model)"><select className={sel} value={modelId ?? ""} onChange={(e) => setModelId(e.target.value)} disabled={!product?.models.length}>{product?.models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}{!product?.models.length && <option value="">RESEARCH REQUIRED — no scale model</option>}</select></Field>
      <Field label="Location"><select className={sel} value={choices.location} onChange={(e) => setChoices({ ...choices, location: e.target.value as PlannerChoices["location"] })}><option value="near_farms">Near farms / supply belt</option><option value="urban">Urban / consumer market</option><option value="hyderabad">Hyderabad</option><option value="port">Near port</option><option value="other">Other</option></select></Field>
      <Field label="Target market"><select className={sel} value={choices.targetMarket} onChange={(e) => setChoices({ ...choices, targetMarket: e.target.value as PlannerChoices["targetMarket"] })}><option>B2B</option><option>B2C</option><option>Export</option><option>Hybrid</option></select></Field>
      <Field label="Automation level"><select className={sel} value={choices.automation} onChange={(e) => setChoices({ ...choices, automation: e.target.value as PlannerChoices["automation"] })}><option value="manual">Manual</option><option value="semi_automatic">Semi-automatic</option><option value="automatic">Automatic</option></select></Field>
      <Field label="Shifts per day"><select className={sel} value={choices.shifts} onChange={(e) => setChoices({ ...choices, shifts: Number(e.target.value) as 1 | 2 | 3 })}><option value={1}>1</option><option value={2}>2</option><option value={3}>3 (continuous)</option></select></Field>
    </div>
  );

  if (!model || !result) {
    return (
      <div>
        {inputs}
        <div className="mt-8 rounded-[var(--radius-media)] border border-dashed border-neutral-300 p-10 text-center"><p className="t-h4">RESEARCH REQUIRED</p><p className="t-caption mt-2 max-w-[48ch] mx-auto">No engineering scale model exists yet for {product?.name}. The planner does not pretend: capacity options are only exposed when process and equipment assumptions have been documented.</p></div>
      </div>
    );
  }

  const summary = [
    { label: "Processing floor", v: result.processingFloorSqm === undefined ? "—" : `${num(result.processingFloorSqm)} m²`, q: model.processingFloorArea },
    { label: "Built-up area", v: result.builtUpSqm === undefined ? "—" : `${num(result.builtUpSqm)} m² (${num(result.builtUpSqm * 10.7639)} sq ft)`, q: model.processingFloorArea },
    { label: "Site area", v: result.siteSqm === undefined ? "—" : `${num(result.siteSqm)} m² ≈ ${result.siteAcres!.toFixed(2)} acre`, q: model.processingFloorArea },
    { label: "Manpower", v: result.manpower === undefined ? "—" : `${result.manpower} persons`, q: model.manpower[0]?.headcount },
    { label: "Connected load", v: result.powerKw === undefined ? "—" : `${num(result.powerKw)} kW`, q: model.power },
    { label: "Water", v: result.waterKlPerDay === undefined ? "—" : `${num(result.waterKlPerDay, 1)} kL/day`, q: model.water },
    { label: "CAPEX (ex-land)", v: result.capexInr === undefined ? "—" : inr(result.capexInr), q: model.capex },
    { label: "Raw material / day", v: model.rawMaterialPerDay.value === undefined ? "—" : `${num(model.rawMaterialPerDay.value)} ${model.rawMaterialPerDay.unit}`, q: model.rawMaterialPerDay },
  ];

  const stepsMobile = ["Inputs", "Summary", "Layout", "Evidence"];

  return (
    <div>
      {!embedded && <ScenarioBar current="factory" />}
      {/* Mobile wizard header */}
      <div className="mb-4 flex gap-2 md:hidden" role="tablist">{stepsMobile.map((s, i) => <button key={s} role="tab" aria-selected={step === i} onClick={() => setStep(i)} className={cx("tap flex-1 rounded-full border px-2 py-1.5 text-[0.75rem] font-semibold", step === i ? "bg-coconut-950 text-ivory-50 border-coconut-950" : "border-neutral-300")}>{i + 1}. {s}</button>)}</div>

      <div className={cx(step !== 0 && "hidden md:block")}>{inputs}</div>

      <div className={cx("mt-8", step !== 1 && "hidden md:block")}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {summary.map((s) => (
            <div key={s.label} className="border-t hairline pt-3"><p className="t-overline text-neutral-500">{s.label}</p><p className="t-metric mt-1 text-xl">{s.v}</p>{s.q && <div className="mt-1"><EvidenceBadge q={{ ...s.q, evidence: s.v === "—" ? "RESEARCH_REQUIRED" : "CALCULATED", formula: result.evidenceChain.find((c) => c.field.toLowerCase().startsWith(s.label.toLowerCase().split(" ")[0]))?.formula ?? s.q.formula, notes: s.q.notes }} sources={sources} /></div>}</div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3"><button onClick={saveToScenario} className="tap rounded-[var(--radius-control)] bg-coconut-950 px-4 py-2 text-ivory-50 t-cta text-xs">Use this plan in my scenario</button><span className="t-caption">Carries capacity, input, location, automation, shifts, manpower, utilities and CAPEX basis into the Financial model.</span></div>
        {result.warnings.length > 0 && <div className="mt-6"><Callout tone="warning" title="Planner warnings"><ul className="list-disc pl-5 space-y-1">{result.warnings.map((w) => <li key={w}>{w}</li>)}</ul></Callout></div>}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div><p className="t-overline text-neutral-500 mb-2">Manpower by role (base {model.shiftsPerDay}-shift model)</p><ul className="space-y-1 text-[0.9rem]">{model.manpower.map((m) => <li key={m.roleId} className="flex justify-between border-b hairline py-1"><span>{roleName(m.roleId)}</span><span className="t-data">{m.headcount.value ?? "—"} <EvidenceBadge q={m.headcount} sources={sources} compact /></span></li>)}</ul></div>
          <div><p className="t-overline text-neutral-500 mb-2">Model assumptions</p><ul className="list-disc pl-5 space-y-1 text-[0.9rem]">{model.assumptions.map((a) => <li key={a}>{a}</li>)}<li>{result.workingCapitalNote}</li></ul></div>
        </div>
      </div>

      <div className={cx("mt-10", step !== 2 && "hidden md:block")}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="t-overline text-neutral-500 mr-2">Layers</span>
          {(["flow", "hygiene", "fire"] as const).map((k) => <button key={k} onClick={() => setLayers({ ...layers, [k]: !layers[k] })} aria-pressed={layers[k]} className={cx("tap rounded-full border px-3 py-1 text-[0.75rem] font-semibold", layers[k] ? "bg-coconut-950 text-ivory-50 border-coconut-950" : "border-neutral-300")}>{k === "flow" ? "Material flow" : k === "hygiene" ? "Clean zones" : "Fire risk"}</button>)}
        </div>
        <div className="overflow-x-auto"><div className="min-w-[640px]"><FactoryBlueprint rects={rects} flowSequence={model.flowSequence} showFlow={layers.flow} showHygiene={layers.hygiene} showFire={layers.fire} /></div></div>
        <div className="mt-6 overflow-x-auto"><table className="table-data"><thead><tr><th>Zone</th><th>Kind</th><th>Ratio to floor</th><th>Area</th><th>Hygiene</th><th>Fire</th></tr></thead><tbody>{result.zones.map((z) => <tr key={z.id}><td className="font-medium">{z.name}</td><td className="t-caption">{z.kind.replace(/_/g, " ")}</td><td className="t-data">{z.areaRatio.toFixed(2)}</td><td className="t-data">{z.areaSqm === undefined ? "—" : `${num(z.areaSqm)} m²`}</td><td className="t-caption">{z.hygiene ?? ""}</td><td className="t-caption">{z.fireRisk ?? ""}</td></tr>)}</tbody></table></div>
      </div>

      <div className={cx("mt-10", step !== 3 && "hidden md:block")}>
        <p className="t-overline text-neutral-500 mb-3">Evidence chain — how every number was derived</p>
        <ol className="space-y-2">{result.evidenceChain.map((c) => <li key={c.field} className="grid gap-1 border-t hairline py-2 md:grid-cols-[180px_1fr_auto]"><span className="font-medium text-[0.9rem]">{c.field}</span><span className="t-data text-neutral-700">{c.formula}{c.notes && <span className="t-caption block">{c.notes}</span>}</span><Badge tone={c.evidence === "RESEARCH_REQUIRED" ? "neutral" : "green"}>{c.evidence.replace("_", " ")}</Badge></li>)}</ol>
        <p className="mt-4 t-caption">Continue to the <Link href={`/tools/financial-model?product=${product.id}`} className="underline">Financial Model</Link> to convert these into working capital, break-even and ROI with your prices.</p>
      </div>
    </div>
  );
}
