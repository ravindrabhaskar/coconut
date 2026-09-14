# 06 — Implementation Structure

```
src/
  domain/types.ts            Typed entity model (Quantity, evidence, 40+ entity interfaces, relationships)
  data/                      Typed content modules (identical shape to DB documents) — seed + static fallback
    helpers.ts               q / rr / est / ej / asm / vf constructors enforce evidence discipline
    sources.ts taxonomy.ts components.ts products-*.ts processes.ts machines.ts models.ts market.ts
    opportunities.ts research.ts validation.ts assets.ts index.ts (aggregates + builds relationship graph)
  db/
    schema.ts                Drizzle (PostgreSQL): base columns + JSONB document per entity, edges, evidence, audit
    read.ts                  readEntities / upsertEntity (used by repository + admin)
  services/
    repository.ts            THE data boundary. Static or Postgres by DATABASE_URL. hrefFor() route mapping.
    related.ts               Related-entity blocks + prev/next from the graph
    search.ts                Weighted in-memory index + autocomplete (swap for tsvector later)
    gaps.ts                  Research-Gap Engine (field status, coverage %, needs)
  lib/
    calc/units.ts            Explicit unit conversions (tested)
    calc/finance.ts          Financial model + formulas + scenarios (tested)
    calc/massBalance.ts      Stage-tree mass balance + validation + economics overlay (tested)
    calc/scoring.ts          Strategic assessment, opportunity finder, business builder, location scoring (tested)
    calc/factoryPlanner.ts   Planner + blueprint packing (tested)
    format.ts seo/site.tsx hooks.ts
  components/
    ui/                      primitives (Section, Prose, Badge, Callout, Metric, …), evidence.tsx (badge + popover)
    layout/                  header (mega menu / bottom sheet), chrome (footer, breadcrumbs, PageIntro), toc, depth
    entity/blocks.tsx        EntitySection, SWOT, QuantityTable, SourceList, RelatedBlocks
    viz/                     coconut/ (renderer contract, svg, webgl), product-tree, value-chain, zero-waste-ring,
                             india-map, factory-blueprint, charts, illustrations
    features/                factory-planner, financial-model, mass-balance, compare, finder + business-builder,
                             india-analysis, field-validation, search-box, entity-editor
  app/                       Routes (see docs/02-sitemap.md). Server components by default; client only for tools.
    api/                     search, entities/[type], finance, mass-balance, factory, score
    admin/                   proxy-protected; dashboard, entity browser/editor (writes only with DATABASE_URL)
  proxy.ts                   Admin auth (cookie = SHA-256 of ADMIN_PASSWORD)
db/schema.sql, db/migrations Generated DDL
scripts/seed.ts              Seeds Postgres from src/data (idempotent)
docs/                        IA, sitemap, ERM, design system, asset manifest, this file
```

## Rendering strategy
- Entity pages: SSG via `generateStaticParams` (component, product, build, process, machine, opportunity, research, source, state, country, category, industry, customer).
- Filtered indexes and tools reading `searchParams`: dynamic.
- Heavy client code (planner, model, mass balance, compare, finder, map) is isolated in `features/` and only ships on tool pages.
- WebGL is never loaded unless a GLB is configured; the SVG renderer is the default hero.

## Adding a product (no code change)
1. Add a `Product` document (data module or admin/DB) with `sourceComponentIds`, `processIds`, `machineIds`, `customers`, `certificationIds`, `regulationIds`, `exportCountryIds`, `risks`, `scaleOptions`.
2. Optionally add a `FactoryScaleModel` and a `MassBalanceModel` referencing it, and an `Opportunity` with criteria.
3. The product page, build page, related blocks, product trees, search index, compare rows, gap report, sitemap and API all pick it up automatically (integrity tests enforce referential validity).

## Scripts
`pnpm dev` · `pnpm build` · `pnpm test` · `pnpm typecheck` · `pnpm lint` · `pnpm db:generate` · `pnpm db:push` · `pnpm seed`
