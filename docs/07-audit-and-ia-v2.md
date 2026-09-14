# 07 — Repository Audit & Information Architecture v2

Date: 2026-09-14. Verified against the repository (not the status summary).

## A. Current architecture map

| Layer | Location | Verdict |
|---|---|---|
| Domain model | `src/domain/types.ts` — Quantity + 40 entity interfaces | Sound. Keep. Extend (verification states, reviews, quotations, schemes, prices). |
| Content | `src/data/*` typed modules; `index.ts` derives 614 edges | Sound. Keep. This is the seed and the static fallback. |
| Persistence | `src/db/schema.ts` (45 tables, JSONB docs + relational edges), `read.ts`, `scripts/seed.ts` | Sound. Extend with 3 tables. |
| Services | `repository.ts` (single data boundary), `related.ts`, `search.ts` (in-memory), `gaps.ts` | Sound. `search` is fine to ~5k docs. |
| Calculators | `src/lib/calc/*` pure + tested | Sound. Keep. Needs a shared Scenario input. |
| UI | `components/ui`, `layout`, `entity`, `viz`, `features` | Sound tokens; a few inconsistent patterns (see L). |
| Routes | 49 page files, 245 static pages | Working. Organisation is the problem (see C). |
| Admin | `proxy.ts` cookie auth, JSON editor, DB writes | Works; JSON-only editing is a P2 debt. |
| Tests | 9 files / 51 tests (calc, data integrity, search, routing, evidence badge) | Good. No E2E. |
| Client state | `useLocalStorage` only (depth toggle, field interviews) | Minimal, clean. No auth readiness beyond admin cookie. |

## B. Current URL hierarchy (before)
```
/  /explore /explore/[slug] /components/[slug]→redirect
/products /products/[slug] /products/category/[slug]
/manufacturing (hub) /manufacturing/processes[/slug] /manufacturing/{factory-planner,mass-balance,financial-model,land-calculator,manpower}
/machinery[/slug]  /build[/product]  /compare
/opportunities[/slug] /opportunities/{finder,business-builder}
/export[/country] /india[/state] /hyderabad /customers[/slug] /industries[/slug]
/research[/slug] /research/gaps /sources[/slug] /methodology /technology /sustainability /value-chain /zero-waste
/field-validation /90-day-plan /roadmap /about /search /admin
```

## C. Problems with the current IA
1. **Three competing "plan a factory" entry points**: `/manufacturing` hub, `/build/[product]`, and product-page CTAs. Users cannot tell which is canonical.
2. **Calculators scattered** under `/manufacturing/*` and `/opportunities/*`; "Land calculator" is the factory planner with a different intro (duplicate).
3. **"Manufacturing" conflates two intents**: understanding processes (Processing) and designing a plant (Factory).
4. **"Build" and "Opportunities" overlap** (finder, builder, roadmap, 90-day plan are all Business intent).
5. **Markets nav mixes geography and demand**; India/Hyderabad are Locations, not Markets.
6. **"Insights" is vague**; Research/Evidence is the platform's differentiator and deserves a first-class label.
7. **Tool discovery**: no tool hub; tools are only reachable via mega-menu sub-items.
8. **Knowledge-graph navigation is bottom-of-page only** (RelatedBlocks); no contextual "Produced from / Requires / Sold to" rail.
9. **Homepage tries to show everything** (10 heavy sections) rather than positioning + journey.
10. **Evidence vocabulary too coarse**: "VERIFIED_FACT" is used for values with a source but unconfirmed section (medium confidence). Needs SOURCE_BACKED.

## D. Proposed IA (intent-based)
```
Explore      /explore, /explore/[component]                     — understand the coconut
Products     /products, /products/category/[c], /products/[p]   — what can be made
Processing   /processing, /processing/[process]                 — how it is made
Machinery    /machinery, /machinery/[m]                         — with what
Factory      /factory (journey hub), /build/[product]           — design a plant (single canonical journey)
Business     /business (hub), /opportunities[/o], /business/schemes, /roadmap, /90-day-plan, /field-validation
Markets      /markets (hub), /export[/c], /customers[/c], /industries[/i], /markets/prices, /value-chain
Locations    /locations (hub), /india[/state], /hyderabad
Research     /research[/r], /research/gaps, /sources[/s], /methodology, /technology, /sustainability, /zero-waste
Tools        /tools (hub), /tools/{factory-planner,mass-balance,financial-model,land-calculator,manpower,opportunity-finder,business-builder,compare}
```
Old URLs redirect permanently (`next.config.ts`). No content is deleted.

## E. Navigation hierarchy
Header: Explore · Products · Processing · Factory · Business · Markets · Locations · Research · Tools (9 groups; 6 visible + "More" collapses Locations/Research/Tools below 1280px) + Search + Depth.
Footer: same nine columns condensed.

## F. Homepage structure (v2)
1 Hero (positioning + 2 CTAs) → 2 Value chain strip (Coconut→Component→Product→Process→Machine→Factory→Market) → 3 Anatomy (exploded coconut) → 4 Product opportunities (compact table) → 5 Factory planning demo (live from a scale model) → 6 India supply intelligence (map) → 7 Markets & export → 8 Data credibility (live evidence stats + legend) → 9 Who it is for → 10 Final CTA.

## G. Page templates
Product: Overview → Key metrics → Raw material → Process & flow → Yield → Machines → Utilities → Quality → Factory models → Investment → Customers → Markets → Export → Regulations → Research → Evidence status.
Machine: Overview → Function → Applicable products → Capacity/Power/Footprint → MOC → Utilities → Supplier category → Quotation history → Comparable machines → Line position.
State: Production → Districts (RR) → Raw material → Products → Ecosystem → Logistics/ports → Schemes → Opportunity assessment.
Market: Overview → Demand → Products → Requirements → Customers → Pricing (dated) → Competition → Routes → Evidence.
Opportunity: Why → Input → Product → Market → Scale → Investment → Economics → Risks → Location → Evidence.
All templates carry a `GraphNav` rail (Produced from / Requires / Used in / Sold to / Exported to / Evidence).

## H. Entity relationship improvements
- Add `MachineQuotation` (supplier, model, price, GST, freight, installation, warranty, lead time, validity, attachment, status) → machine.
- Add `GovernmentScheme` (eligibility, benefit, max, geography, source, effective/verified) → states, products.
- Add `PriceRecord` (commodity, date, market, unit, grade, source) → products.
- Add `reviews[]` on BaseEntity for expert sign-off; DATA VERIFIED badge only when verifiedPct ≥ 70 and ≥ 1 review.
- Add Scenario (client) linking mass balance → planner → finance.

## I. Existing features to reuse
ExplodedCoconut, ProductTree, ValueChain, ZeroWasteRing, IndiaMap/IndiaAnalysis, FactoryBlueprint, charts, EvidenceBadge/Qty, TableOfContents, DepthGate, all calculators, search, gaps engine, admin editor.

## J. Missing features (classified)
P0: tools hub, factory journey hub, contextual GraphNav, scenario object, SOURCE_BACKED state + staleness, quotation/scheme/price models.
P1: thin-product depth, new products (milk powder, grow bags, coir rope/mats, vinegar, nata de coco, handicrafts), scheme finder page, price index page, CI + E2E smoke.
P2: form CMS, auth + saved scenarios, accurate TopoJSON map, photography pipeline, machine-level layout, location engine with freight.
P3: localisation, Postgres tsvector search, PDF export.

## K. Data/evidence gaps (from gap engine)
486 fields · 185 RESEARCH REQUIRED · 2 verified. Needs: 65 citations, 52 field-validation values, 46 measurements, 19 quotations. Weakest: Coir Yarn 35%, Copra/Biochar 40%, Cream/Oil/Flakes/Shell Powder 45%.

## L. UX inconsistencies
- Land calculator duplicates factory planner. → Land calculator becomes a scenario-aware view of the same tool under /tools.
- Product page hero CTA "Plan this industry" + bottom CTA + Build hub: keep one canonical `/build/[product]`; hub is `/factory`.
- Chips vs Badges used interchangeably for filters/tags. → Chips = filters, Badges = status/tags.
- Some hubs use grid-of-cards, others lists. → Hubs use the `HubGrid` pattern; entity indexes use lists/tables.
- Mobile TOC bar overlaps bottom CTAs on short pages. → Hide when fewer than 6 TOC items.

## M. Technical risks
- No git repository → no rollback. (Recommend `git init` + baseline commit before further work.)
- In-memory search rebuilt per server instance (fine now; migrate to tsvector at ~5k docs).
- URL moves require redirects (done in `next.config.ts`).
- Admin edits only with DATABASE_URL; JSON editing is error-prone → schema-driven forms (P2).

## N. Prioritised plan (this iteration implements Phases 1, 2 core, 3 partial, 4)
Phase 1 IA/nav/home/templates/GraphNav/tools hub · Phase 2 evidence states, staleness, quotation/scheme/price models, desk-verified standards · Phase 3 thin products + new products · Phase 4 scenario object across tools · Phase 5–9 prepared (docs + contracts), not built.

## O. Files affected
`next.config.ts` (redirects) · `src/app/{processing,factory,business,markets,locations,tools}` (new) · moved: `manufacturing/processes→processing`, calculators→`tools/*`, `compare→tools/compare` · `nav-data.ts`, `chrome.tsx` · `domain/types.ts` (+ evidence states, reviews, quotations, schemes, prices) · `db/schema.ts` (+3 tables) · `data/{schemes,prices,quotations}.ts`, `data/products-*.ts` · `lib/format.ts`, `lib/freshness.ts` · `components/entity/graph-nav.tsx`, `components/features/scenario.tsx` · `services/gaps.ts` · tests.

## P. Implemented in this iteration (2026-09-14)
- Phase 1: intent-based IA (9 groups, "More" collapse), hubs (/factory journey, /tools, /business, /markets, /locations), route moves with 308 redirects, breadcrumbs rewired, GraphNav rail on product/component/machine/process templates, Key-metrics strip on products, quotation history + comparable machines on machine pages, homepage v2 (positioning → chain → anatomy → products table → live factory demo → India → markets → credibility → audiences → CTA).
- Phase 2: SOURCE_BACKED state, verifiedBy/reviewedAt/dataKind on Quantity, ExpertReview on entities, DATA VERIFIED requires review, staleness rules, MachineQuotation / GovernmentScheme / PriceRecord entities + tables + admin + seed, Codex 177/240/210 and FSSAI 2.2/2.3 read from primary PDFs (46+ verified parameters across DC, VCO, coconut oil, milk, cream, milk powder, vinegar), PMFME verified (PIB Sep 2025), scheme register page, dated price register page (empty by design).
- Phase 3: seven thin products enriched (qualitative depth; numbers stay RESEARCH REQUIRED), six new products (milk powder, grow bags, rope & mats, vinegar, nata de coco, handicrafts).
- Phase 4: shared Scenario (localStorage, typed) with ScenarioBar; mass balance → planner → financial model read/write it.
- Phase 9 prep: CI workflow (typecheck → lint → unit → build → e2e), Playwright config + smoke/responsive/redirect/evidence/scenario specs.
Not done (next): git baseline, form-based CMS, auth + DB-persisted scenarios, TopoJSON map, photography, GLB, location engine, tsvector search, localisation.
