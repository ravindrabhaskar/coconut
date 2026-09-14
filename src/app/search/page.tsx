import Link from "next/link";
import { search } from "@/services/search";
import type { EntityType } from "@/domain/types";
import { Container, Section, Chip, Badge, EmptyState } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { SearchBox } from "@/components/features/search-box";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = { ...pageMetadata({ title: "Search", description: "Search components, products, processes, machines, customers, exports, regulations, certifications, research, locations.", path: "/search" }), robots: { index: false } };

const TYPES: { id: EntityType; label: string }[] = [
  { id: "component", label: "Components" }, { id: "product", label: "Products" }, { id: "process", label: "Processes" }, { id: "machine", label: "Machines" }, { id: "customer_segment", label: "Customers" },
  { id: "country", label: "Exports" }, { id: "state", label: "States" }, { id: "regulation", label: "Regulations" }, { id: "certification", label: "Certifications" }, { id: "risk", label: "Risks" }, { id: "opportunity", label: "Opportunities" }, { id: "research_document", label: "Research" }, { id: "source", label: "Sources" }, { id: "industry", label: "Industries" },
];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const type = sp.type as EntityType | undefined;
  const results = q ? await search(q, { types: type ? [type] : undefined, limit: 100 }) : [];
  const grouped = results.reduce<Record<string, typeof results>>((acc, r) => { (acc[r.typeLabel] ??= []).push(r); return acc; }, {});
  const qs = (t?: string) => `/search?q=${encodeURIComponent(q)}${t ? `&type=${t}` : ""}`;
  return (
    <>
      <PageIntro overline="Search" title={q ? `Results for “${q}”` : "Search the platform."} lede="Try “shell” to surface the hard shell, shell charcoal, activated carbon, shell powder, shell processing, machinery, customers, exports and economics." breadcrumbs={[{ label: "Search" }]} dark={false}>
        <div className="mt-8 max-w-3xl"><SearchBox initial={q} autoFocus={!q} /></div>
      </PageIntro>
      <Section surface="white" padded={false} className="pb-24">
        <Container>
          {q && <div className="flex flex-wrap gap-2 mb-8"><Chip href={qs()} active={!type}>All ({results.length})</Chip>{TYPES.filter((t) => !type ? results.some((r) => r.type === t.id) : true).map((t) => <Chip key={t.id} href={qs(t.id)} active={type === t.id}>{t.label}</Chip>)}</div>}
          {q && results.length === 0 && <EmptyState title="No results" body="Try a broader term (e.g. “husk”, “carbon”, “milk”) or clear the type filter." />}
          {Object.entries(grouped).map(([label, items]) => (
            <div key={label} className="mb-10">
              <p className="t-overline text-neutral-500 mb-3">{label} · {items.length}</p>
              <ul className="divide-y hairline">{items.map((r) => <li key={r.id} className="py-3"><Link href={r.href} className="group block"><span className="flex flex-wrap items-center gap-2"><span className="t-h4 group-hover:underline underline-offset-4">{r.name}</span><Badge>{r.group}</Badge><span className="t-data text-neutral-400">relevance {r.score}</span></span><span className="t-caption block mt-1">{r.summary}</span></Link></li>)}</ul>
            </div>
          ))}
        </Container>
      </Section>
    </>
  );
}
