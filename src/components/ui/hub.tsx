import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "./primitives";

/** The one hub pattern used by every section landing page: dense list-grid, no decorative cards. */
export interface HubItem { title: string; href: string; body?: string; meta?: string; badge?: ReactNode }

export function HubGrid({ items, columns = 3, className }: { items: HubItem[]; columns?: 2 | 3 | 4; className?: string }) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columns];
  return (
    <ul className={cx("grid gap-px overflow-hidden rounded-[var(--radius-media)] border hairline bg-neutral-200", cols, className)}>
      {items.map((it) => (
        <li key={it.href} className="bg-cocos hover:bg-ivory-100">
          <Link href={it.href} className="group block h-full p-5 md:p-6">
            {it.badge && <div className="mb-3 flex flex-wrap gap-1.5">{it.badge}</div>}
            <p className="t-h4 group-hover:underline underline-offset-4">{it.title}</p>
            {it.body && <p className="t-caption mt-2">{it.body}</p>}
            {it.meta && <p className="t-data mt-3 text-leaf-500">{it.meta}</p>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** A numbered journey (used on Factory and Home): each step links to the tool/page that performs it. */
export function Journey({ steps, dark }: { steps: { label: string; href?: string; note?: string }[]; dark?: boolean }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => {
        const inner = (
          <>
            <span className={cx("t-data", dark ? "text-leaf-300" : "text-leaf-500")}>{String(i + 1).padStart(2, "0")}</span>
            <span className="mt-1 block text-[0.92rem] font-semibold leading-snug">{s.label}</span>
            {s.note && <span className={cx("t-caption mt-1 block", dark && "text-ivory-100/60")}>{s.note}</span>}
          </>
        );
        const cls = cx("block h-full rounded-[var(--radius-control)] border p-3.5", dark ? "border-ivory-100/20 bg-ivory-50/5" : "border-neutral-200 bg-cocos", s.href && "hover:border-leaf-500");
        return <li key={s.label}>{s.href ? <Link href={s.href} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>}</li>;
      })}
    </ol>
  );
}
