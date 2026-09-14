import Link from "next/link";
import { repo } from "@/services/repository";
import { Container, Section, Badge } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Coconut Product Customers — Who Buys, Why, and What They Require", description: "Customer categories for coconut products: hotels, restaurants, bakeries, food manufacturers, ingredient companies, beverage makers, distributors, retailers, quick commerce, exporters, industrial buyers, horticulture, nurseries, hydroponic farms, water treatment, filtration, personal care.", path: "/customers" });

export default async function CustomersPage() {
  const [segments, products] = await Promise.all([repo.customerSegments(), repo.products()]);
  return (
    <>
      <PageIntro overline="Markets" title="Customers." lede="For each category: what they buy, why, specification, quality requirements, packaging, MOQ, purchase frequency, certifications, buying process, payment terms, problems, supplier-selection criteria and the opportunity. Specific contracts are never fabricated." breadcrumbs={[{ label: "Markets", href: "/markets" }, { label: "Customers" }]} />
      <Section surface="ivory">
        <Container>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {segments.map((s) => <li key={s.id} className="card card-hover p-6"><Link href={`/customers/${s.slug}`} className="group block h-full"><Badge>{s.kind}</Badge><p className="t-h4 mt-3 group-hover:underline underline-offset-4">{s.name}</p><p className="t-caption mt-2">{s.summary}</p><p className="t-data mt-3 text-neutral-500">{s.productIds.map((id) => products.find((p) => p.id === id)?.name).filter(Boolean).slice(0, 4).join(" · ")}</p></Link></li>)}
          </ul>
        </Container>
      </Section>
    </>
  );
}
