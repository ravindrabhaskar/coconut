import { repo } from "@/services/repository";
import { Container, Section, Callout } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { MassBalanceTool } from "@/components/features/mass-balance";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Mass Balance — From Raw Coconuts to Products, By-products & Losses", description: "Interactive coconut mass balance: enter 100 to 100,000 nuts or a weight; see husk, fibre, pith, shell, kernel, water, products, by-products, process loss, recovery %, and an economics overlay with your prices. Yields are tied to coconut type, maturity and process with evidence labels.", path: "/tools/mass-balance" });

export default async function MassBalancePage({ searchParams }: { searchParams: Promise<{ product?: string; model?: string }> }) {
  const sp = await searchParams;
  const [models, sources, products] = await Promise.all([repo.massBalanceModels(), repo.sources(), repo.products()]);
  const initial = sp.model ?? models.find((m) => m.productId === sp.product)?.id ?? models[0].id;
  const names = Object.fromEntries(products.map((p) => [p.id, { name: p.name, slug: p.slug }]));
  return (
    <>
      <PageIntro overline="Tools" title="Mass balance." lede="No universal coconut composition is assumed. Each model is tied to a coconut type, maturity, geography and process, and every fraction carries an evidence label with a range. Override any fraction to test sensitivity; add your prices to see revenue, process cost and contribution." breadcrumbs={[{ label: "Tools", href: "/tools" }, { label: "Mass balance" }]} />
      <Section surface="ivory">
        <Container>
          <MassBalanceTool models={models} sources={sources} initialModelId={initial} productNames={names} />
          <div className="mt-10"><Callout tone="neutral" title="How to read it">Bars show mass as a share of input. Products (green) and by-products (fibre) are saleable streams; losses (grey) are moisture, volatiles and fines — some of which (volatiles, shell heat) are recoverable as energy. A large unaccounted share means the model is missing a loss stage: that is a research gap, not a rounding error.</Callout></div>
        </Container>
      </Section>
    </>
  );
}
