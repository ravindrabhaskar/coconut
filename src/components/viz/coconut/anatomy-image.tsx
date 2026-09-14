"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CoconutLayer } from "./types";
import { cx } from "@/components/ui/primitives";

/**
 * AnatomyImage — the exploded-view render (public/images/pages/coconut-exploded-view.png, labels baked in)
 * paired with an interactive layer panel driven by the same data as the SVG renderer.
 */
export function AnatomyImage({ layers }: { layers: CoconutLayer[] }) {
  const ordered = [...layers].sort((a, b) => a.order - b.order);
  const [activeId, setActiveId] = useState<string>(ordered[0]?.id);
  const active = ordered.find((l) => l.id === activeId) ?? ordered[0];
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
      <figure className="mx-auto w-full max-w-[560px]">
        <div className="overflow-hidden rounded-[var(--radius-media)] border hairline bg-white">
          <Image src="/images/pages/coconut-exploded-view.png" alt="Exploded view of a young green coconut: stem (peduncle), outer husk (exocarp), fibrous husk (mesocarp), hard shell (endocarp), coconut meat (endosperm) and coconut water" width={1191} height={1321} priority={false} sizes="(min-width: 1024px) 560px, 100vw" className="h-auto w-full" />
        </div>
        <figcaption className="t-caption mt-2">Exploded view of a young (tender) coconut — the mature nut has thicker, firmer kernel and a brown, lignified husk. Layer shares below are for the mature nut.</figcaption>
      </figure>
      <div>
        <ol className="flex flex-wrap gap-2" role="tablist" aria-label="Coconut layers">
          {ordered.map((l) => (
            <li key={l.id}>
              <button role="tab" aria-selected={activeId === l.id} onClick={() => setActiveId(l.id)} className={cx("tap rounded-full border px-3.5 py-2 text-[0.82rem] font-semibold", activeId === l.id ? "bg-coconut-950 text-ivory-50 border-coconut-950" : "border-neutral-300 hover:border-coconut-800")}>
                {String(l.order).padStart(2, "0")} {l.name}
              </button>
            </li>
          ))}
        </ol>
        {active && (
          <div key={active.id} className="anim-rise mt-6" aria-live="polite">
            <p className="t-overline text-leaf-500">Layer {String(active.order).padStart(2, "0")} · {active.massShareLabel ?? "mass share: research required"}</p>
            <h3 className="t-h2 mt-2">{active.name}</h3>
            <p className="mt-3 max-w-[52ch] text-[1.02rem] leading-relaxed text-neutral-700">{active.short}</p>
            {active.products.length > 0 && (
              <div className="mt-5">
                <p className="t-overline text-neutral-500 mb-2">Becomes</p>
                <ul className="flex flex-wrap gap-2">{active.products.map((p) => <li key={p.href}><Link href={p.href} className="t-nav rounded-full border border-neutral-300 px-3 py-1.5 hover:border-coconut-800 tap">{p.name}</Link></li>)}</ul>
              </div>
            )}
            <Link href={`/explore/${active.slug}`} className="t-cta mt-6 inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-coconut-950 px-5 py-3 text-ivory-50 tap">Explore {active.name} →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
