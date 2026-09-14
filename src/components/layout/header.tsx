"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavGroup } from "./nav-data";
import { DepthToggle } from "./depth";
import { cx } from "@/components/ui/primitives";
import { useScrolled } from "@/lib/hooks";

export function Header({ nav }: { nav: NavGroup[] }) {
  const pathname = usePathname();
  return <HeaderInner key={pathname} nav={nav} pathname={pathname} />;
}

function HeaderInner({ nav, pathname }: { nav: NavGroup[]; pathname: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const scrolled = useScrolled(24);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); setMobile(false); } };
    document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { document.body.style.overflow = mobile ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [mobile]);

  const enter = (i: number) => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(i); };
  const leave = () => { closeTimer.current = setTimeout(() => setOpen(null), 160); };
  const dark = pathname === "/" && !scrolled;
  const active = open === null ? null : open === -1 ? { label: "More", href: "#", columns: nav.filter((g) => g.secondary).map((g) => ({ heading: g.label, items: g.columns.flatMap((c) => c.items).slice(0, 6) })), featured: undefined } : nav[open];

  return (
    <header className={cx("sticky top-0 z-50 border-b transition-colors duration-300", dark ? "border-transparent bg-coconut-950/0 text-ivory-50" : "border-neutral-200/70 bg-ivory-50/85 text-neutral-900 shadow-[0_8px_30px_-24px_rgba(6,21,15,0.5)] backdrop-blur-xl")}
      onMouseLeave={leave}>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3" aria-label="COCONUT home">
          <span className={cx("inline-flex h-9 w-9 items-center justify-center rounded-xl", dark ? "bg-white/10" : "bg-accent text-coconut-950 shadow-[var(--shadow-glow)]")}><Logo className="h-6 w-6" /></span>
          <span className="t-display text-[1.05rem] tracking-[-0.02em]">COCONUT</span>
          <span className="hidden t-overline opacity-60 lg:inline">One coconut. An entire industry.</span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((g, i) => (
              <li key={g.label} onMouseEnter={() => enter(i)} onFocus={() => enter(i)} className={cx(g.secondary && "hidden xl:block")}>
                <Link href={g.href} className={cx("t-nav rounded-full px-3.5 py-2 transition-colors", open === i ? (dark ? "bg-ivory-50/12" : "bg-leaf-200/60 text-coconut-900") : "hover:opacity-80")} aria-expanded={open === i} aria-haspopup="true">
                  {g.label}
                </Link>
              </li>
            ))}
            {nav.some((g) => g.secondary) && (
              <li onMouseEnter={() => enter(-1)} onFocus={() => enter(-1)} className="xl:hidden">
                <button className={cx("t-nav rounded-full px-3.5 py-2 transition-colors", open === -1 ? (dark ? "bg-ivory-50/12" : "bg-leaf-200/60 text-coconut-900") : "hover:opacity-80")} aria-expanded={open === -1} aria-haspopup="true">More</button>
              </li>
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <SearchButton dark={dark} />
          <div className="hidden md:block"><DepthToggle dark={dark} /></div>
          <button className="tap rounded-[var(--radius-control)] p-2 lg:hidden" aria-label="Open menu" aria-expanded={mobile} onClick={() => setMobile(true)}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>

      {/* Mega menu (desktop) */}
      {open !== null && active && (
        <div onMouseEnter={() => enter(open)} className="absolute inset-x-0 top-full hidden px-5 pt-2 lg:block">
          <div className="mx-auto grid max-w-[1400px] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-10 rounded-[var(--radius-media)] border border-neutral-200 bg-cocos/95 px-10 py-9 text-neutral-900 shadow-[0_30px_70px_-30px_rgba(6,21,15,0.45)] backdrop-blur-xl">
            {active.columns.filter((c) => c.items.length).map((col) => (
              <div key={col.heading}>
                <p className="t-overline mb-4 text-neutral-500">{col.heading}</p>
                <ul className="space-y-1">
                  {col.items.map((it) => (
                    <li key={it.href}>
                      <Link href={it.href} className="group block rounded-[var(--radius-control)] px-2 py-1.5 -mx-2 hover:bg-leaf-200/50">
                        <span className="t-nav block">{it.label}</span>
                        {it.description && <span className="t-caption block">{it.description}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {active.featured && (
              <Link href={active.featured.href} className="surface-hero overflow-hidden rounded-[var(--radius-card)] p-6 hover:brightness-110">
                <p className="t-overline relative z-[1] mb-3 text-lime-400">Featured</p>
                <p className="t-h4 relative z-[1] text-ivory-50">{active.featured.title}</p>
                <p className="t-caption relative z-[1] mt-2 text-ivory-100/70">{active.featured.body}</p>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Mobile bottom sheet */}
      {mobile && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-ink/50" aria-label="Close menu" onClick={() => setMobile(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[20px] bg-cocos text-neutral-900 px-5 pb-10 pt-3">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-neutral-300" />
            <div className="mb-4 flex items-center justify-between">
              <span className="t-overline text-neutral-500">Depth</span><DepthToggle />
            </div>
            <MobileSearch onDone={() => setMobile(false)} />
            {nav.map((g) => (
              <details key={g.label} className="border-t hairline py-3">
                <summary className="t-h4 flex cursor-pointer list-none items-center justify-between tap"><span>{g.label}</span><span aria-hidden="true">+</span></summary>
                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                  {g.columns.filter((c) => c.items.length).map((col) => (
                    <div key={col.heading}>
                      <p className="t-overline mb-2 text-neutral-500">{col.heading}</p>
                      <ul>{col.items.map((it) => <li key={it.href}><Link href={it.href} className="block py-2 t-nav tap">{it.label}</Link></li>)}</ul>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function SearchButton({ dark }: { dark: boolean }) {
  return (
    <Link href="/search" className={cx("t-nav hidden items-center gap-2 rounded-full border px-3.5 py-1.5 md:inline-flex", dark ? "border-ivory-100/25 hover:bg-ivory-50/10" : "border-neutral-300 bg-cocos hover:border-leaf-500")} aria-label="Search the platform">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" /><path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      Search
    </Link>
  );
}

function MobileSearch({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) { router.push(`/search?q=${encodeURIComponent(q.trim())}`); onDone(); } }} className="mb-2 flex gap-2">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search components, products, machines…" aria-label="Search" className="tap w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 py-2 text-[0.95rem]" />
      <button className="tap rounded-full bg-accent px-4 text-coconut-950 t-cta text-xs">Go</button>
    </form>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="9.5" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
      <circle cx="16" cy="16" r="5" fill="currentColor" opacity="0.9" />
      <circle cx="16" cy="16" r="2" fill="var(--color-lime-400)" />
    </svg>
  );
}
