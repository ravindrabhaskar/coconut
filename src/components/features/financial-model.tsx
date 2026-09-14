"use client";

import { useMemo, useState } from "react";
import type { EvidenceType } from "@/domain/types";
import { computeFinancials, validateInputs, applyScenario, priceToEconomicsWaterfall, FORMULAS, SCENARIO_MULTIPLIERS, type FinancialInputs, type Scenario, type FinancialOutputs } from "@/lib/calc/finance";
import { Waterfall } from "@/components/viz/charts";
import { Badge, Callout, cx } from "@/components/ui/primitives";
import { inr, num, pct } from "@/lib/format";
import { EVIDENCE_COLOR, EVIDENCE_SHORT } from "@/lib/format";
import { useScenario, ScenarioBar } from "./scenario";

type Key = keyof FinancialInputs;

interface FieldDef { key: Key; label: string; unit: string; group: string; help?: string }

const FIELDS: FieldDef[] = [
  { key: "rawMaterialQtyPerMonth", label: "Raw material quantity", unit: "units/month (kg or nuts)", group: "Production" },
  { key: "rawMaterialCostPerUnit", label: "Raw material cost", unit: "₹ per unit", group: "Production" },
  { key: "yieldRatio", label: "Yield", unit: "kg finished per raw unit", group: "Production", help: "From the mass balance / product yield (ESTIMATE unless measured)." },
  { key: "utilisation", label: "Capacity utilisation", unit: "0–1", group: "Production" },
  { key: "sellingPricePerKg", label: "Selling price", unit: "₹ per kg", group: "Revenue", help: "Never assumed by the platform — enter a quoted price with date." },
  { key: "returnsRate", label: "Returns / rejections", unit: "fraction of revenue", group: "Revenue" },
  { key: "packagingCostPerKg", label: "Packaging", unit: "₹ per kg", group: "Variable costs" },
  { key: "transportPerKg", label: "Transport (outbound)", unit: "₹ per kg", group: "Variable costs" },
  { key: "powerPerMonth", label: "Power", unit: "₹ per month", group: "Utilities" },
  { key: "waterPerMonth", label: "Water", unit: "₹ per month", group: "Utilities" },
  { key: "fuelPerMonth", label: "Fuel / steam", unit: "₹ per month", group: "Utilities" },
  { key: "directLabourPerMonth", label: "Direct labour", unit: "₹ per month", group: "Fixed costs" },
  { key: "rentPerMonth", label: "Rent", unit: "₹ per month", group: "Fixed costs" },
  { key: "repairsPerMonth", label: "Repairs & maintenance", unit: "₹ per month", group: "Fixed costs" },
  { key: "qcTestingPerMonth", label: "QC / testing", unit: "₹ per month", group: "Fixed costs" },
  { key: "marketingPerMonth", label: "Marketing", unit: "₹ per month", group: "Fixed costs" },
  { key: "adminPerMonth", label: "Administration", unit: "₹ per month", group: "Fixed costs" },
  { key: "capex", label: "CAPEX", unit: "₹", group: "Capital" },
  { key: "depreciationRate", label: "Depreciation rate", unit: "fraction per year", group: "Capital" },
  { key: "debt", label: "Debt", unit: "₹", group: "Capital" },
  { key: "interestRate", label: "Interest rate", unit: "fraction per year", group: "Capital" },
  { key: "taxRate", label: "Tax rate", unit: "fraction", group: "Capital" },
  { key: "customerCreditDays", label: "Customer credit", unit: "days", group: "Working capital" },
  { key: "supplierCreditDays", label: "Supplier credit", unit: "days", group: "Working capital" },
  { key: "inventoryDays", label: "Inventory", unit: "days", group: "Working capital" },
];

/** Structural defaults: units/ratios only. Prices and costs start EMPTY (0) and are flagged — the platform never invents them. */
const EMPTY: FinancialInputs = {
  rawMaterialQtyPerMonth: 0, rawMaterialCostPerUnit: 0, yieldRatio: 0.3, sellingPricePerKg: 0, utilisation: 0.7, packagingCostPerKg: 0, directLabourPerMonth: 0, powerPerMonth: 0, waterPerMonth: 0, fuelPerMonth: 0, transportPerKg: 0,
  rentPerMonth: 0, repairsPerMonth: 0, qcTestingPerMonth: 0, marketingPerMonth: 0, adminPerMonth: 0, interestRate: 0.12, debt: 0, capex: 0, depreciationRate: 0.1, customerCreditDays: 30, supplierCreditDays: 0, inventoryDays: 15, taxRate: 0.25, returnsRate: 0.01,
};
const EMPTY_EVIDENCE: Record<Key, EvidenceType> = Object.fromEntries(FIELDS.map((f) => [f.key, ["yieldRatio", "utilisation", "interestRate", "depreciationRate", "customerCreditDays", "supplierCreditDays", "inventoryDays", "taxRate", "returnsRate"].includes(f.key) ? "ASSUMPTION" : "RESEARCH_REQUIRED"])) as Record<Key, EvidenceType>;

/** Illustrative structure: clearly labelled ASSUMPTION values that demonstrate the model mechanics. Not a forecast. */
const ILLUSTRATIVE: FinancialInputs = {
  rawMaterialQtyPerMonth: 100000, rawMaterialCostPerUnit: 10, yieldRatio: 0.3, sellingPricePerKg: 80, utilisation: 0.7, packagingCostPerKg: 4, directLabourPerMonth: 250000, powerPerMonth: 60000, waterPerMonth: 8000, fuelPerMonth: 90000, transportPerKg: 2,
  rentPerMonth: 60000, repairsPerMonth: 20000, qcTestingPerMonth: 15000, marketingPerMonth: 20000, adminPerMonth: 40000, interestRate: 0.12, debt: 3000000, capex: 6000000, depreciationRate: 0.1, customerCreditDays: 30, supplierCreditDays: 0, inventoryDays: 15, taxRate: 0.25, returnsRate: 0.01,
};

export function FinancialModel({ productName, yieldHint }: { productName?: string; yieldHint?: { value: number; label: string; evidence: EvidenceType } }) {
  const [shared, updateScenario] = useScenario();
  const fromScenario = (): { inputs: Partial<FinancialInputs>; evidence: Partial<Record<Key, EvidenceType>> } => {
    const i: Partial<FinancialInputs> = {}; const e: Partial<Record<Key, EvidenceType>> = {};
    if (shared.rawInputPerDay !== undefined) { i.rawMaterialQtyPerMonth = shared.rawInputPerDay * shared.operatingDaysPerMonth; e.rawMaterialQtyPerMonth = "CALCULATED"; }
    if (shared.yieldRatio !== undefined) { i.yieldRatio = shared.yieldRatio; e.yieldRatio = shared.yieldEvidence?.includes("verified") ? "VERIFIED_FACT" : "ESTIMATE"; }
    if (shared.capexInr !== undefined) { i.capex = shared.capexInr; e.capex = "CALCULATED"; }
    if (shared.sellingPricePerKg !== undefined) { i.sellingPricePerKg = shared.sellingPricePerKg; e.sellingPricePerKg = "ASSUMPTION"; }
    if (shared.rawMaterialCostPerUnit !== undefined) { i.rawMaterialCostPerUnit = shared.rawMaterialCostPerUnit; e.rawMaterialCostPerUnit = "ASSUMPTION"; }
    if (shared.packagingCostPerKg !== undefined) { i.packagingCostPerKg = shared.packagingCostPerKg; e.packagingCostPerKg = "ASSUMPTION"; }
    if (shared.freightPerKg !== undefined) { i.transportPerKg = shared.freightPerKg; e.transportPerKg = "ASSUMPTION"; }
    if (shared.labourPerMonth !== undefined) { i.directLabourPerMonth = shared.labourPerMonth; e.directLabourPerMonth = "ASSUMPTION"; }
    return { inputs: i, evidence: e };
  };
  const seed = fromScenario();
  const [inputs, setInputs] = useState<FinancialInputs>({ ...EMPTY, ...(yieldHint ? { yieldRatio: yieldHint.value } : {}), ...seed.inputs });
  const [evidence, setEvidence] = useState<Record<Key, EvidenceType>>({ ...EMPTY_EVIDENCE, ...(yieldHint ? { yieldRatio: yieldHint.evidence } : {}), ...seed.evidence });
  const saveToScenario = () => updateScenario({ sellingPricePerKg: inputs.sellingPricePerKg || undefined, rawMaterialCostPerUnit: inputs.rawMaterialCostPerUnit || undefined, packagingCostPerKg: inputs.packagingCostPerKg || undefined, freightPerKg: inputs.transportPerKg || undefined, labourPerMonth: inputs.directLabourPerMonth || undefined, yieldRatio: inputs.yieldRatio, capexInr: inputs.capex || undefined, capexEvidence: evidence.capex.toLowerCase().replace("_", " ") });
  const [scenario, setScenario] = useState<Scenario>("base");
  const [illustrative, setIllustrative] = useState(false);
  const [step, setStep] = useState(0);

  const set = (k: Key, v: number) => { setInputs({ ...inputs, [k]: v }); if (evidence[k] === "RESEARCH_REQUIRED") setEvidence({ ...evidence, [k]: "ASSUMPTION" }); };
  const setEv = (k: Key, e: EvidenceType) => setEvidence({ ...evidence, [k]: e });
  const loadIllustrative = () => { setInputs(ILLUSTRATIVE); setEvidence(Object.fromEntries(FIELDS.map((f) => [f.key, "ASSUMPTION"])) as Record<Key, EvidenceType>); setIllustrative(true); };
  const clear = () => { setInputs(EMPTY); setEvidence(EMPTY_EVIDENCE); setIllustrative(false); };

  const errors = validateInputs(inputs);
  const scenarios = useMemo(() => (["conservative", "base", "aggressive"] as Scenario[]).map((s) => ({ s, out: computeFinancials(applyScenario(inputs, s)) })), [inputs]);
  const out = scenarios.find((x) => x.s === scenario)!.out;
  const applied = applyScenario(inputs, scenario);
  const waterfall = priceToEconomicsWaterfall(applied, out);
  const missing = FIELDS.filter((f) => evidence[f.key] === "RESEARCH_REQUIRED").length;
  const groups = [...new Set(FIELDS.map((f) => f.group))];
  const stepsMobile = ["Inputs", "Results", "Waterfall", "Scenarios"];

  return (
    <div>
      <ScenarioBar current="finance" />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button onClick={saveToScenario} className="tap rounded-[var(--radius-control)] bg-coconut-950 px-4 py-2 text-[0.85rem] font-semibold text-ivory-50">Save inputs to my scenario</button>
        <button onClick={loadIllustrative} className="tap rounded-[var(--radius-control)] border border-amber-500/60 bg-amber-500/10 px-4 py-2 text-[0.85rem] font-semibold text-amber-500">Load illustrative assumption set</button>
        <button onClick={clear} className="tap rounded-[var(--radius-control)] border border-neutral-300 px-4 py-2 text-[0.85rem] font-semibold">Clear all</button>
        {illustrative && <Badge tone="amber">ILLUSTRATIVE — every value is an ASSUMPTION; replace with quotations</Badge>}
        <span className="t-caption">{missing} inputs still RESEARCH REQUIRED{productName ? ` for ${productName}` : ""}</span>
      </div>
      {errors.length > 0 && <Callout tone="warning" title="Validation">{errors.join("; ")}</Callout>}

      <div className="mb-4 flex gap-2 md:hidden" role="tablist">{stepsMobile.map((s, i) => <button key={s} role="tab" aria-selected={step === i} onClick={() => setStep(i)} className={cx("tap flex-1 rounded-full border px-2 py-1.5 text-[0.75rem] font-semibold", step === i ? "bg-coconut-950 text-ivory-50 border-coconut-950" : "border-neutral-300")}>{s}</button>)}</div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        {/* Inputs */}
        <div className={cx(step !== 0 && "hidden md:block")}>
          {groups.map((g) => (
            <fieldset key={g} className="mb-6 border-t hairline pt-4">
              <legend className="t-overline text-neutral-500 pr-3">{g}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {FIELDS.filter((f) => f.group === g).map((f) => (
                  <label key={f.key} className="block">
                    <span className="flex items-center justify-between gap-2"><span className="text-[0.82rem] font-medium">{f.label}</span>
                      <select aria-label={`${f.label} evidence`} value={evidence[f.key]} onChange={(e) => setEv(f.key, e.target.value as EvidenceType)} className="t-badge rounded border bg-transparent px-1 py-0.5" style={{ color: EVIDENCE_COLOR[evidence[f.key]], borderColor: EVIDENCE_COLOR[evidence[f.key]] }}>
                        {(["VERIFIED_FACT", "ESTIMATE", "ASSUMPTION", "RESEARCH_REQUIRED"] as EvidenceType[]).map((e) => <option key={e} value={e}>{EVIDENCE_SHORT[e]}</option>)}
                      </select></span>
                    <input type="number" step="any" inputMode="decimal" value={inputs[f.key]} onChange={(e) => set(f.key, Number(e.target.value))} className={cx("tap mt-1 w-full rounded-[var(--radius-control)] border bg-white px-3 py-2 text-[0.95rem] t-data", evidence[f.key] === "RESEARCH_REQUIRED" ? "border-dashed border-neutral-400" : "border-neutral-300")} />
                    <span className="t-caption block">{f.unit}{f.help ? ` — ${f.help}` : ""}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        {/* Results */}
        <div>
          <div className={cx(step !== 1 && "hidden md:block")}>
            <div className="mb-4 flex items-center gap-2" role="radiogroup" aria-label="Scenario">{(["conservative", "base", "aggressive"] as Scenario[]).map((s) => <button key={s} role="radio" aria-checked={scenario === s} onClick={() => setScenario(s)} className={cx("tap rounded-full border px-3.5 py-1.5 text-[0.78rem] font-semibold uppercase tracking-wider", scenario === s ? "bg-coconut-950 text-ivory-50 border-coconut-950" : "border-neutral-300")}>{s}</button>)}</div>
            <p className="t-caption mb-4">Scenario multipliers (editable in code, shown transparently): {Object.entries(SCENARIO_MULTIPLIERS[scenario]).map(([k, v]) => `${k} ×${v}`).join(", ") || "none (base)"}</p>
            <Results out={out} />
          </div>
          <div className={cx("mt-8", step !== 2 && "hidden md:block")}>
            <p className="t-overline text-neutral-500 mb-2">Selling price → actual economics (per kg)</p>
            <Waterfall rows={waterfall.rows} format={(n) => `₹${num(n, 1)}`} label="Price to net economics per kg" />
            <p className="t-caption mt-2">Net per kg: <strong>₹{num(waterfall.netPerKg, 2)}</strong>. High selling price is not high profitability — the channel, marketing, packaging and working-capital lines decide.</p>
          </div>
          <div className={cx("mt-8", step !== 3 && "hidden md:block")}>
            <p className="t-overline text-neutral-500 mb-2">Three scenarios side by side</p>
            <div className="overflow-x-auto"><table className="table-data"><thead><tr><th>Metric</th>{scenarios.map((s) => <th key={s.s}>{s.s}</th>)}</tr></thead><tbody>
              {([["Net revenue / month", (o: FinancialOutputs) => inr(o.netRevenue)], ["Gross margin", (o: FinancialOutputs) => pct(o.grossMargin)], ["Contribution margin", (o: FinancialOutputs) => pct(o.contributionMargin)], ["EBITDA / month", (o: FinancialOutputs) => inr(o.ebitda)], ["Net profit / month", (o: FinancialOutputs) => inr(o.netProfit)], ["Net margin", (o: FinancialOutputs) => pct(o.netMargin)], ["Break-even utilisation", (o: FinancialOutputs) => Number.isFinite(o.breakEvenUtilisation) ? pct(o.breakEvenUtilisation) : "not reachable"], ["ROI (annual)", (o: FinancialOutputs) => pct(o.roi)], ["Payback (months)", (o: FinancialOutputs) => Number.isFinite(o.paybackMonths) ? num(o.paybackMonths, 1) : "—"]] as [string, (o: FinancialOutputs) => string][]).map(([label, fn]) => <tr key={label}><td className="font-medium">{label}</td>{scenarios.map((s) => <td key={s.s} className="t-data">{fn(s.out)}</td>)}</tr>)}
            </tbody></table></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Results({ out }: { out: FinancialOutputs }) {
  const rows: [string, keyof FinancialOutputs, string][] = [
    ["Finished quantity", "finishedQtyKg", `${num(out.finishedQtyKg)} kg/month`], ["Revenue", "revenue", inr(out.revenue)], ["Net revenue", "netRevenue", inr(out.netRevenue)], ["COGS", "cogs", inr(out.cogs)],
    ["Gross profit", "grossProfit", `${inr(out.grossProfit)} (${pct(out.grossMargin)})`], ["Contribution", "contribution", `${inr(out.contribution)} (${pct(out.contributionMargin)})`], ["Fixed costs", "fixedCosts", inr(out.fixedCosts)],
    ["EBITDA", "ebitda", `${inr(out.ebitda)} (${pct(out.ebitdaMargin)})`], ["EBIT", "ebit", inr(out.ebit)], ["Net profit", "netProfit", `${inr(out.netProfit)} (${pct(out.netMargin)})`], ["Operating cash flow", "operatingCashFlow", inr(out.operatingCashFlow)],
    ["Break-even quantity", "breakEvenQtyKg", Number.isFinite(out.breakEvenQtyKg) ? `${num(out.breakEvenQtyKg)} kg/month` : "not reachable"], ["Break-even revenue", "breakEvenRevenue", Number.isFinite(out.breakEvenRevenue) ? inr(out.breakEvenRevenue) : "—"], ["Break-even utilisation", "breakEvenUtilisation", Number.isFinite(out.breakEvenUtilisation) ? pct(out.breakEvenUtilisation) : "—"],
    ["Working capital", "workingCapital", inr(out.workingCapital)], ["Working-capital cycle", "workingCapitalCycleDays", `${out.workingCapitalCycleDays} days`], ["Capital employed", "capitalEmployed", inr(out.capitalEmployed)],
    ["ROI (annual net profit ÷ CAPEX)", "roi", pct(out.roi)], ["ROCE", "roce", pct(out.roce)], ["Payback", "paybackMonths", Number.isFinite(out.paybackMonths) ? `${num(out.paybackMonths, 1)} months` : "—"],
  ];
  return (
    <dl className="divide-y hairline divide-neutral-200">
      {rows.map(([label, key, value]) => (
        <div key={key} className="grid grid-cols-[1fr_auto] gap-3 py-2">
          <dt><span className="text-[0.88rem] font-medium">{label}</span><span className="t-caption block t-data">{FORMULAS[key]}</span></dt>
          <dd className="t-metric text-right text-[0.95rem]">{value} <span className="t-badge ml-1" style={{ color: "var(--color-ev-calculated)" }}>CALC</span></dd>
        </div>
      ))}
    </dl>
  );
}
