import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { repo } from "@/services/repository";
import { scoreOpportunity } from "@/lib/calc/scoring";
import { Container, Section, Badge } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export async function generateStaticParams() { return (await repo.industries()).map((i) => ({ slug: i.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const i = (await repo.industries()).find((x) => x.slug === slug); if (!i) return {};
  return pageMetadata({ title: `${i.name} Industry — Coconut Products, Components & Opportunities`, description: i.summary, path: `/industries/${i.slug}` });
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ind = (await repo.industries()).find((x) => x.slug === slug);
  if (!ind) notFound();
  const [products, components, opportunities] = await Promise.all([repo.products(), repo.components(), repo.opportunities()]);
  const prods = products.filter((p) => p.industryIds.includes(ind.id));
  const compIds = new Set(prods.flatMap((p) => p.sourceComponentIds));
  const opps = opportunities.filter((o) => o.industryId === ind.id);
  return (
    <>
      <PageIntro overline="Industry" title={ind.name} lede={ind.summary} breadcrumbs={[{ label: "Industries", href: "/industries" }, { label: ind.name }]} />
      <Section surface="ivory"><Container>
        <div className="grid gap-12 md:grid-cols-3">
          <div className="md:col-span-2"><p className="t-overline text-neutral-500 mb-3">Products</p>{prods.length ? <ul className="grid gap-4 sm:grid-cols-2">{prods.map((p) => <li key={p.id} className="border-t hairline pt-3"><Link href={`/products/${p.slug}`} className="t-h4 underline-offset-4 hover:underline">{p.name}</Link><p className="t-caption mt-1">{p.summary}</p></li>)}</ul> : <p className="t-caption">No products linked yet — add products with this industry in the database.</p>}</div>
          <div><p className="t-overline text-neutral-500 mb-3">Components</p><ul className="space-y-1">{components.filter((c) => compIds.has(c.id)).map((c) => <li key={c.id}><Link href={`/explore/${c.slug}`} className="underline underline-offset-4">{c.name.replace(/ \(.*\)/, "")}</Link></li>)}</ul>
            <p className="t-overline text-neutral-500 mt-8 mb-3">Opportunities</p><ul className="space-y-2">{opps.map((o) => <li key={o.id}><Link href={`/opportunities/${o.slug}`} className="underline underline-offset-4">{o.name}</Link> <Badge tone="green">{scoreOpportunity(o).total}</Badge></li>)}{!opps.length && <li className="t-caption">None recorded yet.</li>}</ul></div>
        </div>
      </Container></Section>
    </>
  );
}
