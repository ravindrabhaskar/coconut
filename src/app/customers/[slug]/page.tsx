import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { repo } from "@/services/repository";
import { Container, Section, BulletList, KeyValue } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { Qty } from "@/components/ui/evidence";
import { SourceList } from "@/components/entity/blocks";
import { pageMetadata } from "@/lib/seo/site";

function B({ t, items }: { t: string; items: string[] }) { return <div><p className="t-overline text-neutral-500 mb-2">{t}</p><BulletList items={items} /></div>; }

export async function generateStaticParams() { return (await repo.customerSegments()).map((c) => ({ slug: c.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const c = await repo.customerBySlug(slug); if (!c) return {};
  return pageMetadata({ title: `${c.name} — What They Buy, Why, Specifications & Buying Process`, description: c.summary, path: `/customers/${c.slug}` });
}

export default async function CustomerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await repo.customerBySlug(slug);
  if (!c) notFound();
  const [products, sources] = await Promise.all([repo.products(), repo.sources()]);
  const prods = c.productIds.map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products;
  return (
    <>
      <PageIntro overline={`Customer segment · ${c.kind}`} title={c.name} lede={c.summary} breadcrumbs={[{ label: "Markets", href: "/markets" }, { label: "Customers", href: "/customers" }, { label: c.name }]} />
      <Section surface="ivory">
        <Container>
          <div className="grid gap-10 md:grid-cols-2">
            <B t="What they buy" items={c.whatTheyBuy} /><B t="Why they buy" items={c.whyTheyBuy} /><B t="Product specification" items={c.specification} /><B t="Quality requirements" items={c.qualityRequirements} /><B t="Packaging" items={c.packaging} /><B t="Buying process" items={c.buyingProcess} /><B t="Problems they face" items={c.problems} /><B t="Supplier-selection criteria" items={c.selectionCriteria} /><B t="Opportunity" items={c.opportunity} />
            <KeyValue rows={[{ k: "MOQ", v: <Qty q={c.moq} sources={sources} /> }, { k: "Purchase frequency", v: c.purchaseFrequency }, { k: "Payment terms", v: <Qty q={c.paymentTerms} sources={sources} /> }, { k: "Certifications", v: c.certifications.join(", ") || "—" }]} />
          </div>
          <p className="t-overline text-neutral-500 mt-12 mb-3">Products they buy</p>
          <ul className="flex flex-wrap gap-2">{prods.map((p) => <li key={p.id}><Link href={`/products/${p.slug}`} className="t-nav rounded-full border border-neutral-300 px-3 py-1.5 hover:border-coconut-800 tap">{p.name}</Link></li>)}</ul>
          <div className="mt-12"><p className="t-overline text-neutral-500 mb-3">Sources</p><SourceList ids={c.sourceIds} sources={sources} /></div>
        </Container>
      </Section>
    </>
  );
}
