import type { EvidenceType, Quantity, Unit, Confidence } from "@/domain/types";

export const TODAY = "2026-09-14";

type Extra = Partial<Omit<Quantity, "value" | "unit" | "evidence">>;

/** Generic quantity. */
export function q(value: number | undefined, unit: Unit, evidence: EvidenceType, extra: Extra = {}): Quantity {
  return { value, unit, evidence, researchedAt: TODAY, ...extra };
}

/** RESEARCH REQUIRED — no value. Always explain what is needed. */
export function rr(unit: Unit, notes: string, extra: Extra = {}): Quantity {
  return { unit, evidence: "RESEARCH_REQUIRED", notes, researchedAt: TODAY, ...extra };
}

/** Estimate with a range (value = midpoint unless given). */
export function est(min: number, max: number, unit: Unit, notes: string, extra: Extra & { value?: number; confidence?: Confidence } = {}): Quantity {
  const { value, ...rest } = extra;
  return { value: value ?? (min + max) / 2, min, max, unit, evidence: "ESTIMATE", notes, researchedAt: TODAY, confidence: extra.confidence ?? "medium", ...rest };
}

/** Expert judgment (qualitative-numeric, no external source). */
export function ej(value: number, unit: Unit, notes: string, extra: Extra = {}): Quantity {
  return { value, unit, evidence: "EXPERT_JUDGMENT", notes, researchedAt: TODAY, confidence: "medium", ...extra };
}

/** Assumption used inside a model (must be editable by the user). */
export function asm(value: number, unit: Unit, notes: string, extra: Extra = {}): Quantity {
  return { value, unit, evidence: "ASSUMPTION", notes, researchedAt: TODAY, ...extra };
}

/** Source-backed: authoritative source attached; exact figure/section not yet independently re-verified. */
export function sb(value: number | undefined, unit: Unit, sourceIds: string[], extra: Extra = {}): Quantity {
  return { value, unit, evidence: "SOURCE_BACKED", sourceIds, researchedAt: TODAY, confidence: "medium", ...extra };
}

/** Verified fact with source ids — requires verifiedBy and lastVerifiedAt to be meaningful. */
export function vf(value: number | undefined, unit: Unit, sourceIds: string[], extra: Extra = {}): Quantity {
  return { value, unit, evidence: "VERIFIED_FACT", sourceIds, researchedAt: TODAY, lastVerifiedAt: TODAY, confidence: "high", ...extra };
}

export function base(id: string, name: string, slug: string, summary: string) {
  return { id, name, slug, summary, status: "published" as const, createdAt: TODAY, updatedAt: TODAY };
}
