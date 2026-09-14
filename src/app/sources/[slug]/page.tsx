import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { repo } from "@/services/repository";
import { Container, Section, KeyValue, Badge } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export async function generateStaticParams() { return (await repo.sources()).map((s) => ({ slug: s.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const s = await repo.sourceBySlug(slug); if (!s) return {};
  return pageMetadata({ title: `${s.name} — Source Record`, description: s.summary, path: `/sources/${s.slug}` });
}

export default async function SourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await repo.sourceBySlug(slug);
  if (!s) notFound();
  const [products, components, research] = await Promise.all([repo.products(), repo.components(), repo.research()]);
  const cited = [...products.filter((p) => p.sourceIds.includes(s.id)).map((p) => ({ name: p.name, href: `/products/${p.slug}` })), ...components.filter((c) => c.sourceIds.includes(s.id)).map((c) => ({ name: c.name, href: `/explore/${c.slug}` })), ...research.filter((r) => r.sourceIds.includes(s.id)).map((r) => ({ name: r.name, href: `/research/${r.slug}` }))];
  return (
    <>
      <PageIntro overline={`Source · ${s.sourceType.replace("_", " ")}`} title={s.name} lede={s.summary} breadcrumbs={[{ label: "Sources", href: "/sources" }, { label: s.name }]}><div className="mt-4"><Badge tone={s.evidenceStrength === "strong" ? "green" : "amber"}>{s.evidenceStrength} evidence</Badge></div></PageIntro>
      <Section surface="ivory"><Container>
        <div className="grid gap-12 md:grid-cols-2">
          <KeyValue rows={[{ k: "Organisation", v: s.organisation }, { k: "URL / reference", v: s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline break-all">{s.url}</a> : s.reference ?? "—" }, { k: "Publication date", v: s.publicationDate ?? "—" }, { k: "Research date", v: s.researchDate }, { k: "Last reviewed", v: s.lastReviewedAt ?? "—" }, { k: "Relevant section", v: s.relevantSection ?? "—" }, { k: "Geography", v: s.geography ?? "—" }, { k: "Notes", v: s.notes ?? "—" }]} />
          <div><p className="t-overline text-neutral-500 mb-3">Cited by</p><ul className="space-y-1">{cited.map((c) => <li key={c.href}><Link href={c.href} className="underline underline-offset-4">{c.name}</Link></li>)}{!cited.length && <li className="t-caption">Not yet cited.</li>}</ul></div>
        </div>
      </Container></Section>
    </>
  );
}
