/**
 * Related-entity resolution — computed from the relationship graph, never hard-coded in UI.
 */

import { repo, hrefFor } from "./repository";
import type { EntityType } from "@/domain/types";

export interface RelatedGroup { label: string; items: { name: string; href: string; summary?: string }[] }

const LABELS: Partial<Record<EntityType, string>> = {
  component: "Related Components", product: "Related Products", process: "Related Processes", machine: "Related Machinery", industry: "Related Industries",
  customer_segment: "Related Customers", country: "Related Export Markets", research_document: "Related Research", opportunity: "Related Opportunities",
  certification: "Related Certifications", regulation: "Related Regulations", risk: "Related Risks", source: "Sources",
};

const ORDER: EntityType[] = ["component", "product", "process", "machine", "industry", "customer_segment", "country", "research_document", "opportunity", "certification", "regulation", "risk"];

export async function relatedFor(type: EntityType, id: string, limitPerGroup = 8): Promise<RelatedGroup[]> {
  const rels = await repo.relationships();
  const buckets = new Map<EntityType, Set<string>>();
  const add = (t: EntityType, i: string) => { if (t === type && i === id) return; buckets.set(t, (buckets.get(t) ?? new Set()).add(i)); };
  for (const r of rels) {
    if (r.fromType === type && r.fromId === id) add(r.toType, r.toId);
    if (r.toType === type && r.toId === id) add(r.fromType, r.fromId);
  }
  // Second-degree for components: products → their processes/machines/customers
  if (type === "component") {
    const productIds = [...(buckets.get("product") ?? [])];
    for (const r of rels) if (r.fromType === "product" && productIds.includes(r.fromId) && ["process", "machine", "customer_segment", "country", "industry", "research_document", "opportunity"].includes(r.toType)) add(r.toType, r.toId);
    // sibling components
    const comps = await repo.components();
    comps.filter((c) => c.id !== id).forEach((c) => add("component", c.id));
  }
  if (type === "product") {
    const p = await repo.productById(id);
    if (p) {
      const siblings = (await repo.products()).filter((s) => s.id !== id && s.sourceComponentIds.some((c) => p.sourceComponentIds.includes(c)));
      siblings.forEach((s) => add("product", s.id));
    }
  }
  const groups: RelatedGroup[] = [];
  for (const t of ORDER) {
    const ids = [...(buckets.get(t) ?? [])].slice(0, limitPerGroup);
    if (!ids.length) continue;
    const items = (await Promise.all(ids.map(async (i) => { const e = await repo.entity(t, i); return e ? { name: e.name, href: e.href, summary: e.summary } : null; }))).filter(Boolean) as RelatedGroup["items"];
    if (items.length) groups.push({ label: LABELS[t] ?? t, items });
  }
  return groups;
}

export async function siblings(type: "component" | "product", slug: string): Promise<{ prev?: { name: string; href: string }; next?: { name: string; href: string } }> {
  const list = type === "component" ? await repo.components() : await repo.products();
  const idx = list.findIndex((x) => x.slug === slug);
  if (idx < 0) return {};
  const prev = list[idx - 1];
  const next = list[idx + 1];
  return { prev: prev ? { name: prev.name, href: hrefFor(type, prev.slug) } : undefined, next: next ? { name: next.name, href: hrefFor(type, next.slug) } : undefined };
}
