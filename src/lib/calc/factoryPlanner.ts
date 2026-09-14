/**
 * Factory planner — derives area, manpower, utility and capital indications for a product at a scale,
 * from a FactoryScaleModel (engineering assumptions) plus user choices.
 *
 * All outputs are CALCULATED from labelled inputs; the UI must display the evidence chain.
 * Layouts are CONCEPTUAL — require professional engineering validation.
 */

import type { FactoryScaleModel, FactoryZone, Quantity } from "@/domain/types";

export interface PlannerChoices {
  automation: "manual" | "semi_automatic" | "automatic";
  shifts: 1 | 2 | 3;
  location: "near_farms" | "urban" | "port" | "hyderabad" | "other";
  targetMarket: "B2B" | "B2C" | "Export" | "Hybrid";
}

export interface PlannedZone extends FactoryZone {
  areaSqm?: number;
  areaSqft?: number;
}

export interface PlannerResult {
  processingFloorSqm?: number;
  zones: PlannedZone[];
  builtUpSqm?: number;
  siteSqm?: number;
  siteAcres?: number;
  manpower?: number;
  powerKw?: number;
  waterKlPerDay?: number;
  capexInr?: number;
  workingCapitalNote: string;
  evidenceChain: { field: string; formula: string; evidence: Quantity["evidence"]; notes?: string }[];
  warnings: string[];
}

/** Multipliers applied on top of the base scale model (EXPERT_JUDGMENT — editable, documented). */
export const AUTOMATION_FACTORS = {
  manual: { manpower: 1.25, capex: 0.85, floor: 1.05 },
  semi_automatic: { manpower: 1.0, capex: 1.0, floor: 1.0 },
  automatic: { manpower: 0.7, capex: 1.35, floor: 0.95 },
} as const;

export const MARKET_FACTORS = {
  B2B: { fgStorage: 1.0, packaging: 0.9 },
  B2C: { fgStorage: 1.2, packaging: 1.4 },
  Export: { fgStorage: 1.5, packaging: 1.2 },
  Hybrid: { fgStorage: 1.3, packaging: 1.2 },
} as const;

const SQM_TO_SQFT = 10.7639;
const SQM_PER_ACRE = 4046.8564224;

export function planFactory(model: FactoryScaleModel, choices: PlannerChoices): PlannerResult {
  const warnings: string[] = [];
  const chain: PlannerResult["evidenceChain"] = [];
  const auto = AUTOMATION_FACTORS[choices.automation];
  const mkt = MARKET_FACTORS[choices.targetMarket];

  const baseFloor = model.processingFloorArea.value;
  if (baseFloor === undefined) warnings.push("Processing floor area is RESEARCH REQUIRED for this scale model.");
  const processingFloorSqm = baseFloor === undefined ? undefined : baseFloor * auto.floor;
  chain.push({
    field: "Processing floor",
    formula: `base processing floor (${model.processingFloorArea.evidence}: machine footprints × circulation factor ${model.circulationFactor.value ?? "?"}) × automation floor factor ${auto.floor}`,
    evidence: baseFloor === undefined ? "RESEARCH_REQUIRED" : "CALCULATED",
  });

  const zones: PlannedZone[] = model.zones.map((z) => {
    let ratio = z.areaRatio;
    if (z.kind === "storage_fg") ratio *= mkt.fgStorage;
    if (z.kind === "packaging") ratio *= mkt.packaging;
    const areaSqm = processingFloorSqm === undefined ? undefined : processingFloorSqm * ratio;
    return { ...z, areaRatio: ratio, areaSqm, areaSqft: areaSqm === undefined ? undefined : areaSqm * SQM_TO_SQFT };
  });
  chain.push({
    field: "Zone areas",
    formula: "processing floor × zone area ratio (EXPERT_JUDGMENT per product) × market factor (FG storage / packaging)",
    evidence: processingFloorSqm === undefined ? "RESEARCH_REQUIRED" : "CALCULATED",
  });

  const builtKinds = new Set(["receiving", "storage_raw", "inspection", "processing_wet", "processing_dry", "drying", "thermal", "qc_lab", "packaging", "storage_fg", "utilities", "water_treatment", "waste", "maintenance", "office", "worker_facilities", "effluent", "cooling"]);
  const builtUpSqm = processingFloorSqm === undefined ? undefined : zones.filter((z) => builtKinds.has(z.kind)).reduce((s, z) => s + (z.areaSqm ?? 0), 0);
  const siteSqm = processingFloorSqm === undefined ? undefined : zones.reduce((s, z) => s + (z.areaSqm ?? 0), 0);
  chain.push({ field: "Built-up area", formula: "Σ enclosed zone areas", evidence: builtUpSqm === undefined ? "RESEARCH_REQUIRED" : "CALCULATED" });
  chain.push({ field: "Site area", formula: "Σ all zones incl. roads, parking, loading, fire, expansion", evidence: siteSqm === undefined ? "RESEARCH_REQUIRED" : "CALCULATED" });

  const baseManpower = model.manpower.reduce((s, m) => s + (m.headcount.value ?? 0), 0);
  const manpowerUnknown = model.manpower.some((m) => m.headcount.value === undefined);
  const shiftFactor = choices.shifts === 1 ? 1 : choices.shifts === 2 ? 1.8 : 2.6;
  const manpower = manpowerUnknown ? undefined : Math.ceil(baseManpower * auto.manpower * shiftFactor);
  chain.push({
    field: "Manpower",
    formula: `Σ role headcounts (${model.shiftsPerDay}-shift base) × automation factor ${auto.manpower} × shift factor ${shiftFactor}`,
    evidence: manpowerUnknown ? "RESEARCH_REQUIRED" : "CALCULATED",
    notes: "Shift factor <N because supervisory/office roles do not scale linearly.",
  });
  if (manpowerUnknown) warnings.push("One or more manpower roles are RESEARCH REQUIRED.");

  const powerKw = model.power.value === undefined ? undefined : model.power.value * (choices.automation === "automatic" ? 1.15 : choices.automation === "manual" ? 0.9 : 1);
  chain.push({ field: "Connected load", formula: "scale-model connected load × automation factor (0.9 / 1.0 / 1.15)", evidence: powerKw === undefined ? "RESEARCH_REQUIRED" : model.power.evidence === "RESEARCH_REQUIRED" ? "RESEARCH_REQUIRED" : "CALCULATED" });

  const waterKlPerDay = model.water.value === undefined ? undefined : model.water.value * (choices.shifts === 1 ? 1 : choices.shifts === 2 ? 1.9 : 2.8);
  chain.push({ field: "Water", formula: "scale-model daily water × shift factor", evidence: waterKlPerDay === undefined ? "RESEARCH_REQUIRED" : "CALCULATED" });

  const capexInr = model.capex.value === undefined ? undefined : model.capex.value * auto.capex;
  chain.push({
    field: "CAPEX",
    formula: `scale-model CAPEX (${model.capex.evidence}) × automation capex factor ${auto.capex}`,
    evidence: capexInr === undefined ? "RESEARCH_REQUIRED" : "CALCULATED",
    notes: "Excludes land purchase. Machine quotations are RESEARCH REQUIRED — current supplier quotation needed.",
  });
  if (capexInr === undefined) warnings.push("CAPEX is RESEARCH REQUIRED — obtain current supplier quotations.");

  if (choices.location === "urban" && zones.some((z) => z.kind === "thermal" && (z.areaSqm ?? 0) > 0)) {
    warnings.push("Thermal processes (kilns, carbonisation) face siting and emissions constraints in urban areas — check pollution-control consent category.");
  }
  if (choices.location === "hyderabad" && model.rawMaterialPerDay.value !== undefined && model.rawMaterialPerDay.value > 5000) {
    warnings.push("Large raw-material volumes in Hyderabad imply long inbound haul from coconut-growing districts — compare a near-farm primary processing site.");
  }

  return {
    processingFloorSqm,
    zones,
    builtUpSqm,
    siteSqm,
    siteAcres: siteSqm === undefined ? undefined : siteSqm / SQM_PER_ACRE,
    manpower,
    powerKw,
    waterKlPerDay,
    capexInr,
    workingCapitalNote: `Working-capital days in scale model: ${model.workingCapitalDays.value ?? "RESEARCH REQUIRED"} (${model.workingCapitalDays.evidence}). Use the Financial Model to convert to INR with your prices.`,
    evidenceChain: chain,
    warnings,
  };
}

/** Simple packing of zones into a blueprint grid for visualisation (not an engineering layout). */
export interface LayoutRect { id: string; name: string; kind: FactoryZone["kind"]; x: number; y: number; w: number; h: number; hygiene?: FactoryZone["hygiene"]; fireRisk?: FactoryZone["fireRisk"]; areaSqm?: number }

export function layoutZones(zones: PlannedZone[], flowSequence: string[], canvasW = 100): LayoutRect[] {
  // Order: flow sequence first (material flow left→right), then supporting zones in a second band, site zones around.
  const byId = new Map(zones.map((z) => [z.id, z]));
  const flow = flowSequence.map((id) => byId.get(id)).filter(Boolean) as PlannedZone[];
  const flowIds = new Set(flow.map((z) => z.id));
  const support = zones.filter((z) => !flowIds.has(z.id) && !["roads", "parking", "loading", "fire_safety", "expansion"].includes(z.kind));
  const site = zones.filter((z) => ["roads", "parking", "loading", "fire_safety", "expansion"].includes(z.kind));
  const total = zones.reduce((s, z) => s + (z.areaSqm ?? 1), 0) || 1;
  const rects: LayoutRect[] = [];

  const band = (list: PlannedZone[], y: number, h: number, x0: number, wTotal: number) => {
    const sum = list.reduce((s, z) => s + (z.areaSqm ?? 1), 0) || 1;
    let x = x0;
    for (const z of list) {
      const w = ((z.areaSqm ?? 1) / sum) * wTotal;
      rects.push({ id: z.id, name: z.name, kind: z.kind, x, y, w, h, hygiene: z.hygiene, fireRisk: z.fireRisk, areaSqm: z.areaSqm });
      x += w;
    }
  };
  const siteShare = site.reduce((s, z) => s + (z.areaSqm ?? 1), 0) / total;
  const buildingH = 100 * (1 - Math.min(0.45, Math.max(0.2, siteShare)));
  const flowH = buildingH * 0.62;
  band(flow, 0, flowH, 0, canvasW);
  band(support, flowH, buildingH - flowH, 0, canvasW);
  band(site, buildingH, 100 - buildingH, 0, canvasW);
  return rects;
}
