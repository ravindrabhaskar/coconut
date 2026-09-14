import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { repo } from "@/services/repository";
import { Container, Section, Badge } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export async function generateStaticParams() { return (await repo.categories()).map((c) => ({ slug: c.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const c = (await repo.categories()).find((x) => x.slug === slug); if (!c) return {};
  return pageMetadata({ title: `${c.name} Coconut Products — Processing, Machinery & Markets`, description: c.summary, path: `/products/category/${c.slug}` });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = (await repo.categories()).find((x) => x.slug === slug);
  if (!cat) notFound();
  const products = await repo.productsByCategory(cat.id);
  return (
    <>
      <PageIntro overline="Product category" title={cat.name} lede={cat.summary} breadcrumbs={[{ label: "Products", href: "/products" }, { label: cat.name }]} />
      <Section surface="ivory">
        <Container>
          {products.length === 0 ? <p className="t-caption">No products in this category yet — add one to the database and it will appear here with its full page.</p> : (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{products.map((p) => <li key={p.id} className="border-t-2 border-coconut-950 pt-4"><Link href={`/products/${p.slug}`} className="group block"><div className="flex gap-1.5">{p.marketTags.map((t) => <Badge key={t}>{t}</Badge>)}</div><p className="t-h4 mt-3 group-hover:underline underline-offset-4">{p.name}</p><p className="t-caption mt-2">{p.summary}</p></Link></li>)}</ul>
          )}
        </Container>
      </Section>
    </>
  );
}
