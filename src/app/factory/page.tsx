import Link from "next/link";
import { repo } from "@/services/repository";
import { Container, Section, SectionHeader, Callout, Badge } from "@/components/ui/primitives";
import { HubGrid, Journey } from "@/components/ui/hub";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Factory — Design a Coconut Processing Plant Step by Step", description: "The factory journey: choose product → capacity → input requirement → processing line → machines → utilities → mass balance → area → layout → CAPEX → OPEX → unit economics → break-even → ROI. Product-specific engineering models, conceptual blueprints and evidence-labelled outputs.", path: "/factory" });

const JOURNEY = [
  { label: "Choose product", href: "/build", note: "One product at a time" },
  { label: "Choose capacity", href: "/build", note: "Only engineered scales are offered" },
  { label: "Calculate input requirement", href: "/tools/mass-balance", note: "Nuts/kg per day from yields" },
  { label: "Choose processing line", href: "/processing", note: "Routes, steps, QC points" },
  { label: "See machines", href: "/machinery", note: "Capacity, power, footprint" },
  { label: "Calculate utilities", href: "/tools/factory-planner", note: "Power, water, steam, fuel" },
  { label: "Generate mass balance", href: "/tools/mass-balance", note: "Products, by-products, losses" },
  { label: "Estimate factory area", href: "/tools/land-calculator", note: "Zones, built-up, site" },
  { label: "Generate layout", href: "/tools/factory-planner", note: "Conceptual blueprint" },
  { label: "Calculate CAPEX", href: "/tools/financial-model", note: "Quotation-backed only" },
  { label: "Calculate OPEX", href: "/tools/financial-model", note: "Labour, utilities, packaging…" },
  { label: "Unit economics → break-even → ROI", href: "/tools/financial-model", note: "Three scenarios" },
];

export default async function FactoryHub() {
  const [products, models] = await Promise.all([repo.products(), repo.scaleModels()]);
  const withModels = products.filter((p) => models.some((m) => m.productId === p.id));
  return (
    <>
      <PageIntro overline="Factory" title="Design a plant — for one product, at one scale." lede="This is the single canonical factory journey. It refuses to generalise: activated carbon gets kilns, boilers and charcoal yards; coconut milk gets high-care UHT zones and an effluent plant; cocopeat gets husk and drying yards." breadcrumbs={[{ label: "Factory" }]}>
        <div className="mt-10 text-ivory-50"><Journey steps={JOURNEY} dark /></div>
      </PageIntro>
      <Section surface="ivory">
        <Container>
          <SectionHeader overline="Start here" title="Products with engineering scale models." lede={`${withModels.length} of ${products.length} products have documented engineering assumptions (footprints, zones, manpower, utilities). The others expose RESEARCH REQUIRED rather than a fake plan.`} className="mb-8" />
          <HubGrid items={withModels.map((p) => ({ title: p.name, href: `/build/${p.slug}`, body: p.summary, badge: models.filter((m) => m.productId === p.id).map((m) => <Badge key={m.id} tone="green">{m.name.split("—")[1]?.trim() ?? m.name}</Badge>), meta: "Open planning chain →" }))} />
          <p className="t-caption mt-6">Other products: {products.filter((p) => !withModels.includes(p)).map((p, i) => <span key={p.id}>{i > 0 && ", "}<Link href={`/build/${p.slug}`} className="underline">{p.name}</Link></span>)} — planning chain available with RESEARCH REQUIRED engineering.</p>
          <SectionHeader overline="Factory section" title="What lives here." className="mt-16 mb-8" />
          <HubGrid columns={4} items={[
            { title: "Factory planner", href: "/tools/factory-planner", body: "Zones, flow, hygiene, fire risk, utilities, manpower." },
            { title: "Mass balance", href: "/tools/mass-balance", body: "Inputs → outputs → losses with sensitivity." },
            { title: "Machine selection", href: "/machinery", body: "Relational machine directory; quotations register." },
            { title: "Utilities", href: "/tools/factory-planner", body: "Power, water, steam, fuel per scale model." },
            { title: "Layout", href: "/tools/factory-planner", body: "Conceptual blueprint; machine-level layout when quotations supply dimensions." },
            { title: "CAPEX / OPEX", href: "/tools/financial-model", body: "Computed from labelled inputs; never pre-filled prices." },
            { title: "Labour", href: "/tools/manpower", body: "Roles, skills, headcount." },
            { title: "Waste & by-products", href: "/zero-waste", body: "Every stream's commercial path." },
          ]} />
          <div className="mt-12"><Callout tone="warning" title="Discipline">Do not buy machinery until you validate the customer. Do not buy land until you understand the process. Do not build a factory until you understand utilisation. Planning outputs are conceptual and require professional engineering validation.</Callout></div>
        </Container>
      </Section>
    </>
  );
}
