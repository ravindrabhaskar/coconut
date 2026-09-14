"use client";

import type { CoconutRendererProps } from "./types";

/**
 * Layered SVG exploded-coconut renderer (cross-section, engineering exploded view).
 * Each layer is an ovoid ring drawn with even-odd fill; the exploded state offsets layers along the vertical axis.
 * Materials: gradient shading + fibre pattern (mesocarp) + turbulence texture (endocarp) + specular water.
 */

const CX = 300;
const CY = 400;
const RX = 168;
const RY = 214;

// Layer geometry: thickness of each ring from the outside in. Water fills the remainder.
const THICK: Record<string, number> = { "cmp-outer-husk": 7, "cmp-fibrous-husk": 52, "cmp-hard-shell": 13, "cmp-kernel": 34 };
const EXPLODE_DY: Record<string, number> = { peduncle: -330, "cmp-outer-husk": -230, "cmp-fibrous-husk": -120, "cmp-hard-shell": -10, "cmp-kernel": 95, "cmp-coconut-water": 200 };

const ovoid = (rx: number, ry: number, cy = CY) => {
  // Slightly egg-shaped: narrower at top (stem end).
  const top = cy - ry;
  const bottom = cy + ry;
  return `M ${CX} ${top} C ${CX + rx * 0.78} ${top}, ${CX + rx} ${cy - ry * 0.25}, ${CX + rx} ${cy + ry * 0.05} C ${CX + rx} ${cy + ry * 0.62}, ${CX + rx * 0.62} ${bottom}, ${CX} ${bottom} C ${CX - rx * 0.62} ${bottom}, ${CX - rx} ${cy + ry * 0.62}, ${CX - rx} ${cy + ry * 0.05} C ${CX - rx} ${cy - ry * 0.25}, ${CX - rx * 0.78} ${top}, ${CX} ${top} Z`;
};

type Ring = { layer: CoconutRendererProps["layers"][number]; outer: { rx: number; ry: number }; inner: { rx: number; ry: number } | null };

/** Pure helper: nested ring radii from the outside in (water has no inner ring). */
function computeRings(layers: CoconutRendererProps["layers"]): Ring[] {
  const ordered = [...layers].sort((a, b) => a.order - b.order);
  const out: Ring[] = [];
  let rx = RX;
  let ry = RY;
  for (const l of ordered) {
    const t = THICK[l.id];
    const outer = { rx, ry };
    if (t !== undefined) { rx -= t; ry -= t * 1.15; }
    out.push({ layer: l, outer, inner: t !== undefined ? { rx, ry } : null });
  }
  return out;
}

export function SvgCoconutRenderer({ layers, exploded, activeId, onHover, onSelect, reducedMotion, className }: CoconutRendererProps) {
  // Build radii from outside in
  const rings = computeRings(layers);
  const transition = reducedMotion ? "none" : "transform 1100ms cubic-bezier(.2,.7,.2,1), opacity 400ms ease";
  const dim = (id: string) => activeId && activeId !== id;

  return (
    <svg viewBox="0 0 600 800" className={className} role="img" aria-label="Exploded technical illustration of a coconut showing peduncle, outer husk, fibrous husk, hard shell, kernel and coconut water" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="g-skin" cx="38%" cy="30%" r="80%"><stop offset="0%" stopColor="#8fb36c" /><stop offset="55%" stopColor="#4f7f3a" /><stop offset="100%" stopColor="#1f3d22" /></radialGradient>
        <radialGradient id="g-husk" cx="40%" cy="32%" r="80%"><stop offset="0%" stopColor="#e2cba3" /><stop offset="60%" stopColor="#b08d5b" /><stop offset="100%" stopColor="#6b4a2e" /></radialGradient>
        <radialGradient id="g-shell" cx="40%" cy="30%" r="85%"><stop offset="0%" stopColor="#8a6240" /><stop offset="55%" stopColor="#4a3220" /><stop offset="100%" stopColor="#1e140c" /></radialGradient>
        <radialGradient id="g-kernel" cx="42%" cy="30%" r="80%"><stop offset="0%" stopColor="#ffffff" /><stop offset="70%" stopColor="#f4efe3" /><stop offset="100%" stopColor="#d9d0bb" /></radialGradient>
        <radialGradient id="g-water" cx="40%" cy="28%" r="80%"><stop offset="0%" stopColor="#f0f7ea" /><stop offset="60%" stopColor="#cfe0bd" /><stop offset="100%" stopColor="#8fae74" /></radialGradient>
        <linearGradient id="g-peduncle" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8a6240" /><stop offset="100%" stopColor="#4a3220" /></linearGradient>
        <pattern id="p-fibre" patternUnits="userSpaceOnUse" width="14" height="14" patternTransform="rotate(-18)"><path d="M0 7 H14" stroke="#6b4a2e" strokeWidth="1.1" opacity="0.45" /><path d="M0 2 H14" stroke="#e5d6bd" strokeWidth="0.6" opacity="0.5" /></pattern>
        <filter id="f-shell-tex" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" result="n" /><feColorMatrix in="n" type="saturate" values="0" result="g" /><feComponentTransfer in="g" result="c"><feFuncA type="table" tableValues="0 0.25" /></feComponentTransfer><feBlend in="SourceGraphic" in2="c" mode="multiply" /></filter>
        <filter id="f-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10" /></filter>
        <filter id="f-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <clipPath id="clip-cut"><rect x="0" y="0" width={CX + 2} height="800" /></clipPath>
      </defs>

      {/* ground shadow */}
      <ellipse cx={CX} cy={CY + RY + 40} rx="190" ry="26" fill="#000" opacity={exploded ? 0.18 : 0.28} filter="url(#f-soft)" style={{ transition }} />

      {/* Peduncle (stem) */}
      <g style={{ transform: `translateY(${exploded ? EXPLODE_DY.peduncle : 0}px)`, transition, transformOrigin: "300px 400px" }} opacity={activeId ? 0.55 : 1}>
        <path d={`M ${CX - 16} ${CY - RY + 6} q 16 -30 32 0 v -8 q -16 -22 -32 0 z`} fill="url(#g-peduncle)" />
        <path d={`M ${CX} ${CY - RY - 2} v -40`} stroke="#6b4a2e" strokeWidth="7" strokeLinecap="round" />
        <path d={`M ${CX} ${CY - RY - 2} v -40`} stroke="#8a6240" strokeWidth="3" strokeLinecap="round" />
        <text x={CX + 20} y={CY - RY - 26} className="t-data" fill="currentColor" opacity="0.7" fontSize="11">Peduncle</text>
      </g>

      {rings.map(({ layer, outer, inner }) => {
        const id = layer.id;
        const dy = exploded ? (EXPLODE_DY[id] ?? 0) : 0;
        const fill = id === "cmp-outer-husk" ? "url(#g-skin)" : id === "cmp-fibrous-husk" ? "url(#g-husk)" : id === "cmp-hard-shell" ? "url(#g-shell)" : id === "cmp-kernel" ? "url(#g-kernel)" : "url(#g-water)";
        const d = inner ? `${ovoid(outer.rx, outer.ry)} ${ovoid(inner.rx, inner.ry)}` : ovoid(outer.rx, outer.ry);
        const isActive = activeId === id;
        return (
          <g key={id} style={{ transform: `translateY(${dy}px)`, transition, transformOrigin: "300px 400px", cursor: "pointer" }}
            opacity={dim(id) ? 0.35 : 1}
            onMouseEnter={() => onHover(id)} onMouseLeave={() => onHover(null)} onClick={() => onSelect(id)}
            role="button" tabIndex={0} aria-label={`${layer.name}: ${layer.short}`}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(id); } }}
            onFocus={() => onHover(id)} onBlur={() => onHover(null)}>
            {isActive && <path d={d} fillRule="evenodd" fill="none" stroke="#a9c58e" strokeWidth="6" opacity="0.6" filter="url(#f-glow)" />}
            <path d={d} fillRule="evenodd" fill={fill} filter={id === "cmp-hard-shell" ? "url(#f-shell-tex)" : undefined} />
            {id === "cmp-fibrous-husk" && <path d={d} fillRule="evenodd" fill="url(#p-fibre)" />}
            {/* cut-face shading: right half slightly darker to imply cross-section */}
            <path d={d} fillRule="evenodd" fill="#000" opacity="0.10" clipPath="url(#clip-cut)" />
            {id === "cmp-hard-shell" && (
              <g opacity="0.8">
                <ellipse cx={CX - 20} cy={CY - outer.ry + 26} rx="6" ry="4" fill="#1e140c" />
                <ellipse cx={CX + 4} cy={CY - outer.ry + 18} rx="6" ry="4" fill="#1e140c" />
                <ellipse cx={CX + 26} cy={CY - outer.ry + 28} rx="6" ry="4" fill="#1e140c" />
              </g>
            )}
            {id === "cmp-kernel" && inner && <path d={ovoid(outer.rx - 1, outer.ry - 1)} fill="none" stroke="#b08d5b" strokeWidth="1.5" opacity="0.8" />}
            {id === "cmp-coconut-water" && <ellipse cx={CX - 40} cy={CY - 60} rx="34" ry="18" fill="#fff" opacity="0.35" />}
            {/* leader + label */}
            <g opacity={exploded || isActive ? 1 : 0} style={{ transition: "opacity 400ms ease 500ms" }}>
              <line x1={CX + outer.rx - 8} y1={CY} x2={CX + RX + 46} y2={CY} stroke="currentColor" strokeWidth="1" opacity="0.5" />
              <circle cx={CX + outer.rx - 8} cy={CY} r="3" fill="#a9c58e" />
              <text x={CX + RX + 54} y={CY - 4} fill="currentColor" fontSize="13" fontWeight="600" fontFamily="var(--font-display)">{layer.name}</text>
              <text x={CX + RX + 54} y={CY + 12} fill="currentColor" fontSize="10.5" opacity="0.65" fontFamily="var(--font-mono)">{String(layer.order).padStart(2, "0")} · {layer.massShareLabel ?? "share: research required"}</text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
