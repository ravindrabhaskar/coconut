# 02 — Complete Sitemap & Route Map

> Superseded for navigation by IA v2 in `docs/07-audit-and-ia-v2.md` (sections D–E). Route changes: `/manufacturing/processes[/slug]` → `/processing[/slug]`; calculators → `/tools/*`; `/compare` → `/tools/compare`; `/opportunities/{finder,business-builder}` → `/tools/{opportunity-finder,business-builder}`; new hubs `/factory`, `/business`, `/business/schemes`, `/markets`, `/markets/prices`, `/locations`, `/tools`.

Legend: **(D)** dynamic from database · **(S)** static/ISR page · **(T)** interactive tool · **(A)** admin

```
/                                   (S) Homepage — immersive narrative (10 sections)
/explore                            (S) Exploded coconut + component index
/explore/[slug]                     (D) Component page (outer-husk, fibrous-husk, hard-shell, kernel, coconut-water,
                                        coir-fibre, coir-pith, sap, leaves, trunk, residues)
/components/[slug]                  →  redirect alias to /explore/[slug]
/products                           (D) All products, filterable by category / component / market
/products/category/[slug]           (D) food, beverages, horticulture, coir, industrial, personal-care, wellness, consumer
/products/[slug]                    (D) Product page (deep, 3 depth levels, ends in PLAN THIS INDUSTRY)
/industries                         (D) Industry index
/industries/[slug]                  (D)
/manufacturing                      (S) Manufacturing hub
/manufacturing/processes            (D)
/manufacturing/processes/[slug]     (D)
/manufacturing/factory-planner      (T) Product-specific factory planner + dynamic blueprint
/manufacturing/land-calculator      (T)
/manufacturing/manpower             (D/T)
/manufacturing/financial-model      (T) Interactive financial model (Conservative / Base / Aggressive)
/manufacturing/mass-balance         (T) Interactive mass balance with sensitivity
/machinery                          (D) Machinery database with filters
/machinery/[slug]                   (D)
/build                              (T) Choose a product → planning chain
/build/[product]                    (D/T) Product-specific planning chain
/opportunities                      (D) Opportunity database + Strategic Assessment (0–100)
/opportunities/[slug]               (D) incl. auto-generated Business Model Canvas
/opportunities/finder               (T) "Which coconut business is right for me?"
/opportunities/business-builder     (T) Capital × market × product → indicative route
/compare                            (T) Compare 2–4 products
/value-chain                        (S/D) Interactive farm-to-export chain
/zero-waste                         (S/D) Circular value-recovery visualisation
/export                             (D/T) Export explorer with filters
/india                              (D/T) Interactive India map, transparent scoring, scenario comparison
/india/[state]                      (D)
/hyderabad                          (S/D) Hub analysis
/customers                          (D)
/customers/[slug]                   (D)
/research                           (D) Research repository, filters
/research/[slug]                    (D)
/research/gaps                      (D) Research-gap engine
/sources                            (D)
/sources/[slug]                     (D)
/technology                         (S/D) Coconut Industry 4.0
/sustainability                     (S/D) Circular coconut economy
/field-validation                   (T) 100+ question interview framework + local capture
/90-day-plan                        (T) Day 1–90 timeline
/roadmap                            (S) Phases 1–5, Year 1–10 strategic scenarios, discipline rules
/methodology                        (S) Evidence system
/about                              (S)
/search                             (T) Global search
/admin                              (A) Dashboard, entity lists, research gaps, publish state
/admin/[entity]                     (A)
/api/*                              JSON services
/sitemap.xml  /robots.txt           generated from the database
```

## SEO title patterns (generated from entity data)

- Component: `{Name} — Products, Processing & Industrial Applications`
- Product: `{Name} Manufacturing — Process, Machinery & Factory Requirements`
- Machine: `{Name} — Capacity, Utilities & Applications`
- Process: `{Name} — Steps, Inputs, Outputs & Machinery`
- State: `Coconut Processing in {State} — Raw Material, Infrastructure & Market Access`
