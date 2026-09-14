import { repo } from "@/services/repository";
import { Container, Section, SectionHeader, Badge } from "@/components/ui/primitives";
import { HubGrid } from "@/components/ui/hub";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Markets — Demand, Customers, Export Markets & Price Intelligence", description: "India and global market context for coconut products: customer segments, industries, export markets and requirements, dated price records, trade statistics with year/unit/source.", path: "/markets" });

export default async function MarketsHub() {
  const [customers, countries, industries, prices, research] = await Promise.all([repo.customerSegments(), repo.countries(), repo.industries(), repo.prices(), repo.research()]);
  const stats = research.find((r) => r.id === "rd-india-statistics");
  return (
    <>
      <PageIntro overline="Markets" title="Who buys, where, and at what terms." lede="Demand is modelled as customer segments with specifications and buying processes; trade as export markets with requirements; prices only as dated, sourced records. Nothing here is a market-size headline without year, unit and source." breadcrumbs={[{ label: "Markets" }]} />
      <Section surface="ivory"><Container>
        <SectionHeader overline="Demand" title="Customers and industries." className="mb-8" />
        <HubGrid columns={4} items={[
          { title: "Customer segments", href: "/customers", body: `${customers.length} segments — what they buy, why, specs, MOQ, terms, buying process.` },
          { title: "Industries", href: "/industries", body: `${industries.length} industries served by the coconut.` },
          { title: "Value chain", href: "/value-chain", body: "Where value is added and lost, farm to export." },
          { title: "India statistics", href: "/india#statistics", body: stats ? stats.summary : "Production statistics with year and unit." },
        ]} />
        <SectionHeader overline="Trade" title="Export and prices." className="mt-16 mb-8" />
        <HubGrid columns={3} items={[
          { title: "Export explorer", href: "/export", body: `${countries.filter((c) => c.productIds.length).length} markets with requirements, certifications, logistics and currency risk.`, badge: <Badge>filters: product · region · certification</Badge> },
          { title: "Price intelligence", href: "/markets/prices", body: prices.length ? `${prices.length} dated price records.` : "No dated price records yet — the register is empty by design until sourced prices are captured.", badge: <Badge tone={prices.length ? "green" : "amber"}>{prices.length ? "dated records" : "empty — research required"}</Badge> },
          { title: "Hyderabad hub", href: "/hyderabad", body: "Demand, distribution and HQ role analysis for a metro without raw material." },
        ]} />
      </Container></Section>
    </>
  );
}
