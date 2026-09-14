# COCONUT — One Coconut. An Entire Industry.

A database-driven, evidence-labelled platform for the complete coconut industry: components → material streams →
products → processes → machinery → factories → customers → markets → export → risks → economics → scale.

## Run

```bash
pnpm install
pnpm dev            # http://localhost:3000 — runs from typed static content (no database needed)
pnpm test           # 59 unit/integration tests; `pnpm e2e` runs Playwright smoke + responsive checks (install chromium once)
pnpm build && pnpm start
```

## Database (optional, recommended for production)

```bash
cp .env.example .env         # set DATABASE_URL (PostgreSQL / Supabase) and ADMIN_PASSWORD
pnpm db:push                 # create tables from src/db/schema.ts (DDL also in db/schema.sql)
pnpm seed                    # load src/data into the database (idempotent upserts)
```

With `DATABASE_URL` set the site reads from PostgreSQL and the admin layer (`/admin`) can create, edit, publish and
unpublish entities without code changes. Without it the site is fully functional in read-only static mode.

## Information architecture (v2)

Explore · Products · Processing · Machinery · Factory · Business · Markets · Locations · Research · Tools — see `docs/07-audit-and-ia-v2.md`. Old URLs (`/manufacturing/*`, `/compare`, `/opportunities/finder|business-builder`) redirect permanently.

## Evidence states

`VERIFIED_FACT` (primary document read; section, verifier, date) · `SOURCE_BACKED` · `ESTIMATE` · `ASSUMPTION` · `CALCULATED` · `EXPERT_JUDGMENT` · `RESEARCH_REQUIRED`. Primary standards on file under `research/` (Codex STAN 177/240/210, FSSAI Ch 2.2 v5 2025 & Ch 2.3 v1 2023, PIB PMFME 2025). Staleness rules per data kind in `src/lib/freshness.ts`.

## Principles enforced in code

- Every quantity is a `Quantity` with unit + evidence label (`VERIFIED_FACT | ESTIMATE | ASSUMPTION | CALCULATED | EXPERT_JUDGMENT | RESEARCH_REQUIRED`).
- Unknown values render **RESEARCH REQUIRED** — never a plausible number. Tests assert that research-required records carry no value and verified facts cite a source.
- Calculations live in `src/lib/calc` (pure, tested); UI never computes from display strings.
- Relationships are derived from entity fields (`src/data/index.ts#buildRelationships`) — related blocks, trees, search and sitemap are generated, never hard-coded.
- Planning outputs are labelled conceptual and require professional validation; nothing is investment advice.

## Documentation

`docs/01-information-architecture.md` · `docs/02-sitemap.md` · `docs/03-entity-relationship-model.md` ·
`docs/04-design-system.md` · `docs/05-visual-asset-manifest.md` · `docs/06-implementation-structure.md`

## 3D hero

The exploded coconut ships as a layered SVG technical illustration. To use a real model set
`NEXT_PUBLIC_COCONUT_GLB=/models/coconut.glb` (Draco, named layer meshes) — the page swaps renderers without changes.
