import Link from "next/link";
import { repo } from "@/services/repository";
import { Container, Section } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Coconut Industries — Food, Beverage, Horticulture, Coir, Industrial, Personal Care, Wellness, Consumer, Export, Technology, Waste-to-value", description: "Eleven industries served by the coconut, each linked to its products, components and opportunities.", path: "/industries" });

export default async function IndustriesPage() {
  const [industries, products] = await Promise.all([repo.industries(), repo.products()]);
  return (
    <>
      <PageIntro overline="Markets" title="Industries." lede="One coconut feeds eleven industries. Each industry page lists the products, components and opportunities that serve it." breadcrumbs={[{ label: "Industries" }]} />
      <Section surface="ivory"><Container>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((i) => { const n = products.filter((p) => p.industryIds.includes(i.id)).length; return <li key={i.id} className="card card-hover p-6"><Link href={`/industries/${i.slug}`} className="group block h-full"><p className="t-h4 group-hover:underline underline-offset-4">{i.name}</p><p className="t-caption mt-2">{i.summary}</p><p className="t-data mt-3 text-leaf-500">{n} products →</p></Link></li>; })}
        </ul>
      </Container></Section>
    </>
  );
}
