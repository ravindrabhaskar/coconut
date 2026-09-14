/**
 * Mass balance — traverses a MassBalanceModel stage tree and computes absolute masses.
 * Fractions are Quantities (evidence-labelled). Missing fraction values propagate as undefined (RESEARCH REQUIRED).
 * Sensitivity: caller may pass overrides {stageId: fraction}.
 */

import type { MassBalanceModel, MassBalanceStage, Quantity } from "@/domain/types";

export interface MassBalanceResult {
  stageId: string;
  name: string;
  kind: MassBalanceStage["kind"];
  massKg?: number;
  fractionOfParent?: number;
  fractionOfInput?: number;
  parentId?: string;
  productId?: string;
  componentId?: string;
  evidence: Quantity["evidence"];
  depth: number;
  researchRequired: boolean;
}

export interface MassBalanceSummary {
  inputKg: number;
  results: MassBalanceResult[];
  totalsByKind: Record<MassBalanceStage["kind"], number>;
  closureError: number; // input − Σ(leaf masses); should be ~0 if model is closed
  unaccountedKg: number;
}

export function inputMassKg(model: MassBalanceModel, input: { nuts?: number; kg?: number }): number {
  if (input.kg !== undefined) return input.kg;
  if (input.nuts !== undefined) {
    if (model.avgNutMass.value === undefined) throw new Error("Average nut mass is RESEARCH REQUIRED for this model");
    return input.nuts * model.avgNutMass.value;
  }
  throw new Error("Provide nuts or kg");
}

export function computeMassBalance(
  model: MassBalanceModel,
  input: { nuts?: number; kg?: number },
  overrides: Record<string, number> = {},
): MassBalanceSummary {
  const inputKg = inputMassKg(model, input);
  const byId = new Map(model.stages.map((s) => [s.id, s]));
  const children = new Map<string | undefined, MassBalanceStage[]>();
  for (const s of model.stages) {
    const list = children.get(s.fromStageId) ?? [];
    list.push(s);
    children.set(s.fromStageId, list);
  }
  const results: MassBalanceResult[] = [];
  const masses = new Map<string, number | undefined>();

  const walk = (parentId: string | undefined, parentMass: number | undefined, depth: number) => {
    for (const s of children.get(parentId) ?? []) {
      const frac = overrides[s.id] ?? s.fraction.value;
      const mass = frac === undefined || parentMass === undefined ? undefined : parentMass * frac;
      masses.set(s.id, mass);
      results.push({
        stageId: s.id,
        name: s.name,
        kind: s.kind,
        massKg: mass,
        fractionOfParent: frac,
        fractionOfInput: mass === undefined ? undefined : mass / inputKg,
        parentId: s.fromStageId,
        productId: s.productId,
        componentId: s.componentId,
        evidence: overrides[s.id] !== undefined ? "ASSUMPTION" : s.fraction.evidence,
        depth,
        researchRequired: frac === undefined,
      });
      walk(s.id, mass, depth + 1);
    }
  };
  // root stage(s): those with no parent
  const roots = children.get(undefined) ?? [];
  for (const r of roots) {
    const frac = overrides[r.id] ?? r.fraction.value ?? 1;
    const mass = inputKg * frac;
    masses.set(r.id, mass);
    results.push({
      stageId: r.id, name: r.name, kind: r.kind, massKg: mass, fractionOfParent: frac, fractionOfInput: frac,
      productId: r.productId, componentId: r.componentId, evidence: overrides[r.id] !== undefined ? "ASSUMPTION" : r.fraction.evidence, depth: 0, researchRequired: false,
    });
    walk(r.id, mass, 1);
  }

  // Leaves = stages with no children
  const totalsByKind: Record<MassBalanceStage["kind"], number> = { material: 0, product: 0, byproduct: 0, loss: 0 };
  let leafSum = 0;
  for (const r of results) {
    const isLeaf = !(children.get(r.stageId)?.length);
    if (isLeaf && r.massKg !== undefined) {
      totalsByKind[r.kind] += r.massKg;
      leafSum += r.massKg;
    }
  }
  void byId;
  return { inputKg, results, totalsByKind, closureError: inputKg - leafSum, unaccountedKg: Math.max(0, inputKg - leafSum) };
}

/** Checks that child fractions under every parent sum to ≤ 1 (allowing small tolerance). */
export function validateModel(model: MassBalanceModel, tol = 0.02): string[] {
  const errs: string[] = [];
  const groups = new Map<string | undefined, MassBalanceStage[]>();
  for (const s of model.stages) groups.set(s.fromStageId, [...(groups.get(s.fromStageId) ?? []), s]);
  for (const [parent, list] of groups) {
    if (parent === undefined) continue;
    const known = list.filter((s) => s.fraction.value !== undefined);
    if (known.length !== list.length) continue; // research required — skip closure check
    const sum = known.reduce((a, s) => a + (s.fraction.value ?? 0), 0);
    if (sum > 1 + tol) errs.push(`Children of ${parent} sum to ${(sum * 100).toFixed(1)}% (> 100%)`);
    if (sum < 1 - tol) errs.push(`Children of ${parent} sum to ${(sum * 100).toFixed(1)}% — ${((1 - sum) * 100).toFixed(1)}% unaccounted (add a loss stage)`);
  }
  return errs;
}

/** Revenue/cost/contribution overlay. Prices are supplied by the caller (never assumed). */
export function economicsOverlay(
  summary: MassBalanceSummary,
  pricePerKgByStage: Record<string, number | undefined>,
  processCostPerKgInput: number | undefined,
) {
  let revenue = 0;
  let priced = 0;
  let unpriced = 0;
  for (const r of summary.results) {
    if ((r.kind === "product" || r.kind === "byproduct") && r.massKg !== undefined) {
      const p = pricePerKgByStage[r.stageId];
      if (p === undefined) unpriced++;
      else {
        revenue += r.massKg * p;
        priced++;
      }
    }
  }
  const processCost = processCostPerKgInput === undefined ? undefined : processCostPerKgInput * summary.inputKg;
  return {
    potentialRevenue: revenue,
    processCost,
    contribution: processCost === undefined ? undefined : revenue - processCost,
    pricedStreams: priced,
    unpricedStreams: unpriced,
  };
}
