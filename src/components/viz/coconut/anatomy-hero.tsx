"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CoconutLayer } from "./types";
import { cx } from "@/components/ui/primitives";

/**
 * AnatomyHero — the exploded-view render customised for the Explore context: numbered hotspots are overlaid on the
 * image at each baked label's position; selecting one shows the mature-nut industry framing for that layer
 * (mass share, evidence, products it becomes) and links into the component page.
 * Hotspot positions are percentages of the image box (1191×1321 render).
 */
const HOTSPOTS: { order: number; x: number; y: number }[] = [
  { order: 1, x: 57, y: 23 }, // outer husk (exocarp)
  { order: 2, x: 60, y: 38 }, // fibrous husk (mesocarp)
  { order: 3, x: 60, y: 50 }, // hard shell (endocarp)
  { order: 4, x: 57, y: 62 }, // meat (endosperm)
  { order: 5, x: 50, y: 71 }, // coconut water
];
const STEM = { x: 38, y: 7 };

const MATURE_NOTE: Record<number, string> = {
  1: "On the mature nut the skin is brown and lignified; it is removed with the husk at dehusking and never separated industrially.",
  2: "The husk of the mature nut is thick and fibrous — this is the coir stream (fibre, pith, yarn, mats, grow media).",
  3: "The mature shell is hard and dense — activated carbon, shell charcoal and shell powder start here.",
  4: "Mature kernel is thick and firm: fresh it gives milk, cream and desiccated coconut; dried it becomes copra and oil.",
  5: "Mature-nut water is a lower-volume by-product than tender water; it feeds vinegar, nata de coco and beverages.",
};

export function AnatomyHero({ layers }: { layers: CoconutLayer[] }) {
  const ordered = [...layers].sort((a, b) => a.order - b.order);
  const [activeOrder, setActiveOrder] = useState<number>(ordered[0]?.order ?? 1);
  const active = ordered.find((l) => l.order === activeOrder) ?? ordered[0];
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
      <figure className="mx-auto w-full max-w-[520px]">
        <div className="card relative overflow-hidden">
          <Image src="/images/pages/coconut-exploded-view.png" alt="Exploded view of a young green coconut: stem (peduncle), outer husk (exocarp), fibrous husk (mesocarp), hard shell (endocarp), coconut meat (endosperm) and coconut water" width={1191} height={1321} priority sizes="(min-width: 1024px) 520px, 100vw" className="h-auto w-full" />
          {/* Stem: not a modelled material stream — informational marker only */}
          <span className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-400 bg-white/90 px-2 py-0.5 text-[0.65rem] font-semibold text-neutral-600" style={{ left: `${STEM.x}%`, top: `${STEM.y}%` }} title="Peduncle — field residue, not an industrial stream">stem · field residue</span>
          {HOTSPOTS.map((h) => {
            const l = ordered.find((x) => x.order === h.order);
            if (!l) return null;
            const on = l.order === activeOrder;
            return (
              <button key={h.order} onClick={() => setActiveOrder(l.order)} aria-label={`${l.name}: show industry context`} aria-pressed={on} className={cx("tap absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 font-bold shadow-md transition-transform", on ? "h-9 w-9 scale-110 border-leaf-500 bg-coconut-950 text-ivory-50" : "h-8 w-8 border-white bg-accent text-coconut-950 hover:scale-110")} style={{ left: `${h.x}%`, top: `${h.y}%` }}>
                {String(l.order).padStart(2, "0")}
              </button>
            );
          })}
        </div>
        <figcaption className="t-caption mt-2">Young (tender) coconut, exploded. Tap a number to see how that layer behaves on the mature nut the industry actually processes.</figcaption>
      </figure>
      <div>
        <ol className="flex flex-wrap gap-2" role="tablist" aria-label="Coconut layers">
          {ordered.map((l) => (
            <li key={l.id}>
              <button role="tab" aria-selected={activeOrder === l.order} onClick={() => setActiveOrder(l.order)} className={cx("tap rounded-full border px-3.5 py-2 text-[0.82rem] font-semibold", activeOrder === l.order ? "bg-coconut-950 text-ivory-50 border-coconut-950" : "border-neutral-300 bg-cocos hover:border-leaf-500")}>
                {String(l.order).padStart(2, "0")} {l.name}
              </button>
            </li>
          ))}
        </ol>
        {active && (
          <div key={active.id} className="anim-rise mt-6" aria-live="polite">
            <p className="t-overline text-leaf-500">Layer {String(active.order).padStart(2, "0")} · {active.massShareLabel ?? "mass share: research required"}</p>
            <h2 className="t-h2 mt-2 text-coconut-950">{active.name}</h2>
            <p className="mt-3 max-w-[52ch] text-[1.02rem] leading-relaxed text-neutral-700">{active.short}</p>
            <p className="mt-3 max-w-[52ch] rounded-[var(--radius-card)] border border-leaf-300 bg-leaf-200/40 px-4 py-3 text-[0.9rem] text-neutral-800"><span className="t-overline text-leaf-500 mr-2">Mature nut</span>{MATURE_NOTE[active.order]}</p>
            {active.products.length > 0 && (
              <div className="mt-5">
                <p className="t-overline text-neutral-500 mb-2">Becomes</p>
                <ul className="flex flex-wrap gap-2">{active.products.map((p) => <li key={p.href}><Link href={p.href} className="t-nav rounded-full border border-neutral-300 bg-cocos px-3 py-1.5 hover:border-leaf-500 tap">{p.name}</Link></li>)}</ul>
              </div>
            )}
            <Link href={`/explore/${active.slug}`} className="t-cta mt-6 inline-flex items-center gap-2 rounded-full bg-coconut-950 px-5 py-3 text-ivory-50 shadow-[0_8px_24px_-10px_rgba(6,21,15,0.6)] tap">Explore {active.name} →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
