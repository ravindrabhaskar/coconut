import type { FactoryScaleModel, FactoryZone, MassBalanceModel, MassBalanceStage, Quantity } from "@/domain/types";
import { base, est, rr, ej, asm } from "./helpers";

const EJ = ["src-internal-ej"];

// ---------------------------------------------------------------------------
// Mass balance models
// ---------------------------------------------------------------------------

const stage = (id: string, name: string, kind: MassBalanceStage["kind"], fraction: Quantity, fromStageId?: string, extra: Partial<MassBalanceStage> = {}): MassBalanceStage => ({ id, name, kind, fraction, fromStageId, ...extra });

/** Whole mature coconut (tall variety, India) — fresh basis, husk on. */
export const massBalanceModels: MassBalanceModel[] = [
  {
    ...base("mb-mature-whole", "Mature Coconut — Whole-nut Separation (India, tall varieties)", "mature-whole-nut", "Separation of a whole mature coconut (with husk) into husk (fibre + pith), shell, kernel and water. Fresh-mass basis."),
    coconutType: "mature", maturityNote: "11–12 month nuts; fresh mass with husk.", geography: "India", baseUnit: "nuts",
    avgNutMass: est(1.2, 1.6, "kg", "Whole mature nut mass with husk for tall varieties; hybrids/dwarfs differ. Weigh a sample of 100 nuts before relying on this.", { basis: "kg per whole nut, fresh, husk on", sourceIds: ["src-cdb", ...EJ], confidence: "medium" }),
    stages: [
      stage("husk", "Husk (exocarp + mesocarp)", "material", est(0.30, 0.40, "ratio", "Husk share of whole nut fresh mass.", { sourceIds: ["src-coir-board", ...EJ] }), undefined, { componentId: "cmp-fibrous-husk" }),
      stage("shell", "Shell (endocarp)", "material", est(0.12, 0.16, "ratio", "Shell share.", { sourceIds: EJ }), undefined, { componentId: "cmp-hard-shell" }),
      stage("kernel", "Kernel (fresh, with testa)", "material", est(0.28, 0.35, "ratio", "Fresh kernel share.", { sourceIds: ["src-cdb", ...EJ] }), undefined, { componentId: "cmp-kernel" }),
      stage("water", "Coconut water (mature)", "material", est(0.12, 0.20, "ratio", "Mature-nut water share; declines with maturity.", { sourceIds: EJ, confidence: "low" }), undefined, { componentId: "cmp-coconut-water" }),
      // Husk → fibre/pith (dry-basis conversion folded in via lower fractions; note moisture)
      stage("husk-moisture", "Moisture lost in husk drying", "loss", est(0.30, 0.50, "ratio", "Fresh husk carries 30–50% moisture depending on age; dried before/while processing.", { confidence: "low" }), "husk"),
      stage("fibre", "Coir fibre (dry)", "product", est(0.15, 0.22, "ratio", "≈ 25–35% of dry husk expressed on fresh husk after moisture loss.", { formula: "(0.25–0.35) × (1 − husk moisture)", confidence: "low", sourceIds: ["src-coir-board", ...EJ] }), "husk", { productId: "prd-coir-fibre", componentId: "cmp-coir-fibre" }),
      stage("pith", "Coir pith (dry)", "product", est(0.33, 0.45, "ratio", "≈ 65–75% of dry husk on fresh-husk basis after moisture loss.", { formula: "(0.65–0.75) × (1 − husk moisture)", confidence: "low", sourceIds: ["src-coir-board", ...EJ] }), "husk", { productId: "prd-cocopeat", componentId: "cmp-coir-pith" }),
      stage("husk-fines", "Husk fines / process loss", "loss", est(0.03, 0.08, "ratio", "Dust and fines.", { confidence: "low" }), "husk"),
      // Shell → charcoal
      stage("shell-moisture", "Shell moisture", "loss", est(0.08, 0.15, "ratio", "Fresh shell moisture.", { confidence: "low" }), "shell"),
      stage("dry-shell", "Dry shell", "material", est(0.85, 0.92, "ratio", "Dry shell after moisture loss.", { confidence: "low" }), "shell"),
      stage("charcoal", "Shell charcoal", "product", est(0.25, 0.32, "ratio", "Charcoal per dry shell.", { confidence: "medium" }), "dry-shell", { productId: "prd-shell-charcoal" }),
      stage("shell-volatiles", "Volatiles (heat) from carbonisation", "loss", est(0.68, 0.75, "ratio", "Mass lost as volatiles — recoverable as process heat.", { confidence: "medium" }), "dry-shell"),
      // Kernel → DC + parings + water evaporated
      stage("parings", "Parings (testa)", "byproduct", est(0.10, 0.15, "ratio", "Testa share of fresh kernel; to oil/feed.", { confidence: "low" }), "kernel"),
      stage("white-kernel", "White kernel", "material", est(0.85, 0.90, "ratio", "Kernel after paring.", { confidence: "low" }), "kernel"),
      stage("dc", "Desiccated coconut", "product", est(0.34, 0.40, "ratio", "DC per kg white kernel (≈50% moisture → ≤3%; small fines loss).", { confidence: "medium" }), "white-kernel", { productId: "prd-desiccated-coconut" }),
      stage("dc-evap", "Water evaporated in drying", "loss", est(0.58, 0.64, "ratio", "Moisture removed.", { confidence: "medium" }), "white-kernel"),
      stage("dc-fines", "Fines / handling loss", "loss", est(0.01, 0.03, "ratio", "", { confidence: "low" }), "white-kernel"),
      // Water
      stage("water-beverage", "Recoverable water (if beverage/vinegar line)", "byproduct", est(0.6, 0.9, "ratio", "Share of mature water hygienically recoverable; often discarded.", { confidence: "low" }), "water"),
      stage("water-loss", "Water discarded / spilt", "loss", est(0.1, 0.4, "ratio", "", { confidence: "low" }), "water"),
    ],
    sourceIds: ["src-cdb", "src-coir-board", ...EJ],
  },
  {
    ...base("mb-mature-vco", "Mature Coconut — Kernel to VCO (centrifuge) with co-products", "mature-kernel-vco", "Kernel-only balance for the wet centrifuge VCO route including residue (→ flour) and skim."),
    coconutType: "mature", maturityNote: "Fresh white kernel basis (after paring).", geography: "India", baseUnit: "kg", processId: "prc-vco-centrifuge", productId: "prd-virgin-coconut-oil",
    avgNutMass: est(0.30, 0.42, "kg", "Fresh white kernel per mature nut (≈ 0.9 × kernel share × nut mass).", { basis: "kg white kernel per nut", formula: "nut mass × kernel share × (1 − parings)", confidence: "low" }),
    stages: [
      stage("milk", "Coconut milk (first press, no water added)", "material", est(0.50, 0.60, "ratio", "Milk yield per kg grated kernel by screw press.", { confidence: "low" }), undefined),
      stage("residue", "Press residue (→ coconut flour)", "byproduct", est(0.40, 0.50, "ratio", "Wet residue.", { confidence: "low" }), undefined, { productId: "prd-coconut-flour" }),
      stage("vco", "Virgin coconut oil", "product", est(0.22, 0.30, "ratio", "VCO per kg milk (centrifuge).", { confidence: "low" }), "milk", { productId: "prd-virgin-coconut-oil" }),
      stage("skim", "Skim (aqueous phase)", "byproduct", est(0.55, 0.65, "ratio", "Water phase; may be used in beverages/feed.", { confidence: "low" }), "milk"),
      stage("protein", "Protein curd", "byproduct", est(0.08, 0.15, "ratio", "", { confidence: "low" }), "milk"),
      stage("vco-loss", "Process loss", "loss", est(0.02, 0.05, "ratio", "", { confidence: "low" }), "milk"),
      stage("flour", "Coconut flour (dry)", "product", est(0.35, 0.45, "ratio", "Dry flour per kg wet residue.", { confidence: "low" }), "residue", { productId: "prd-coconut-flour" }),
      stage("flour-evap", "Moisture evaporated", "loss", est(0.50, 0.60, "ratio", "", { confidence: "low" }), "residue"),
      stage("flour-loss", "Milling loss", "loss", est(0.03, 0.06, "ratio", "", { confidence: "low" }), "residue"),
    ],
    sourceIds: ["src-icar-cpcri", ...EJ],
  },
  {
    ...base("mb-shell-ac", "Dry Shell to Activated Carbon", "shell-to-activated-carbon", "Shell → charcoal → activated carbon with burn-off and fines."),
    coconutType: "mature", maturityNote: "Dry shell basis.", geography: "India", baseUnit: "kg", processId: "prc-activated-carbon", productId: "prd-activated-carbon",
    avgNutMass: est(0.15, 0.22, "kg", "Dry shell per mature nut.", { basis: "kg dry shell per nut", confidence: "low" }),
    stages: [
      stage("charcoal", "Shell charcoal", "material", est(0.25, 0.32, "ratio", "", { confidence: "medium" }), undefined, { productId: "prd-shell-charcoal" }),
      stage("volatiles", "Volatiles (heat)", "loss", est(0.68, 0.75, "ratio", "", { confidence: "medium" }), undefined),
      stage("ac", "Activated carbon (graded)", "product", est(0.28, 0.36, "ratio", "After burn-off and screening.", { confidence: "low" }), "charcoal", { productId: "prd-activated-carbon" }),
      stage("burnoff", "Burn-off during activation", "loss", est(0.55, 0.65, "ratio", "", { confidence: "medium" }), "charcoal"),
      stage("ac-fines", "Fines (saleable as powder / fuel)", "byproduct", est(0.04, 0.10, "ratio", "", { confidence: "low" }), "charcoal"),
    ],
    sourceIds: EJ,
  },
];

export const massBalanceById = Object.fromEntries(massBalanceModels.map((m) => [m.id, m]));

// ---------------------------------------------------------------------------
// Factory scale models — zone area ratios are EXPERT_JUDGMENT relative to processing floor
// ---------------------------------------------------------------------------

const z = (id: string, name: string, kind: FactoryZone["kind"], areaRatio: number, extra: Partial<FactoryZone> = {}): FactoryZone => ({ id, name, kind, areaRatio, ...extra });

const commonSite = (expansion = 0.5): FactoryZone[] => [
  z("office", "Office & admin", "office", 0.15),
  z("worker", "Worker facilities (change rooms, canteen, toilets)", "worker_facilities", 0.15, { hygiene: "transition" }),
  z("maint", "Maintenance & spares", "maintenance", 0.1),
  z("loading", "Loading / unloading bays", "loading", 0.25),
  z("roads", "Internal roads & circulation", "roads", 0.6),
  z("parking", "Parking", "parking", 0.2),
  z("fire", "Fire safety / assembly", "fire_safety", 0.1, { fireRisk: "low" }),
  z("expansion", "Expansion reserve", "expansion", expansion),
];

const model = (m: Partial<FactoryScaleModel> & { id: string; name: string; slug: string; summary: string; productId: string; capacity: Quantity; zones: FactoryZone[]; flowSequence: string[] }): FactoryScaleModel => ({
  ...base(m.id, m.name, m.slug, m.summary),
  rawMaterialPerDay: rr("kg/day", "Derived from yield model."),
  processingFloorArea: rr("sqm", "Sum of machine footprints × circulation factor — pending machine footprints."),
  circulationFactor: ej(2.5, "ratio", "Processing floor = Σ machine footprints × 2.5 (aisles, work-in-progress, operator zones). Typical planning ratio."),
  shiftsPerDay: 1,
  manpower: [], power: rr("kW", "Connected load — sum of machine loads + lighting/utilities; supplier data required."),
  water: rr("kL/day", "Process + cleaning + domestic — measure/derive."),
  capex: rr("INR", "RESEARCH REQUIRED — CURRENT SUPPLIER QUOTATIONS for machinery; building cost per sqft by region."),
  workingCapitalDays: ej(60, "days", "Inventory + receivables − payables; use Financial Model."),
  assumptions: [], sourceIds: EJ, ...m,
});

const H = (roleId: string, n: number, note = "") => ({ roleId, headcount: ej(n, "persons", note || "Per shift, semi-automatic line.") });

export const factoryScaleModels: FactoryScaleModel[] = [
  model({
    id: "fsm-dc-1tpd", name: "Desiccated Coconut — 1 t/day", slug: "dc-1tpd", summary: "Single-shift DC line producing ≈1 tonne DC/day from ≈8,000–10,000 mature nuts.",
    productId: "prd-desiccated-coconut", capacity: asm(1000, "kg/day", "Target finished DC per day."),
    rawMaterialPerDay: est(8000, 10000, "nuts/day", "At 0.10–0.13 kg DC per nut.", { formula: "1000 ÷ (0.10–0.13)", confidence: "low" }),
    processingFloorArea: est(250, 400, "sqm", "Σ footprints (dehusk 4, deshell 3, pare 2×2, wash 4, disintegrate 3, dryer 40, sieving 10, packing 10, boiler 30 ≈ 110 sqm) × 2.5 ≈ 275 sqm; range for dryer type.", { formula: "Σ machine footprints × 2.5", confidence: "low" }),
    zones: [
      z("receiving", "Nut receiving & grading yard", "receiving", 0.6, { hygiene: "dirty" }),
      z("raw-store", "Raw nut storage (3–5 days)", "storage_raw", 0.8, { hygiene: "dirty" }),
      z("dehusk", "Dehusking / deshelling (dirty zone)", "processing_wet", 0.35, { hygiene: "dirty" }),
      z("wet", "Paring, washing, disintegration (wet clean zone)", "processing_wet", 0.35, { hygiene: "clean" }),
      z("drying", "Drying hall", "drying", 0.3, { hygiene: "clean", fireRisk: "medium" }),
      z("dry", "Sieving & grading (dry clean zone)", "processing_dry", 0.15, { hygiene: "clean" }),
      z("packing", "Packing", "packaging", 0.2, { hygiene: "clean" }),
      z("fg", "Finished-goods warehouse (cool, dry)", "storage_fg", 0.6),
      z("qc", "QC laboratory", "qc_lab", 0.08),
      z("boiler", "Boiler / thermal utilities", "utilities", 0.25, { fireRisk: "high" }),
      z("water", "Water treatment & storage", "water_treatment", 0.12),
      z("etp", "Effluent treatment", "effluent", 0.15),
      z("waste", "Husk / shell / parings yard", "waste", 0.5, { fireRisk: "medium" }),
      ...commonSite(0.6),
    ],
    flowSequence: ["receiving", "raw-store", "dehusk", "wet", "drying", "dry", "packing", "fg"],
    manpower: [H("role-plant-manager", 1), H("role-production-supervisor", 1), H("role-machine-operator", 4), H("role-helper", 14, "Dehusking, paring and packing are labour-intensive at semi-automatic level."), H("role-qc-chemist", 1), H("role-maintenance", 1), H("role-store-logistics", 1), H("role-sales", 1), H("role-accounts", 1)],
    power: est(60, 120, "kW", "Connected load: disintegrator, dryer fans, boiler auxiliaries, packing, lighting. Supplier data required.", { confidence: "low" }),
    water: est(5, 12, "kL/day", "3–6 l/kg DC + cleaning + domestic.", { confidence: "low" }),
    fuel: rr("kg/day", "Boiler biomass (shell/husk can supply part)."),
    workingCapitalDays: ej(45, "days", "Nut inventory 5 days + DC inventory 15 days + receivables 30–45 days − supplier credit ~0 (farmers/traders paid promptly)."),
    assumptions: ["Single shift, 25 working days/month", "Semi-automatic line with manual paring supplement", "Building leased or built — land excluded", "Boiler-heated dryer"],
    sourceIds: EJ,
  }),
  model({
    id: "fsm-vco-200lpd", name: "Virgin Coconut Oil (centrifuge) — 200 l/day", slug: "vco-200lpd", summary: "Small VCO unit with coconut flour co-product, ≈2,000–2,800 nuts/day.",
    productId: "prd-virgin-coconut-oil", capacity: asm(200, "l/day", "VCO per day."),
    rawMaterialPerDay: est(1600, 2800, "nuts/day", "8–14 nuts per litre.", { formula: "200 × (8–14)", confidence: "low" }),
    processingFloorArea: est(120, 200, "sqm", "Σ footprints ≈ 50–70 sqm × 2.5.", { formula: "Σ machine footprints × 2.5", confidence: "low" }),
    zones: [
      z("receiving", "Receiving", "receiving", 0.5, { hygiene: "dirty" }), z("raw-store", "Raw nut storage", "storage_raw", 0.6, { hygiene: "dirty" }),
      z("dehusk", "Dehusk / deshell", "processing_wet", 0.35, { hygiene: "dirty" }), z("wet", "Paring, washing, grating, pressing", "processing_wet", 0.45, { hygiene: "clean" }),
      z("sep", "Centrifuge & filtration (clean zone)", "processing_wet", 0.25, { hygiene: "clean" }), z("flour", "Residue drying & milling", "drying", 0.3, { hygiene: "clean", fireRisk: "medium" }),
      z("packing", "Bottling & packing", "packaging", 0.25, { hygiene: "clean" }), z("fg", "FG store", "storage_fg", 0.4), z("qc", "QC lab", "qc_lab", 0.1),
      z("util", "Utilities", "utilities", 0.2), z("etp", "Effluent (skim/wash water)", "effluent", 0.15), z("waste", "Husk/shell yard", "waste", 0.5),
      ...commonSite(0.4),
    ],
    flowSequence: ["receiving", "raw-store", "dehusk", "wet", "sep", "packing", "fg"],
    manpower: [H("role-plant-manager", 1), H("role-production-supervisor", 1), H("role-machine-operator", 3), H("role-helper", 8), H("role-qc-chemist", 1), H("role-store-logistics", 1), H("role-sales", 1)],
    power: est(25, 50, "kW", "", { confidence: "low" }), water: est(3, 6, "kL/day", "", { confidence: "low" }),
    workingCapitalDays: ej(75, "days", "Slow-moving branded inventory and retail/distributor credit lengthen the cycle."),
    assumptions: ["Single shift", "Centrifuge route", "Flour co-product dried on shared dryer"],
  }),
  model({
    id: "fsm-cocopeat-10tpd", name: "Cocopeat (5 kg blocks) — 10 t/day", slug: "cocopeat-10tpd", summary: "Husk processing unit producing ≈10 t compressed cocopeat/day plus fibre, from ≈25–35 t dry husk.",
    productId: "prd-cocopeat", capacity: asm(10000, "kg/day", "Compressed cocopeat (blocks)."),
    rawMaterialPerDay: est(15000, 20000, "kg/day", "Dry husk at 60–70% pith recovery and washing/drying losses.", { formula: "10,000 ÷ (0.55–0.65)", confidence: "low" }),
    processingFloorArea: est(400, 700, "sqm", "Defibering, screening, pressing under roof ≈ 160–280 sqm footprints × 2.5.", { confidence: "low" }),
    zones: [
      z("husk-yard", "Husk yard (open)", "storage_raw", 3.0, { fireRisk: "high" }), z("soak", "Soaking pits", "processing_wet", 0.6),
      z("defiber", "Defibering & screening", "processing_wet", 0.4), z("wash", "Pith washing tanks", "water_treatment", 0.6),
      z("dry-yard", "Drying yard (open) — climate dependent", "drying", 4.0, { fireRisk: "medium" }), z("sieve", "Sieving", "processing_dry", 0.2),
      z("press", "Block pressing", "processing_dry", 0.3), z("fibre", "Fibre drying & baling", "processing_dry", 0.5),
      z("fg", "FG warehouse (palletised blocks)", "storage_fg", 1.2), z("qc", "QC (EC/pH/moisture)", "qc_lab", 0.05),
      z("etp", "Wastewater treatment / recycling", "effluent", 0.8), z("util", "Utilities", "utilities", 0.15),
      ...commonSite(0.8),
    ],
    flowSequence: ["husk-yard", "soak", "defiber", "wash", "dry-yard", "sieve", "press", "fg"],
    manpower: [H("role-plant-manager", 1), H("role-production-supervisor", 1), H("role-machine-operator", 4), H("role-helper", 18, "Yard handling and drying are labour-intensive."), H("role-qc-chemist", 1), H("role-maintenance", 1), H("role-store-logistics", 2), H("role-sales", 1), H("role-accounts", 1)],
    power: est(80, 150, "kW", "Defibering dominates.", { confidence: "low" }), water: rr("kL/day", "Pith washing water is the key unknown — RESEARCH REQUIRED; recycling essential."),
    workingCapitalDays: ej(90, "days", "Export receivables and container-load inventory."),
    assumptions: ["Sun drying (large yard) — mechanical dryers reduce yard but add fuel", "Export-oriented block production", "Land-intensive: yard areas dominate"],
    sourceIds: ["src-coir-board", ...EJ],
  }),
  model({
    id: "fsm-ac-2tpd", name: "Activated Carbon (steam) — 2 t/day", slug: "activated-carbon-2tpd", summary: "Continuous rotary-kiln steam activation producing ≈2 t AC/day from ≈6–7 t charcoal (≈20–25 t shell equivalent).",
    productId: "prd-activated-carbon", capacity: asm(2000, "kg/day", "Activated carbon."),
    rawMaterialPerDay: est(5500, 7000, "kg/day", "Charcoal at 0.28–0.36 kg AC/kg charcoal.", { formula: "2000 ÷ (0.28–0.36)", confidence: "low" }),
    processingFloorArea: est(800, 1500, "sqm", "Kiln 100–400 sqm, boiler, crushing/screening, cooling ≈ 300–600 sqm footprints × 2.5.", { confidence: "low" }),
    zones: [
      z("charcoal-yard", "Charcoal receiving & storage (covered)", "storage_raw", 1.0, { fireRisk: "high" }), z("sizing", "Crushing & screening (feed)", "processing_dry", 0.2),
      z("kiln", "Activation kiln hall", "thermal", 0.6, { fireRisk: "high" }), z("boiler", "Boiler house", "utilities", 0.3, { fireRisk: "high" }),
      z("cooling", "Cooling & product screening", "cooling", 0.3), z("acid", "Acid wash & drying (optional)", "processing_wet", 0.25),
      z("packing", "Bagging", "packaging", 0.2), z("fg", "FG warehouse", "storage_fg", 0.8), z("qc", "QC lab (iodine number, hardness)", "qc_lab", 0.08),
      z("etp", "Effluent / neutralisation", "effluent", 0.2), z("emission", "Emission control / stack", "utilities", 0.15),
      ...commonSite(0.6),
    ],
    flowSequence: ["charcoal-yard", "sizing", "kiln", "cooling", "acid", "packing", "fg"],
    shiftsPerDay: 3,
    manpower: [H("role-plant-manager", 1, "Total, not per shift"), H("role-production-supervisor", 3, "One per shift"), H("role-kiln-operator", 6, "Two per shift"), H("role-machine-operator", 6), H("role-helper", 12), H("role-qc-chemist", 2), H("role-maintenance", 3), H("role-store-logistics", 2), H("role-sales", 1), H("role-accounts", 1)],
    power: est(100, 250, "kW", "Kiln drive, fans, crushers, boiler auxiliaries.", { confidence: "low" }), water: rr("kL/day", "Boiler feed and cooling — RESEARCH REQUIRED."),
    steam: rr("kg/h", "RESEARCH REQUIRED — steam-to-carbon ratio."), fuel: rr("kcal/kg", "RESEARCH REQUIRED — kiln fuel."),
    workingCapitalDays: ej(90, "days", "Charcoal inventory, export receivables."),
    assumptions: ["Continuous 3-shift operation (kilns cannot cycle daily)", "Charcoal purchased or captive", "Red/orange PCB category — consent lead time"],
    sourceIds: ["src-cpcb", ...EJ],
  }),
  model({
    id: "fsm-milk-2klpd", name: "Coconut Milk (UHT/retort) — 2,000 l/day", slug: "coconut-milk-2klpd", summary: "Fresh-kernel coconut milk/cream line with aseptic or retort packing.",
    productId: "prd-coconut-milk", capacity: asm(2000, "l/day", "Standardised milk."),
    rawMaterialPerDay: est(1500, 2200, "kg/day", "Fresh kernel at 0.9–1.4 l/kg.", { formula: "2000 ÷ (0.9–1.4)", confidence: "low" }),
    processingFloorArea: est(300, 500, "sqm", "Kernel prep + extraction + UHT + aseptic filling ≈ 120–200 sqm footprints × 2.5.", { confidence: "low" }),
    zones: [
      z("receiving", "Receiving", "receiving", 0.5, { hygiene: "dirty" }), z("raw-store", "Nut store", "storage_raw", 0.6, { hygiene: "dirty" }),
      z("dehusk", "Dehusk/deshell", "processing_wet", 0.3, { hygiene: "dirty" }), z("wet", "Paring, washing, grating, pressing", "processing_wet", 0.4, { hygiene: "clean" }),
      z("uht", "Standardisation, homogenisation, UHT (high-care)", "processing_wet", 0.35, { hygiene: "clean" }), z("filling", "Aseptic / retort filling", "packaging", 0.35, { hygiene: "clean" }),
      z("incubation", "Incubation & FG warehouse", "storage_fg", 0.8), z("qc", "QC & micro lab", "qc_lab", 0.12),
      z("boiler", "Boiler & CIP", "utilities", 0.3, { fireRisk: "high" }), z("water", "Water treatment (RO/softening)", "water_treatment", 0.15), z("etp", "ETP (high BOD)", "effluent", 0.3), z("waste", "Residue/husk/shell yard", "waste", 0.5),
      ...commonSite(0.5),
    ],
    flowSequence: ["receiving", "raw-store", "dehusk", "wet", "uht", "filling", "incubation"],
    manpower: [H("role-plant-manager", 1), H("role-production-supervisor", 1), H("role-machine-operator", 5), H("role-helper", 12), H("role-qc-chemist", 2), H("role-maintenance", 1), H("role-store-logistics", 1), H("role-sales", 1), H("role-accounts", 1)],
    power: est(60, 120, "kW", "", { confidence: "low" }), water: est(10, 20, "kL/day", "4–8 l/kg kernel + CIP.", { confidence: "low" }),
    steam: rr("kg/h", "UHT and CIP steam — supplier data."),
    workingCapitalDays: ej(75, "days", "FG incubation hold + distributor credit."),
    assumptions: ["Single shift", "Aseptic line likely imported — long lead time", "High food-safety capital (CIP, micro lab)"],
    sourceIds: ["src-fssai", ...EJ],
  }),
  model({
    id: "fsm-flour-500kgpd", name: "Coconut Flour — 500 kg/day (co-product line)", slug: "coconut-flour-500kgpd", summary: "Flour line attached to a milk/VCO plant, drying and milling residue.",
    productId: "prd-coconut-flour", capacity: asm(500, "kg/day", "Dry flour."),
    rawMaterialPerDay: est(1100, 1400, "kg/day", "Wet residue at 0.35–0.45 kg flour/kg residue.", { formula: "500 ÷ (0.35–0.45)", confidence: "low" }),
    processingFloorArea: est(100, 180, "sqm", "Dryer, mill, sieve, packing ≈ 40–70 sqm × 2.5.", { confidence: "low" }),
    zones: [
      z("residue", "Residue receiving (chilled hold)", "receiving", 0.3, { hygiene: "clean" }), z("drying", "Drying", "drying", 0.5, { hygiene: "clean", fireRisk: "medium" }),
      z("mill", "Milling & sieving (dust-controlled)", "processing_dry", 0.4, { hygiene: "clean", fireRisk: "medium" }), z("packing", "Packing", "packaging", 0.3, { hygiene: "clean" }),
      z("fg", "FG store", "storage_fg", 0.6), z("qc", "QC", "qc_lab", 0.1), z("util", "Utilities", "utilities", 0.2),
      ...commonSite(0.3),
    ],
    flowSequence: ["residue", "drying", "mill", "packing", "fg"],
    manpower: [H("role-production-supervisor", 1), H("role-machine-operator", 2), H("role-helper", 4), H("role-qc-chemist", 1, "Shared with parent plant")],
    power: est(30, 60, "kW", "Mill and dryer.", { confidence: "low" }), water: est(0.5, 1.5, "kL/day", "Cleaning.", { confidence: "low" }),
    workingCapitalDays: ej(60, "days", ""),
    assumptions: ["Depends on a residue source — not a standalone plant", "Dust explosion precautions in milling"],
  }),
  model({
    id: "fsm-chips-200kgpd", name: "Coconut Chips — 200 kg/day", slug: "coconut-chips-200kgpd", summary: "Branded snack line producing ≈200 kg chips/day from ≈1,500–2,000 nuts.",
    productId: "prd-coconut-chips", capacity: asm(200, "kg/day", "Toasted chips."),
    rawMaterialPerDay: est(500, 700, "kg/day", "Fresh kernel at 0.30–0.40 kg chips/kg kernel.", { formula: "200 ÷ (0.30–0.40)", confidence: "low" }),
    processingFloorArea: est(120, 200, "sqm", "", { confidence: "low" }),
    zones: [
      z("receiving", "Receiving", "receiving", 0.4, { hygiene: "dirty" }), z("dehusk", "Dehusk/deshell/pare", "processing_wet", 0.4, { hygiene: "dirty" }),
      z("slice", "Washing, slicing, infusion", "processing_wet", 0.4, { hygiene: "clean" }), z("toast", "Toasting / drying", "drying", 0.4, { hygiene: "clean", fireRisk: "medium" }),
      z("packing", "Cooling & nitrogen-flush packing", "packaging", 0.4, { hygiene: "clean" }), z("fg", "FG store", "storage_fg", 0.5), z("qc", "QC", "qc_lab", 0.1), z("util", "Utilities", "utilities", 0.2),
      ...commonSite(0.3),
    ],
    flowSequence: ["receiving", "dehusk", "slice", "toast", "packing", "fg"],
    manpower: [H("role-plant-manager", 1), H("role-production-supervisor", 1), H("role-machine-operator", 2), H("role-helper", 8), H("role-qc-chemist", 1), H("role-sales", 2, "B2C needs sales/marketing headcount"), H("role-accounts", 1)],
    power: est(20, 40, "kW", "", { confidence: "low" }), water: est(2, 4, "kL/day", "", { confidence: "low" }),
    workingCapitalDays: ej(90, "days", "Retail/quick-commerce credit and branded inventory."),
    assumptions: ["B2C brand — marketing cost dominates economics, not processing"],
  }),
  model({
    id: "fsm-charcoal-3tpd", name: "Shell Charcoal — 3 t/day", slug: "shell-charcoal-3tpd", summary: "Kiln yard converting ≈10–12 t dry shell/day into ≈3 t charcoal.",
    productId: "prd-shell-charcoal", capacity: asm(3000, "kg/day", "Charcoal."),
    rawMaterialPerDay: est(9500, 12000, "kg/day", "Dry shell at 0.25–0.32 yield.", { formula: "3000 ÷ (0.25–0.32)", confidence: "low" }),
    processingFloorArea: est(200, 400, "sqm", "Kilns + sizing.", { confidence: "low" }),
    zones: [
      z("shell-yard", "Shell yard (covered)", "storage_raw", 2.0, { fireRisk: "high" }), z("kilns", "Kiln area (open-sided)", "thermal", 1.0, { fireRisk: "high" }),
      z("cooling", "Cooling / quenching", "cooling", 0.4), z("sizing", "Crushing & screening", "processing_dry", 0.3), z("fg", "Charcoal store (covered)", "storage_fg", 1.0, { fireRisk: "high" }),
      z("emission", "Smoke control", "utilities", 0.2), ...commonSite(0.5),
    ],
    flowSequence: ["shell-yard", "kilns", "cooling", "sizing", "fg"],
    manpower: [H("role-production-supervisor", 1), H("role-kiln-operator", 4), H("role-helper", 8), H("role-store-logistics", 1)],
    power: est(15, 40, "kW", "Crusher and screen.", { confidence: "low" }),
    workingCapitalDays: ej(45, "days", ""),
    assumptions: ["Traditional/drum kilns; continuous carbonisers change layout", "PCB consent essential"],
    sourceIds: ["src-cpcb", ...EJ],
  }),
  model({
    id: "fsm-shell-powder-2tpd", name: "Shell Powder — 2 t/day", slug: "shell-powder-2tpd", summary: "Grinding unit converting ≈2.2 t dry shell/day into graded powder.",
    productId: "prd-shell-powder", capacity: asm(2000, "kg/day", "Graded powder."),
    rawMaterialPerDay: est(2100, 2300, "kg/day", "", { confidence: "low" }),
    processingFloorArea: est(120, 200, "sqm", "", { confidence: "low" }),
    zones: [
      z("shell-yard", "Shell yard", "storage_raw", 1.0), z("clean", "Cleaning & drying", "processing_dry", 0.3), z("grind", "Grinding & classification (dust-controlled)", "processing_dry", 0.5, { fireRisk: "medium" }),
      z("packing", "Bagging", "packaging", 0.2), z("fg", "FG store", "storage_fg", 0.6), z("util", "Utilities & dust collection", "utilities", 0.2), ...commonSite(0.3),
    ],
    flowSequence: ["shell-yard", "clean", "grind", "packing", "fg"],
    manpower: [H("role-production-supervisor", 1), H("role-machine-operator", 2), H("role-helper", 5)],
    power: est(40, 80, "kW", "Grinding is power-intensive.", { confidence: "low" }),
    workingCapitalDays: ej(45, "days", ""),
    assumptions: ["Industrial (non-food) grade"],
  }),
  model({
    id: "fsm-water-2klpd", name: "Packaged Coconut Water (chilled/HPP toll) — 2,000 l/day", slug: "coconut-water-2klpd", summary: "Tender-nut opening line with chilled bottling; HPP via toll processor.",
    productId: "prd-coconut-water", capacity: asm(2000, "l/day", "Packaged water."),
    rawMaterialPerDay: est(4500, 8000, "nuts/day", "At 0.25–0.45 l per tender nut.", { formula: "2000 ÷ (0.25–0.45)", confidence: "low" }),
    processingFloorArea: est(150, 250, "sqm", "", { confidence: "low" }),
    zones: [
      z("receiving", "Tender nut receiving & washing", "receiving", 0.6, { hygiene: "dirty" }), z("open", "Hygienic opening line", "processing_wet", 0.4, { hygiene: "clean" }),
      z("filter", "Filtration & chilling", "processing_wet", 0.3, { hygiene: "clean" }), z("fill", "Filling (chilled)", "packaging", 0.3, { hygiene: "clean" }),
      z("cold", "Cold store (2–4 °C)", "storage_fg", 0.6), z("qc", "QC & micro", "qc_lab", 0.12), z("util", "Refrigeration & utilities", "utilities", 0.3), z("waste", "Husk/shell yard (large volume)", "waste", 1.5),
      ...commonSite(0.3),
    ],
    flowSequence: ["receiving", "open", "filter", "fill", "cold"],
    manpower: [H("role-plant-manager", 1), H("role-production-supervisor", 1), H("role-machine-operator", 3), H("role-helper", 10), H("role-qc-chemist", 1), H("role-store-logistics", 2), H("role-sales", 2)],
    power: est(40, 80, "kW", "Refrigeration dominates.", { confidence: "low" }), water: est(3, 6, "kL/day", "", { confidence: "low" }),
    workingCapitalDays: ej(45, "days", "Short shelf life forces fast turnover."),
    assumptions: ["HPP via toll processor — own HPP unit changes CAPEX by an order of magnitude", "Cold chain to customers required"],
  }),
];

export const factoryScaleModelById = Object.fromEntries(factoryScaleModels.map((m) => [m.id, m]));
export const scaleModelsForProduct = (productId: string) => factoryScaleModels.filter((m) => m.productId === productId);
