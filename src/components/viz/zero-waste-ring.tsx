"use client";

import Link from "next/link";
import { useState } from "react";
import { cx } from "@/components/ui/primitives";

export interface StreamNode { id: string; name: string; href: string; kind: "component" | "product" | "recovery"; path: string; products: { name: string; href: string }[]; note?: string }

/**
 * ZeroWasteRing — full-width circular visualisation: coconut at centre, material streams around,
 * animated flow arcs, click a stream to read its commercial path.
 */
export function ZeroWasteRing({ streams, dark = true }: { streams: StreamNode[]; dark?: boolean }) {
  const [active, setActive] = useState<string | null>(null);
  const n = streams.length;
  const R = 220, ox = 320, oy = 320;
  const pos = (i: number) => { const a = (-Math.PI / 2) + (i / n) * Math.PI * 2; return { x: ox + R * Math.cos(a), y: oy + R * Math.sin(a), a }; };
  const activeStream = streams.find((s) => s.id === active);
  const colorFor = (k: StreamNode["kind"]) => k === "component" ? "#a9c58e" : k === "product" ? "#e5d6bd" : "#7ea55f";

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <svg viewBox="0 0 640 640" className="mx-auto w-full max-w-[640px]" role="img" aria-label="Circular diagram of coconut material streams and recovery paths">
        <defs>
          <radialGradient id="zw-core" cx="40%" cy="35%" r="70%"><stop offset="0%" stopColor="#e5d6bd" /><stop offset="60%" stopColor="#b08d5b" /><stop offset="100%" stopColor="#4a3220" /></radialGradient>
        </defs>
        <circle cx={ox} cy={oy} r={R} fill="none" stroke={dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"} strokeWidth="1" />
        <circle cx={ox} cy={oy} r={R + 34} fill="none" stroke={dark ? "rgba(169,197,142,0.35)" : "rgba(79,127,58,0.35)"} strokeWidth="1.5" strokeDasharray="6 10" className="anim-flow" />
        {/* recovery loop arrow back to centre */}
        {streams.map((s, i) => {
          const p = pos(i);
          const isA = active === s.id;
          const dim = active && !isA;
          return (
            <g key={s.id} opacity={dim ? 0.35 : 1} style={{ transition: "opacity 300ms" }}>
              <line x1={ox} y1={oy} x2={p.x} y2={p.y} stroke={colorFor(s.kind)} strokeWidth={isA ? 2.5 : 1.2} strokeDasharray="8 8" className="anim-flow" opacity="0.8" />
              <g onClick={() => setActive(s.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActive(s.id); } }} aria-label={s.name} style={{ cursor: "pointer" }}>
                <circle cx={p.x} cy={p.y} r={isA ? 34 : 28} fill={dark ? "#12291c" : "#fffdf8"} stroke={colorFor(s.kind)} strokeWidth={isA ? 3 : 1.5} style={{ transition: "r 200ms" }} />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="currentColor" fontFamily="var(--font-display)">{s.name.length > 12 ? s.name.split(" ")[0] : s.name}</text>
              </g>
            </g>
          );
        })}
        <circle cx={ox} cy={oy} r="64" fill="url(#zw-core)" />
        <circle cx={ox} cy={oy} r="64" fill="none" stroke="#fff" strokeOpacity="0.25" />
        <text x={ox} y={oy - 2} textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="var(--font-display)">ONE</text>
        <text x={ox} y={oy + 14} textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="var(--font-display)">COCONUT</text>
      </svg>
      <div aria-live="polite">
        {activeStream ? (
          <div key={activeStream.id} className="anim-rise">
            <p className={cx("t-overline", dark ? "text-leaf-300" : "text-leaf-500")}>{activeStream.kind === "recovery" ? "Recovery stream" : activeStream.kind === "component" ? "Material stream" : "Product stream"}</p>
            <h3 className="t-h2 mt-2">{activeStream.name}</h3>
            <p className={cx("mt-4 max-w-[52ch] leading-relaxed", dark ? "text-ivory-100/80" : "text-neutral-700")}>{activeStream.path}</p>
            {activeStream.note && <p className={cx("mt-3 t-caption", dark && "text-ivory-100/50")}>{activeStream.note}</p>}
            {activeStream.products.length > 0 && <ul className="mt-5 flex flex-wrap gap-2">{activeStream.products.map((p) => <li key={p.href}><Link href={p.href} className={cx("t-nav rounded-full border px-3 py-1.5 tap", dark ? "border-ivory-100/25 hover:bg-ivory-50/10" : "border-neutral-300 hover:bg-neutral-100")}>{p.name}</Link></li>)}</ul>}
            <Link href={activeStream.href} className={cx("t-cta mt-6 inline-flex items-center gap-2 rounded-[var(--radius-control)] px-5 py-3 tap", dark ? "bg-ivory-50 text-coconut-950" : "bg-coconut-950 text-ivory-50")}>Open {activeStream.name} →</Link>
          </div>
        ) : (
          <div>
            <p className={cx("t-overline", dark ? "text-leaf-300" : "text-leaf-500")}>Economic circularity</p>
            <h3 className="t-h2 mt-2">Every stream has a commercial path — or an honest note that it doesn&apos;t yet.</h3>
            <p className={cx("mt-4 max-w-[52ch] leading-relaxed", dark ? "text-ivory-100/80" : "text-neutral-700")}>Click a stream. The focus is on what each material earns or saves — not on vague environmental claims.</p>
            <ul className={cx("mt-6 grid grid-cols-2 gap-2 t-data", dark ? "text-ivory-100/70" : "text-neutral-600")}>{streams.map((s) => <li key={s.id}><button onClick={() => setActive(s.id)} className="hover:underline tap min-h-[32px] text-left">{s.name}</button></li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}
