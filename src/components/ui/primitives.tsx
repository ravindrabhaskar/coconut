import Link from "next/link";
import type { ReactNode } from "react";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ---------------------------------------------------------------- Layout */
export function Container({ children, className, wide }: { children: ReactNode; className?: string; wide?: boolean }) {
  return <div className={cx("mx-auto w-full px-5 sm:px-8 lg:px-12", wide ? "max-w-[1600px]" : "max-w-[1440px]", className)}>{children}</div>;
}

export function Section({ children, className, surface = "ivory", id, padded = true }: { children: ReactNode; className?: string; surface?: "ivory" | "white" | "dark" | "charcoal" | "fibre" | "none"; id?: string; padded?: boolean }) {
  const s = surface === "none" ? "" : `surface-${surface}`;
  return (
    <section id={id} className={cx(s, padded && "py-[var(--spacing-section)]", "relative", className)}>
      <div className="relative z-[1]">{children}</div>
    </section>
  );
}

export function Overline({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx("t-overline text-leaf-500", className)}>{children}</p>;
}

export function SectionHeader({ overline, title, lede, align = "left", className, as: Tag = "h2" }: { overline?: string; title: ReactNode; lede?: ReactNode; align?: "left" | "center"; className?: string; as?: "h1" | "h2" | "h3" }) {
  return (
    <div className={cx("mb-10 md:mb-14", align === "center" && "text-center mx-auto", className)}>
      {overline && <Overline className="mb-4">{overline}</Overline>}
      <Tag className={cx(Tag === "h1" ? "t-h1" : Tag === "h3" ? "t-h3" : "t-h2", "max-w-[22ch]", align === "center" && "mx-auto")}>{title}</Tag>
      {lede && <p className={cx("t-body-lg mt-5 max-w-[60ch] opacity-80", align === "center" && "mx-auto")}>{lede}</p>}
    </div>
  );
}

/* ---------------------------------------------------------------- Buttons */
type BtnVariant = "primary" | "secondary" | "ghost" | "light" | "outline-light";
const btnBase = "inline-flex items-center justify-center gap-2 t-cta rounded-[var(--radius-control)] px-6 py-3.5 transition-colors duration-[var(--duration-ui)] tap disabled:opacity-50 disabled:cursor-not-allowed";
const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-coconut-950 text-ivory-50 hover:bg-coconut-800",
  secondary: "bg-leaf-500 text-cocos hover:bg-coconut-700",
  ghost: "text-coconut-950 hover:bg-neutral-100 border border-neutral-300",
  light: "bg-ivory-50 text-coconut-950 hover:bg-leaf-200",
  "outline-light": "border border-ivory-100/40 text-ivory-50 hover:bg-ivory-50/10",
};

export function Button({ children, variant = "primary", className, ...rest }: { children: ReactNode; variant?: BtnVariant; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cx(btnBase, btnVariants[variant], className)} {...rest}>{children}</button>;
}

export function LinkButton({ children, href, variant = "primary", className }: { children: ReactNode; href: string; variant?: BtnVariant; className?: string }) {
  return <Link href={href} className={cx(btnBase, btnVariants[variant], className)}>{children}</Link>;
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg className={cx("h-4 w-4", className)} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 8h11M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------------------------------------------------------- Badges / chips */
export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "green" | "fibre" | "dark" | "amber" | "danger"; className?: string }) {
  const tones = {
    neutral: "bg-neutral-100 text-neutral-700 border-neutral-200",
    green: "bg-leaf-200/60 text-coconut-800 border-leaf-300",
    fibre: "bg-fibre-200 text-earth-800 border-fibre-300",
    dark: "bg-charcoal-800 text-ivory-100 border-charcoal-700",
    amber: "bg-amber-500/15 text-amber-500 border-amber-500/40",
    danger: "bg-danger/10 text-danger border-danger/40",
  };
  return <span className={cx("t-badge inline-flex items-center rounded-[var(--radius-data)] border px-2 py-1", tones[tone], className)}>{children}</span>;
}

export function Chip({ children, active, onClick, className, href }: { children: ReactNode; active?: boolean; onClick?: () => void; className?: string; href?: string }) {
  const cls = cx("t-nav inline-flex items-center rounded-full border px-3.5 py-1.5 transition-colors tap min-h-[36px]", active ? "bg-coconut-950 text-ivory-50 border-coconut-950" : "border-neutral-300 hover:border-coconut-800 text-neutral-800", className);
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type="button" onClick={onClick} className={cls} aria-pressed={active}>{children}</button>;
}

/* ---------------------------------------------------------------- Prose */
/** Renders string[] paragraphs; lines starting with "- " become list items. */
export function Prose({ paragraphs, className, dark }: { paragraphs: string[]; className?: string; dark?: boolean }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = (key: number) => { if (list.length) { blocks.push(<ul key={`l${key}`}>{list.map((l, i) => <li key={i}>{l}</li>)}</ul>); list = []; } };
  paragraphs.forEach((p, i) => {
    if (p.startsWith("- ")) list.push(p.slice(2)); else { flush(i); blocks.push(<p key={i}>{p}</p>); }
  });
  flush(paragraphs.length);
  return <div className={cx("prose-coconut", dark ? "text-ivory-100/85" : "text-neutral-800", className)}>{blocks}</div>;
}

export function BulletList({ items, className, columns }: { items: string[]; className?: string; columns?: 2 }) {
  if (!items.length) return <ResearchRequiredInline note="No items recorded yet." />;
  return (
    <ul className={cx("grid gap-x-8 gap-y-2", columns === 2 && "sm:grid-cols-2", className)}>
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 text-[0.95rem] leading-relaxed">
          <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-500" aria-hidden="true" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------------------------------------------------------------- States */
export function ResearchRequiredInline({ note, className }: { note?: string; className?: string }) {
  return (
    <span className={cx("t-badge inline-flex items-center gap-1.5 rounded-[var(--radius-data)] border border-dashed border-neutral-400 px-2 py-1 text-neutral-500", className)} title={note}>
      <span aria-hidden="true">◌</span> Research required
    </span>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-media)] border border-dashed border-neutral-300 p-10 text-center">
      <p className="t-h4">{title}</p>
      {body && <p className="t-caption mt-2 max-w-[48ch] mx-auto">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Callout({ title, children, tone = "neutral" }: { title?: string; children: ReactNode; tone?: "neutral" | "warning" | "green" }) {
  const t = { neutral: "border-neutral-300 bg-neutral-50", warning: "border-amber-500/50 bg-amber-500/8", green: "border-leaf-300 bg-leaf-200/30" }[tone];
  return (
    <aside className={cx("rounded-[var(--radius-control)] border-l-4 px-5 py-4", t)}>
      {title && <p className="t-overline mb-2 text-neutral-700">{title}</p>}
      <div className="text-[0.95rem] leading-relaxed">{children}</div>
    </aside>
  );
}

export function DisciplineRule({ children }: { children: ReactNode }) {
  return <p className="t-h3 border-l-4 border-danger pl-5 py-1 uppercase tracking-tight text-ivory-50">{children}</p>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} aria-hidden="true" />;
}

/* ---------------------------------------------------------------- Data */
export function KeyValue({ rows, className }: { rows: { k: ReactNode; v: ReactNode }[]; className?: string }) {
  return (
    <dl className={cx("divide-y hairline divide-neutral-200", className)}>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-4 py-3">
          <dt className="t-caption self-start pt-0.5 uppercase tracking-wider">{r.k}</dt>
          <dd className="text-[0.95rem]">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Metric({ label, value, sub, dark }: { label: string; value: ReactNode; sub?: ReactNode; dark?: boolean }) {
  return (
    <div>
      <p className={cx("t-overline", dark ? "text-leaf-300" : "text-neutral-500")}>{label}</p>
      <p className="t-metric mt-2 text-3xl md:text-4xl">{value}</p>
      {sub && <div className="mt-2 t-caption">{sub}</div>}
    </div>
  );
}

export function Term({ term, def }: { term: string; def: string }) {
  return <abbr title={def} className="cursor-help border-b border-dotted border-neutral-400 no-underline">{term}</abbr>;
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cx("hairline border-t", className)} />;
}
