# 04 — Design System

**Direction:** Premium industrial + nature + science + technology. Editorial, high-contrast scale, restrained motion.
Not SaaS, not marketplace, not recipe blog, not ecommerce, not government portal.

## Tokens (defined once in `src/app/globals.css` via Tailwind v4 `@theme`)

### Colour
| Token              | Value     | Use |
|--------------------|-----------|-----|
| `--color-coconut-950` | #0B1A12 | Deep coconut green (dark sections, header) |
| `--color-coconut-900` | #12291C | Deep green surface |
| `--color-coconut-800` | #1C3A28 | |
| `--color-coconut-700` | #26512F | |
| `--color-leaf-500`    | #4F7F3A | Natural leaf green (accents, links on light) |
| `--color-leaf-400`    | #7EA55F | Accent on dark |
| `--color-leaf-300`    | #A9C58E | |
| `--color-ivory-50`    | #FBF8F1 | Warm ivory page ground |
| `--color-ivory-100`   | #F4EFE3 | |
| `--color-white-cocos` | #FFFDF8 | Coconut white |
| `--color-fibre-200`   | #E5D6BD | Natural fibre beige |
| `--color-fibre-300`   | #D2BC98 | |
| `--color-fibre-500`   | #B08D5B | Fibre / copra |
| `--color-earth-700`   | #6B4A2E | Earth brown |
| `--color-earth-800`   | #4A3220 | |
| `--color-charcoal-900`| #17181A | Charcoal |
| `--color-charcoal-800`| #24262A | |
| `--color-charcoal-700`| #3A3D42 | |
| `--color-black`       | #0A0A0A | |
| `--color-neutral-50..900` | warm greys | text and borders |

Evidence colours (semantic, always paired with text label, never colour-only):
`verified` leaf-500 · `estimate` fibre-500 · `assumption` amber · `calculated` slate-blue · `expert` earth-700 · `research-required` neutral-500 (dashed).

### Typography
| Style      | Font                 | Size / leading / tracking |
|------------|----------------------|---------------------------|
| Display    | Manrope 800          | clamp(3rem, 8vw, 7.5rem) / 0.95 / -0.03em |
| H1         | Manrope 800          | clamp(2.5rem, 5vw, 4.5rem) / 1.0 / -0.02em |
| H2         | Manrope 700          | clamp(1.9rem, 3.5vw, 3rem) / 1.05 / -0.02em |
| H3         | Manrope 700          | 1.5rem / 1.2 / -0.01em |
| H4         | Manrope 600          | 1.125rem / 1.3 |
| Body       | Inter 400            | 1.0625rem / 1.65 (max 68ch) |
| Body-lg    | Inter 400            | 1.25rem / 1.6 |
| Caption    | Inter 400            | 0.8125rem / 1.4, neutral-500 |
| Overline   | Inter 600            | 0.6875rem / 1 / +0.14em uppercase |
| Metric     | JetBrains Mono 500   | 2rem–3.5rem, tabular-nums |
| Data       | JetBrains Mono 400   | 0.8125rem, tabular-nums |
| Evidence badge | JetBrains Mono 600 | 0.625rem uppercase +0.08em |
| Source     | Inter 400 italic     | 0.8125rem |
| Nav        | Inter 500            | 0.875rem |
| CTA        | Inter 600            | 0.9375rem, uppercase tracking +0.06em |

### Spacing & layout
- 4px base scale; section padding `clamp(4rem, 10vw, 9rem)`.
- Container max 1440px; prose max 68ch; asymmetric 5/7 and 4/8 editorial grids.
- Radius: 2px (data), 6px (controls), 12px (media). No pill cards.
- Borders 1px neutral-200 (light) / charcoal-700 (dark). Shadows only for popovers.

### Material textures
Subtle SVG noise/grain overlay (opacity 0.04) on dark sections; fibre line-pattern for husk sections; never rustic.

### Motion
- Durations: 160ms micro, 320ms UI, 700–1200ms narrative. Easing `cubic-bezier(.2,.7,.2,1)`.
- Only motion that answers "what changed / what flows where / what comes from what / what next".
- `prefers-reduced-motion`: all narrative animation becomes instant; exploded coconut shows exploded state statically with a selector.

### Component inventory (`src/components/ui`)
Button, LinkButton, Badge, EvidenceBadge (+popover), ResearchRequired, Quantity, Metric, Section, SectionHeader, Prose,
DataTable, Tabs, Accordion, Tooltip, Skeleton, EmptyState, ErrorState, Callout, DisciplineRule, DepthToggle,
Breadcrumbs, TOC, Chip/Filter, RangeInput, NumberInput, Select, Stepper (mobile wizard), ScoreBar, Heatmap cell,
Freshness chip, SourceCitation.
