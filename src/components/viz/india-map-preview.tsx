"use client";

import { useState } from "react";
import Link from "next/link";
import { IndiaMap, type MapState } from "./india-map";

/** Homepage preview: real-boundary India map with a selectable state and a link into the full analysis. */
export function IndiaMapPreview({ states }: { states: MapState[] }) {
  const [active, setActive] = useState<string | null>(states[0]?.id ?? null);
  const s = states.find((x) => x.id === active);
  return (
    <div className="grid gap-8 md:grid-cols-[1fr_1fr] md:items-center">
      <IndiaMap states={states} activeId={active} onSelect={setActive} dark />
      <div>
        {s && <><p className="t-overline text-leaf-300">Selected</p><p className="t-h3 mt-1">{s.name}</p><p className="t-caption mt-1 text-ivory-100/60">Default-weight score {s.score}/100 — EXPERT JUDGMENT dimensions; open the full analysis to change scenario weights.</p><Link href={`/india/${s.slug}`} className="t-nav mt-4 inline-block underline underline-offset-4">State profile →</Link></>}
        <ul className="mt-6 grid grid-cols-2 gap-1 t-data text-[0.75rem] text-ivory-100/70">{states.map((x) => <li key={x.id}><button onClick={() => setActive(x.id)} className="tap min-h-[28px] hover:underline">{x.name} · {x.score}</button></li>)}</ul>
      </div>
    </div>
  );
}
