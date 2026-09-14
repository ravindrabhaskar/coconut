import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "./primitives";

/** The one hub pattern used by every section landing page: card grid with soft elevation and a lift on hover. */
export interface HubItem { title: string; href: string; body?: string; meta?: string; badge?: ReactNode }

export function HubGrid({ items, columns = 3, className }: { items: HubItem[]; columns?: 2 | 3 | 4; className?: string }) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columns];
  return (
    <ul className={cx("grid gap-4", cols, className)}>
      {items.map((it) => (
        <li key={it.href} className="card card-hover">
          <Link href={it.href} className="group flex h-full flex-col p-5 md:p-6">
            {it.badge && <div className="mb-3 flex flex-wrap gap-1.5">{it.badge}</div>}
            <p className="t-h4 flex items-start justify-between gap-3"><span>{it.title}</span><span aria-hidden="true" className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-all group-hover:bg-accent group-hover:text-coconut-950">→</span></p>
            {it.body && <p className="t-caption mt-2">{it.body}</p>}
            {it.meta && <p className="t-data mt-auto pt-4 text-leaf-500">{it.meta}</p>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** A numbered journey (used on Factory and Home): each step links to the tool/page that performs it. */
export function Journey({ steps, dark }: { steps: { label: string; href?: string; note?: string }[]; dark?: boolean }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => {
        const inner = (
          <>
            <span className={cx("inline-flex h-7 w-7 items-center justify-center rounded-full t-data font-semibold", dark ? "bg-accent text-coconut-950" : "bg-leaf-200 text-coconut-800")}>{String(i + 1).padStart(2, "0")}</span>
            <span className="mt-1 block text-[0.92rem] font-semibold leading-snug">{s.label}</span>
            {s.note && <span className={cx("t-caption mt-1 block", dark && "text-ivory-100/60")}>{s.note}</span>}
          </>
        );
        const cls = cx("block h-full p-4", dark ? "card-glass" : "card", s.href && (dark ? "card-glass-hover" : "card-hover"));
        return <li key={s.label}>{s.href ? <Link href={s.href} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>}</li>;
      })}
    </ol>
  );
}
