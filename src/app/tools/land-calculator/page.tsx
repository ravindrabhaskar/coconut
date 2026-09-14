import { repo } from "@/services/repository";
import { Container, Section, Callout } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { FactoryPlanner } from "@/components/features/factory-planner";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Land & Building Calculator — Coconut Processing", description: "Estimate land, production floor, warehouse, utilities, machine footprint, circulation and loading areas for a coconut product at a chosen capacity, location, shift pattern and automation level.", path: "/tools/land-calculator" });

export default async function LandCalculatorPage() {
  const [products, models, roles, sources] = await Promise.all([repo.products(), repo.scaleModels(), repo.manpowerRoles(), repo.sources()]);
  const list = products.map((p) => ({ id: p.id, name: p.name, slug: p.slug, models: models.filter((m) => m.productId === p.id) })).filter((p) => p.models.length);
  return (
    <>
      <PageIntro overline="Tools" title="Land calculator." lede="Input: product, capacity, location, shifts, automation. Output: estimated site land, production floor, warehouse, utilities, machine footprint, circulation, loading, manpower, CAPEX and working-capital basis — each with an evidence badge you can click." breadcrumbs={[{ label: "Tools", href: "/tools" }, { label: "Land calculator" }]} />
      <Section surface="ivory">
        <Container>
          <Callout tone="neutral" title="Formula">Processing floor = Σ machine footprints × circulation factor (2.5, EXPERT JUDGMENT). Zone areas = processing floor × zone ratio (per-product EXPERT JUDGMENT) × market factor. Site = Σ all zones including roads, parking, loading, fire and expansion. Units are explicit (m², sq ft, acres) and converted by tested functions.</Callout>
          <div className="mt-8"><FactoryPlanner products={list} roles={roles} sources={sources} /></div>
        </Container>
      </Section>
    </>
  );
}
