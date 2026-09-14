/**
 * Programmatic technical illustrations (server-renderable SVG).
 * - MaterialSwatch: product hero — material texture, honestly captioned as illustrative.
 * - MachineSchematic: illustrative process equipment with I/O direction, operator zone, maintenance access.
 * - ComponentCutaway: static coconut cross-section with one layer highlighted.
 * - ProcessFlow: horizontal step chain with animated arrows (vertical on mobile via CSS).
 */

import { cx } from "@/components/ui/primitives";

const SWATCH: Record<string, { base: string; hi: string; grain: "granular" | "liquid" | "fibre" | "block" | "flake" | "powder" | "lump" | "mesh" }> = {
  "prd-desiccated-coconut": { base: "#f4efe3", hi: "#ffffff", grain: "granular" },
  "prd-coconut-flour": { base: "#efe6d2", hi: "#fbf8f1", grain: "powder" },
  "prd-coconut-milk": { base: "#f7f4ec", hi: "#ffffff", grain: "liquid" },
  "prd-coconut-cream": { base: "#f3eee2", hi: "#ffffff", grain: "liquid" },
  "prd-virgin-coconut-oil": { base: "#f7f3e2", hi: "#ffffff", grain: "liquid" },
  "prd-coconut-oil": { base: "#f1e2b4", hi: "#fff6d6", grain: "liquid" },
  "prd-copra": { base: "#c9a877", hi: "#e5d6bd", grain: "lump" },
  "prd-coconut-chips": { base: "#e9d5a8", hi: "#f8ecc8", grain: "flake" },
  "prd-coconut-flakes": { base: "#f4efe3", hi: "#fff", grain: "flake" },
  "prd-coconut-water": { base: "#e6efd8", hi: "#ffffff", grain: "liquid" },
  "prd-coconut-sugar": { base: "#a87437", hi: "#d1a26a", grain: "granular" },
  "prd-cocopeat": { base: "#6b4a2e", hi: "#8a6240", grain: "block" },
  "prd-coir-fibre": { base: "#b08d5b", hi: "#d2bc98", grain: "fibre" },
  "prd-coir-yarn": { base: "#a17f50", hi: "#c9a877", grain: "fibre" },
  "prd-coir-geotextile": { base: "#9c7a4c", hi: "#c9a877", grain: "mesh" },
  "prd-shell-charcoal": { base: "#1b1b1b", hi: "#3a3d42", grain: "lump" },
  "prd-activated-carbon": { base: "#141414", hi: "#2a2c30", grain: "granular" },
  "prd-shell-powder": { base: "#7a5a3a", hi: "#9c7a4c", grain: "powder" },
  "prd-biochar": { base: "#1e1a16", hi: "#3a3128", grain: "lump" },
};

export function MaterialSwatch({ productId, name, className }: { productId: string; name: string; className?: string }) {
  const s = SWATCH[productId] ?? { base: "#d2bc98", hi: "#e5d6bd", grain: "granular" as const };
  const id = `sw-${productId}`;
  return (
    <figure className={cx("relative overflow-hidden rounded-[var(--radius-media)]", className)}>
      <svg viewBox="0 0 800 560" className="h-full w-full" role="img" aria-label={`Illustrative material texture representing ${name}`}>
        <defs>
          <radialGradient id={`${id}-g`} cx="35%" cy="30%" r="90%"><stop offset="0%" stopColor={s.hi} /><stop offset="70%" stopColor={s.base} /><stop offset="100%" stopColor="#0b0b0b" stopOpacity="0.85" /></radialGradient>
          <filter id={`${id}-n`}><feTurbulence type="fractalNoise" baseFrequency={s.grain === "powder" ? "1.6" : s.grain === "granular" ? "0.9" : s.grain === "lump" ? "0.25" : s.grain === "liquid" ? "0.02" : "0.6"} numOctaves="3" seed="7" result="n" /><feColorMatrix in="n" type="saturate" values="0" /><feComponentTransfer><feFuncA type="table" tableValues={s.grain === "liquid" ? "0 0.08" : "0 0.45"} /></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply" /></filter>
          <pattern id={`${id}-fibre`} width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(-22)"><path d="M0 9 H18" stroke="#4a3220" strokeWidth="1.4" opacity="0.5" /><path d="M0 3 H18" stroke="#e5d6bd" strokeWidth="0.7" opacity="0.6" /></pattern>
          <pattern id={`${id}-mesh`} width="26" height="26" patternUnits="userSpaceOnUse"><path d="M0 13 H26 M13 0 V26" stroke="#4a3220" strokeWidth="3" opacity="0.7" /></pattern>
          <pattern id={`${id}-flake`} width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(15)"><ellipse cx="20" cy="20" rx="14" ry="5" fill="#fff" opacity="0.35" /><ellipse cx="5" cy="5" rx="9" ry="3.5" fill="#000" opacity="0.08" /></pattern>
        </defs>
        <rect width="800" height="560" fill="#0b1a12" />
        <rect x="60" y="60" width="680" height="440" rx="10" fill={`url(#${id}-g)`} filter={`url(#${id}-n)`} />
        {s.grain === "fibre" && <rect x="60" y="60" width="680" height="440" rx="10" fill={`url(#${id}-fibre)`} />}
        {s.grain === "mesh" && <rect x="60" y="60" width="680" height="440" rx="10" fill={`url(#${id}-mesh)`} />}
        {s.grain === "flake" && <rect x="60" y="60" width="680" height="440" rx="10" fill={`url(#${id}-flake)`} />}
        {s.grain === "block" && <><rect x="200" y="160" width="400" height="240" rx="6" fill={s.hi} opacity="0.35" /><rect x="200" y="160" width="400" height="240" rx="6" fill="none" stroke="#e5d6bd" strokeOpacity="0.5" /></>}
        {s.grain === "liquid" && <ellipse cx="300" cy="200" rx="120" ry="40" fill="#fff" opacity="0.35" />}
        <rect x="60" y="60" width="680" height="440" rx="10" fill="none" stroke="#fff" strokeOpacity="0.15" />
        <text x="80" y="530" fontSize="12" fill="#cfe0bd" fontFamily="var(--font-mono)" opacity="0.8">ILLUSTRATIVE MATERIAL VISUAL · PHOTOGRAPHY PENDING</text>
      </svg>
    </figure>
  );
}

export function MachineSchematic({ name, input, output, category, className }: { name: string; input: string; output: string; category: string; className?: string }) {
  return (
    <figure className={cx("rounded-[var(--radius-media)] border hairline bg-cocos p-4", className)}>
      <svg viewBox="0 0 800 380" className="w-full" role="img" aria-label={`Schematic line drawing of illustrative process equipment: ${name}`}>
        <defs><marker id="ms-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#26512f" /></marker></defs>
        {/* footprint */}
        <rect x="200" y="90" width="400" height="200" fill="#f4efe3" stroke="#26512f" strokeWidth="1.5" />
        <rect x="230" y="120" width="340" height="140" fill="none" stroke="#26512f" strokeWidth="1" strokeDasharray="4 3" />
        <rect x="250" y="140" width="120" height="100" fill="none" stroke="#26512f" strokeWidth="1" />
        <circle cx="470" cy="190" r="42" fill="none" stroke="#26512f" strokeWidth="1" />
        <circle cx="470" cy="190" r="6" fill="#26512f" />
        {/* operator zone */}
        <rect x="200" y="300" width="400" height="40" fill="#cfe0bd" fillOpacity="0.5" stroke="#4f7f3a" strokeDasharray="3 3" />
        <text x="210" y="325" fontSize="11" fontFamily="var(--font-mono)" fill="#26512f">OPERATOR ZONE</text>
        {/* maintenance access */}
        <rect x="610" y="90" width="60" height="200" fill="#e5d6bd" fillOpacity="0.5" stroke="#b08d5b" strokeDasharray="3 3" />
        <text x="640" y="190" fontSize="10" fontFamily="var(--font-mono)" fill="#6b4a2e" transform="rotate(-90 640 190)" textAnchor="middle">MAINTENANCE ACCESS</text>
        {/* I/O */}
        <line x1="40" y1="190" x2="195" y2="190" stroke="#26512f" strokeWidth="2" markerEnd="url(#ms-arrow)" />
        <text x="40" y="175" fontSize="11" fontFamily="var(--font-mono)" fill="#26512f">IN: {input.length > 28 ? input.slice(0, 27) + "…" : input}</text>
        <line x1="680" y1="190" x2="760" y2="190" stroke="#26512f" strokeWidth="2" markerEnd="url(#ms-arrow)" />
        <text x="760" y="175" fontSize="11" fontFamily="var(--font-mono)" fill="#26512f" textAnchor="end">OUT: {output.length > 26 ? output.slice(0, 25) + "…" : output}</text>
        <text x="200" y="76" fontSize="12" fontWeight="700" fontFamily="var(--font-display)" fill="#0b1a12">{name}</text>
        <text x="600" y="76" fontSize="10" fontFamily="var(--font-mono)" fill="#77736a" textAnchor="end">{category.toUpperCase()} · FOOTPRINT ENVELOPE</text>
        <text x="400" y="368" fontSize="10.5" fontFamily="var(--font-mono)" fill="#a83a2e" textAnchor="middle">ILLUSTRATIVE PROCESS EQUIPMENT — NOT A SPECIFIC COMMERCIAL MODEL</text>
      </svg>
    </figure>
  );
}

const LAYERS = [
  { id: "cmp-outer-husk", rx: 168, ry: 214, fill: "#4f7f3a" },
  { id: "cmp-fibrous-husk", rx: 161, ry: 206, fill: "#b08d5b" },
  { id: "cmp-hard-shell", rx: 109, ry: 146, fill: "#4a3220" },
  { id: "cmp-kernel", rx: 96, ry: 131, fill: "#f4efe3" },
  { id: "cmp-coconut-water", rx: 62, ry: 92, fill: "#cfe0bd" },
];

export function ComponentCutaway({ highlightId, className }: { highlightId: string; className?: string }) {
  const cx0 = 300, cy0 = 300;
  const idx = LAYERS.findIndex((l) => l.id === highlightId);
  return (
    <svg viewBox="0 0 600 600" className={className} role="img" aria-label="Coconut cross-section with the component highlighted">
      <defs><pattern id="cc-fibre" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)"><path d="M0 6 H12" stroke="#6b4a2e" strokeWidth="1" opacity="0.45" /></pattern></defs>
      <ellipse cx={cx0} cy={cy0 + 250} rx="180" ry="22" fill="#000" opacity="0.2" />
      {LAYERS.map((l, i) => {
        const on = i === idx;
        const dim = idx >= 0 && !on;
        return (
          <g key={l.id} opacity={dim ? 0.3 : 1}>
            <ellipse cx={cx0} cy={cy0} rx={l.rx} ry={l.ry} fill={l.fill} />
            {l.id === "cmp-fibrous-husk" && <ellipse cx={cx0} cy={cy0} rx={l.rx} ry={l.ry} fill="url(#cc-fibre)" />}
            {on && <ellipse cx={cx0} cy={cy0} rx={l.rx + 6} ry={l.ry + 6} fill="none" stroke="#a9c58e" strokeWidth="5" opacity="0.8" />}
          </g>
        );
      })}
      <ellipse cx={cx0 - 40} cy={cy0 - 70} rx="30" ry="14" fill="#fff" opacity="0.3" />
      {idx < 0 && <text x={cx0} y={cy0 + 290} textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="currentColor" opacity="0.6">PALM RESOURCE — NOT PART OF THE FRUIT CROSS-SECTION</text>}
    </svg>
  );
}

export function ProcessFlow({ steps, dark }: { steps: { name: string; zone?: string; qc?: string }[]; dark?: boolean }) {
  return (
    <ol className="grid gap-2 md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]" aria-label="Process steps">
      {steps.map((s, i) => (
        <li key={i} className="relative flex md:block">
          <div className={cx("flex-1 rounded-[var(--radius-control)] border p-3", dark ? "border-ivory-100/20 bg-ivory-50/5" : "border-neutral-200 bg-cocos")}>
            <p className="t-data opacity-60">{String(i + 1).padStart(2, "0")}{s.zone ? ` · ${s.zone}` : ""}</p>
            <p className="mt-1 text-[0.9rem] font-semibold leading-snug">{s.name}</p>
            {s.qc && <p className="t-caption mt-1">QC: {s.qc}</p>}
          </div>
          {i < steps.length - 1 && (
            <svg className="absolute -right-3 top-1/2 hidden h-4 w-6 -translate-y-1/2 md:block" viewBox="0 0 24 16" aria-hidden="true"><path d="M0 8h18" stroke="currentColor" strokeWidth="1.5" className="anim-flow" opacity="0.5" /><path d="M14 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" /></svg>
          )}
        </li>
      ))}
    </ol>
  );
}
