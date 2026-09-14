# 03 — Entity / Data Relationship Model (Coconut Industry Knowledge Graph)

All entities share a **base record**: `id, name, slug, summary, status (draft|published|archived), created_at, updated_at, last_verified_at`.

All quantities are stored as a **Quantity** value object, never as bare numbers:

```
Quantity {
  value?: number          // undefined ⇒ RESEARCH REQUIRED
  unit: Unit              // explicit unit enum (kg, t, l, nuts, kWh, sqft, sqm, acre, ha, INR, USD, %, days…)
  min?, max?: number
  currency?: 'INR'|'USD'
  geography?: string      // e.g. "India", "Tamil Nadu"
  scale?: string          // e.g. "1 t/day"
  basis?: string          // e.g. "per tonne of dehusked nuts, dry basis"
  evidence: EvidenceType  // VERIFIED_FACT | ESTIMATE | ASSUMPTION | CALCULATED | EXPERT_JUDGMENT | RESEARCH_REQUIRED
  sourceIds?: string[]    // → sources
  publishedAt?, researchedAt?, lastVerifiedAt?: ISO date
  formula?: string        // for CALCULATED
  notes?: string
  confidence?: 'low'|'medium'|'high'
  year?: number           // for time-sensitive statistics
}
```

## Entities (tables)

| Table                     | Purpose |
|---------------------------|---------|
| components                | Biological parts of the palm/fruit (husk, shell, kernel, water, sap, leaves, trunk, residues…) |
| products                  | Commercial products (coconut flour, VCO, cocopeat, activated carbon…) |
| product_categories        | food, beverages, horticulture, coir, industrial, personal-care, wellness, consumer |
| industries                | Food, Beverage, Horticulture, Coir, Industrial, Personal Care, Wellness, Consumer, Export, Technology, Waste-to-value |
| processes                 | Named manufacturing processes (e.g. "Wet-process VCO") with yields & utilities |
| process_steps             | Ordered steps per process: inputs, outputs, losses, machines, QC points |
| machines                  | Machinery database (capacity range, utilities, footprint, operators, MOC, availability) |
| machine_product_links     | Many-to-many machine ↔ product ↔ process stage |
| raw_materials             | Raw-material specifications & procurement notes |
| factories / factory_zones | Factory zone definitions and per-product zone rules |
| factory_scale_models      | Product × capacity engineering assumptions (area ratios, manpower, utilities) |
| suppliers (categories)    | Research supplier categories (never fabricated company names) |
| customers / customer_segments | Buyer types, specs they care about, buying process |
| markets / countries / states / locations | Geography entities with scored dimensions |
| exports                   | Product × country export records (requirements, docs, freshness) |
| regulations / certifications | Regulatory bodies, standards, certifications |
| quality_parameters        | Spec parameters per product with evidence |
| packaging / storage_requirements | Formats, shelf life, storage conditions |
| utilities                 | Power/water/steam/fuel/air requirements per process/scale |
| manpower_roles            | Role, skill, headcount per scale |
| financial_models / financial_assumptions | Named assumption sets and computed models (3 scenarios) |
| mass_balance_models       | Yield chains by coconut type/maturity/process |
| risks                     | Risk register with probability/impact/mitigation |
| opportunities / opportunity_scores | Opportunity database + transparent criterion scores |
| competitors               | Verified companies only (empty until verified) |
| sources / evidence_records| Provenance |
| research_documents / research_notes | Repository |
| visual_assets             | Image asset manifest |
| field_interviews          | Interview framework + captured notes |
| roadmap_tasks             | 90-day plan and phase roadmap |
| technologies              | Industry 4.0 catalogue with maturity label |
| value_chain_nodes         | Farm→export chain |
| relationships             | Generic typed edges between any two entities |

## Relationship edges (`relationships` table)

`relationships(from_type, from_id, relation, to_type, to_id, note, evidence, order)`

Relation vocabulary:

```
HAS_COMPONENT        coconut → component
DERIVES_FROM         component → component (fibre ← fibrous-husk)
PRODUCES             component → product
REQUIRES_PROCESS     product → process
REQUIRES_MACHINE     process → machine
STEP_USES_MACHINE    process_step → machine
YIELDS_BYPRODUCT     process → product
SOLD_TO              product → customer_segment
REQUIRES_CERT        product → certification
GOVERNED_BY          product → regulation
EXPORTED_TO          product → country
HAS_RISK             product → risk
HAS_FINANCIAL_MODEL  product → financial_model
HAS_MASS_BALANCE     product → mass_balance_model
HAS_OPPORTUNITY      product → opportunity
BELONGS_TO_INDUSTRY  product → industry
IN_CATEGORY          product → product_category
SUBSTITUTES          product → product
COMPETES_WITH        product → competitor
CITED_BY             any → source
ILLUSTRATED_BY       any → visual_asset
LOCATED_IN           location → state
RELATED_RESEARCH     any → research_document
```

Example chain (fully data-derived):

```
COCONUT ─HAS_COMPONENT→ HARD SHELL ─PRODUCES→ SHELL CHARCOAL ─PRODUCES→ ACTIVATED CARBON
ACTIVATED CARBON ─REQUIRES_PROCESS→ Steam Activation ─REQUIRES_MACHINE→ Rotary Activation Kiln
ACTIVATED CARBON ─SOLD_TO→ Water-treatment companies ─EXPORTED_TO→ (countries) ─HAS_RISK→ Fuel price risk
ACTIVATED CARBON ─HAS_FINANCIAL_MODEL→ AC-1tpd-base
```

## Status vocabulary

Entity content status: `PAGE_IMPLEMENTED | DATA_PARTIALLY_POPULATED | DATA_VERIFIED | RESEARCH_REQUIRED`
Computed by the Research-Gap Engine from field coverage and evidence types.

## Runtime data source

- `DATABASE_URL` set → Postgres via Drizzle (`src/db/schema.ts`, DDL in `db/schema.sql`), seeded from `src/data/*`.
- Not set → typed static content modules in `src/data/*` (identical shapes) via the same `Repository` interface.
Page code only ever talks to `src/services/*`, never to a data source directly.
