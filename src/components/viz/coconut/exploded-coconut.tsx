"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CoconutLayer, CoconutRendererKind } from "./types";
import { SvgCoconutRenderer } from "./svg-renderer";
import { WebglCoconutRenderer, webglAvailable } from "./webgl-renderer";
import { cx } from "@/components/ui/primitives";
import { useReducedMotion } from "@/lib/hooks";

/**
 * ExplodedCoconut — page-level orchestrator.
 * Desktop: hover highlights a layer, dims others, reveals label + description + product branches + Explore CTA. Click navigates.
 * Mobile/tablet: touch-first — layer selector chips below the visual, tap to select, swipe between layers.
 * Renderer is swappable (svg → webgl) without changing this component's API.
 */
export function ExplodedCoconut({ layers, initialExploded = false, autoExplode = true, dark = true, compact = false }: { layers: CoconutLayer[]; initialExploded?: boolean; autoExplode?: boolean; dark?: boolean; compact?: boolean }) {
  const [exploded, setExploded] = useState(initialExploded);
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const [renderer] = useState<CoconutRendererKind>(() => (typeof window !== "undefined" && webglAvailable() ? "webgl" : "svg"));
  const router = useRouter();

  useEffect(() => { if (autoExplode || reduced) { const t = setTimeout(() => setExploded(true), reduced ? 0 : 900); return () => clearTimeout(t); } }, [autoExplode, reduced]);

  const activeId = hover ?? selected;
  const active = useMemo(() => layers.find((l) => l.id === activeId) ?? null, [layers, activeId]);
  const ordered = useMemo(() => [...layers].sort((a, b) => a.order - b.order), [layers]);

  const select = (id: string) => { setSelected(id); };
  const go = (id: string) => { const l = layers.find((x) => x.id === id); if (l) router.push(`/explore/${l.slug}`); };

  // Swipe between layers on touch
  const [touchX, setTouchX] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) {
      const idx = ordered.findIndex((l) => l.id === (selected ?? ordered[0].id));
      const next = ordered[(idx + (dx < 0 ? 1 : -1) + ordered.length) % ordered.length];
      setSelected(next.id);
    }
    setTouchX(null);
  };

  const rendererProps = { layers, exploded, activeId, onHover: setHover, onSelect: (id: string) => { if (selected === id) go(id); else select(id); }, reducedMotion: reduced };

  return (
    <div className={cx("grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center", dark ? "text-ivory-50" : "text-neutral-900")}>
      <div className="relative" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {renderer === "webgl" ? <WebglCoconutRenderer {...rendererProps} className="w-full" /> : <SvgCoconutRenderer {...rendererProps} className={cx("mx-auto w-full", compact ? "max-h-[420px]" : "max-h-[78vh]")} />}
        <div className="mt-2 flex items-center justify-between gap-3">
          <button onClick={() => setExploded((e) => !e)} className={cx("t-badge rounded-full border px-3 py-1.5 tap", dark ? "border-ivory-100/30 hover:bg-ivory-50/10" : "border-neutral-300 hover:bg-neutral-100")} aria-pressed={exploded}>
            {exploded ? "Assemble" : "Explode"}
          </button>
          <span className={cx("t-caption", dark && "text-ivory-100/50")}>{renderer === "webgl" ? "3D model" : "Technical illustration — layered SVG"} · {reduced ? "reduced motion" : "hover / tap a layer"}</span>
        </div>
        {/* Mobile layer selector */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden scroll-x" role="tablist" aria-label="Coconut layers">
          {ordered.map((l) => (
            <button key={l.id} role="tab" aria-selected={activeId === l.id} onClick={() => select(l.id)}
              className={cx("tap shrink-0 rounded-full border px-3.5 py-2 text-[0.8rem] font-medium", activeId === l.id ? (dark ? "bg-ivory-50 text-coconut-950 border-ivory-50" : "bg-coconut-950 text-ivory-50 border-coconut-950") : dark ? "border-ivory-100/30" : "border-neutral-300")}>
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Info panel */}
      <div className="lg:min-h-[320px]" aria-live="polite">
        {active ? (
          <div key={active.id} className="anim-rise">
            <p className={cx("t-overline", dark ? "text-leaf-300" : "text-leaf-500")}>Layer {String(active.order).padStart(2, "0")} · {active.massShareLabel ?? "mass share: research required"}</p>
            <h3 className="t-h2 mt-3">{active.name}</h3>
            <p className={cx("mt-4 max-w-[52ch] text-[1.05rem] leading-relaxed", dark ? "text-ivory-100/80" : "text-neutral-700")}>{active.short}</p>
            {active.products.length > 0 && (
              <div className="mt-6">
                <p className={cx("t-overline mb-3", dark ? "text-ivory-100/50" : "text-neutral-500")}>Becomes</p>
                <ul className="flex flex-wrap gap-2">
                  {active.products.map((p) => (
                    <li key={p.href}><Link href={p.href} className={cx("t-nav inline-block rounded-full border px-3 py-1.5 tap", dark ? "border-ivory-100/25 hover:bg-ivory-50/10" : "border-neutral-300 hover:bg-neutral-100")}>{p.name}</Link></li>
                  ))}
                </ul>
              </div>
            )}
            <Link href={`/explore/${active.slug}`} className={cx("t-cta mt-8 inline-flex items-center gap-2 rounded-[var(--radius-control)] px-6 py-3.5 tap", dark ? "bg-ivory-50 text-coconut-950 hover:bg-leaf-200" : "bg-coconut-950 text-ivory-50 hover:bg-coconut-800")}>
              Explore {active.name} <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <div>
            <p className={cx("t-overline", dark ? "text-leaf-300" : "text-leaf-500")}>Anatomy of a coconut</p>
            <h3 className="t-h2 mt-3">Six layers. Six material streams.</h3>
            <p className={cx("mt-4 max-w-[52ch] text-[1.05rem] leading-relaxed", dark ? "text-ivory-100/80" : "text-neutral-700")}>Hover or tap a layer to see what it is, how it is separated, and which products, machines and markets grow from it.</p>
            <ol className={cx("mt-6 space-y-2 t-data", dark ? "text-ivory-100/70" : "text-neutral-600")}>
              {ordered.map((l) => <li key={l.id}><button onClick={() => select(l.id)} className="hover:underline underline-offset-4 tap min-h-[32px]">{String(l.order).padStart(2, "0")} {l.name}</button></li>)}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
