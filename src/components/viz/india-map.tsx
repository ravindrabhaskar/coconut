"use client";

import { cx } from "@/components/ui/primitives";
import { INDIA_STATES, INDIA_VIEWBOX } from "@/data/india-geo";

export interface MapState { id: string; name: string; slug: string; code: string; score: number }

/**
 * India map with real state boundaries (DataMeet Admin2, MIT; simplified). All states drawn faintly;
 * coconut-analysis states are shaded by score, labelled at their centroid and clickable.
 */
export function IndiaMap({ states, activeId, onSelect, dark }: { states: MapState[]; activeId: string | null; onSelect: (id: string) => void; dark?: boolean }) {
  const max = Math.max(...states.map((s) => s.score), 1);
  const byId = Object.fromEntries(states.map((s) => [s.id, s]));
  const shade = (s: number) => `rgba(126,165,95,${0.3 + 0.65 * (s / max)})`;
  const base = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const stroke = dark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.28)";
  return (
    <figure>
      <svg viewBox={INDIA_VIEWBOX} className="mx-auto w-full max-w-[560px]" role="img" aria-label="Map of India with coconut-producing states shaded by score">
        {/* Non-analysed states: faint context */}
        {INDIA_STATES.filter((g) => !g.stateId || !byId[g.stateId]).map((g) => (
          <path key={g.name} d={g.d} fill={base} stroke={stroke} strokeWidth="0.6" strokeLinejoin="round" />
        ))}
        {/* Analysed states */}
        {INDIA_STATES.filter((g) => g.stateId && byId[g.stateId]).map((g) => {
          const s = byId[g.stateId!];
          const on = activeId === s.id;
          return (
            <g key={g.name} onClick={() => onSelect(s.id)} role="button" tabIndex={0} aria-label={`${s.name}, score ${s.score}`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(s.id); } }} style={{ cursor: "pointer" }}>
              <path d={g.d} fill={shade(s.score)} stroke={on ? (dark ? "#fff" : "#0b1a12") : stroke} strokeWidth={on ? 2 : 0.8} strokeLinejoin="round" />
              <text x={g.cx} y={g.cy} textAnchor="middle" fontSize="12" fontWeight="700" fill={dark ? "#fff" : "#0b1a12"} fontFamily="var(--font-display)" style={{ paintOrder: "stroke", stroke: dark ? "rgba(11,26,18,0.7)" : "rgba(255,255,255,0.8)", strokeWidth: 3 }}>{s.code}</text>
              <text x={g.cx} y={g.cy + 13} textAnchor="middle" fontSize="10.5" fill={dark ? "#cfe0bd" : "#26512f"} fontFamily="var(--font-mono)" style={{ paintOrder: "stroke", stroke: dark ? "rgba(11,26,18,0.7)" : "rgba(255,255,255,0.8)", strokeWidth: 3 }}>{s.score}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className={cx("t-caption mt-2 text-center", dark && "text-ivory-100/50")}>State boundaries: DataMeet India (MIT), simplified for display — comparison visualisation, not for legal use. Shade = weighted score.</figcaption>
    </figure>
  );
}
