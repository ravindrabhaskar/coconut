import { repo } from "@/services/repository";
import { Container, Section, Callout } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { FactoryPlanner } from "@/components/features/factory-planner";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Factory Planner — Product-specific Conceptual Layouts", description: "Interactive factory planner: choose product, scale, location, market, automation and shifts; get land, building, zones, manpower, power, water and CAPEX indications with an evidence chain and a dynamic blueprint.", path: "/tools/factory-planner" });

export default async function FactoryPlannerPage({ searchParams }: { searchParams: Promise<{ product?: string; model?: string }> }) {
  const sp = await searchParams;
  const [products, models, roles, sources] = await Promise.all([repo.products(), repo.scaleModels(), repo.manpowerRoles(), repo.sources()]);
  const list = products.map((p) => ({ id: p.id, name: p.name, slug: p.slug, models: models.filter((m) => m.productId === p.id) })).sort((a, b) => Number(!!b.models.length) - Number(!!a.models.length));
  const initial = sp.product && list.some((p) => p.id === sp.product) ? sp.product : list[0]?.id;
  return (
    <>
      <PageIntro overline="Tools" title="Factory planner." lede="The layout changes with the product: activated carbon gets kilns, boilers and charcoal yards; coconut milk gets high-care UHT zones and an effluent plant; cocopeat gets husk and drying yards. Inputs: product, scale, location, target market, automation, shifts." breadcrumbs={[{ label: "Tools", href: "/tools" }, { label: "Factory planner" }]} />
      <Section surface="ivory">
        <Container>
          <Callout tone="warning" title="Conceptual planning layout">Zone areas are ratios labelled EXPERT JUDGMENT applied to a processing floor estimated from machine footprints × circulation factor. Every output is CALCULATED from those inputs and REQUIRES PROFESSIONAL ENGINEERING VALIDATION before any site or building decision.</Callout>
          <div className="mt-8"><FactoryPlanner products={list} roles={roles} sources={sources} initialProductId={initial} initialModelId={sp.model} /></div>
        </Container>
      </Section>
    </>
  );
}
