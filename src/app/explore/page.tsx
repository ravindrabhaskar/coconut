import Link from "next/link";
import { repo } from "@/services/repository";
import { Container, Section, SectionHeader } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/layout/chrome";
import { PalmFrond } from "@/components/ui/decor";
import { AnatomyHero } from "@/components/viz/coconut/anatomy-hero";
import type { CoconutLayer } from "@/components/viz/coconut/types";
import { formatQuantity } from "@/lib/format";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Explore the Coconut — Interactive Anatomy & Every Component", description: "An interactive exploded coconut: peduncle, outer husk, fibrous husk, hard shell, kernel and coconut water — plus sap, leaves, trunk and residues. Each component links to its products, processes, machinery and markets.", path: "/explore" });

export default async function ExplorePage() {
  const [components, products] = await Promise.all([repo.components(), repo.products()]);
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const layers: CoconutLayer[] = components.filter((c) => c.explodedOrder).map((c) => ({
    id: c.id, slug: c.slug, name: c.name.replace(/ \(.*\)/, ""), short: c.summary, colorToken: c.colorToken, order: c.explodedOrder!,
    products: [...c.primaryOutputProductIds, ...c.secondaryOutputProductIds].map((id) => byId[id]).filter(Boolean).slice(0, 6).map((p) => ({ name: p.name, href: `/products/${p.slug}` })),
    massShareLabel: c.massShare ? `≈ ${formatQuantity(c.massShare)} of nut mass (${c.massShare.evidence.toLowerCase().replace("_", " ")})` : undefined,
  }));
  return (
    <>
      <section className="surface-tropical overflow-hidden pt-8 pb-16">
        <PalmFrond className="-left-16 -top-12 h-[420px] w-[420px] opacity-[0.16]" />
        <PalmFrond flip className="-right-24 -bottom-24 h-[440px] w-[440px] opacity-[0.14]" />
        <Container className="relative z-[1]">
          <Breadcrumbs items={[{ label: "Explore" }]} className="mb-8" />
          <p className="t-overline text-palm-500 mb-4 flex items-center gap-3"><span className="h-px w-6 bg-accent" aria-hidden="true" />Explore</p>
          <h1 className="t-h1 text-coconut-950 max-w-[16ch]">Understand the coconut before the industry.</h1>
          <div className="mt-12"><AnatomyHero layers={layers} /></div>
        </Container>
      </section>
      <Section surface="ivory">
        <Container>
          <SectionHeader overline="All components" title="Fruit and palm resources." lede="Fruit components are separated at the factory; palm resources are harvested from the tree. Both are modelled as entities with product trees." />
          {(["fruit", "palm"] as const).map((origin) => (
            <div key={origin} className="mb-14">
              <p className="t-overline text-neutral-500 mb-5">{origin === "fruit" ? "Fruit components" : "Palm resources"}</p>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {components.filter((c) => c.origin === origin).map((c) => (
                  <li key={c.id} className="card card-hover p-6">
                    <Link href={`/explore/${c.slug}`} className="group block">
                      <p className="t-h4 group-hover:underline underline-offset-4">{c.name}</p>
                      <p className="t-caption mt-1 italic">{c.scientificName}</p>
                      <p className="mt-3 text-[0.92rem] text-neutral-700">{c.summary}</p>
                      <p className="t-data mt-4 text-leaf-500">Complexity: {c.processingComplexity.replace("_", " ")} · {[...c.primaryOutputProductIds, ...c.secondaryOutputProductIds].length} products</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Container>
      </Section>
    </>
  );
}
