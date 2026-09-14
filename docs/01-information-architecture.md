# 01 — Information Architecture

**Platform:** COCONUT — "One Coconut. An Entire Industry."
**Nature:** Database-driven knowledge + planning system for the complete coconut industry.

## 1. Core philosophy

1. The **coconut is the hero**; every page descends from a coconut component.
2. **Data is the intelligence layer** — every page is rendered from relational entities, never hand-written per product.
3. **Evidence is first-class** — every quantitative value carries an evidence label
   (`VERIFIED_FACT | ESTIMATE | ASSUMPTION | CALCULATED | EXPERT_JUDGMENT | RESEARCH_REQUIRED`)
   and links to a source record. Missing data renders as **RESEARCH REQUIRED**, never a plausible number.
4. **Three depth levels** on every entity page: *Understand → Business → Industrial*.
5. **Nothing is waste if it can be economically valued** — every material stream has a commercial path or an explicit "not commercially validated" note.

## 2. Audience & depth model

| Audience      | Primary depth        | Entry points                                   |
|---------------|----------------------|------------------------------------------------|
| Student       | Understand           | Explore Coconut, Zero-Waste, Value Chain       |
| Farmer        | Understand/Business  | Components, Procurement, Field Validation      |
| Entrepreneur  | Business             | Opportunities, Business Builder, Compare       |
| Processor     | Industrial           | Products, Manufacturing, Machinery             |
| Factory owner | Industrial           | Factory Planner, Mass Balance, Financial Model |
| Investor      | Business             | Opportunity Scores, Risk, Scale Roadmap        |
| Researcher    | All                  | Research, Sources, Methodology, Research Gaps  |
| Buyer         | Business             | Products, Customers, Export                    |

Depth is a global toggle (`understand | business | industrial`) persisted client-side. Sections declare the
minimum depth at which they appear; deeper content is progressively disclosed rather than hidden.

## 3. Knowledge graph (top level)

```
COCONUT PALM
├── FRUIT
│   ├── Peduncle / Stem
│   ├── Outer Husk (exocarp)
│   ├── Fibrous Husk (mesocarp) ──► Coir Fibre, Coir Pith
│   ├── Hard Shell (endocarp)   ──► Charcoal, Activated Carbon, Shell Powder, Biochar
│   ├── Kernel (endosperm)      ──► DC, Flour, Milk, Cream, Oil, VCO, Copra, Chips, Flakes
│   └── Coconut Water           ──► Fresh, Packaged, Concentrate, Ingredients
├── Inflorescence / Sap         ──► Neera, Coconut Sugar, Vinegar (validation required)
├── Leaves / Midrib             ──► Thatch, Plates, Brooms, Biomass
├── Trunk                       ──► Coconut wood, Boards, Furniture
└── Residues                    ──► Biomass fuel, Compost, Biochar
```

Each node is an **entity** with typed relationships (see `03-entity-relationship-model.md`).

## 4. Primary navigation (6 visible groups + search + depth)

1. **Explore** — Components mega menu (11 components + Exploded Coconut)
2. **Products** — By category (Food, Beverages, Horticulture, Coir, Industrial, Personal Care, Wellness, Consumer)
3. **Manufacturing** — Processes, Machinery, Factory Planner, Land Calculator, Manpower, Financial Model, Mass Balance
4. **Build** — Opportunity Finder, Business Builder, Compare, Build [product], 90-Day Plan, Roadmap
5. **Markets** — Export, India Map, Hyderabad, Customers
6. **Insights** — Value Chain, Zero Waste, Technology, Sustainability, Research, Methodology
7. **Search** (global)
8. **Depth toggle**

Mobile: bottom-sheet mega menu.

## 5. Page template families

| Template                  | Driven by entity                       | Route pattern                           |
|---------------------------|----------------------------------------|-----------------------------------------|
| ComponentPage             | `components`                           | `/explore/[slug]` (`/components/[slug]` alias) |
| ProductPage               | `products`                             | `/products/[slug]`                      |
| ProductCategoryPage       | `product_categories`                   | `/products/category/[slug]`             |
| ProcessPage               | `processes`                            | `/manufacturing/processes/[slug]`       |
| MachinePage               | `machines`                             | `/machinery/[slug]`                     |
| BuildPage (planning chain)| `products` + `factory_scale_models`    | `/build/[product]`                      |
| IndustryPage              | `industries`                           | `/industries/[slug]`                    |
| CustomerSegmentPage       | `customer_segments`                    | `/customers/[slug]`                     |
| LocationPage              | `states`                               | `/india/[state]`                        |
| ResearchArticlePage       | `research_documents`                   | `/research/[slug]`                      |
| SourcePage                | `sources`                              | `/sources/[slug]`                       |
| OpportunityPage           | `opportunities`                        | `/opportunities/[slug]`                 |
| Tool pages                | calculators (pure domain functions)    | `/manufacturing/*`, `/compare`, `/build`|

Adding a row to `products` automatically yields: product page, build page, machinery links, customer links,
export links, risk links, research-gap report, search index entry, sitemap entry, related-entity blocks.

## 6. Wayfinding

- Breadcrumbs on every page: Home → Coconut → Component → Product.
- Sticky table of contents on long entity pages (desktop right rail; mobile mini-TOC).
- Previous/next contextual exploration within the same parent (sibling components / sibling products).
- Dynamic "Related" footer on every entity page, computed from `relationships` — never hard-coded in UI.

## 7. Evidence & provenance UI

- `EvidenceBadge` beside every quantity. Click → popover: value, unit, range, geography, scale, basis, evidence type,
  source, publication/research/verified dates, formula, limitations, confidence.
- `ResearchRequired` inline state when a field is unknown.
- `DataFreshness` chip on time-sensitive values (year, unit, source, research date, last verified).
- `/methodology` explains the evidence system; `/research/gaps` exposes coverage per entity.
