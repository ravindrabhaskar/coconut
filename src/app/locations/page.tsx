import { repo } from "@/services/repository";
import { scoreLocation } from "@/lib/calc/scoring";
import { Container, Section, SectionHeader, Badge, Callout } from "@/components/ui/primitives";
import { HubGrid } from "@/components/ui/hub";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Locations — Where Should the Coconut Factory Be?", description: "State profiles, raw-material availability, processing ecosystem, labour, logistics, port access, incentives and recommended products by geography. Interactive India analysis with transparent, scenario-weighted scoring.", path: "/locations" });

export default async function LocationsHub() {
  const [states, schemes, products] = await Promise.all([repo.states(), repo.schemes(), repo.products()]);
  const scored = states.map((s) => ({ s, r: scoreLocation(s.dimensions) })).sort((a, b) => b.r.total - a.r.total);
  const suggested = (id: string) => {
    // Recommended products by geography — EXPERT JUDGMENT from state ecosystem notes; no location is declared best.
    const map: Record<string, string[]> = { "st-tn": ["prd-cocopeat", "prd-activated-carbon", "prd-desiccated-coconut"], "st-kl": ["prd-virgin-coconut-oil", "prd-coir-geotextile", "prd-coconut-oil"], "st-ka": ["prd-copra", "prd-coconut-oil", "prd-coconut-water"], "st-ap": ["prd-cocopeat", "prd-coconut-water", "prd-desiccated-coconut"], "st-ts": ["prd-coconut-water", "prd-virgin-coconut-oil", "prd-coconut-chips"], "st-od": ["prd-desiccated-coconut", "prd-coir-fibre"], "st-mh": ["prd-coconut-water", "prd-virgin-coconut-oil"], "st-wb": ["prd-desiccated-coconut"] };
    return (map[id] ?? []).map((pid) => products.find((p) => p.id === pid)?.name).filter(Boolean) as string[];
  };
  return (
    <>
      <PageIntro overline="Locations" title="Where should this factory be?" lede="Raw material, land, labour, power, water, road, rail, port, market, ecosystem, suppliers, schemes and export connectivity — scored per state with visible weights. Scenario weights (near farms, near market, near Hyderabad, near port, hybrid) change the ranking; no location is declared best." breadcrumbs={[{ label: "Locations" }]} />
      <Section surface="ivory"><Container>
        <SectionHeader overline="India" title="State profiles." lede="District-level production density, freight distances and factory registries are RESEARCH REQUIRED (roadmap: TopoJSON boundaries + CDB district data)." className="mb-8" />
        <HubGrid columns={4} items={scored.map(({ s, r }) => ({ title: s.name, href: `/india/${s.slug}`, body: s.summary, badge: [<Badge key="s" tone="green">{r.total}/100 default weights</Badge>, ...(schemes.some((x) => x.geography.includes(s.id)) ? [<Badge key="sch">state scheme record</Badge>] : [])], meta: suggested(s.id).length ? `Suggested fit: ${suggested(s.id).join(", ")}` : undefined }))} />
        <SectionHeader overline="Tools & analysis" title="Compare scenarios." className="mt-16 mb-8" />
        <HubGrid columns={3} items={[
          { title: "Location finder", href: "/tools/location-finder", body: "Describe the plant (or pick a product) and rank states on re-weighted dimensions." },
          { title: "Interactive India analysis", href: "/india", body: "Map, scenario weights, dimension-by-dimension reasons." },
          { title: "Hyderabad as a hub", href: "/hyderabad", body: "HQ / distribution / sales / processing role fit." },
          { title: "Government schemes by state", href: "/business/schemes", body: "Central, board and state programmes; verified terms flagged." },
        ]} />
        <div className="mt-12"><Callout tone="neutral" title="Location engine (roadmap)">A product-specific location engine (raw-material radius, freight to port, utilities, schemes → suitability score) is planned; today&apos;s scoring is state-level and product-agnostic, with EXPERT JUDGMENT weights.</Callout></div>
      </Container></Section>
    </>
  );
}
