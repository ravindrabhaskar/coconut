"use client";

import type { LayoutRect } from "@/lib/calc/factoryPlanner";
import { num } from "@/lib/format";

const KIND_COLOR: Record<string, string> = {
  receiving: "#7ea55f", storage_raw: "#b08d5b", inspection: "#a9c58e", processing_wet: "#4f6b8a", processing_dry: "#6b8fb0", drying: "#c48a1f", thermal: "#a83a2e",
  qc_lab: "#cfe0bd", packaging: "#e5d6bd", storage_fg: "#d2bc98", utilities: "#55595f", water_treatment: "#4f8ab0", waste: "#6b4a2e", maintenance: "#3a3d42", office: "#a29e94",
  worker_facilities: "#77736a", loading: "#8a6240", roads: "#2f3a45", parking: "#3c4956", fire_safety: "#a83a2e", expansion: "#1f3d22", effluent: "#3d6b7a", cooling: "#5a8ea3",
};

/** Blueprint-style zoned layout with material flow arrows, hygiene shading and fire-risk hatching. Conceptual only. */
export function FactoryBlueprint({ rects, flowSequence, showFlow = true, showHygiene = true, showFire = true }: { rects: LayoutRect[]; flowSequence: string[]; showFlow?: boolean; showHygiene?: boolean; showFire?: boolean }) {
  const W = 1000, H = 640;
  const sx = W / 100, sy = H / 100;
  const centre = (id: string) => { const r = rects.find((x) => x.id === id); return r ? { x: (r.x + r.w / 2) * sx, y: (r.y + r.h / 2) * sy } : null; };
  const flow = flowSequence.map(centre).filter(Boolean) as { x: number; y: number }[];
  return (
    <figure>
      <div className="pattern-blueprint rounded-[var(--radius-media)] p-3 text-ivory-50">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Conceptual factory layout with zones and material flow">
          <defs>
            <pattern id="hatch-fire" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#ff6b5b" strokeWidth="1.2" opacity="0.5" /></pattern>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#a9c58e" /></marker>
          </defs>
          {rects.map((r) => {
            const x = r.x * sx + 2, y = r.y * sy + 2, w = Math.max(0, r.w * sx - 4), h = Math.max(0, r.h * sy - 4);
            const fill = KIND_COLOR[r.kind] ?? "#555";
            return (
              <g key={r.id}>
                <rect x={x} y={y} width={w} height={h} fill={fill} fillOpacity="0.55" stroke="#cfe0bd" strokeOpacity="0.7" strokeWidth="1" />
                {showHygiene && r.hygiene === "clean" && <rect x={x} y={y} width={w} height={h} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="4 3" />}
                {showFire && r.fireRisk === "high" && <rect x={x} y={y} width={w} height={h} fill="url(#hatch-fire)" />}
                {w > 60 && h > 26 && (
                  <>
                    <text x={x + 8} y={y + 16} fontSize="11" fontWeight="600" fill="#fff" fontFamily="var(--font-display)">{r.name.length > w / 6.5 ? r.name.slice(0, Math.max(6, Math.floor(w / 6.5))) + "…" : r.name}</text>
                    {r.areaSqm !== undefined && h > 40 && <text x={x + 8} y={y + 32} fontSize="10" fill="#cfe0bd" fontFamily="var(--font-mono)">{num(r.areaSqm)} m²</text>}
                  </>
                )}
              </g>
            );
          })}
          {showFlow && flow.length > 1 && (
            <polyline points={flow.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#a9c58e" strokeWidth="2.5" strokeDasharray="10 8" className="anim-flow" markerEnd="url(#arrow)" />
          )}
        </svg>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 t-data text-[0.68rem] text-ivory-100/70">
          <span><span className="inline-block h-2.5 w-4 border-2 border-dashed border-white align-middle" /> clean / high-care zone</span>
          <span><span className="inline-block h-2.5 w-4 align-middle" style={{ background: "url(#hatch-fire)", border: "1px solid #ff6b5b" }} /> high fire risk</span>
          <span><span className="inline-block h-0.5 w-6 bg-leaf-300 align-middle" /> material flow</span>
        </div>
      </div>
      <figcaption className="t-badge mt-3 text-danger">CONCEPTUAL PLANNING LAYOUT — REQUIRES PROFESSIONAL ENGINEERING VALIDATION. Zone areas derive from ratios labelled EXPERT JUDGMENT.</figcaption>
    </figure>
  );
}
