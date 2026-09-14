import type { DataKind, Quantity } from "@/domain/types";

/**
 * Data-staleness rules. Thresholds depend on data kind: prices go stale in weeks, regulations in years.
 * A value is judged on lastVerifiedAt, else reviewedAt, else researchedAt.
 */
export type Freshness = "current" | "review_suggested" | "potentially_stale" | "undated";

/** [reviewSuggestedAfterDays, staleAfterDays] */
export const FRESHNESS_RULES: Record<DataKind, [number, number]> = {
  price: [30, 90],
  quotation: [90, 180],
  scheme: [180, 365],
  statistic: [365, 730],
  market: [180, 365],
  engineering: [365, 1095],
  composition: [1095, 1825],
  regulation: [365, 1095],
  other: [180, 365],
};

export function inferDataKind(q: Quantity): DataKind {
  if (q.dataKind) return q.dataKind;
  const u = q.unit;
  if (u.startsWith("INR/") || u.startsWith("USD/")) return "price";
  if (u === "INR" || u === "USD") return "quotation";
  if (u === "million nuts" || u === "million t" || u === "INR crore" || u === "USD million") return "statistic";
  if (u === "%" || u === "kg/kg" || u === "l/kg" || u === "kcal/kg") return "composition";
  return "engineering";
}

export function freshness(q: Quantity, today = new Date()): { state: Freshness; ageDays?: number; basisDate?: string } {
  const basis = q.lastVerifiedAt ?? q.reviewedAt ?? q.researchedAt;
  if (!basis) return { state: "undated" };
  const age = Math.floor((today.getTime() - new Date(basis).getTime()) / 86_400_000);
  const [review, stale] = FRESHNESS_RULES[inferDataKind(q)];
  return { state: age > stale ? "potentially_stale" : age > review ? "review_suggested" : "current", ageDays: age, basisDate: basis };
}

export const FRESHNESS_LABEL: Record<Freshness, string> = { current: "Current", review_suggested: "Review suggested", potentially_stale: "Potentially stale", undated: "Undated" };
