import Link from "next/link";
import type { ReactNode } from "react";
import type { Depth, Quantity, SWOT, Source } from "@/domain/types";
import { BulletList, Container, cx, ResearchRequiredInline } from "@/components/ui/primitives";
import { EvidenceBadge, Qty } from "@/components/ui/evidence";
import { DepthGate } from "@/components/layout/depth";
import type { RelatedGroup } from "@/services/related";
import { formatQuantity } from "@/lib/format";

/** A titled, anchored section of an entity page. Depth-gated content collapses politely below its level. */
export function EntitySection({ id, title, overline, depth, children, className }: { id: string; title: string; overline?: string; depth?: Depth; children: ReactNode; className?: string }) {
  const gated = depth && depth !== "understand";
  return (
    <section id={id} className={cx("scroll-mt-24 border-t hairline py-10 md:py-14", className)}>
      {overline && <p className="t-overline text-neutral-500 mb-2">{overline}</p>}
      <h2 className="t-h3 mb-6">{title}{gated && <span className="t-badge ml-3 align-middle text-slate-500">{depth}</span>}</h2>
      {gated ? <DepthGate min={depth} label={`"${title}" is ${depth}-level detail.`}>{children}</DepthGate> : children}
    </section>
  );
}

export function TwoCol({ children, aside }: { children: ReactNode; aside: ReactNode }) {
  return (
    <Container>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">{children}</div>
        <aside className="hidden lg:block">{aside}</aside>
      </div>
    </Container>
  );
}

export function SwotGrid({ swot }: { swot: SWOT }) {
  const cells: [string, string[], string][] = [["Strengths", swot.strengths, "border-leaf-500"], ["Weaknesses", swot.weaknesses, "border-fibre-500"], ["Opportunities", swot.opportunities, "border-slate-500"], ["Threats", swot.threats, "border-danger"]];
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {cells.map(([t, items, b]) => (
        <div key={t} className={cx("border-t-2 pt-4", b)}><p className="t-overline mb-3 text-neutral-600">{t}</p><BulletList items={items} /></div>
      ))}
    </div>
  );
}

export function QuantityTable({ rows, sources, caption }: { rows: { label: string; q: Quantity; note?: string }[]; sources: Source[]; caption?: string }) {
  if (!rows.length) return <ResearchRequiredInline note="No quantities recorded." />;
  return (
    <div className="overflow-x-auto">
      <table className="table-data">
        {caption && <caption className="t-caption mb-2 text-left">{caption}</caption>}
        <thead><tr><th>Parameter</th><th>Value</th><th>Evidence</th><th>Notes</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="font-medium">{r.label}</td>
              <td className="t-data whitespace-nowrap">{r.q.value === undefined ? <span className="text-neutral-500">—</span> : formatQuantity(r.q)}</td>
              <td><EvidenceBadge q={r.q} sources={sources} /></td>
              <td className="t-caption max-w-[40ch]">{r.note ?? r.q.notes ?? (r.q.basis ? `Basis: ${r.q.basis}` : "")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MetricRow({ items, sources }: { items: { label: string; q: Quantity }[]; sources: Source[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="border-t hairline pt-3">
          <p className="t-overline text-neutral-500">{it.label}</p>
          <div className="mt-2"><Qty q={it.q} sources={sources} big /></div>
          {it.q.scale && <p className="t-caption mt-1">at {it.q.scale}</p>}
        </div>
      ))}
    </div>
  );
}

export function SourceList({ ids, sources }: { ids: string[]; sources: Source[] }) {
  const list = ids.map((id) => sources.find((s) => s.id === id)).filter(Boolean) as Source[];
  if (!list.length) return <ResearchRequiredInline note="No sources attached." />;
  return (
    <ol className="space-y-3">
      {list.map((s, i) => (
        <li key={s.id} className="flex gap-4 text-[0.9rem]">
          <span className="t-data text-neutral-400">[{i + 1}]</span>
          <span>
            <Link href={`/sources/${s.slug}`} className="font-medium underline-offset-4 hover:underline">{s.name}</Link>
            <span className="t-source block">{s.organisation} · {s.sourceType.replace("_", " ")} · strength: {s.evidenceStrength} · researched {s.researchDate}{s.lastReviewedAt ? ` · reviewed ${s.lastReviewedAt}` : ""}</span>
            {s.relevantSection && <span className="t-caption block">Section: {s.relevantSection}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function RelatedBlocks({ groups }: { groups: RelatedGroup[] }) {
  if (!groups.length) return null;
  return (
    <section aria-label="Related entities" className="border-t hairline py-12">
      <p className="t-overline text-neutral-500 mb-8">Related — generated from the knowledge graph</p>
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="t-h4 mb-3">{g.label}</p>
            <ul className="space-y-1.5">{g.items.map((it) => <li key={it.href}><Link href={it.href} className="text-[0.92rem] underline-offset-4 hover:underline">{it.name}</Link></li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TagRow({ items }: { items: { label: string; href?: string; tone?: "neutral" | "green" | "fibre" | "dark" }[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((t, i) => {
        const cls = "t-badge inline-flex rounded-[var(--radius-data)] border px-2 py-1 " + (t.tone === "green" ? "border-leaf-300 bg-leaf-200/50 text-coconut-800" : t.tone === "fibre" ? "border-fibre-300 bg-fibre-200 text-earth-800" : t.tone === "dark" ? "border-charcoal-700 bg-charcoal-800 text-ivory-100" : "border-neutral-300 text-neutral-700");
        return <li key={i}>{t.href ? <Link href={t.href} className={cls}>{t.label}</Link> : <span className={cls}>{t.label}</span>}</li>;
      })}
    </ul>
  );
}
