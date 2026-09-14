import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { repo } from "@/services/repository";
import { Container, Section, BulletList, Badge, Prose } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { EvidenceBadge, FreshnessChip } from "@/components/ui/evidence";
import { SourceList } from "@/components/entity/blocks";
import { pageMetadata, articleJsonLd, JsonLd } from "@/lib/seo/site";

export async function generateStaticParams() { return (await repo.research()).map((r) => ({ slug: r.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const r = await repo.researchBySlug(slug); if (!r) return {};
  return pageMetadata({ title: r.name, description: r.summary, path: `/research/${r.slug}`, type: "article" });
}

export default async function ResearchDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await repo.researchBySlug(slug);
  if (!r) notFound();
  const [products, components, machines, regs, sources, states] = await Promise.all([repo.products(), repo.components(), repo.machines(), repo.regulations(), repo.sources(), repo.states()]);
  const rel = (ids: string[], list: { id: string; name: string; slug: string }[], base: string) => ids.map((id) => list.find((x) => x.id === id)).filter(Boolean).map((x) => ({ name: x!.name, href: `${base}/${x!.slug}` }));
  const groups = [["Related products", rel(r.relatedProductIds, products, "/products")], ["Related components", rel(r.relatedComponentIds, components, "/explore")], ["Related machinery", rel(r.relatedMachineIds, machines, "/machinery")], ["Related regulations", r.relatedRegulationIds.map((id) => regs.find((x) => x.id === id)).filter(Boolean).map((x) => ({ name: x!.name, href: `/research#${x!.slug}` }))], ["Related states", rel(r.stateIds ?? [], states, "/india")]] as [string, { name: string; href: string }[]][];
  return (
    <>
      <JsonLd data={articleJsonLd({ headline: r.name, description: r.summary, path: `/research/${r.slug}`, datePublished: r.createdAt, dateModified: r.updatedAt })} />
      <PageIntro overline={`Research · ${r.evidenceLevel} evidence`} title={r.name} lede={r.summary} breadcrumbs={[{ label: "Research", href: "/research" }, { label: r.name }]}>
        <div className="mt-6 flex flex-wrap gap-2 text-ivory-50">{r.tags.map((t) => <Badge key={t} tone="dark">{t}</Badge>)}<FreshnessChip researchedAt={r.researchDate} lastVerifiedAt={r.lastVerifiedAt} /></div>
      </PageIntro>
      <Section surface="ivory"><Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <Prose paragraphs={r.detail} />
            {r.keyFacts.length > 0 && <div className="mt-10"><p className="t-overline text-neutral-500 mb-3">Key facts</p><ul className="space-y-3">{r.keyFacts.map((f, i) => <li key={i} className="border-t hairline pt-3 text-[0.92rem]"><p>{f.fact}</p>{f.quantity && <p className="mt-1"><EvidenceBadge q={f.quantity} sources={sources} /> <span className="t-caption">{f.quantity.notes}</span></p>}</li>)}</ul></div>}
            {r.businessImplications.length > 0 && <div className="mt-10"><p className="t-overline text-neutral-500 mb-3">Business implications</p><BulletList items={r.businessImplications} /></div>}
            <div className="mt-10"><p className="t-overline text-neutral-500 mb-3">Sources</p><SourceList ids={r.sourceIds} sources={sources} /></div>
          </div>
          <aside className="space-y-8">{groups.filter(([, items]) => items.length).map(([label, items]) => <div key={label}><p className="t-overline text-neutral-500 mb-2">{label}</p><ul className="space-y-1">{items.map((i) => <li key={i.href}><Link href={i.href} className="text-[0.9rem] underline-offset-4 hover:underline">{i.name}</Link></li>)}</ul></div>)}</aside>
        </div>
      </Container></Section>
    </>
  );
}
