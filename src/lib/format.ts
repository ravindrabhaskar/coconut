import type { EvidenceType, Quantity, Unit } from "@/domain/types";
import { formatInr, formatNumber } from "@/lib/calc/units";

export const EVIDENCE_LABEL: Record<EvidenceType, string> = {
  VERIFIED_FACT: "Verified fact",
  SOURCE_BACKED: "Source-backed",
  ESTIMATE: "Estimate",
  ASSUMPTION: "Assumption",
  CALCULATED: "Calculated",
  EXPERT_JUDGMENT: "Expert judgment",
  RESEARCH_REQUIRED: "Research required",
};

export const EVIDENCE_SHORT: Record<EvidenceType, string> = {
  VERIFIED_FACT: "VERIFIED", SOURCE_BACKED: "SOURCED", ESTIMATE: "ESTIMATE", ASSUMPTION: "ASSUMED", CALCULATED: "CALCULATED", EXPERT_JUDGMENT: "EXPERT", RESEARCH_REQUIRED: "RESEARCH REQUIRED",
};

export const EVIDENCE_COLOR: Record<EvidenceType, string> = {
  VERIFIED_FACT: "var(--color-ev-verified)", SOURCE_BACKED: "var(--color-ev-sourced)", ESTIMATE: "var(--color-ev-estimate)", ASSUMPTION: "var(--color-ev-assumption)",
  CALCULATED: "var(--color-ev-calculated)", EXPERT_JUDGMENT: "var(--color-ev-expert)", RESEARCH_REQUIRED: "var(--color-ev-research)",
};

const UNIT_LABEL: Partial<Record<Unit, string>> = {
  sqm: "m²", sqft: "sq ft", kWh: "kWh", kW: "kW", "%": "%", ratio: "", persons: "persons", count: "", text: "", "kg/kg": "kg/kg", "l/kg": "l/kg",
  "kL/day": "kL/day", "t/day": "t/day", "kg/day": "kg/day", "l/day": "l/day", "nuts/day": "nuts/day", "nuts/h": "nuts/h", "kg/h": "kg/h", "million nuts": "million nuts",
  "million t": "million t", "INR crore": "₹ crore", "INR lakh": "₹ lakh", "USD million": "US$ million", "l/unit": "l/nut", "kg/nut": "kg/nut",
};

export function unitLabel(u: Unit): string {
  return UNIT_LABEL[u] ?? u;
}

/** Formats a quantity's value (with range) for display. Percent values stored as fractions (0–1) or 0–100 are both handled. */
export function formatQuantity(q: Quantity, opts: { compact?: boolean } = {}): string {
  if (q.value === undefined) return "Research required";
  const pct = q.unit === "%";
  const scale = pct && q.value <= 1 && (q.max ?? q.value) <= 1 ? 100 : 1;
  const money = q.unit === "INR" || q.unit === "INR/kg" || q.unit === "INR/l" || q.unit === "INR/nut" || q.unit === "INR/t" || q.unit === "INR/unit";
  const fmt = (n: number) => {
    if (q.unit === "INR") return formatInr(n, { compact: opts.compact ?? true });
    if (money) return `₹${formatNumber(n, { digits: n < 100 ? 1 : 0 })}`;
    if (q.unit === "USD" || q.unit === "USD/kg" || q.unit === "USD/t") return `US$${formatNumber(n, { digits: n < 100 ? 2 : 0 })}`;
    const v = n * scale;
    const digits = Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2;
    return formatNumber(v, { digits, compact: opts.compact });
  };
  const hasRange = q.min !== undefined && q.max !== undefined && q.min !== q.max;
  const body = hasRange ? `${fmt(q.min!)}–${fmt(q.max!)}` : fmt(q.value);
  const unit = money || q.unit === "USD" || q.unit === "USD/kg" || q.unit === "USD/t" ? (q.unit.includes("/") ? `/${q.unit.split("/")[1]}` : "") : pct ? "%" : ` ${unitLabel(q.unit)}`;
  return `${body}${unit}`.trim();
}

export function pct(n: number | undefined, digits = 0): string {
  if (n === undefined || !Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}

export function inr(n: number | undefined): string {
  if (n === undefined || !Number.isFinite(n)) return "—";
  return formatInr(n);
}

export function num(n: number | undefined, digits = 0): string {
  if (n === undefined || !Number.isFinite(n)) return "—";
  return formatNumber(n, { digits });
}

export function titleCase(s: string): string {
  return s.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
