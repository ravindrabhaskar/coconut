"use client";

import Link from "next/link";
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/lib/hooks";
import { Badge, cx } from "@/components/ui/primitives";
import { inr, num } from "@/lib/format";

/**
 * Scenario — the single object every tool reads and writes, so assumptions are typed once.
 * Persisted per browser (localStorage) today; the shape is designed to move to a `scenarios` table with auth later.
 * Every numeric field carries its evidence label because tools must not silently upgrade an assumption.
 */
export interface Scenario {
  version: 1;
  name: string;
  updatedAt: string;
  productId?: string;
  productName?: string;
  massBalanceModelId?: string;
  scaleModelId?: string;
  capacityPerDay?: number;         // finished product per day
  capacityUnit?: string;
  operatingDaysPerMonth: number;
  rawInputPerDay?: number;         // nuts or kg per day
  rawInputUnit?: "nuts" | "kg";
  yieldRatio?: number;             // kg finished per raw unit
  yieldEvidence?: string;
  rawMaterialCostPerUnit?: number; // INR per raw unit — user-entered only
  sellingPricePerKg?: number;      // INR — user-entered only
  location?: "near_farms" | "urban" | "hyderabad" | "port" | "other";
  automation?: "manual" | "semi_automatic" | "automatic";
  shifts?: 1 | 2 | 3;
  targetMarket?: "B2B" | "B2C" | "Export" | "Hybrid";
  manpower?: number;
  powerKw?: number;
  waterKlPerDay?: number;
  capexInr?: number;               // only when derived from a scale model (CALCULATED) or user-entered
  capexEvidence?: string;
  packagingCostPerKg?: number;
  freightPerKg?: number;
  labourPerMonth?: number;
  utilitiesPerMonth?: number;
}

export const EMPTY_SCENARIO: Scenario = { version: 1, name: "My scenario", updatedAt: "", operatingDaysPerMonth: 25 };
const KEY = "coconut.scenario.v1";

export function useScenario(): [Scenario, (patch: Partial<Scenario>) => void, () => void] {
  const [raw, setRaw] = useLocalStorage(KEY, "");
  const scenario = useMemo<Scenario>(() => { try { return raw ? { ...EMPTY_SCENARIO, ...JSON.parse(raw) } : EMPTY_SCENARIO; } catch { return EMPTY_SCENARIO; } }, [raw]);
  const update = useCallback((patch: Partial<Scenario>) => {
    let current: Scenario = EMPTY_SCENARIO;
    try { const s = localStorage.getItem(KEY); if (s) current = { ...EMPTY_SCENARIO, ...JSON.parse(s) }; } catch {}
    setRaw(JSON.stringify({ ...current, ...patch, updatedAt: new Date().toISOString() }));
  }, [setRaw]);
  const reset = useCallback(() => setRaw(""), [setRaw]);
  return [scenario, update, reset];
}

const STEPS: { key: keyof Scenario; label: string; href: string }[] = [
  { key: "productId", label: "Product", href: "/build" },
  { key: "rawInputPerDay", label: "Mass balance", href: "/tools/mass-balance" },
  { key: "scaleModelId", label: "Factory", href: "/tools/factory-planner" },
  { key: "sellingPricePerKg", label: "Economics", href: "/tools/financial-model" },
];

/** Persistent strip shown on every tool page: what the scenario holds, what is still missing, where to go next. */
export function ScenarioBar({ current }: { current: "product" | "mass" | "factory" | "finance" | "compare" | "other" }) {
  const [s, , reset] = useScenario();
  const has = (k: keyof Scenario) => s[k] !== undefined && s[k] !== "" && s[k] !== null;
  const next = STEPS.find((st) => !has(st.key));
  const facts = [
    s.productName && `Product: ${s.productName}`,
    s.rawInputPerDay !== undefined && `Input: ${num(s.rawInputPerDay)} ${s.rawInputUnit ?? ""}/day`,
    s.capacityPerDay !== undefined && `Capacity: ${num(s.capacityPerDay)} ${s.capacityUnit ?? ""}/day`,
    s.yieldRatio !== undefined && `Yield: ${(s.yieldRatio * 100).toFixed(1)}% (${s.yieldEvidence ?? "assumption"})`,
    s.capexInr !== undefined && `CAPEX: ${inr(s.capexInr)} (${s.capexEvidence ?? "assumption"})`,
    s.sellingPricePerKg !== undefined && `Price: ₹${num(s.sellingPricePerKg)}/kg (your input)`,
    s.location && `Location: ${s.location.replace("_", " ")}`,
  ].filter(Boolean) as string[];
  return (
    <div className="mb-8 rounded-[var(--radius-control)] border border-leaf-300 bg-leaf-200/30 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="t-overline text-coconut-800">Scenario</span>
        <span className="text-[0.85rem] font-semibold">{s.name}</span>
        {facts.length ? facts.map((f) => <span key={f} className="t-data text-[0.72rem] text-neutral-700">{f}</span>) : <span className="t-caption">Empty — tools will fill it as you go.</span>}
        <span className="ml-auto flex items-center gap-2">
          {next && next.href !== "#" && <Link href={next.href} className={cx("t-badge rounded-full border border-coconut-800 px-2.5 py-1 hover:bg-coconut-950 hover:text-ivory-50")}>Next: {next.label} →</Link>}
          {facts.length > 0 && <button onClick={reset} className="t-caption underline">Reset</button>}
        </span>
      </div>
      <ol className="mt-2 flex flex-wrap gap-1.5" aria-label="Scenario steps">
        {STEPS.map((st) => <li key={st.key}><Badge tone={has(st.key) ? "green" : "neutral"}>{has(st.key) ? "✓ " : ""}{st.label}</Badge></li>)}
        <li><Badge tone={current === "compare" ? "fibre" : "neutral"}>Compare</Badge></li>
      </ol>
      <p className="t-caption mt-2">Shared across Mass balance → Factory planner → Financial model. Prices and costs are never pre-filled — only what you enter. Stored in this browser; account-based saved scenarios are on the roadmap.</p>
    </div>
  );
}
