@AGENTS.md

# COCONUT platform — working notes

- Data boundary: pages import only from `src/services/*`. Content lives in `src/data/*` (typed) and mirrors the Postgres JSONB documents in `src/db/schema.ts`.
- Never invent numbers. Use `rr()` (RESEARCH_REQUIRED) from `src/data/helpers.ts` when a value is unknown; `est()` for literature ranges; `vf()` only with a sourceId.
- Calculations go in `src/lib/calc` with tests in `__tests__`. Run `pnpm test`, `pnpm typecheck`, `pnpm lint` before finishing.
- Relationship edges are derived in `src/data/index.ts#buildRelationships`; do not hard-code related entities in UI.
- Bash heredocs on this Windows shell break on non-ASCII characters; write files containing unicode with the Write tool.
