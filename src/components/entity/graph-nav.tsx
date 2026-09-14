import Link from "next/link";
import { repo, hrefFor } from "@/services/repository";
import type { EntityType, RelationType } from "@/domain/types";
import { cx } from "@/components/ui/primitives";

/**
 * GraphNav — contextual knowledge-graph rail: "Produced from · Requires · Used in · Sold to · Exported to · Evidence".
 * Computed from the relationship graph for the current entity (never hard-coded). Renders on every entity template.
 */
const LABELS: Record<string, string> = {
  "in:PRODUCES": "Produced from", "out:PRODUCES": "Produces", "out:REQUIRES_PROCESS": "Requires process", "in:REQUIRES_PROCESS": "Used in (products)",
  "out:REQUIRES_MACHINE": "Required machinery", "in:REQUIRES_MACHINE": "Used by (products)", "out:SOLD_TO": "Sold to", "in:SOLD_TO": "Buys", "out:EXPORTED_TO": "Exported to",
  "out:REQUIRES_CERT": "Certifications", "out:GOVERNED_BY": "Regulations", "out:HAS_RISK": "Risks", "out:HAS_OPPORTUNITY": "Opportunity", "out:YIELDS_BYPRODUCT": "By-products",
  "out:RELATED_RESEARCH": "Research", "out:CITED_BY": "Evidence sources", "in:YIELDS_BYPRODUCT": "By-product of", "in:HAS_OPPORTUNITY": "Product",
};
const ORDER = ["in:PRODUCES", "out:PRODUCES", "in:YIELDS_BYPRODUCT", "out:YIELDS_BYPRODUCT", "out:REQUIRES_PROCESS", "in:REQUIRES_PROCESS", "out:REQUIRES_MACHINE", "in:REQUIRES_MACHINE", "out:SOLD_TO", "in:SOLD_TO", "out:EXPORTED_TO", "out:REQUIRES_CERT", "out:GOVERNED_BY", "out:HAS_RISK", "out:HAS_OPPORTUNITY", "in:HAS_OPPORTUNITY", "out:RELATED_RESEARCH", "out:CITED_BY"];

export async function GraphNav({ type, id, className, compact }: { type: EntityType; id: string; className?: string; compact?: boolean }) {
  const rels = await repo.relationships();
  const groups = new Map<string, { type: EntityType; id: string }[]>();
  const add = (k: string, t: EntityType, i: string) => { const list = groups.get(k) ?? []; if (!list.some((x) => x.id === i)) list.push({ type: t, id: i }); groups.set(k, list); };
  for (const r of rels) {
    if (r.fromType === type && r.fromId === id) add(`out:${r.relation as RelationType}`, r.toType, r.toId);
    if (r.toType === type && r.toId === id) add(`in:${r.relation as RelationType}`, r.fromType, r.fromId);
  }
  // Second degree for components: products' processes/machines/customers
  if (type === "component") {
    const productIds = (groups.get("out:PRODUCES") ?? []).map((x) => x.id);
    for (const r of rels) if (r.fromType === "product" && productIds.includes(r.fromId) && ["REQUIRES_PROCESS", "REQUIRES_MACHINE", "SOLD_TO", "EXPORTED_TO"].includes(r.relation)) add(`out:${r.relation}`, r.toType, r.toId);
  }
  // Machines/processes: the products using them + products' customers (second degree, useful for "line position")
  if (type === "machine" || type === "process") {
    const productIds = (groups.get(type === "machine" ? "in:REQUIRES_MACHINE" : "in:REQUIRES_PROCESS") ?? []).map((x) => x.id);
    for (const r of rels) if (r.fromType === "product" && productIds.includes(r.fromId) && r.relation === "SOLD_TO") add("out:SOLD_TO", r.toType, r.toId);
  }
  const sections = await Promise.all(ORDER.filter((k) => groups.has(k)).map(async (k) => {
    const items = (await Promise.all((groups.get(k) ?? []).slice(0, compact ? 5 : 8).map(async ({ type: t, id: i }) => { const e = await repo.entity(t, i); return e ? { name: e.name.replace(/ \(.*\)/, ""), href: e.href } : null; }))).filter(Boolean) as { name: string; href: string }[];
    return { key: k, label: LABELS[k] ?? k, items, total: groups.get(k)!.length };
  }));
  const shown = sections.filter((s) => s.items.length);
  if (!shown.length) return null;
  return (
    <nav aria-label="Knowledge graph" className={cx("rounded-[var(--radius-control)] border hairline bg-cocos p-4", className)}>
      <p className="t-overline text-neutral-500 mb-3">In the knowledge graph</p>
      <dl className="space-y-3">
        {shown.map((s) => (
          <div key={s.key}>
            <dt className="t-badge text-neutral-500">{s.label}</dt>
            <dd className="mt-1 flex flex-wrap gap-x-3 gap-y-1">{s.items.map((it) => <Link key={it.href} href={it.href} className="text-[0.82rem] underline-offset-4 hover:underline">{it.name}</Link>)}{s.total > s.items.length && <span className="t-caption">+{s.total - s.items.length}</span>}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 t-caption"><Link href={hrefFor(type, "")} className="underline">{type.replace("_", " ")} index</Link> · edges derived, not hand-written</p>
    </nav>
  );
}
