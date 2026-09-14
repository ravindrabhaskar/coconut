# 05 — Visual Asset Manifest & Image System

The manifest lives in code so it is queryable, testable and admin-editable: `src/data/assets.ts` (entity `visual_assets`).
Every asset record carries: asset ID, entity ID, page, section, asset type, subject, purpose, visual brief, generation
status, alt text, caption, licence, attribution, illustrative flag, desktop/mobile variants (when produced).

## Visual classes and current implementation

| Class | Status | Implementation |
|---|---|---|
| A. Scientific / anatomical | **programmatic SVG** | `viz/coconut/svg-renderer.tsx` (exploded coconut), `viz/illustrations.tsx#ComponentCutaway` |
| B. Raw-material photography | **required** (briefs registered) | Macro photography briefs in manifest; never substituted with stock |
| C. Product photography | **programmatic SVG** (interim) | `illustrations.tsx#MaterialSwatch` — labelled “ILLUSTRATIVE MATERIAL VISUAL · PHOTOGRAPHY PENDING” |
| D. Process visuals | **programmatic SVG** | `illustrations.tsx#ProcessFlow` (animated step chain, vertical on mobile) |
| E. Machinery visuals | **programmatic SVG** | `illustrations.tsx#MachineSchematic` — footprint, I/O direction, operator zone, maintenance access; always labelled “ILLUSTRATIVE PROCESS EQUIPMENT — NOT A SPECIFIC COMMERCIAL MODEL” |
| F. Factory visuals | **programmatic SVG** | `viz/factory-blueprint.tsx` — blueprint grid, zones, material flow, hygiene, fire hatching |
| G. Customer application photos | **required** (briefs registered) | e.g. greenhouse on cocopeat slabs; GAC vessels at a water plant |
| H. Geographical | **programmatic SVG** | `viz/india-map.tsx` — schematic state shapes, explicitly not cartographic |
| I. Business / finance | **programmatic SVG** | `viz/charts.tsx` — bar, waterfall, score bars, risk heatmap (with screen-reader tables) |

## Art direction (unified)
Premium engineering visualisation. Warm charcoal / deep green grounds for dark sections; ivory for reading.
Gradient-shaded materials, fibre line patterns, turbulence shell texture, specular water. No cartoon, no clip art,
no stock-photo collage. Every generated visual is captioned honestly as illustrative.

## Replacing the 2D hero with a GLB
`viz/coconut/types.ts` defines the renderer contract. `webgl-renderer.tsx` activates only when
`NEXT_PUBLIC_COCONUT_GLB` points to a production-quality Draco-compressed model with named layer meshes
(`peduncle, exocarp, mesocarp, endocarp, kernel, water`). The page (`ExplodedCoconut`) is renderer-agnostic.

## Photography production rules
- Licensed or commissioned only; attribution stored in the manifest.
- Deliver AVIF/WebP, desktop 2400 px and mobile 1200 px, 3:2 for hero, 1:1 for macro.
- Real machines must carry manufacturer/model attribution or be shown as schematic.
