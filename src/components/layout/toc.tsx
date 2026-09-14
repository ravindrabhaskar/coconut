"use client";

import { useEffect, useState } from "react";
import { cx } from "@/components/ui/primitives";

export interface TocItem { id: string; label: string; depth?: "understand" | "business" | "industrial" }

/** Sticky table of contents (desktop right rail) + mobile mini-TOC sheet. */
export function TableOfContents({ items, title = "On this page" }: { items: TocItem[]; title?: string }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: "-20% 0px -70% 0px", threshold: [0, 1] });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items]);

  const list = (
    <ol className="space-y-0.5">
      {items.map((i) => (
        <li key={i.id}>
          <a href={`#${i.id}`} onClick={() => setOpen(false)} className={cx("block border-l-2 py-1.5 pl-3 text-[0.82rem] leading-snug transition-colors", active === i.id ? "border-leaf-500 text-neutral-900 font-medium" : "border-transparent text-neutral-500 hover:text-neutral-900")}>
            {i.label}
            {i.depth === "industrial" && <span className="ml-1.5 t-badge text-[0.55rem] text-slate-500">IND</span>}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <nav aria-label={title} className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto pr-4 lg:block">
        <p className="t-overline mb-3 text-neutral-500">{title}</p>
        {list}
      </nav>
      {/* Mobile mini-TOC */}
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        {open && <button className="fixed inset-0 bg-ink/40" aria-label="Close contents" onClick={() => setOpen(false)} />}
        <div className="relative mx-auto max-w-[640px]">
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="tap flex w-full items-center justify-between border-t border-neutral-200 bg-cocos px-5 py-3 text-[0.85rem] shadow-[0_-8px_30px_-20px_rgba(0,0,0,0.4)]">
            <span className="truncate"><span className="t-overline mr-2 text-neutral-500">Contents</span>{items.find((i) => i.id === active)?.label}</span>
            <span aria-hidden="true">{open ? "▾" : "▴"}</span>
          </button>
          {open && <div className="max-h-[60vh] overflow-y-auto bg-cocos px-5 pb-6 pt-2">{list}</div>}
        </div>
      </div>
    </>
  );
}
