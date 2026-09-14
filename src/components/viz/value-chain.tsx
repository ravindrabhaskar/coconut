"use client";

import Link from "next/link";
import { useState } from "react";
import type { ValueChainNode } from "@/domain/types";
import { cx, BulletList } from "@/components/ui/primitives";

/** Interactive farm-to-export chain. Horizontal with flow animation on desktop; vertical on mobile. */
export function ValueChain({ nodes, products, dark, compact }: { nodes: ValueChainNode[]; products: { id: string; name: string; slug: string }[]; dark?: boolean; compact?: boolean }) {
  const [active, setActive] = useState<string>(nodes[0]?.id);
  const node = nodes.find((n) => n.id === active) ?? nodes[0];
  const related = products.filter((p) => node?.relatedProductIds.includes(p.id));
  return (
    <div>
      <ol className={cx("relative flex flex-col gap-2 md:flex-row md:items-stretch md:gap-0 md:overflow-x-auto scroll-x pb-2")} aria-label="Value chain stages">
        {nodes.map((n, i) => (
          <li key={n.id} className="flex items-center md:shrink-0">
            <button onClick={() => setActive(n.id)} aria-pressed={active === n.id}
              className={cx("tap w-full rounded-[var(--radius-control)] border px-3 py-2.5 text-left text-[0.8rem] font-semibold md:w-[128px] md:text-center md:text-[0.72rem] md:uppercase md:tracking-wider",
                active === n.id ? (dark ? "bg-ivory-50 text-coconut-950 border-ivory-50" : "bg-coconut-950 text-ivory-50 border-coconut-950") : dark ? "border-ivory-100/25 hover:bg-ivory-50/10" : "border-neutral-300 hover:border-coconut-800")}>
              <span className="t-data mr-2 opacity-60 md:block md:mr-0 md:mb-1">{String(n.order).padStart(2, "0")}</span>{n.name}
            </button>
            {i < nodes.length - 1 && (
              <svg className="hidden h-6 w-7 shrink-0 md:block" viewBox="0 0 28 24" aria-hidden="true">
                <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5" className="anim-flow" opacity="0.6" /><path d="M18 7l6 5-6 5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
              </svg>
            )}
          </li>
        ))}
      </ol>
      {node && !compact && (
        <div key={node.id} className={cx("anim-rise mt-8 grid gap-8 rounded-[var(--radius-media)] border p-6 md:grid-cols-3 md:p-8", dark ? "border-ivory-100/15 bg-ivory-50/5" : "border-neutral-200 bg-cocos")}>
          <div className="md:col-span-3">
            <p className={cx("t-overline", dark ? "text-leaf-300" : "text-leaf-500")}>Stage {node.order}</p>
            <h3 className="t-h3 mt-1">{node.name}</h3>
            <p className={cx("mt-2 max-w-[70ch]", dark ? "text-ivory-100/75" : "text-neutral-700")}>{node.summary}</p>
          </div>
          <Block title="Participants" items={node.participants} /><Block title="Value addition" items={node.valueAddition} /><Block title="Risks" items={node.risks} />
          <Block title="Cost drivers" items={node.costDrivers} /><Block title="Technology" items={node.technology} /><Block title="Business opportunities" items={node.opportunities} />
          {related.length > 0 && (
            <div className="md:col-span-3 flex flex-wrap items-center gap-2 border-t hairline pt-4">
              <span className="t-overline mr-2 opacity-60">Related products</span>
              {related.map((p) => <Link key={p.id} href={`/products/${p.slug}`} className={cx("t-nav rounded-full border px-3 py-1 tap", dark ? "border-ivory-100/25 hover:bg-ivory-50/10" : "border-neutral-300 hover:bg-neutral-100")}>{p.name}</Link>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (<div><p className="t-overline mb-2 opacity-60">{title}</p><BulletList items={items} /></div>);
}
