"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Depth } from "@/domain/types";
import { cx } from "@/components/ui/primitives";
import { useLocalStorage } from "@/lib/hooks";

const DepthCtx = createContext<{ depth: Depth; setDepth: (d: Depth) => void }>({ depth: "business", setDepth: () => {} });

const ORDER: Depth[] = ["understand", "business", "industrial"];
export const depthRank = (d: Depth) => ORDER.indexOf(d);

export function DepthProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useLocalStorage("coconut.depth", "business");
  const depth: Depth = ORDER.includes(stored as Depth) ? (stored as Depth) : "business";
  return <DepthCtx.Provider value={{ depth, setDepth: (d) => setStored(d) }}>{children}</DepthCtx.Provider>;
}

export const useDepth = () => useContext(DepthCtx);

export function DepthToggle({ dark, className }: { dark?: boolean; className?: string }) {
  const { depth, setDepth } = useDepth();
  const labels: Record<Depth, string> = { understand: "Understand", business: "Business", industrial: "Industrial" };
  return (
    <div role="radiogroup" aria-label="Depth of detail" className={cx("inline-flex rounded-full border p-0.5", dark ? "border-ivory-100/25" : "border-neutral-300", className)}>
      {ORDER.map((d) => (
        <button key={d} role="radio" aria-checked={depth === d} onClick={() => setDepth(d)}
          className={cx("whitespace-nowrap rounded-full px-3 py-1.5 text-[0.75rem] font-semibold tracking-wide transition-colors tap min-h-[32px]", depth === d ? (dark ? "bg-accent text-coconut-950" : "bg-coconut-950 text-ivory-50") : dark ? "text-ivory-100/80 hover:text-ivory-50" : "text-neutral-600 hover:text-neutral-900")}>
          {labels[d]}
        </button>
      ))}
    </div>
  );
}

/** Wraps content that should only appear at or above a depth. Content stays in DOM for SEO/screen readers but is collapsed with a reveal control. */
export function DepthGate({ min, children, label }: { min: Depth; children: ReactNode; label?: string }) {
  const { depth, setDepth } = useDepth();
  const visible = depthRank(depth) >= depthRank(min);
  if (visible) return <>{children}</>;
  return (
    <div className="my-6 rounded-[var(--radius-control)] border border-dashed border-neutral-300 bg-neutral-50 px-5 py-4 text-[0.9rem]">
      <span className="text-neutral-700">{label ?? `${min === "industrial" ? "Industrial" : "Business"} detail is collapsed at the current depth.`}</span>{" "}
      <button onClick={() => setDepth(min)} className="font-semibold underline decoration-leaf-500 underline-offset-4">Show {min} detail</button>
      <div className="sr-only">{children}</div>
    </div>
  );
}
