import Link from "next/link";
import { repo } from "@/services/repository";
import { Container, Section, Badge } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Build the Industry — Choose One Product to Plan", description: "Select one coconut product and follow a product-specific planning chain from raw material and capacity to land, machinery, manpower, utilities, CAPEX, working capital, customers, break-even, risks and scale.", path: "/build" });

const CHAIN = ["Product", "Raw material", "Target capacity", "Process", "Mass balance", "Land", "Building", "Machinery", "Manpower", "Power", "Water", "Other utilities", "Storage", "Quality control", "Packaging", "CAPEX", "Working capital", "Monthly operating cost", "Expected production", "Customers", "Revenue model", "Break-even", "ROI", "Risks", "Scale"];

export default async function BuildIndex() {
  const [products, components, models] = await Promise.all([repo.products(), repo.components(), repo.scaleModels()]);
  const compName = (id: string) => components.find((c) => c.id === id)?.name.replace(/ \(.*\)/, "") ?? "";
  return (
    <>
      <PageIntro overline="Build the industry" title="Choose ONE product." lede="This module refuses to generalise. Activated carbon cannot share a floorplan with coconut flour; cocopeat cannot share a mass balance with coconut milk. Pick one product and the platform assembles its specific planning chain." breadcrumbs={[{ label: "Build" }]}>
        <ol className="mt-10 flex flex-wrap gap-x-3 gap-y-2 t-data text-ivory-100/60">{CHAIN.map((c, i) => <li key={c}>{c}{i < CHAIN.length - 1 && <span className="ml-3 opacity-50">↓</span>}</li>)}</ol>
      </PageIntro>
      <Section surface="ivory">
        <Container>
          <ul className="grid gap-px overflow-hidden rounded-[var(--radius-media)] border hairline bg-neutral-200 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const m = models.filter((x) => x.productId === p.id);
              return (
                <li key={p.id} className="bg-cocos p-6 hover:bg-ivory-100">
                  <Link href={`/build/${p.slug}`} className="group block h-full">
                    <p className="t-caption">{p.sourceComponentIds.map(compName).join(" · ")}</p>
                    <p className="t-h4 mt-2 group-hover:underline underline-offset-4">{p.name}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">{m.length ? m.map((x) => <Badge key={x.id} tone="green">{x.name.split("—")[1]?.trim() ?? x.name}</Badge>) : <Badge>scale model: research required</Badge>}</div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>
    </>
  );
}
