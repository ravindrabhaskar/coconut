"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cx } from "@/components/ui/primitives";

/** Search input with debounced autocomplete via /api/search?ac=1. Submits to /search?q=. */
export function SearchBox({ initial = "", autoFocus }: { initial?: string; autoFocus?: boolean }) {
  const [q, setQ] = useState(initial);
  const [sugg, setSugg] = useState<{ name: string; href: string; typeLabel: string }[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(async () => {
      if (q.trim().length < 2) { setSugg([]); return; }
      try { const r = await fetch(`/api/search?ac=1&q=${encodeURIComponent(q)}`); const j = await r.json(); setSugg(j.results ?? []); setOpen(true); } catch { setSugg([]); }
    }, 180);
    return () => { if (t.current) clearTimeout(t.current); };
  }, [q]);
  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); setOpen(false); if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`); }} className="relative">
      <label htmlFor="global-search" className="sr-only">Search the platform</label>
      <div className="flex gap-2">
        <input id="global-search" autoFocus={autoFocus} value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => sugg.length && setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} placeholder="Search components, products, processes, machines, customers, markets, regulations, research…" autoComplete="off" aria-autocomplete="list" className="tap w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-4 py-3 text-[1rem]" />
        <button className="tap rounded-[var(--radius-control)] bg-coconut-950 px-5 text-ivory-50 t-cta text-xs">Search</button>
      </div>
      {open && sugg.length > 0 && (
        <ul role="listbox" className={cx("absolute inset-x-0 top-full z-30 mt-1 rounded-[var(--radius-control)] border border-neutral-200 bg-cocos shadow-xl")}>
          {sugg.map((s) => <li key={s.href} role="option" aria-selected={false}><Link href={s.href} className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-100"><span className="text-[0.95rem]">{s.name}</span><span className="t-caption">{s.typeLabel}</span></Link></li>)}
        </ul>
      )}
    </form>
  );
}
