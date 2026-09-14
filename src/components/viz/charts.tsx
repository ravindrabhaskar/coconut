"use client";

import { cx } from "@/components/ui/primitives";

/* Accessible, dependency-free SVG charts. Every chart has a visually hidden table twin for screen readers. */

export function BarChart({ data, format = (n) => String(n), dark, height = 220, label }: { data: { label: string; value: number; tone?: string }[]; format?: (n: number) => string; dark?: boolean; height?: number; label: string }) {
  const max = Math.max(...data.map((d) => Math.abs(d.value)), 1);
  const w = 600, pad = 8, bw = (w - pad * 2) / data.length;
  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" role="img" aria-label={label}>
        {data.map((d, i) => {
          const h = (Math.abs(d.value) / max) * (height - 50);
          const x = pad + i * bw + bw * 0.15;
          return (
            <g key={i}>
              <rect x={x} y={height - 30 - h} width={bw * 0.7} height={h} fill={d.tone ?? "var(--color-leaf-500)"} rx="2" />
              <text x={x + bw * 0.35} y={height - 34 - h} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="currentColor">{format(d.value)}</text>
              <text x={x + bw * 0.35} y={height - 12} textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.7">{d.label.length > 14 ? d.label.slice(0, 13) + "…" : d.label}</text>
            </g>
          );
        })}
      </svg>
      <table className="sr-only"><caption>{label}</caption><tbody>{data.map((d) => <tr key={d.label}><th scope="row">{d.label}</th><td>{format(d.value)}</td></tr>)}</tbody></table>
      <span className={cx("sr-only", dark && "")} />
    </figure>
  );
}

/** Pure helper: running totals for waterfall bars. */
function accumulate(rows: { label: string; value: number; kind: "start" | "cost" | "gain" | "end" }[]) {
  let running = 0;
  const bars = rows.map((r) => {
    const from = r.kind === "start" ? 0 : running;
    running = r.kind === "start" ? r.value : running + r.value;
    return { ...r, from, to: running };
  });
  return { bars, running };
}

/** Waterfall: start value, sequential deltas, computed end. */
export function Waterfall({ rows, format, label, height = 300 }: { rows: { label: string; value: number; kind: "start" | "cost" | "gain" | "end" }[]; format: (n: number) => string; label: string; height?: number }) {
  const w = 720, padL = 10, padB = 60, top = 24;
  const { bars, running } = accumulate(rows);
  const endBar = { label: "Net", value: running, kind: "end" as const, from: 0, to: running };
  const all = [...bars, endBar];
  const maxV = Math.max(...all.map((b) => Math.max(b.from, b.to)), 1);
  const minV = Math.min(...all.map((b) => Math.min(b.from, b.to)), 0);
  const scale = (v: number) => top + ((maxV - v) / (maxV - minV || 1)) * (height - top - padB);
  const bw = (w - padL * 2) / all.length;
  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" role="img" aria-label={label}>
        <line x1={padL} x2={w - padL} y1={scale(0)} y2={scale(0)} stroke="currentColor" opacity="0.3" />
        {all.map((b, i) => {
          const x = padL + i * bw + bw * 0.12;
          const y1 = scale(Math.max(b.from, b.to)), y2 = scale(Math.min(b.from, b.to));
          const fill = b.kind === "start" ? "var(--color-leaf-500)" : b.kind === "end" ? (b.to >= 0 ? "var(--color-coconut-700)" : "var(--color-danger)") : b.value < 0 ? "var(--color-fibre-500)" : "var(--color-leaf-400)";
          return (
            <g key={i}>
              {i > 0 && i < all.length && <line x1={x - bw * 0.12} x2={x} y1={scale(b.from)} y2={scale(b.from)} stroke="currentColor" opacity="0.25" strokeDasharray="2 3" />}
              <rect x={x} y={y1} width={bw * 0.76} height={Math.max(1, y2 - y1)} fill={fill} rx="2" />
              <text x={x + bw * 0.38} y={y1 - 5} textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="currentColor">{format(b.kind === "start" || b.kind === "end" ? b.to : b.value)}</text>
              <text x={x + bw * 0.38} y={height - padB + 16} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7" transform={`rotate(-18 ${x + bw * 0.38} ${height - padB + 16})`}>{b.label.length > 16 ? b.label.slice(0, 15) + "…" : b.label}</text>
            </g>
          );
        })}
      </svg>
      <table className="sr-only"><caption>{label}</caption><tbody>{all.map((b) => <tr key={b.label}><th scope="row">{b.label}</th><td>{format(b.kind === "start" || b.kind === "end" ? b.to : b.value)}</td></tr>)}</tbody></table>
    </figure>
  );
}

export function ScoreBar({ value, max = 100, label, tone, dark }: { value: number; max?: number; label?: string; tone?: string; dark?: boolean }) {
  const pctv = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-3" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <div className={cx("h-2 flex-1 overflow-hidden rounded-full", dark ? "bg-ivory-50/15" : "bg-neutral-200")}><div className="h-full rounded-full" style={{ width: `${pctv}%`, background: tone ?? "var(--color-leaf-500)", transition: "width 600ms var(--ease-narrative)" }} /></div>
      <span className="t-data w-10 text-right">{Math.round(value)}</span>
    </div>
  );
}

/** Risk heatmap: probability × impact grid with risks placed in cells. */
export function RiskHeatmap({ risks, dark }: { risks: { id: string; name: string; probability: number; impact: number }[]; dark?: boolean }) {
  const cell = (p: number, i: number) => risks.filter((r) => r.probability === p && r.impact === i);
  const level = (p: number, i: number) => p * i;
  const color = (l: number) => l >= 16 ? "rgba(168,58,46,0.85)" : l >= 10 ? "rgba(196,138,31,0.8)" : l >= 5 ? "rgba(176,141,91,0.6)" : "rgba(79,127,58,0.45)";
  return (
    <figure>
      <div className="grid grid-cols-[auto_repeat(5,minmax(0,1fr))] gap-1 text-[0.72rem]">
        <div />
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="t-overline text-center opacity-60">Impact {i}</div>)}
        {[5, 4, 3, 2, 1].map((p) => (
          <FragmentRow key={p} p={p} cell={cell} level={level} color={color} dark={dark} />
        ))}
      </div>
      <figcaption className="t-caption mt-2">Rating = probability × impact (1–25). Placement is EXPERT JUDGMENT per product; adjust with field evidence.</figcaption>
      <table className="sr-only"><caption>Risk heatmap</caption><thead><tr><th>Risk</th><th>Probability</th><th>Impact</th></tr></thead><tbody>{risks.map((r) => <tr key={r.id}><td>{r.name}</td><td>{r.probability}</td><td>{r.impact}</td></tr>)}</tbody></table>
    </figure>
  );
}

function FragmentRow({ p, cell, level, color, dark }: { p: number; cell: (p: number, i: number) => { id: string; name: string }[]; level: (p: number, i: number) => number; color: (l: number) => string; dark?: boolean }) {
  return (
    <>
      <div className="t-overline flex items-center pr-2 opacity-60">P{p}</div>
      {[1, 2, 3, 4, 5].map((i) => {
        const items = cell(p, i);
        return (
          <div key={i} className={cx("min-h-[56px] rounded-[3px] p-1.5", dark ? "text-ivory-50" : "text-neutral-900")} style={{ background: color(level(p, i)) }} title={`P${p} × I${i} = ${level(p, i)}`}>
            {items.map((r) => <span key={r.id} className="block truncate text-[0.68rem] font-medium leading-tight" title={r.name}>{r.name}</span>)}
          </div>
        );
      })}
    </>
  );
}
