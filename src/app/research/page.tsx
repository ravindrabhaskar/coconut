import Link from "next/link";
import { repo } from "@/services/repository";
import { Container, Section, Chip, Badge, LinkButton, Arrow } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Coconut Industry Research Repository", description: "Searchable research articles: business levels, procurement models, tender vs mature nuts, high price vs profit, integrated zero-waste model, product trees, evidence methodology, sap regulation, India statistics, discipline rules, Hyderabad hub. Filter by component, product, tag, state or source.", path: "/research" });

export default async function ResearchPage({ searchParams }: { searchParams: Promise<{ tag?: string; product?: string; component?: string; q?: string }> }) {
  const sp = await searchParams;
  const [docs, products, components, regs, certs, risks] = await Promise.all([repo.research(), repo.products(), repo.components(), repo.regulations(), repo.certifications(), repo.risks()]);
  const tags = [...new Set(docs.flatMap((d) => d.tags))].sort();
  const list = docs.filter((d) => (!sp.tag || d.tags.includes(sp.tag)) && (!sp.product || d.relatedProductIds.includes(sp.product)) && (!sp.component || d.relatedComponentIds.includes(sp.component)) && (!sp.q || (d.name + d.summary + d.detail.join(" ")).toLowerCase().includes(sp.q.toLowerCase())));
  const qs = (patch: Record<string, string | undefined>) => { const u = new URLSearchParams(); Object.entries({ ...sp, ...patch }).forEach(([k, v]) => { if (v) u.set(k, v); }); const s = u.toString(); return `/research${s ? `?${s}` : ""}`; };
  return (
    <>
      <PageIntro overline="Insights" title="Research repository." lede="Structured research records with summary, detail, key facts (with evidence), business implications, related entities, sources, research date, last verified and evidence level. Also: the regulation, certification and risk registers." breadcrumbs={[{ label: "Research" }]}>
        <div className="mt-8 flex flex-wrap gap-3"><LinkButton href="/research/gaps" variant="light">Research-gap engine <Arrow /></LinkButton><LinkButton href="/sources" variant="outline-light">Sources</LinkButton><LinkButton href="/methodology" variant="outline-light">Methodology</LinkButton></div>
      </PageIntro>
      <Section surface="ivory" padded={false} className="py-8"><Container>
        <form action="/research" className="mb-4 flex gap-2 max-w-lg"><input name="q" defaultValue={sp.q} placeholder="Search research…" aria-label="Search research" className="tap w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 py-2" /><button className="tap rounded-[var(--radius-control)] bg-coconut-950 px-4 text-ivory-50 t-cta text-xs">Search</button></form>
        <div className="flex flex-wrap gap-2"><Chip href={qs({ tag: undefined })} active={!sp.tag}>All tags</Chip>{tags.map((t) => <Chip key={t} href={qs({ tag: t })} active={sp.tag === t}>{t}</Chip>)}</div>
        <div className="mt-3 flex flex-wrap gap-2"><Chip href={qs({ component: undefined })} active={!sp.component}>All components</Chip>{components.filter((c) => docs.some((d) => d.relatedComponentIds.includes(c.id))).map((c) => <Chip key={c.id} href={qs({ component: c.id })} active={sp.component === c.id}>{c.name.replace(/ \(.*\)/, "")}</Chip>)}</div>
        <div className="mt-3 flex flex-wrap gap-2"><Chip href={qs({ product: undefined })} active={!sp.product}>All products</Chip>{products.filter((p) => docs.some((d) => d.relatedProductIds.includes(p.id))).map((p) => <Chip key={p.id} href={qs({ product: p.id })} active={sp.product === p.id}>{p.name}</Chip>)}</div>
      </Container></Section>
      <Section surface="white" padded={false} className="pb-16 pt-6"><Container>
        <ul className="grid gap-x-10 gap-y-6 md:grid-cols-2">{list.map((d) => <li key={d.id} className="border-t hairline pt-4"><div className="flex flex-wrap gap-1.5"><Badge tone={d.evidenceLevel === "strong" ? "green" : d.evidenceLevel === "weak" ? "amber" : "neutral"}>{d.evidenceLevel} evidence</Badge>{d.tags.map((t) => <Badge key={t}>{t}</Badge>)}</div><Link href={`/research/${d.slug}`} className="t-h4 mt-3 block underline-offset-4 hover:underline">{d.name}</Link><p className="t-caption mt-1">{d.summary}</p><p className="t-data mt-2 text-neutral-500">Researched {d.researchDate} · verified {d.lastVerifiedAt ?? "—"}</p></li>)}</ul>
        {!list.length && <p className="t-caption py-10">No research matches.</p>}
      </Container></Section>
      <Section surface="ivory"><Container>
        <div className="grid gap-12 lg:grid-cols-3">
          <div id="regulations"><p className="t-overline text-neutral-500 mb-3">Regulation register</p><ul className="space-y-3">{regs.map((r) => <li key={r.id} id={r.slug} className="border-t hairline pt-3 text-[0.9rem]"><p className="font-semibold">{r.name}</p><p className="t-caption">{r.authority} · {r.scope.join("; ")}</p>{r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="t-caption underline">{r.url}</a>}</li>)}</ul></div>
          <div id="certifications"><p className="t-overline text-neutral-500 mb-3">Certification register</p><ul className="space-y-3">{certs.map((c) => <li key={c.id} id={c.slug} className="border-t hairline pt-3 text-[0.9rem]"><p className="font-semibold">{c.name}</p><p className="t-caption">{c.issuer} · {c.purpose}</p><p className="t-caption">Markets: {c.requiredForMarkets.join(", ")}</p></li>)}</ul></div>
          <div id="risks"><p className="t-overline text-neutral-500 mb-3">Risk register</p><ul className="space-y-3">{risks.map((r) => <li key={r.id} id={r.slug} className="border-t hairline pt-3 text-[0.9rem]"><p className="font-semibold">{r.name} <Badge>{r.category.replace("_", " ")}</Badge></p><p className="t-caption">{r.description[0]}</p><p className="t-caption">Mitigation: {r.genericMitigation.join("; ")}</p></li>)}</ul></div>
        </div>
      </Container></Section>
    </>
  );
}
