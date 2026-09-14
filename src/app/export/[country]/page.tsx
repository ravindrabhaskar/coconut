import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { repo } from "@/services/repository";
import { Container, Section, BulletList, KeyValue } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { FreshnessChip } from "@/components/ui/evidence";
import { SourceList } from "@/components/entity/blocks";
import { pageMetadata } from "@/lib/seo/site";

export async function generateStaticParams() { return (await repo.countries()).map((c) => ({ country: c.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params; const c = await repo.countryBySlug(country); if (!c) return {};
  return pageMetadata({ title: `Exporting Coconut Products to ${c.name} — Requirements, Certification & Logistics`, description: c.marketContext[0] ?? c.summary, path: `/export/${c.slug}` });
}

export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = await repo.countryBySlug(country);
  if (!c) notFound();
  const [products, sources] = await Promise.all([repo.products(), repo.sources()]);
  const prods = c.productIds.map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products;
  return (
    <>
      <PageIntro overline={`Export market · ${c.region}`} title={c.name} lede={c.marketContext[0]} breadcrumbs={[{ label: "Markets", href: "/markets" }, { label: "Export", href: "/export" }, { label: c.name }]}>
        <div className="mt-6 text-ivory-50"><FreshnessChip researchedAt="2026-09-14" lastVerifiedAt={c.lastVerifiedAt} /></div>
      </PageIntro>
      <Section surface="ivory">
        <Container>
          <div className="grid gap-10 md:grid-cols-2">
            <div><p className="t-overline text-neutral-500 mb-2">Market context</p><BulletList items={c.marketContext} /><p className="t-overline text-neutral-500 mt-6 mb-2">Regulatory / import complexity</p><BulletList items={c.regulatoryNotes} /></div>
            <div><KeyValue rows={[{ k: "Certifications expected", v: c.certificationsExpected.join(", ") || "—" }, { k: "Logistics & ports", v: c.logistics.join("; ") || "—" }, { k: "Currency risk", v: c.currencyRisk }, { k: "Payment risk", v: "Use LC or advance for new buyers; capture terms in field validation (RESEARCH REQUIRED per buyer)." }, { k: "Price indications", v: "RESEARCH REQUIRED — no export price is shown without a dated source." }]} /></div>
          </div>
          <p className="t-overline text-neutral-500 mt-12 mb-3">Suitable products and their export requirements</p>
          <ul className="grid gap-4 md:grid-cols-2">{prods.map((p) => <li key={p.id} className="rounded-[var(--radius-control)] border hairline p-4"><Link href={`/products/${p.slug}`} className="t-h4 underline-offset-4 hover:underline">{p.name}</Link><ul className="mt-2 list-disc pl-5 text-[0.85rem] space-y-0.5">{p.exportRequirements.slice(0, 4).map((r) => <li key={r}>{r}</li>)}</ul><p className="t-caption mt-2">Shelf-life: {p.shelfLife.value === undefined ? "research required" : `${p.shelfLife.min ?? p.shelfLife.value}–${p.shelfLife.max ?? p.shelfLife.value} ${p.shelfLife.unit}`} · packaging: {p.packaging[0]?.format ?? "—"}</p></li>)}</ul>
          <div className="mt-12"><p className="t-overline text-neutral-500 mb-3">Sources</p><SourceList ids={c.sourceIds} sources={sources} /></div>
        </Container>
      </Section>
    </>
  );
}
