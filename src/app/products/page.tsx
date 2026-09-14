import Link from "next/link";
import { repo } from "@/services/repository";
import { productGapReport } from "@/services/gaps";
import { Container, Section, Badge, Chip } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Coconut Products — Every Product from Every Component", description: "All coconut products modelled on the platform: food, beverages, horticulture, coir, industrial, personal care, wellness, consumer — each with process, machinery, factory, customers, export and economics.", path: "/products" });

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ component?: string; market?: string; category?: string }> }) {
  const sp = await searchParams;
  const [products, components, categories] = await Promise.all([repo.products(), repo.components(), repo.categories()]);
  const filtered = products.filter((p) => (!sp.component || p.sourceComponentIds.includes(sp.component)) && (!sp.market || p.marketTags.includes(sp.market as never)) && (!sp.category || p.categoryId === sp.category));
  const compName = (id: string) => components.find((c) => c.id === id)?.name.replace(/ \(.*\)/, "") ?? id;
  const qs = (patch: Record<string, string | undefined>) => { const u = new URLSearchParams(); const merged = { ...sp, ...patch }; Object.entries(merged).forEach(([k, v]) => { if (v) u.set(k, v); }); const s = u.toString(); return `/products${s ? `?${s}` : ""}`; };
  return (
    <>
      <PageIntro overline="Products" title="Every product, from every component." lede={`${products.length} products. Each page: what it is, raw material, complete process, yields, quality, machinery, utilities, factory, packaging, customers, competitors, economics, regulation, export, risks, SWOT, scale, technology — with evidence labels.`} breadcrumbs={[{ label: "Products" }]} />
      <Section surface="ivory" padded={false} className="py-8">
        <Container>
          <div className="flex flex-wrap gap-2" aria-label="Filter by component">
            <Chip href={qs({ component: undefined })} active={!sp.component}>All components</Chip>
            {components.filter((c) => products.some((p) => p.sourceComponentIds.includes(c.id))).map((c) => <Chip key={c.id} href={qs({ component: c.id })} active={sp.component === c.id}>{c.name.replace(/ \(.*\)/, "")}</Chip>)}
          </div>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Filter by category">
            <Chip href={qs({ category: undefined })} active={!sp.category}>All categories</Chip>
            {categories.map((c) => <Chip key={c.id} href={qs({ category: c.id })} active={sp.category === c.id}>{c.name}</Chip>)}
          </div>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Filter by market">
            <Chip href={qs({ market: undefined })} active={!sp.market}>All markets</Chip>
            {["B2B", "B2C", "Industrial", "Export"].map((m) => <Chip key={m} href={qs({ market: m })} active={sp.market === m}>{m}</Chip>)}
          </div>
        </Container>
      </Section>
      <Section surface="white" padded={false} className="pb-24 pt-6">
        <Container>
          {filtered.length === 0 ? <p className="t-caption py-10">No products match these filters.</p> : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => {
                const g = productGapReport(p);
                return (
                  <li key={p.id} className="card card-hover p-6">
                    <Link href={`/products/${p.slug}`} className="group block h-full">
                      <div className="flex flex-wrap gap-1.5">{p.marketTags.map((t) => <Badge key={t}>{t}</Badge>)}<Badge tone="fibre">L{p.businessLevel.slice(1)}</Badge></div>
                      <p className="t-h4 mt-4 group-hover:underline underline-offset-4">{p.name}</p>
                      <p className="t-caption mt-1">{p.sourceComponentIds.map(compName).join(" · ")}</p>
                      <p className="mt-3 text-[0.9rem] text-neutral-700 line-clamp-3">{p.summary}</p>
                      <p className="t-data mt-4 text-neutral-500">{g.contentStatus.replace(/_/g, " ")} · {g.coveragePct}% evidence coverage</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </Section>
    </>
  );
}
